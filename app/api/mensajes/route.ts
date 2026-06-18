import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversacionId = searchParams.get("conversacionId")
    const empresaId = "empresa-001"

    if (conversacionId) {
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
      ORDER BY "ultimoMensajeEn" DESC NULLS LAST
    ` as any[]
    return NextResponse.json(conversaciones)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversacionId, autorId, autorNombre, autorRol, contenido, tipo } = await req.json()
    if (!conversacionId || !autorId || !contenido) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const tipoMsg = tipo || "texto"
    const rolMsg = autorRol || "EMPLEADO"

    await prisma.$executeRaw`
      INSERT INTO "Mensaje" (id, "conversacionId", "autorId", "autorNombre", "autorRol", contenido, tipo)
      VALUES (gen_random_uuid()::text, ${conversacionId}, ${autorId}, ${autorNombre}, ${rolMsg}, ${contenido}, ${tipoMsg})
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