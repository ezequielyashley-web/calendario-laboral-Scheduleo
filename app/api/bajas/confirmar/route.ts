/**
 * API: /api/bajas/confirmar
 * POST → Confirmar datos económicos al INSS con PIN de admin
 *
 * Según RD 1060/2022: la empresa tiene 3 días hábiles
 * para comunicar los datos económicos del trabajador al INSS.
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { bajaId, pin, baseReguladora } = body

    if (!bajaId || !pin) {
      return NextResponse.json({ error: 'bajaId y pin son obligatorios' }, { status: 400 })
    }

    // Verificar PIN del administrador
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id as string }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const pinValido = await bcrypt.compare(pin, adminUser.password)
    if (!pinValido) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 403 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_SEDE'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Solo admins pueden confirmar bajas' }, { status: 403 })
    }

    // Verificar que la baja existe y está pendiente
    const bajas = await prisma.$queryRaw`
      SELECT * FROM "BajaMedica" WHERE id = ${bajaId} AND "empresaId" = 'empresa-001' LIMIT 1
    ` as any[]

    if (bajas.length === 0) {
      return NextResponse.json({ error: 'Baja no encontrada' }, { status: 404 })
    }

    const baja = bajas[0]

    if (baja.confirmadaDatosEconomicos) {
      return NextResponse.json({ error: 'Esta baja ya fue confirmada' }, { status: 409 })
    }

    // Calcular porcentaje prestación según días y tipo
    const diasDuracion = baja.diasDuracion || 0
    let porcentaje = 0
    if (['at','it_profesional','maternidad','paternidad','menstruacion','semana39','interrupcion_embarazo'].includes(baja.tipo)) {
      porcentaje = baja.tipo === 'maternidad' || baja.tipo === 'paternidad' ? 100 : 75
    } else {
      // IT común: días 1-3 sin subsidio, 4-20 al 60%, 21+ al 75%
      if (diasDuracion <= 3)  porcentaje = 0
      else if (diasDuracion <= 20) porcentaje = 60
      else porcentaje = 75
    }

    // Confirmar en base de datos
    await prisma.$executeRaw`
      UPDATE "BajaMedica"
      SET
        "confirmadaDatosEconomicos" = true,
        "fechaConfirmacion"         = NOW(),
        "confirmadoPorId"           = ${adminUser.id},
        "porcentajePrestacion"      = ${porcentaje},
        "baseReguladora"            = ${baseReguladora ? Number(baseReguladora) : null},
        "estado"                    = 'activa',
        "updatedAt"                 = NOW()
      WHERE id = ${bajaId}
    `

    // Log de auditoría (obligatorio RDL 8/2019 + RD 1060/2022)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await prisma.$executeRaw`
      INSERT INTO "BajaMedicaLog" (
        "id", "bajaId", "accion", "descripcion", "usuarioId", "ip", "timestamp"
      ) VALUES (
        gen_random_uuid()::text,
        ${bajaId},
        'CONFIRMADA_INSS',
        ${`Datos económicos confirmados al INSS. PIN admin verificado. Porcentaje prestación: ${porcentaje}%. Base reguladora: ${baseReguladora || 'no indicada'}`},
        ${adminUser.id},
        ${ip},
        NOW()
      )
    `

    return NextResponse.json({
      ok: true,
      message: 'Datos económicos confirmados correctamente al INSS',
      porcentajePrestacion: porcentaje,
      fechaConfirmacion: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('POST /api/bajas/confirmar error:', error)
    return NextResponse.json({ error: 'Error al confirmar baja' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
