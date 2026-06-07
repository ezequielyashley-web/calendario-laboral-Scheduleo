import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const empleadoId = searchParams.get("empleadoId")
    const año = searchParams.get("año") || new Date().getFullYear().toString()

    if (!empleadoId) {
      return NextResponse.json({ error: "empleadoId requerido" }, { status: 400 })
    }

    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { diasVacaciones: true, diasAsuntosPropios: true, nombre: true, apellidos: true },
    })

    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    const vacaciones = await prisma.vacacion.findMany({
      where: {
        empleadoId,
        esDemostracion: false,
        fechaInicio: {
          gte: new Date(`${año}-01-01`),
          lte: new Date(`${año}-12-31`),
        },
        estado: { in: ["APROBADA", "PENDIENTE"] },
      },
    })

    const vacNormales = vacaciones.filter(v => v.tipo !== "ASUNTOS_PROPIOS")
    const vacAP = vacaciones.filter(v => v.tipo === "ASUNTOS_PROPIOS")

    const diasAprobados   = vacNormales.filter(v => v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0)
    const diasPendientes  = vacNormales.filter(v => v.estado === "PENDIENTE").reduce((s,v) => s + v.diasTotales, 0)
    const diasDisponibles = (empleado as any).diasVacaciones - diasAprobados

    const apAprobados   = vacAP.filter(v => v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0)
    const apPendientes  = vacAP.filter(v => v.estado === "PENDIENTE").reduce((s,v) => s + v.diasTotales, 0)
    const apDisponibles = (empleado as any).diasAsuntosPropios - apAprobados

    return NextResponse.json({
      empleado: { nombre: empleado.nombre, apellidos: empleado.apellidos },
      año: parseInt(año),
      vacaciones: {
        diasTotales:    (empleado as any).diasVacaciones,
        diasAprobados,
        diasPendientes,
        diasDisponibles,
      },
      asuntosPropios: {
        diasTotales:    (empleado as any).diasAsuntosPropios,
        diasAprobados:  apAprobados,
        diasPendientes: apPendientes,
        diasDisponibles: apDisponibles,
      },
    })
  } catch (error) {
    console.error("GET /api/vacaciones/stats error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
