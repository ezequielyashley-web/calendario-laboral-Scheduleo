import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { empleadoId, empresaId, puesto, fechaInicio, sueldoAlEntrar, porcentajeAumento, notas } = body

    await prisma.$executeRaw`
      INSERT INTO "HistorialCargo" (id, "empleadoId", "empresaId", puesto, "fechaInicio", "sueldoAlEntrar", "porcentajeAumento", notas, "createdAt")
      VALUES (gen_random_uuid()::text, ${empleadoId}, ${empresaId}, ${puesto}, ${fechaInicio}::date, ${sueldoAlEntrar}, ${porcentajeAumento}, ${notas || ""}, NOW())
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar historial" }, { status: 500 })
  }
}
