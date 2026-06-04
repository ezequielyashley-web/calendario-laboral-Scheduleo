import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"

    const limites = await prisma.$queryRaw`
      SELECT l.*, e.nombre as empleado_nombre
      FROM "LimiteAnticipo" l
      LEFT JOIN "Empleado" e ON e.id = l."empleadoId"
      WHERE l."empresaId" = ${empresaId}
      ORDER BY l."esGeneral" DESC
    ` as any[]

    return NextResponse.json(limites)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener limites" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { empleadoId, empresaId, limite, esGeneral } = body

    const id = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "LimiteAnticipo" (id, "empleadoId", "empresaId", limite, "esGeneral")
      VALUES (${id}, ${empleadoId || null}, ${empresaId || "empresa-001"}, ${limite}, ${esGeneral || false})
      ON CONFLICT ("empleadoId", "empresaId") DO UPDATE SET limite = ${limite}, "esGeneral" = ${esGeneral || false}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar limite" }, { status: 500 })
  }
}
