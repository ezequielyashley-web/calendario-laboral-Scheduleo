import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"
    const empleadoId = searchParams.get("empleadoId")

    let deudas: any[]

    if (empleadoId) {
      deudas = await prisma.$queryRaw`
        SELECT d.* FROM "Deuda" d
        WHERE d.empresaid = ${empresaId} AND d.empleadoid = ${empleadoId}
        ORDER BY d.createdat DESC
      ` as any[]
    } else {
      deudas = await prisma.$queryRaw`
        SELECT d.* FROM "Deuda" d
        WHERE d.empresaid = ${empresaId}
        ORDER BY d.createdat DESC
      ` as any[]
    }

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
      INSERT INTO "Deuda" (id, empleadoid, empresaid, tipo, descripcion, importetotal, numerocuotas, diacobro, notas)
      VALUES (${id}, ${empleadoId}, ${empresaId || "empresa-001"}, ${tipo}, ${descripcion}, ${importeTotal}, ${numeroCuotas || 1}, ${diaCobro || 1}, ${notas || ""})
    `

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear deuda" }, { status: 500 })
  }
}
