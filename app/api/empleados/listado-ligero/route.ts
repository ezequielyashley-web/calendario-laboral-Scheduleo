import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const cached = unstable_cache(
      () => prisma.empleado.findMany({
        where: { empresaId: "empresa-001", esDemostracion: false },
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          numeroEmpleado: true,
          grupoTrabajoId: true,
          puestoDeTrabajoId: true,
        },
        orderBy: { numeroEmpleado: "asc" },
      }),
      ["empleados-listado-ligero"],
      { tags: ["empleados-ligero"] }
    )
    const empleados = await cached()

    return NextResponse.json(empleados)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener listado de empleados" }, { status: 500 })
  }
}