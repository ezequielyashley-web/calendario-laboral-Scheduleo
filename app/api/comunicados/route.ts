import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const comunicados = await prisma.$queryRaw`
      SELECT * FROM "Comunicado"
      WHERE "empresaId" = ${"empresa-001"}
      ORDER BY "creadoEn" DESC
    ` as any[]
    return NextResponse.json(comunicados)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { titulo, contenido, urgente, destinatarios, autorId, autorNombre } = await req.json()
    if (!titulo || !contenido || !autorId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const esUrgente = urgente || false
    const dests = JSON.stringify(destinatarios || [])

    await prisma.$executeRaw`
      INSERT INTO "Comunicado" (id, titulo, contenido, urgente, destinatarios, "autorId", "autorNombre")
      VALUES (gen_random_uuid()::text, ${titulo}, ${contenido}, ${esUrgente}, ${dests}::jsonb, ${autorId}, ${autorNombre})
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear comunicado" }, { status: 500 })
  }
}