import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const alertas: { tipo: string; mensaje: string; icono: string }[] = []

    // Vacaciones pendientes hace mas de 5 dias
    const vacsPendientes = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "Vacacion"
      WHERE estado = 'PENDIENTE' AND "createdAt" < NOW() - INTERVAL '5 days'
    ` as any[]
    const totalVacsAntiguas = Number(vacsPendientes[0]?.total || 0)
    if (totalVacsAntiguas > 0) {
      alertas.push({ tipo: "vacaciones", icono: "🏖️", mensaje: `Hay ${totalVacsAntiguas} solicitud(es) de vacaciones pendientes desde hace mas de 5 dias sin revisar.` })
    }

    // Solicitudes de cambio de turno pendientes
    const cambiosPendientes = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "CambioTurno" WHERE estado = 'PENDIENTE'
    ` as any[]
    const totalCambios = Number(cambiosPendientes[0]?.total || 0)
    if (totalCambios > 0) {
      alertas.push({ tipo: "cambios", icono: "🔄", mensaje: `Hay ${totalCambios} solicitud(es) de cambio de turno pendientes de aprobar.` })
    }

    // Bajas medicas activas
    const bajasActivas = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "BajaMedica"
    ` as any[]
    const totalBajas = Number(bajasActivas[0]?.total || 0)
    if (totalBajas > 0) {
      alertas.push({ tipo: "bajas", icono: "⚕️", mensaje: `Actualmente hay ${totalBajas} baja(s) medica(s) registradas en el sistema.` })
    }

    // Empleados sin grupo asignado
    const sinGrupo = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "Empleado" WHERE "grupoTrabajoId" IS NULL AND "empresaId" = 'empresa-001'
    ` as any[]
    const totalSinGrupo = Number(sinGrupo[0]?.total || 0)
    if (totalSinGrupo > 0) {
      alertas.push({ tipo: "grupos", icono: "⚠️", mensaje: `Hay ${totalSinGrupo} empleado(s) sin grupo de trabajo asignado.` })
    }

    return NextResponse.json({ alertas })
  } catch (error) {
    console.error("Error generando alertas:", error)
    return NextResponse.json({ alertas: [] })
  }
}