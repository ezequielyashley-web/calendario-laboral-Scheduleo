import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"

    const empleados = await prisma.empleado.findMany({
      where: { empresaId },
      include: {
        puestoDeTrabajo: { select: { id: true, nombre: true } },
        grupoTrabajo: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: "asc" }
    })

    return NextResponse.json(empleados)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener empleados" }, { status: 500 })
  }
}
