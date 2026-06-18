import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mes = parseInt(searchParams.get("mes") || String(new Date().getMonth() + 1))
    const anio = parseInt(searchParams.get("anio") || String(new Date().getFullYear()))

    const inicioMes = new Date(anio, mes - 1, 1)
    const finMes = new Date(anio, mes, 0, 23, 59, 59)

    // Total empleados activos
    const totalEmpleados = await prisma.empleado.count({
      where: { empresaId: "empresa-001", esDemostracion: false }
    })

    // FICHAJES del mes
    const fichajes = await prisma.fichaje.findMany({
      where: {
        empleado: { empresaId: "empresa-001", esDemostracion: false },
        fecha: { gte: inicioMes, lte: finMes }
      },
      include: { empleado: true }
    })

    const totalFichajes = fichajes.length
    const fichajesTardios = fichajes.filter(f => {
      if (!f.horaEntrada) return false
      const hora = new Date(f.horaEntrada).getHours()
      const minutos = new Date(f.horaEntrada).getMinutes()
      return hora > 8 || (hora === 8 && minutos > 10)
    }).length
    const fichajesSinSalida = fichajes.filter(f => !f.horaSalida).length

    // VACACIONES del mes
    const vacaciones = await prisma.vacacion.findMany({
      where: {
        empleado: { empresaId: "empresa-001", esDemostracion: false },
        OR: [
          { fechaInicio: { gte: inicioMes, lte: finMes } },
          { fechaFin: { gte: inicioMes, lte: finMes } }
        ]
      }
    })
    const vacAprobadas = vacaciones.filter(v => v.estado === "APROBADA")
    const vacPendientes = vacaciones.filter(v => v.estado === "PENDIENTE")
    const vacRechazadas = vacaciones.filter(v => v.estado === "RECHAZADA")
    const diasAprobados = vacAprobadas.reduce((s, v) => s + (v.diasTotales || 0), 0)

    // BAJAS del mes
    const bajas = await prisma.bajaMedica.findMany({
      where: {
        empleado: { empresaId: "empresa-001", esDemostracion: false },
        fechaInicio: { gte: inicioMes, lte: finMes }
      }
    })

    // HORAS trabajadas
    let horasTotales = 0
    fichajes.forEach(f => {
      if (f.horaEntrada && f.horaSalida) {
        const entrada = new Date(f.horaEntrada).getTime()
        const salida = new Date(f.horaSalida).getTime()
        horasTotales += (salida - entrada) / (1000 * 60 * 60)
      }
    })

    const diasHabiles = 22
    const horasEsperadas = totalEmpleados * diasHabiles * 8

    // CAMBIOS DE TURNO
    const cambiosTurno = await prisma.cambioTurno.findMany({
      where: {
        empleadoOrigen: { empresaId: "empresa-001", esDemostracion: false },
        createdAt: { gte: inicioMes, lte: finMes }
      }
    })

    // GRUPOS
    const grupos = await prisma.grupoTrabajo.findMany({
      where: { empresaId: "empresa-001" },
      include: { _count: { select: { empleados: true } } }
    })

    return NextResponse.json({
      mes, anio, totalEmpleados,
      fichajes: {
        total: totalFichajes,
        correctos: totalFichajes - fichajesTardios - fichajesSinSalida,
        tardios: fichajesTardios,
        sinSalida: fichajesSinSalida,
        pctCorrectos: totalFichajes > 0 ? ((totalFichajes - fichajesTardios) / totalFichajes * 100).toFixed(1) : "0",
        pctTardios: totalFichajes > 0 ? (fichajesTardios / totalFichajes * 100).toFixed(1) : "0"
      },
      vacaciones: {
        total: vacaciones.length,
        aprobadas: vacAprobadas.length,
        pendientes: vacPendientes.length,
        rechazadas: vacRechazadas.length,
        diasAprobados
      },
      bajas: {
        total: bajas.length,
        enCurso: bajas.filter(b => !b.fechaFin).length
      },
      horas: {
        totales: Math.round(horasTotales),
        esperadas: horasEsperadas,
        promedioPorEmpleado: totalEmpleados > 0 ? Math.round(horasTotales / totalEmpleados) : 0,
        pctCumplimiento: horasEsperadas > 0 ? (horasTotales / horasEsperadas * 100).toFixed(1) : "0"
      },
      cambiosTurno: {
        total: cambiosTurno.length,
        aprobados: cambiosTurno.filter(c => c.estado === "APROBADO").length,
        pendientes: cambiosTurno.filter(c => c.estado === "PENDIENTE").length
      },
      grupos: grupos.map(g => ({
        nombre: g.nombre,
        color: g.color,
        empleados: g._count.empleados
      }))
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener reportes" }, { status: 500 })
  }
}