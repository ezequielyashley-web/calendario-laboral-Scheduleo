import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"

    const puestos = await prisma.puestoDeTrabajo.findMany({
      where: { empresaId },
      include: { configuracionesCobertura: true },
    })

    return NextResponse.json(puestos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener cobertura" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { empresaId, puestoDeTrabajoId, coberturas } = body

    await prisma.configuracionCobertura.upsert({
      where: { empresaId_puestoDeTrabajoId: { empresaId, puestoDeTrabajoId } },
      update: coberturas,
      create: { empresaId, puestoDeTrabajoId, ...coberturas },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar cobertura" }, { status: 500 })
  }
}
