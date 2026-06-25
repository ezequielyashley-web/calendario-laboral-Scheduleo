import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const grupos = await prisma.grupoLibranza.findMany({
      include: {
        dias: { orderBy: { fecha: "asc" } },
        empleados: {
          include: {
            empleado: { select: { id: true, nombre: true, apellidos: true, numeroEmpleado: true } }
          }
        }
      },
      orderBy: { nombre: "asc" }
    })
    return NextResponse.json(grupos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener grupos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { nombre, color, tipo, descripcion } = body
    const grupo = await prisma.grupoLibranza.create({
      data: { id: crypto.randomUUID(), nombre, color: color || "#6366f1", tipo: tipo || "ENTRE_SEMANA", descripcion, updatedAt: new Date() }
    })
    return NextResponse.json(grupo, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear grupo" }, { status: 500 })
  }
}
