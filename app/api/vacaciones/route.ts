import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TIPOS_VALIDOS = ["VERANO", "INVIERNO", "MES_COMPLETO", "LIBRE_ELECCION", "ASUNTOS_PROPIOS"]

const FESTIVOS_FALLBACK = [
  "2026-01-01","2026-01-06","2026-03-19","2026-04-02","2026-04-03",
  "2026-05-01","2026-05-02","2026-05-15","2026-08-15","2026-10-12",
  "2026-11-01","2026-11-09","2026-12-07","2026-12-08","2026-12-25",
]

function esFinde(fecha: Date): boolean {
  const dow = fecha.getDay()
  return dow === 0 || dow === 6
}

function addDias(fecha: Date, dias: number): string {
  const d = new Date(fecha)
  d.setDate(d.getDate() + dias)
  return d.toISOString().split("T")[0]
}

async function validarDiaAsuntoPropio(
  fechaStr: string,
  festivos: string[],
  libranzas: string[],
  fechaNacimiento: Date | null
): Promise<string | null> {
  const fecha = new Date(fechaStr + "T12:00:00")

  if (esFinde(fecha)) return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} es fin de semana`

  if (festivos.includes(fechaStr)) return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} es festivo`

  const diaAnterior = addDias(fecha, -1)
  const diaSiguiente = addDias(fecha, 1)

  if (festivos.includes(diaSiguiente)) return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} es anterior a un festivo`
  if (festivos.includes(diaAnterior)) return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} es posterior a un festivo`

  if (libranzas.includes(diaSiguiente)) return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} es anterior a una libranza`
  if (libranzas.includes(diaAnterior)) return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} es posterior a una libranza`
  if (libranzas.includes(fechaStr)) return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} es día de libranza`

  if (fechaNacimiento) {
    const fn = new Date(fechaNacimiento)
    const año = fecha.getFullYear()
    const cumple = new Date(año, fn.getMonth(), fn.getDate()).toISOString().split("T")[0]
    const cumpleAnt = addDias(new Date(cumple + "T12:00:00"), -1)
    const cumplePost = addDias(new Date(cumple + "T12:00:00"), 1)
    if ([cumple, cumpleAnt, cumplePost].includes(fechaStr)) {
      return `El día ${new Date(fechaStr).toLocaleDateString("es-ES")} está relacionado con el cumpleaños`
    }
  }

  return null
}

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
    const { empleadoId, fechaInicio, fechaFin, observaciones, tipo = "LIBRE_ELECCION", diasSueltos } = body

    if (!empleadoId || !tipo) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: "Tipo de vacación no válido" }, { status: 400 })
    }

    // ASUNTOS PROPIOS — días sueltos
    if (tipo === "ASUNTOS_PROPIOS") {
      if (!diasSueltos?.length) {
        return NextResponse.json({ error: "Selecciona al menos un día" }, { status: 400 })
      }

      if (diasSueltos.length > 6) {
        return NextResponse.json({ error: "Los asuntos propios no pueden superar 6 días" }, { status: 400 })
      }

      const empleadoInfo = await prisma.empleado.findUnique({
        where: { id: empleadoId },
        select: { grupoTrabajoId: true, fechaNacimiento: true, diasAsuntosPropios: true },
      })

      if (!empleadoInfo) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

      // Obtener festivos
      let festivos = FESTIVOS_FALLBACK
      try {
        const año = new Date(diasSueltos[0]).getFullYear()
        const resFestivos = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${año}/ES`)
        const dataFestivos = await resFestivos.json()
        festivos = dataFestivos
          .filter((f: any) => !f.counties || f.counties.includes("ES-MD") || f.counties.length === 0)
          .map((f: any) => f.date)
      } catch { /* usa fallback */ }

      // Obtener libranzas del grupo
      let libranzas: string[] = []
      if (empleadoInfo.grupoTrabajoId) {
        const lib = await prisma.libranza.findMany({
          where: { grupoTrabajoId: empleadoInfo.grupoTrabajoId },
          select: { fecha: true },
        })
        libranzas = lib.map(l => l.fecha.toISOString().split("T")[0])
      }

      // Validar antelación mínima 48h
      const limite = new Date()
      limite.setHours(0,0,0,0)
      limite.setDate(limite.getDate() + 2)
      for (const dia of diasSueltos) {
        if (new Date(dia + "T12:00:00") < limite) {
          return NextResponse.json({ error: `El día ${new Date(dia).toLocaleDateString("es-ES")} no cumple la antelación mínima de 48 horas requerida por convenio` }, { status: 400 })
        }
      }
      // Validar cada día
      for (const dia of diasSueltos) {
        const error = await validarDiaAsuntoPropio(dia, festivos, libranzas, empleadoInfo.fechaNacimiento)
        if (error) return NextResponse.json({ error }, { status: 400 })
      }

      // Comprobar días disponibles
      const año = new Date(diasSueltos[0]).getFullYear()
      const apUsados = await prisma.vacacion.findMany({
        where: {
          empleadoId,
          tipo: "ASUNTOS_PROPIOS",
          estado: { in: ["APROBADA", "PENDIENTE"] },
          fechaInicio: { gte: new Date(`${año}-01-01`), lte: new Date(`${año}-12-31`) },
        },
      })
      const diasApUsados = apUsados.reduce((s, v) => s + v.diasTotales, 0)
      const diasDisponibles = (empleadoInfo as any).diasAsuntosPropios - diasApUsados

      if (diasSueltos.length > diasDisponibles) {
        return NextResponse.json({
          error: `No hay días disponibles. Disponibles: ${diasDisponibles}, Solicitados: ${diasSueltos.length}`,
        }, { status: 400 })
      }

      // Crear una solicitud por cada día suelto
      const creadas = []
      for (const dia of diasSueltos) {
        const fecha = new Date(dia + "T12:00:00")
        const vac = await prisma.vacacion.create({
          data: {
            id: crypto.randomUUID(),
            empleadoId,
            fechaInicio: fecha,
            fechaFin: fecha,
            diasTotales: 1,
            estado: "PENDIENTE",
            tipo: "ASUNTOS_PROPIOS",
            observaciones: observaciones || null,
            updatedAt: new Date(),
          },
        })
        creadas.push(vac)
      }

      return NextResponse.json(creadas, { status: 201 })
    }

    // RESTO DE TIPOS — rango normal
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ error: "Faltan fechaInicio y fechaFin" }, { status: 400 })
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

