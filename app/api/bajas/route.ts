import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado')
    const tipo = searchParams.get('tipo')
    const empleadoId = searchParams.get('empleadoId')

    const where: any = { empresaId: 'empresa-001' }
    if (estado) where.estado = estado
    if (tipo) where.tipo = tipo
    if (empleadoId) where.empleadoId = empleadoId

    const bajas = await prisma.bajaMedica.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            numeroEmpleado: true,
                grupoTrabajo: { select: { nombre: true, color: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calcular alertas para cada baja
    const bajasConAlertas = bajas.map(b => {
      const alertas = []
      const hoy = new Date()
      const inicio = new Date(b.fechaInicio)
      const diasTranscurridos = Math.max(0, Math.floor((hoy.getTime() - inicio.getTime()) / 86400000))

      // Alerta 3 días hábiles para confirmar datos económicos
      if (!b.confirmadaDatosEconomicos && b.fechaRecepcionINSS) {
        const recepcion = new Date(b.fechaRecepcionINSS)
        const diasDesdeRecepcion = Math.floor((hoy.getTime() - recepcion.getTime()) / 86400000)
        if (diasDesdeRecepcion >= 2) {
          alertas.push({ tipo: 'URGENTE', msg: `⚠️ Confirmar datos económicos al INSS — plazo máximo 3 días hábiles (llevas ${diasDesdeRecepcion} días)` })
        }
      }

      // Alerta 545 días — riesgo incapacidad permanente
      if (diasTranscurridos >= 500) {
        alertas.push({ tipo: 'CRITICO', msg: `🚨 ${diasTranscurridos} días de baja — a partir del día 545 el contrato queda suspendido e interviene el INSS` })
      } else if (diasTranscurridos >= 450) {
        alertas.push({ tipo: 'AVISO', msg: `⚠️ ${diasTranscurridos} días de baja — quedan ${545 - diasTranscurridos} días para posible incapacidad permanente` })
      }

      // Calcular porcentaje prestación
      let porcentaje = 0
      if (['maternidad', 'paternidad'].includes(b.tipo)) {
        porcentaje = 100
      } else if (['at', 'it_profesional'].includes(b.tipo)) {
        porcentaje = diasTranscurridos >= 1 ? 75 : 0
      } else if (['menstruacion', 'semana39'].includes(b.tipo)) {
        porcentaje = diasTranscurridos <= 20 ? 60 : 75
      } else if (b.tipo === 'interrupcion_embarazo') {
        porcentaje = diasTranscurridos >= 2 ? 75 : 0
      } else {
        // IT común
        if (diasTranscurridos <= 3) porcentaje = 0
        else if (diasTranscurridos <= 20) porcentaje = 60
        else porcentaje = 75
      }

      // Quién paga
      let quienPaga = 'EMPRESA'
      if (['maternidad', 'paternidad', 'menstruacion', 'semana39'].includes(b.tipo)) quienPaga = 'SS'
      else if (['at', 'it_profesional'].includes(b.tipo)) quienPaga = 'MUTUA'
      else if (b.tipo === 'interrupcion_embarazo') quienPaga = diasTranscurridos >= 2 ? 'SS' : 'EMPRESA'
      else if (b.tipo === 'it_comun' && diasTranscurridos > 3) quienPaga = 'SS'

      return {
        ...b,
        diasTranscurridos,
        porcentajeActual: porcentaje,
        quienPaga,
        alertas,
      }
    })

    return NextResponse.json({ bajas: bajasConAlertas, total: bajasConAlertas.length })
  } catch (error) {
    console.error('GET /api/bajas error:', error)
    return NextResponse.json({ error: 'Error al obtener bajas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { empleadoId, tipo = 'it_comun', numeroParteINSS, fechaInicio, medico, diagnostico, baseReguladora } = body

    if (!empleadoId || !fechaInicio) {
      return NextResponse.json({ error: 'empleadoId y fechaInicio son obligatorios' }, { status: 400 })
    }

    if (numeroParteINSS) {
      const existe = await prisma.bajaMedica.findFirst({ where: { numeroParteINSS } })
      if (existe) return NextResponse.json({ error: 'Ya existe una baja con ese número de parte INSS' }, { status: 409 })
    }

    const baja = await prisma.bajaMedica.create({
      data: {
        id: crypto.randomUUID(),
        empleadoId,
        empresaId: 'empresa-001',
        tipo,
        estado: 'pendiente_confirmacion_inss',
        numeroParteINSS: numeroParteINSS || null,
        fechaInicio: new Date(fechaInicio),
        medico: medico || null,
        diagnostico: diagnostico || null,
        baseReguladora: baseReguladora || null,
        porcentajePrestacion: 0,
        creadoAutomaticamente: false,
        fechaRecepcionINSS: new Date(),
        confirmadaDatosEconomicos: false,
        updatedAt: new Date(),
      }
    })

    // Notificación push
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/push/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: '🏥 Nueva baja médica registrada',
          mensaje: `Se ha registrado una baja de tipo ${tipo} — confirmar datos al INSS en 3 días hábiles`,
          url: '/bajas',
          empresaId: 'empresa-001',
        }),
      })
    } catch { }

    return NextResponse.json(baja, { status: 201 })
  } catch (error) {
    console.error('POST /api/bajas error:', error)
    return NextResponse.json({ error: 'Error al registrar baja' }, { status: 500 })
  }
}


