import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { searchParams } = new URL(req.url)
    const userId = auth.userId
    const tipo = searchParams.get("tipo")
    if (tipo === "solicitudes") {
      const solicitudes = await prisma.$queryRaw`
        SELECT * FROM "Conversacion"
        WHERE "empresaId" = 'empresa-001'
        AND estado = 'pendiente'
        AND receptor_id = ${userId}
        ORDER BY "creadoEn" DESC
      ` as any[]
      return NextResponse.json(solicitudes)
    }
    const conversaciones = await prisma.$queryRaw`
      SELECT * FROM "Conversacion"
      WHERE "empresaId" = 'empresa-001'
      AND estado = 'activa'
      AND (solicitante_id = ${userId} OR receptor_id = ${userId})
      ORDER BY "ultimoMensajeEn" DESC NULLS LAST
    ` as any[]
    return NextResponse.json(conversaciones)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { nombre, tipo, participantes, receptorId, receptorNombre, autoAceptar } = await req.json()
    const solicitante = await prisma.user.findUnique({ where: { id: auth.userId } })
    const tipoConv = tipo || "individual"
    const parts = JSON.stringify(participantes || [])
    const estadoInicial = autoAceptar ? 'activa' : 'pendiente'
    const result = await prisma.$queryRaw`
      INSERT INTO "Conversacion" (id, nombre, tipo, participantes, estado, solicitante_id, solicitante_nombre, receptor_id, receptor_nombre, expira_en)
      VALUES (
        gen_random_uuid()::text,
        ${nombre || ""},
        ${tipoConv},
        ${parts}::jsonb,
        ${estadoInicial},
        ${auth.userId},
        ${solicitante?.name || ""},
        ${receptorId || ""},
        ${receptorNombre || ""},
        NOW() + INTERVAL '30 days'
      )
      RETURNING *
    ` as any[]
    return NextResponse.json({ ok: true, id: result[0]?.id, conv: result[0] })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear conversacion" }, { status: 500 })
  }
}
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { conversacionId, accion } = await req.json()
    if (!conversacionId || !accion) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })

    const convRows = await prisma.$queryRaw`
      SELECT solicitante_id, receptor_id FROM "Conversacion" WHERE id = ${conversacionId}
    ` as any[]
    if (!convRows.length) return NextResponse.json({ error: "Conversacion no encontrada" }, { status: 404 })
    const conv = convRows[0]
    if (conv.solicitante_id !== auth.userId && conv.receptor_id !== auth.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (accion === "aceptar") {
      await prisma.$executeRaw`UPDATE "Conversacion" SET estado = 'activa' WHERE id = ${conversacionId}`
      return NextResponse.json({ ok: true })
    }
    if (accion === "rechazar") {
      await prisma.$executeRaw`UPDATE "Conversacion" SET estado = 'rechazada' WHERE id = ${conversacionId}`
      return NextResponse.json({ ok: true })
    }
    if (accion === "cerrar") {
      await prisma.$executeRaw`DELETE FROM "Mensaje" WHERE "conversacionId" = ${conversacionId}`
      await prisma.$executeRaw`UPDATE "Conversacion" SET estado = 'cerrada' WHERE id = ${conversacionId}`
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}