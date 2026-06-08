import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const grupoTrabajoId = searchParams.get("grupoTrabajoId")
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    const where: any = {}
    if (grupoTrabajoId) where.grupoTrabajoId = grupoTrabajoId
    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      }
    }

    const libranzas = await prisma.libranza.findMany({
      where,
      include: {
        grupoTrabajo: { select: { id: true, nombre: true, color: true } },
      },
      orderBy: { fecha: "asc" },
    })

    return NextResponse.json(libranzas)
  } catch (error) {
    console.error("GET /api/libranzas error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await req.json()
    const { grupoTrabajoId, empresaId, fechas, tipo = "COMPLETA" } = body

    if (!grupoTrabajoId || !empresaId || !fechas?.length) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Crear múltiples libranzas de una vez
    const data = fechas.map((fecha: string) => ({
      id: crypto.randomUUID(),
      grupoTrabajoId,
      empresaId,
      fecha: new Date(fecha),
      tipo,
      updatedAt: new Date(),
    }))

    await prisma.libranza.createMany({ data, skipDuplicates: true })

    return NextResponse.json({ ok: true, creadas: data.length }, { status: 201 })
  } catch (error) {
    console.error("POST /api/libranzas error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

    await prisma.libranza.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE /api/libranzas error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
