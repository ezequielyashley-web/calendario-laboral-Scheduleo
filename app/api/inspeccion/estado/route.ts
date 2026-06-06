import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const hace5min = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const recientes = await prisma.$queryRaw`
      SELECT * FROM "LogAccesoInspector"
      WHERE "empresaId" = 'empresa-001'
      AND "creadoEn" > ${hace5min}::timestamptz
      ORDER BY "creadoEn" DESC
      LIMIT 1
    ` as any[]

    const ultimoHoy = await prisma.$queryRaw`
      SELECT * FROM "LogAccesoInspector"
      WHERE "empresaId" = 'empresa-001'
      AND "creadoEn" > ${hoy.toISOString()}::timestamptz
      ORDER BY "creadoEn" DESC
      LIMIT 1
    ` as any[]

    const countHoy = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "LogAccesoInspector"
      WHERE "empresaId" = 'empresa-001'
      AND "creadoEn" > ${hoy.toISOString()}::timestamptz
      AND "seccionConsultada" = 'acceso_inicial'
    ` as any[]

    return NextResponse.json({
      activo: recientes.length > 0,
      ultimoAcceso: ultimoHoy[0]?.creadoEn || null,
      accesosHoy: parseInt(countHoy[0]?.total || "0")
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ activo: false, ultimoAcceso: null, accesosHoy: 0 })
  }
}
