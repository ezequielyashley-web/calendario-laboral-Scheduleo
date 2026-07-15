import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { unstable_cache, revalidateTag } from "next/cache"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"

    const cached = unstable_cache(
      () => prisma.puestoDeTrabajo.findMany({
        where: { empresaId },
        include: { configuracionesCobertura: true },
      }),
      [`cobertura-${empresaId}`],
      { tags: ["cobertura"] }
    )
    const puestos = await cached()

    return NextResponse.json(puestos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener cobertura" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { empresaId, puestoDeTrabajoId, coberturas } = body
    await prisma.configuracionCobertura.upsert({
      where: { empresaId_puestoDeTrabajoId: { empresaId, puestoDeTrabajoId } },
      update: coberturas,
      create: { empresaId, puestoDeTrabajoId, ...coberturas },
    })
    revalidateTag("cobertura", { expire: 0 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar cobertura" }, { status: 500 })
  }
}