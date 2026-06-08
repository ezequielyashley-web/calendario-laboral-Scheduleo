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

    if (!["APROBADO", "RECHAZADO", "CANCELADO"].includes(estado)) {
      return NextResponse.json({ error: "Estado no valido" }, { status: 400 })
    }

    const cambio = await prisma.cambioTurno.findUnique({ where: { id } })
    if (!cambio) return NextResponse.json({ error: "Cambio no encontrado" }, { status: 404 })

    const updated = await prisma.cambioTurno.update({
      where: { id },
      data: {
        estado,
        aprobadoPor: (session.user as any)?.email || null,
        fechaAprobacion: new Date(),
        motivo: observaciones || cambio.motivo,
        updatedAt: new Date(),
      },
      include: {
        empleadoOrigen: { select: { nombre: true, apellidos: true } },
        empleadoDestino: { select: { nombre: true, apellidos: true } },
      }
    })

    // Notificacion push
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/push/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: estado === "APROBADO" ? "✅ Cambio de turno aprobado" : "❌ Cambio de turno rechazado",
          mensaje: `El cambio de turno de ${updated.empleadoOrigen.nombre} ha sido ${estado === "APROBADO" ? "aprobado" : "rechazado"}`,
          url: "/cambios-turno",
          empresaId: "empresa-001",
        }),
      })
    } catch { }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/cambios-turno/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params
    const cambio = await prisma.cambioTurno.findUnique({ where: { id } })
    if (!cambio) return NextResponse.json({ error: "Cambio no encontrado" }, { status: 404 })
    if (cambio.estado === "APROBADO") return NextResponse.json({ error: "No se puede eliminar un cambio aprobado" }, { status: 400 })

    await prisma.cambioTurno.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE /api/cambios-turno/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
