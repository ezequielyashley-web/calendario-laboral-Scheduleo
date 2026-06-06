import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const tipo = searchParams.get("tipo") || "fichajes"
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")
    const empleadoId = searchParams.get("empleadoId")

    if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 })

    const tokens = await prisma.$queryRaw`
      SELECT * FROM "TokenInspeccion"
      WHERE token = ${token} AND "expiraEn" > NOW()
      LIMIT 1
    ` as any[]

    if (!tokens.length) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })

    const ip = req.headers.get("x-forwarded-for") || "desconocida"
    await prisma.$executeRaw`
      INSERT INTO "LogAccesoInspector" (id, "empresaId", token, ip, "seccionConsultada")
      VALUES (gen_random_uuid()::text, 'empresa-001', ${token}, ${ip}, ${tipo})
    `

    if (tipo === "fichajes") {
      let query = `
        SELECT f.*, e.nombre, e.apellidos, e."numeroEmpleado",
          CASE WHEN f."modificado" = true THEN 'SI' ELSE 'NO' END as fue_modificado,
          f."motivoModificacion" as motivo_modificacion
        FROM "Fichaje" f
        LEFT JOIN "Empleado" e ON e.id = f."empleadoId"
        WHERE f."empresaId" = 'empresa-001'
      `
      if (desde) query += ` AND f."horaEntrada" >= '${desde}'`
      if (hasta) query += ` AND f."horaEntrada" <= '${hasta} 23:59:59'`
      if (empleadoId) query += ` AND f."empleadoId" = '${empleadoId}'`
      query += ` ORDER BY f."horaEntrada" DESC LIMIT 500`
      const data = await prisma.$queryRawUnsafe(query)
      return NextResponse.json(data)
    }

    if (tipo === "modificaciones") {
      const data = await prisma.$queryRaw`
        SELECT l.*, e.nombre, e.apellidos, e."numeroEmpleado"
        FROM "LogModificacion" l
        LEFT JOIN "Empleado" e ON e.id = l."empleadoId"
        WHERE l."empresaId" = 'empresa-001'
        ORDER BY l."creadoEn" DESC
        LIMIT 200
      ` as any[]
      return NextResponse.json(data)
    }

    if (tipo === "empleados") {
      const data = await prisma.$queryRaw`
        SELECT id, "numeroEmpleado", nombre, apellidos, dni, "fechaContratacion"
        FROM "Empleado" WHERE "empresaId" = 'empresa-001' ORDER BY apellidos ASC
      ` as any[]
      return NextResponse.json(data)
    }

    if (tipo === "vacaciones") {
      const data = await prisma.$queryRaw`
        SELECT v.*, e.nombre, e.apellidos, e."numeroEmpleado"
        FROM "Vacacion" v LEFT JOIN "Empleado" e ON e.id = v."empleadoId"
        WHERE v."empresaId" = 'empresa-001' ORDER BY v."fechaInicio" DESC LIMIT 200
      ` as any[]
      return NextResponse.json(data)
    }

    if (tipo === "bajas") {
      const data = await prisma.$queryRaw`
        SELECT b.*, e.nombre, e.apellidos, e."numeroEmpleado"
        FROM "BajaMedica" b LEFT JOIN "Empleado" e ON e.id = b."empleadoId"
        WHERE b."empresaId" = 'empresa-001' ORDER BY b."fechaInicio" DESC LIMIT 200
      ` as any[]
      return NextResponse.json(data)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
  }
}
