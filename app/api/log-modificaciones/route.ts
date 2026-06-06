import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fichajeId = searchParams.get("fichajeId")
    const empleadoId = searchParams.get("empleadoId")

    let logs: any[]

    if (fichajeId) {
      logs = await prisma.$queryRaw`
        SELECT * FROM "LogModificacion"
        WHERE "fichajeId" = ${fichajeId}
        ORDER BY "creadoEn" DESC
      ` as any[]
    } else if (empleadoId) {
      logs = await prisma.$queryRaw`
        SELECT * FROM "LogModificacion"
        WHERE "empleadoId" = ${empleadoId}
        ORDER BY "creadoEn" DESC
        LIMIT 100
      ` as any[]
    } else {
      logs = await prisma.$queryRaw`
        SELECT l.*, e.nombre, e.apellidos FROM "LogModificacion" l
        LEFT JOIN "Empleado" e ON e.id = l."empleadoId"
        WHERE l."empresaId" = 'empresa-001'
        ORDER BY l."creadoEn" DESC
        LIMIT 200
      ` as any[]
    }

    return NextResponse.json(logs)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
