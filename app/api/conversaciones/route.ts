import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const tipo = searchParams.get("tipo")

    if (tipo === "solicitudes") {
      const solicitudes = await prisma.$queryRaw`
        SELECT * FROM "Conversacion"
        WHERE "empresaId" = 'empresa-001'
        AND estado = 'pendiente'
        AND "receptorId" = ${userId}
        ORDER BY "creadoEn" DESC
      ` as any[]
      return NextResponse.json(solicitudes)
    }

    const conversaciones = await prisma.$queryRaw`
      SELECT * FROM "Conversacion"
      WHERE "empresaId" = 'empresa-001'
      AND estado = 'activa'
      AND (
        "solicitanteId" = ${userId}
        OR "receptorId" = ${userId}
      )
      ORDER BY "ultimoMensajeEn" DESC NULLS LAST
    ` as any[]
    return NextResponse.json(conversaciones)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, tipo, participantes, solicitanteId, solicitanteNombre, receptorId, receptorNombre } = await req.json()
    const tipoConv = tipo || "individual"
    const parts = JSON.stringify(participantes || [])

    const result = await prisma.$queryRaw`
      INSERT INTO "Conversacion" (id, nombre, tipo, participantes, estado, "solicitanteId", "solicitanteNombre", "receptorId", "receptorNombre", "expiraEn")
      VALUES (
        gen_random_uuid()::text,
        ${nombre || ""},
        ${tipoConv},
        ${parts}::jsonb,
        'pendiente',
        ${solicitanteId || ""},
        ${solicitanteNombre || ""},
        ${receptorId || ""},
        ${receptorNombre || ""},
        NOW() + INTERVAL '30 days'
      )
      RETURNING id
    ` as any[]

    return NextResponse.json({ ok: true, id: result[0]?.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear conversacion" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { conversacionId, accion } = await req.json()
    if (!conversacionId || !accion) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })

    if (accion === "aceptar") {
      await prisma.$executeRaw`
        UPDATE "Conversacion" SET estado = 'activa' WHERE id = ${conversacionId}
      `
      return NextResponse.json({ ok: true, accion: "aceptada" })
    }

    if (accion === "rechazar") {
      await prisma.$executeRaw`
        UPDATE "Conversacion" SET estado = 'rechazada' WHERE id = ${conversacionId}
      `
      return NextResponse.json({ ok: true, accion: "rechazada" })
    }

    if (accion === "cerrar") {
      await prisma.$executeRaw`
        DELETE FROM "Mensaje" WHERE "conversacionId" = ${conversacionId}
      `
      await prisma.$executeRaw`
        UPDATE "Conversacion" SET estado = 'cerrada' WHERE id = ${conversacionId}
      `
      return NextResponse.json({ ok: true, accion: "cerrada" })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}