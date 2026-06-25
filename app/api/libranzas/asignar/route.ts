import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { empleadoId, grupoLibranzaId } = body

    if (!empleadoId || !grupoLibranzaId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const existente = await prisma.empleadoGrupoLibranza.findFirst({
      where: { empleadoId, grupoLibranzaId, fechaFin: null }
    })
    if (existente) return NextResponse.json({ error: "El empleado ya pertenece a este grupo" }, { status: 400 })

    const asignacion = await prisma.empleadoGrupoLibranza.create({
      data: {
        id: crypto.randomUUID(),
        empleadoId,
        grupoLibranzaId,
        fechaInicio: new Date(),
      },
      include: {
        empleado: { select: { nombre: true, apellidos: true } },
        grupoLibranza: { select: { nombre: true, color: true } }
      }
    })
    return NextResponse.json(asignacion, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al asignar" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { empleadoId, grupoLibranzaId } = body
    await prisma.empleadoGrupoLibranza.deleteMany({
      where: { empleadoId, grupoLibranzaId }
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al desasignar" }, { status: 500 })
  }
}
