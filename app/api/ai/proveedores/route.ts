import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el Super Admin puede ver esto" }, { status: 403 })
    }

    const proveedores = await prisma.configuracionAIProveedor.findMany({
      select: { proveedor: true, valido: true, verificadoEn: true, apiKeyEnc: true },
    })

    const resultado = proveedores.map(p => ({
      proveedor: p.proveedor,
      tieneKey: !!p.apiKeyEnc,
      valido: p.valido,
      verificadoEn: p.verificadoEn,
    }))

    return NextResponse.json(resultado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener proveedores" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el Super Admin puede modificar esto" }, { status: 403 })
    }

    const { proveedor, apiKey } = await req.json()
    if (!proveedor) return NextResponse.json({ error: "Falta el proveedor" }, { status: 400 })

    const claveLimpia = (apiKey || "").trim()
    if (!claveLimpia) return NextResponse.json({ error: "La clave esta vacia" }, { status: 400 })

    await prisma.configuracionAIProveedor.upsert({
      where: { proveedor },
      update: { apiKeyEnc: encrypt(claveLimpia), valido: null, verificadoEn: null },
      create: { proveedor, apiKeyEnc: encrypt(claveLimpia) },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar la clave" }, { status: 500 })
  }
}