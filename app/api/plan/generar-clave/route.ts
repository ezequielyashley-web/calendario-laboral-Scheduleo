import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

function generarToken(): string {
  // Formato legible en bloques, tipo XXXX-XXXX-XXXX-XXXX
  const raw = crypto.randomBytes(8).toString("hex").toUpperCase()
  return raw.match(/.{1,4}/g)!.join("-")
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const { planDestino, solicitudId, empresaId } = await req.json()
    if (!["basico", "profesional", "enterprise"].includes(planDestino)) {
      return NextResponse.json({ error: "Plan no valido" }, { status: 400 })
    }
    const token = generarToken()
    await prisma.llaveActivacionPlan.create({
      data: { empresaId: empresaId || "empresa-001", planDestino, token }
    })

    if (solicitudId) {
      await prisma.solicitudPlan.update({
        where: { id: solicitudId },
        data: { estado: "atendida" }
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, token })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al generar la clave" }, { status: 500 })
  }
}