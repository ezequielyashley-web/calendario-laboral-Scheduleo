import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"
    const empleadoId = searchParams.get("empleadoId")
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    let query = `
      SELECT f.*, e.nombre, e.apellidos, e."numeroEmpleado"
      FROM "Fichaje" f
      LEFT JOIN "Empleado" e ON e.id = f."empleadoId"
      WHERE f."empresaId" = '${empresaId}'
    `
    if (empleadoId) query += ` AND f."empleadoId" = '${empleadoId}'`
    if (desde) query += ` AND f."horaEntrada" >= '${desde}'`
    if (hasta) query += ` AND f."horaEntrada" <= '${hasta} 23:59:59'`
    query += ` ORDER BY f."horaEntrada" DESC LIMIT 500`

    const fichajes = await prisma.$queryRawUnsafe(query)
    return NextResponse.json(fichajes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, horaEntrada, horaSalida, motivoCambio, modificadoPor, ip } = body

    const anterior = await prisma.$queryRaw`
      SELECT * FROM "Fichaje" WHERE id = ${id} LIMIT 1
    ` as any[]

    if (!anterior.length) return NextResponse.json({ error: "Fichaje no encontrado" }, { status: 404 })

    const f = anterior[0]

    if (horaEntrada && horaEntrada !== f.horaentrada) {
      await prisma.$executeRaw`
        INSERT INTO "LogModificacion" (id, "empresaId", "fichajeId", "empleadoId", "campoModificado", "valorAnterior", "valorNuevo", "modificadoPor", "motivoCambio", ip)
        VALUES (gen_random_uuid()::text, ${f.empresaid}, ${id}, ${f.empleadoid}, 'horaEntrada', ${f.horaentrada?.toISOString()}, ${horaEntrada}, ${modificadoPor || 'ADMIN'}, ${motivoCambio || ''}, ${ip || ''})
      `
    }

    if (horaSalida && horaSalida !== f.horasalida) {
      await prisma.$executeRaw`
        INSERT INTO "LogModificacion" (id, "empresaId", "fichajeId", "empleadoId", "campoModificado", "valorAnterior", "valorNuevo", "modificadoPor", "motivoCambio", ip)
        VALUES (gen_random_uuid()::text, ${f.empresaid}, ${id}, ${f.empleadoid}, 'horaSalida', ${f.horasalida?.toISOString()}, ${horaSalida}, ${modificadoPor || 'ADMIN'}, ${motivoCambio || ''}, ${ip || ''})
      `
    }

    await prisma.$executeRaw`
      UPDATE "Fichaje" SET
        "horaEntrada" = COALESCE(${horaEntrada}::timestamptz, "horaEntrada"),
        "horaSalida" = COALESCE(${horaSalida}::timestamptz, "horaSalida"),
        "modificado" = true,
        "motivoModificacion" = COALESCE(${motivoCambio}, "motivoModificacion"),
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al modificar fichaje" }, { status: 500 })
  }
}
