import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"
    const empleadoId = searchParams.get("empleadoId")

    const where: any = { empresaId }
    if (empleadoId) where.empleadoId = empleadoId

    const deudas = await prisma.$queryRaw`
      SELECT d.*, 
        e.nombre as empleado_nombre,
        e.email as empleado_email
      FROM "Deuda" d
      LEFT JOIN "Empleado" e ON e.id = d."empleadoId"
      WHERE d."empresaId" = ${empresaId}
      ${empleadoId ? prisma.$queryRaw`AND d."empleadoId" = ${empleadoId}` : prisma.$queryRaw``}
      ORDER BY d."createdAt" DESC
    ` as any[]

    return NextResponse.json(deudas)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener deudas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { empleadoId, empresaId, tipo, descripcion, importeTotal, numeroCuotas, diaCobro, notas } = body

    const id = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "Deuda" (id, "empleadoId", "empresaId", tipo, descripcion, "importeTotal", "numeroCuotas", "diaCobro", notas)
      VALUES (${id}, ${empleadoId}, ${empresaId || "empresa-001"}, ${tipo}, ${descripcion}, ${importeTotal}, ${numeroCuotas || 1}, ${diaCobro || 1}, ${notas || ""})
    `

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear deuda" }, { status: 500 })
  }
}
