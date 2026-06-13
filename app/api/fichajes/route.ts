import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empleadoId = searchParams.get("empleadoId")

    const config = await prisma.$queryRaw`
      SELECT "modoDemo" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    const modoDemo = config[0]?.modoDemo ?? false

    let fichajes: any[]

    if (modoDemo) {
      fichajes = empleadoId
        ? await prisma.$queryRaw`
            SELECT f.*, e.nombre, e.apellidos, e."numeroEmpleado"
            FROM "Fichaje" f
            LEFT JOIN "Empleado" e ON e.id = f."empleadoId"
            WHERE f."empleadoId" = ${empleadoId} AND f."esDemostracion" = true
            ORDER BY f."horaEntrada" DESC LIMIT 500
          ` as any[]
        : await prisma.$queryRaw`
            SELECT f.*, e.nombre, e.apellidos, e."numeroEmpleado"
            FROM "Fichaje" f
            LEFT JOIN "Empleado" e ON e.id = f."empleadoId"
            WHERE f."esDemostracion" = true
            ORDER BY f."horaEntrada" DESC LIMIT 500
          ` as any[]
    } else {
      fichajes = empleadoId
        ? await prisma.$queryRaw`
            SELECT f.*, e.nombre, e.apellidos, e."numeroEmpleado"
            FROM "Fichaje" f
            LEFT JOIN "Empleado" e ON e.id = f."empleadoId"
            WHERE f."empleadoId" = ${empleadoId} AND f."esDemostracion" = false
            ORDER BY f."horaEntrada" DESC LIMIT 500
          ` as any[]
        : await prisma.$queryRaw`
            SELECT f.*, e.nombre, e.apellidos, e."numeroEmpleado"
            FROM "Fichaje" f
            LEFT JOIN "Empleado" e ON e.id = f."empleadoId"
            WHERE f."esDemostracion" = false
            ORDER BY f."horaEntrada" DESC LIMIT 500
          ` as any[]
    }

    return NextResponse.json(fichajes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener fichajes" }, { status: 500 })
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
    if (horaEntrada && horaEntrada !== f.horaEntrada) {
      await prisma.$executeRaw`
        INSERT INTO "LogModificacion" (id, "fichajeId", "empleadoId", "campoModificado", "valorAnterior", "valorNuevo", "modificadoPor", "motivoCambio", ip)
        VALUES (gen_random_uuid()::text, ${id}, ${f.empleadoId}, 'horaEntrada', ${f.horaEntrada?.toISOString()}, ${horaEntrada}, ${modificadoPor || 'ADMIN'}, ${motivoCambio || ''}, ${ip || ''})
      `
    }
    if (horaSalida && horaSalida !== f.horaSalida) {
      await prisma.$executeRaw`
        INSERT INTO "LogModificacion" (id, "fichajeId", "empleadoId", "campoModificado", "valorAnterior", "valorNuevo", "modificadoPor", "motivoCambio", ip)
        VALUES (gen_random_uuid()::text, ${id}, ${f.empleadoId}, 'horaSalida', ${f.horaSalida?.toISOString()}, ${horaSalida}, ${modificadoPor || 'ADMIN'}, ${motivoCambio || ''}, ${ip || ''})
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