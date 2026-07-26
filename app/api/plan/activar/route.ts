import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const { token } = await req.json()
    if (!token?.trim()) return NextResponse.json({ error: "Introduce la clave de activacion" }, { status: 400 })

    const llave = await prisma.llaveActivacionPlan.findUnique({ where: { token: token.trim().toUpperCase() } })
    if (!llave) return NextResponse.json({ error: "Clave no valida" }, { status: 404 })
    if (llave.usado) return NextResponse.json({ error: "Esta clave ya ha sido utilizada" }, { status: 400 })
    if (llave.empresaId !== "empresa-001") return NextResponse.json({ error: "Esta clave no corresponde a tu empresa" }, { status: 403 })

    await prisma.$transaction([
      prisma.empresa.update({ where: { id: "empresa-001" }, data: { plan: llave.planDestino } }),
      prisma.llaveActivacionPlan.update({ where: { id: llave.id }, data: { usado: true } })
    ])

    return NextResponse.json({ ok: true, plan: llave.planDestino })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al activar la clave" }, { status: 500 })
  }
}