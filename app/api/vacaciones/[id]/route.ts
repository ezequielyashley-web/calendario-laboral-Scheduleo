import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import webpush from "web-push"

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:admin@empresa.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
)

async function enviarPushEmpleado(empleadoId: string, titulo: string, mensaje: string, url: string) {
  try {
    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { userId: true, empresaId: true }
    })
    if (!empleado) return
    const subs = await prisma.$queryRaw`
      SELECT * FROM "PushSubscription" WHERE "empresaId" = ${empleado.empresaId}
    ` as any[]
    await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ titulo, mensaje, url })
        )
      )
    )
  } catch (error) {
    console.error("Error enviando push:", error)
  }
}

async function puedeGestionarVacaciones(userId: string): Promise<boolean> {
  const solicitante = await prisma.user.findUnique({ where: { id: userId } })
  const permisos: any = (solicitante as any)?.permisos || {}
  return !!permisos.vacaciones_mod
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    if (auth.role !== "SUPER_ADMIN") {
      const autorizado = await puedeGestionarVacaciones(auth.userId)
      if (!autorizado) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { estado, observaciones } = body

    if (!["APROBADA", "RECHAZADA", "CANCELADA"].includes(estado)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 })
    }

    const vacacion = await prisma.vacacion.findUnique({
      where: { id },
      include: { empleado: { select: { nombre: true, apellidos: true } } }
    })
    if (!vacacion) return NextResponse.json({ error: "Vacacion no encontrada" }, { status: 404 })

    const solicitanteUser = await prisma.user.findUnique({ where: { id: auth.userId } })

    const updated = await prisma.vacacion.update({
      where: { id },
      data: {
        estado,
        observaciones: observaciones || vacacion.observaciones,
        aprobadoPor: solicitanteUser?.email || null,
        fechaAprobacion: new Date(),
        updatedAt: new Date(),
      },
      include: {
        empleado: { select: { nombre: true, apellidos: true, numeroEmpleado: true } },
      },
    })

    const tipoLabel = vacacion.tipo === "ASUNTOS_PROPIOS" ? "Asuntos propios" : "Vacaciones"
    const fechaStr = new Date(vacacion.fechaInicio).toLocaleDateString("es-ES")

    if (estado === "APROBADA") {
      await enviarPushEmpleado(
        vacacion.empleadoId,
        `Aprobados`,
        `Tu solicitud de ${tipoLabel} del ${fechaStr} ha sido aprobada`,
        "/vacaciones"
      )
    } else if (estado === "RECHAZADA") {
      await enviarPushEmpleado(
        vacacion.empleadoId,
        `Rechazados`,
        `Tu solicitud de ${tipoLabel} del ${fechaStr} ha sido rechazada${observaciones ? `: ${observaciones}` : ""}`,
        "/vacaciones"
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/vacaciones/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { id } = await params

    const vacacion = await prisma.vacacion.findUnique({
      where: { id },
      include: { empleado: { select: { userId: true } } }
    })
    if (!vacacion) return NextResponse.json({ error: "Vacacion no encontrada" }, { status: 404 })

    const esPropia = vacacion.empleado?.userId === auth.userId
    if (auth.role !== "SUPER_ADMIN" && !esPropia) {
      const autorizado = await puedeGestionarVacaciones(auth.userId)
      if (!autorizado) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (vacacion.estado === "APROBADA") {
      return NextResponse.json({ error: "No se puede eliminar una vacacion aprobada" }, { status: 400 })
    }

    await prisma.vacacion.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE /api/vacaciones/[id] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}