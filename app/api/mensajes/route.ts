import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { moduloActivo } from "@/lib/modulos"

async function esParticipante(conversacionId: string, userId: string): Promise<boolean> {
  const rows = await prisma.$queryRaw`
    SELECT solicitante_id, receptor_id FROM "Conversacion" WHERE id = ${conversacionId}
  ` as any[]
  if (!rows.length) return false
  return rows[0].solicitante_id === userId || rows[0].receptor_id === userId
}

export async function GET(req: NextRequest) {
  if (!(await moduloActivo("chat"))) return NextResponse.json({ error: "Modulo no activo" }, { status: 403 })
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { searchParams } = new URL(req.url)
    const conversacionId = searchParams.get("conversacionId")
    const noLeidos = searchParams.get("noLeidos")
    const userId = auth.userId
    const empresaId = "empresa-001"
    if (noLeidos) {
      const counts = await prisma.$queryRaw`
        SELECT m."conversacionId", COUNT(*)::int as count
        FROM "Mensaje" m
        INNER JOIN "Conversacion" c ON c.id = m."conversacionId"
        WHERE m."empresaId" = ${empresaId}
        AND m.leido = false
        AND m."autorId" != ${userId}
        AND (c."solicitante_id" = ${userId} OR c."receptor_id" = ${userId})
        GROUP BY m."conversacionId"
      ` as any[]
      return NextResponse.json(counts)
    }
    if (conversacionId) {
      if (!(await esParticipante(conversacionId, userId))) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
      const mensajes = await prisma.$queryRaw`
        SELECT * FROM "Mensaje"
        WHERE "conversacionId" = ${conversacionId}
        AND "empresaId" = ${empresaId}
        ORDER BY "creadoEn" ASC
        LIMIT 100
      ` as any[]
      return NextResponse.json(mensajes)
    }
    const conversaciones = await prisma.$queryRaw`
      SELECT * FROM "Conversacion"
      WHERE "empresaId" = ${empresaId}
      AND (solicitante_id = ${userId} OR receptor_id = ${userId})
      ORDER BY "ultimoMensajeEn" DESC NULLS LAST
    ` as any[]
    return NextResponse.json(conversaciones)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { conversacionId, contenido, tipo } = await req.json()
    if (!conversacionId || !contenido) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }
    if (!(await esParticipante(conversacionId, auth.userId))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    const solicitante = await prisma.user.findUnique({ where: { id: auth.userId } })
    const tipoMsg = tipo || "texto"
    await prisma.$executeRaw`
      INSERT INTO "Mensaje" (id, "conversacionId", "autorId", "autorNombre", "autorRol", contenido, tipo, leido)
      VALUES (gen_random_uuid()::text, ${conversacionId}, ${auth.userId}, ${solicitante?.name || ""}, ${auth.role}, ${contenido}, ${tipoMsg}, false)
    `
    await prisma.$executeRaw`
      UPDATE "Conversacion"
      SET "ultimoMensaje" = ${contenido}, "ultimoMensajeEn" = NOW()
      WHERE id = ${conversacionId}
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 })
  }
}
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { conversacionId } = await req.json()
    if (!conversacionId) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    if (!(await esParticipante(conversacionId, auth.userId))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    await prisma.$executeRaw`
      UPDATE "Mensaje" SET leido = true
      WHERE "conversacionId" = ${conversacionId}
      AND "autorId" != ${auth.userId}
      AND leido = false
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al marcar leido" }, { status: 500 })
  }
}