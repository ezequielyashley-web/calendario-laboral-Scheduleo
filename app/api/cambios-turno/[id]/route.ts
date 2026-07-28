import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { enviarNotificacionPush } from "@/lib/pushNotify"

async function puedeGestionarCambiosTurno(userId: string): Promise<boolean> {
  const solicitante = await prisma.user.findUnique({ where: { id: userId } })
  const permisos: any = (solicitante as any)?.permisos || {}
  return !!permisos.cambios_mod
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    if (auth.role !== "SUPER_ADMIN") {
      const autorizado = await puedeGestionarCambiosTurno(auth.userId)
      if (!autorizado) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    const { id } = await params
    const body = await req.json()
    const { estado, observaciones } = body
    if (!["APROBADO", "RECHAZADO", "CANCELADO"].includes(estado)) {
      return NextResponse.json({ error: "Estado no valido" }, { status: 400 })
    }
    const cambio = await prisma.cambioTurno.findUnique({ where: { id } })
    if (!cambio) return NextResponse.json({ error: "Cambio no encontrado" }, { status: 404 })
    const solicitanteUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    const updated = await prisma.cambioTurno.update({
      where: { id },
      data: {
        estado,
        aprobadoPor: solicitanteUser?.email || null,
        fechaAprobacion: new Date(),
        motivo: observaciones || cambio.motivo,
        updatedAt: new Date(),
      },
      include: {
        empleadoOrigen: { select: { nombre: true, apellidos: true } },
        empleadoDestino: { select: { nombre: true, apellidos: true } },
      }
    })
    try {
      await enviarNotificacionPush(
        estado === "APROBADO" ? "✅ Cambio de turno aprobado" : "❌ Cambio de turno rechazado",
        `El cambio de turno de ${updated.empleadoOrigen.nombre} ha sido ${estado === "APROBADO" ? "aprobado" : "rechazado"}`,
        "/cambios-turno",
        "empresa-001"
      )
    } catch { }
    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/cambios-turno/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { id } = await params
    const cambio = await prisma.cambioTurno.findUnique({
      where: { id },
      include: { empleadoOrigen: { select: { userId: true } }, empleadoDestino: { select: { userId: true } } }
    })
    if (!cambio) return NextResponse.json({ error: "Cambio no encontrado" }, { status: 404 })
    const esParticipante = cambio.empleadoOrigen?.userId === auth.userId || cambio.empleadoDestino?.userId === auth.userId
    if (auth.role !== "SUPER_ADMIN" && !esParticipante) {
      const autorizado = await puedeGestionarCambiosTurno(auth.userId)
      if (!autorizado) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    if (cambio.estado === "APROBADO") return NextResponse.json({ error: "No se puede eliminar un cambio aprobado" }, { status: 400 })
    await prisma.cambioTurno.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE /api/cambios-turno/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}