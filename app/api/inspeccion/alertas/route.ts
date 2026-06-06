import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 })

    const tokens = await prisma.$queryRaw`
      SELECT * FROM "TokenInspeccion"
      WHERE token = ${token} AND "expiraEn" > NOW()
      LIMIT 1
    ` as any[]

    if (!tokens.length) return NextResponse.json({ error: "Token inválido" }, { status: 401 })

    const fechaDesde = desde || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const fechaHasta = hasta || new Date().toISOString()

    const fichajes = await prisma.$queryRaw`
      SELECT f.*, e.nombre, e.apellidos, e."numeroEmpleado"
      FROM "Fichaje" f
      LEFT JOIN "Empleado" e ON e.id = f."empleadoId"
      WHERE f."empresaId" = 'empresa-001'
      AND f."horaEntrada" >= ${fechaDesde}::timestamptz
      AND f."horaEntrada" <= ${fechaHasta}::timestamptz
      AND f."horaSalida" IS NOT NULL
      ORDER BY f."empleadoId", f."horaEntrada"
    ` as any[]

    const porEmpleado: Record<string, any> = {}
    for (const f of fichajes) {
      const empId = f.empleadoid
      if (!porEmpleado[empId]) {
        porEmpleado[empId] = {
          id: empId,
          nombre: f.nombre,
          apellidos: f.apellidos,
          numeroEmpleado: f.numeroempleado,
          semanas: {}
        }
      }
      const fecha = new Date(f.horaentrada)
      const semana = getWeekNumber(fecha)
      const clave = `${fecha.getFullYear()}-S${semana}`
      if (!porEmpleado[empId].semanas[clave]) {
        porEmpleado[empId].semanas[clave] = { horas: 0, fichajes: 0, clave }
      }
      const horas = (new Date(f.horasalida).getTime() - new Date(f.horaentrada).getTime()) / 3600000
      porEmpleado[empId].semanas[clave].horas += horas
      porEmpleado[empId].semanas[clave].fichajes++
    }

    const alertas: any[] = []
    for (const emp of Object.values(porEmpleado)) {
      for (const semana of Object.values(emp.semanas) as any[]) {
        if (semana.horas > 37.5) {
          alertas.push({
            empleadoId: emp.id,
            nombre: emp.nombre,
            apellidos: emp.apellidos,
            numeroEmpleado: emp.numeroEmpleado,
            semana: semana.clave,
            horasTrabajadas: parseFloat(semana.horas.toFixed(2)),
            horasExceso: parseFloat((semana.horas - 37.5).toFixed(2)),
            fichajes: semana.fichajes,
            gravedad: semana.horas > 45 ? "CRITICA" : semana.horas > 40 ? "ALTA" : "MEDIA"
          })
        }
      }
    }

    alertas.sort((a, b) => b.horasExceso - a.horasExceso)

    return NextResponse.json({ alertas, totalEmpleados: Object.keys(porEmpleado).length, totalAlertas: alertas.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al calcular alertas" }, { status: 500 })
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
