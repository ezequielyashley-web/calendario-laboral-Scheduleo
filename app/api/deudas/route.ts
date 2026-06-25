import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"
    const empleadoId = searchParams.get("empleadoId")

    const config = await prisma.$queryRaw`
      SELECT "modoDemo" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    const modoDemo = config[0]?.modoDemo ?? false

    let deudas: any[]
    if (modoDemo) {
      deudas = empleadoId
        ? await prisma.$queryRaw`SELECT * FROM "Deuda" WHERE empresaid = ${empresaId} AND empleadoid = ${empleadoId} AND "esDemostracion" = true ORDER BY createdat DESC` as any[]
        : await prisma.$queryRaw`SELECT * FROM "Deuda" WHERE empresaid = ${empresaId} AND "esDemostracion" = true ORDER BY createdat DESC` as any[]
    } else {
      deudas = empleadoId
        ? await prisma.$queryRaw`SELECT * FROM "Deuda" WHERE empresaid = ${empresaId} AND empleadoid = ${empleadoId} AND "esDemostracion" = false ORDER BY createdat DESC` as any[]
        : await prisma.$queryRaw`SELECT * FROM "Deuda" WHERE empresaid = ${empresaId} AND "esDemostracion" = false ORDER BY createdat DESC` as any[]
    }

    return NextResponse.json(deudas)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener deudas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
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
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
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