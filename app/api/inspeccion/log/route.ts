import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const logs = await prisma.$queryRaw`
      SELECT 
        l.id,
        l.token,
        l.ip,
        l."seccionConsultada",
        l."creadoEn",
        t."creadoPor",
        t."expiraEn"
      FROM "LogAccesoInspector" l
      LEFT JOIN "TokenInspeccion" t ON t.token = l.token
      WHERE l."empresaId" = 'empresa-001'
      ORDER BY l."creadoEn" DESC
      LIMIT 100
    ` as any[]

    const agrupado = logs.reduce((acc, l) => {
      const tokenKey = l.token.substring(0, 12) + "..."
      if (!acc[l.token]) {
        acc[l.token] = {
          token: tokenKey,
          ip: l.ip,
          creadoPor: l.creadoPor,
          expiraEn: l.expiraEn,
          primerAcceso: l.creadoEn,
          ultimoAcceso: l.creadoEn,
          secciones: [],
          totalAccesos: 0
        }
      }
      acc[l.token].secciones.push(l.seccionConsultada)
      acc[l.token].totalAccesos++
      if (new Date(l.creadoEn) > new Date(acc[l.token].ultimoAcceso)) {
        acc[l.token].ultimoAcceso = l.creadoEn
      }
      if (new Date(l.creadoEn) < new Date(acc[l.token].primerAcceso)) {
        acc[l.token].primerAcceso = l.creadoEn
      }
      return acc
    }, {})

    return NextResponse.json(Object.values(agrupado))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
