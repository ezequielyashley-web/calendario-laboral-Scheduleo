import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const config = await prisma.$queryRaw`
      SELECT "modoDemo" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    const modoDemo = config[0]?.modoDemo ?? false

    const empleados = await prisma.$queryRaw`
      SELECT e.*, gt.nombre as "grupoNombre", gt.color as "grupoColor"
      FROM "Empleado" e
      LEFT JOIN "GrupoTrabajo" gt ON e."grupoTrabajoId" = gt.id
      WHERE e."empresaId" = 'empresa-001'
      AND e."esDemostracion" = ${modoDemo}
      ORDER BY e."numeroEmpleado"
    ` as any[]

    return NextResponse.json(empleados)
  } catch (error) {
    console.error(error)
    return NextResponse.json([])
  }
}
