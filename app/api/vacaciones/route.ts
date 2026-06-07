import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TIPOS_VALIDOS = ["VERANO", "INVIERNO", "MES_COMPLETO", "LIBRE_ELECCION", "ASUNTOS_PROPIOS"]

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get("estado")
    const empleadoId = searchParams.get("empleadoId")
    const año = searchParams.get("año")
    const tipo = searchParams.get("tipo")

    const where: any = { esDemostracion: false }
    if (estado && estado !== "TODAS") where.estado = estado
    if (empleadoId) where.empleadoId = empleadoId
    if (tipo && tipo !== "TODOS") where.tipo = tipo
    if (año) {
      where.fechaInicio = {
        gte: new Date(`${año}-01-01`),
        lte: new Date(`${año}-12-31`),
      }
    }

    const vacaciones = await prisma.vacacion.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            numeroEmpleado: true,
            diasVacaciones: true,
            diasAsuntosPropios: true,
            grupoTrabajo: { select: { nombre: true, color: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(vacaciones)
  } catch (error) {
    console.error("GET /api/vacaciones error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await req.json()
    const { empleadoId, fechaInicio, fechaFin, observaciones, tipo = "LIBRE_ELECCION" } = body

    if (!empleadoId || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: "Tipo de vacación no válido" }, { status: 400 })
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (fin < inicio) {
      return NextResponse.json({ error: "La fecha fin no puede ser anterior a la fecha inicio" }, { status: 400 })
    }

    const diasTotales = calcularDiasLaborables(inicio, fin)

    const solapamiento = await prisma.vacacion.findFirst({
      where: {
        empleadoId,
        estado: { in: ["PENDIENTE", "APROBADA"] },
        OR: [{ fechaInicio: { lte: fin }, fechaFin: { gte: inicio } }],
      },
    })

    if (solapamiento) {
      return NextResponse.json({ error: "Ya existe una solicitud en ese período" }, { status: 409 })
    }

    const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } })
    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    const año = inicio.getFullYear()

    // Asuntos propios — contador separado
    if (tipo === "ASUNTOS_PROPIOS") {
      const apUsados = await prisma.vacacion.findMany({
        where: {
          empleadoId,
          tipo: "ASUNTOS_PROPIOS",
          estado: { in: ["APROBADA", "PENDIENTE"] },
          fechaInicio: { gte: new Date(`${año}-01-01`), lte: new Date(`${año}-12-31`) },
        },
      })
      const diasApUsados = apUsados.reduce((s, v) => s + v.diasTotales, 0)
      const diasApDisponibles = (empleado as any).diasAsuntosPropios - diasApUsados
      if (diasTotales > diasApDisponibles) {
        return NextResponse.json({
          error: `No hay días de asuntos propios disponibles. Disponibles: ${diasApDisponibles}, Solicitados: ${diasTotales}`,
        }, { status: 400 })
      }
    } else {
      // Vacaciones normales
      const vacacionesAprobadas = await prisma.vacacion.findMany({
        where: {
          empleadoId,
          estado: "APROBADA",
          tipo: { not: "ASUNTOS_PROPIOS" },
          fechaInicio: { gte: new Date(`${año}-01-01`), lte: new Date(`${año}-12-31`) },
        },
      })
      const diasUsados = vacacionesAprobadas.reduce((s, v) => s + v.diasTotales, 0)
      const diasDisponibles = empleado.diasVacaciones - diasUsados
      if (diasTotales > diasDisponibles) {
        return NextResponse.json({
          error: `No hay días suficientes. Disponibles: ${diasDisponibles}, Solicitados: ${diasTotales}`,
        }, { status: 400 })
      }
    }

    const vacacion = await prisma.vacacion.create({
      data: {
        id: crypto.randomUUID(),
        empleadoId,
        fechaInicio: inicio,
        fechaFin: fin,
        diasTotales,
        estado: "PENDIENTE",
        tipo,
        observaciones: observaciones || null,
        updatedAt: new Date(),
      },
      include: {
        empleado: {
          select: { nombre: true, apellidos: true, numeroEmpleado: true },
        },
      },
    })

    return NextResponse.json(vacacion, { status: 201 })
  } catch (error) {
    console.error("POST /api/vacaciones error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

function calcularDiasLaborables(inicio: Date, fin: Date): number {
  let dias = 0
  const current = new Date(inicio)
  while (current <= fin) {
    const dow = current.getDay()
    if (dow !== 0 && dow !== 6) dias++
    current.setDate(current.getDate() + 1)
  }
  return dias
}
