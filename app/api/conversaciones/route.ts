import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const conversaciones = await prisma.$queryRaw`
      SELECT * FROM "Conversacion"
      WHERE "empresaId" = ${"empresa-001"}
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
    const { nombre, tipo, participantes } = await req.json()
    const tipoConv = tipo || "individual"
    const parts = JSON.stringify(participantes || [])

    const result = await prisma.$queryRaw`
      INSERT INTO "Conversacion" (id, nombre, tipo, participantes)
      VALUES (gen_random_uuid()::text, ${nombre||""}, ${tipoConv}, ${parts}::jsonb)
      RETURNING id
    ` as any[]

    return NextResponse.json({ ok: true, id: result[0]?.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear conversacion" }, { status: 500 })
  }
}