import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { estado, observaciones } = body

    if (!["APROBADA", "RECHAZADA", "CANCELADA"].includes(estado)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 })
    }

    const vacacion = await prisma.vacacion.findUnique({ where: { id } })
    if (!vacacion) return NextResponse.json({ error: "Vacación no encontrada" }, { status: 404 })

    const updated = await prisma.vacacion.update({
      where: { id },
      data: {
        estado,
        observaciones: observaciones || vacacion.observaciones,
        aprobadoPor: (session.user as any)?.email || null,
        fechaAprobacion: new Date(),
        updatedAt: new Date(),
      },
      include: {
        empleado: {
          select: { nombre: true, apellidos: true, numeroEmpleado: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/vacaciones/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params

    const vacacion = await prisma.vacacion.findUnique({ where: { id } })
    if (!vacacion) return NextResponse.json({ error: "Vacación no encontrada" }, { status: 404 })

    if (vacacion.estado === "APROBADA") {
      return NextResponse.json({ error: "No se puede eliminar una vacación aprobada" }, { status: 400 })
    }

    await prisma.vacacion.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE /api/vacaciones/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
