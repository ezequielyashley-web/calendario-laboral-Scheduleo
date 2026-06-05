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
    const { empleadoId, empresaId, tipo, descripcion, importeTotal, numeroCuotas, diaCobro, notas, fechaSolicitud, metodoPago, porcentajeCobro } = body
    const id = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "Deuda" (id, empleadoid, empresaid, tipo, descripcion, importetotal, numerocuotas, diacobro, notas, "fechaSolicitud", "metodoPago", "porcentajeCobro")
      VALUES (${id}, ${empleadoId}, ${empresaId || "empresa-001"}, ${tipo}, ${descripcion}, ${importeTotal}, ${numeroCuotas || 1}, ${diaCobro || 1}, ${notas || ""}, ${fechaSolicitud || new Date().toISOString()}, ${metodoPago || "EFECTIVO"}, ${porcentajeCobro || null})
    `

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear deuda" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, estado, fechaAprobacion, fechaPago, aprobadoPor, metodoPago, porcentajeCobro, notas, importePagado, cuotasPagadas } = body

    await prisma.$executeRaw`
      UPDATE "Deuda" SET
        estado = COALESCE(${estado}, estado),
        "fechaAprobacion" = COALESCE(${fechaAprobacion}::timestamptz, "fechaAprobacion"),
        "fechaPago" = COALESCE(${fechaPago}::timestamptz, "fechaPago"),
        "aprobadoPor" = COALESCE(${aprobadoPor}, "aprobadoPor"),
        "metodoPago" = COALESCE(${metodoPago}, "metodoPago"),
        "porcentajeCobro" = COALESCE(${porcentajeCobro}, "porcentajeCobro"),
        notas = COALESCE(${notas}, notas),
        importepagado = COALESCE(${importePagado}, importepagado),
        cuotaspagadas = COALESCE(${cuotasPagadas}, cuotaspagadas),
        updatedat = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar deuda" }, { status: 500 })
  }
}
