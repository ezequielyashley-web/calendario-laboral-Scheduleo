/**
 * API: /api/bajas
 * GET  → listar bajas (con filtros)
 * POST → crear nueva baja manualmente
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// ── GET /api/bajas ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const estado   = searchParams.get('estado')
    const tipo     = searchParams.get('tipo')
    const pendientesINSS = searchParams.get('pendientesINSS') === 'true'

    const bajas = await prisma.$queryRaw`
      SELECT
        b.*,
        u."name" AS "empleadoNombre",
        u."email" AS "empleadoEmail"
      FROM "BajaMedica" b
      LEFT JOIN "User" u ON u.id = b."empleadoId"
      WHERE b."empresaId" = 'empresa-001'
      ${estado ? prisma.$queryRaw`AND b.estado = ${estado}` : prisma.$queryRaw``}
      ${tipo ? prisma.$queryRaw`AND b.tipo = ${tipo}` : prisma.$queryRaw``}
      ${pendientesINSS ? prisma.$queryRaw`AND b."confirmadaDatosEconomicos" = false` : prisma.$queryRaw``}
      ORDER BY b."createdAt" DESC
      LIMIT 100
    ` as any[]

    return NextResponse.json({ bajas, total: bajas.length })

  } catch (error: any) {
    console.error('GET /api/bajas error:', error)
    return NextResponse.json({ error: 'Error al obtener bajas' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// ── POST /api/bajas ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const {
      empleadoId,
      tipo = 'it_comun',
      numeroParteINSS,
      fechaInicio,
      medico,
      diagnostico,
    } = body

    if (!empleadoId || !fechaInicio) {
      return NextResponse.json({ error: 'empleadoId y fechaInicio son obligatorios' }, { status: 400 })
    }

    // Verificar que no existe ya ese número de parte
    if (numeroParteINSS) {
      const existe = await prisma.$queryRaw`
        SELECT id FROM "BajaMedica" WHERE "numeroParteINSS" = ${numeroParteINSS} LIMIT 1
      ` as any[]
      if (existe.length > 0) {
        return NextResponse.json({ error: 'Ya existe una baja con ese número de parte INSS' }, { status: 409 })
      }
    }

    // Calcular porcentaje inicial según tipo
    const porcentaje = ['at','it_profesional','maternidad','paternidad','menstruacion','semana39','interrupcion_embarazo'].includes(tipo) ? 75 : 0

    await prisma.$executeRaw`
      INSERT INTO "BajaMedica" (
        "id", "empleadoId", "empresaId", "tipo", "estado",
        "numeroParteINSS", "fechaInicio", "medico", "diagnostico",
        "porcentajePrestacion", "creadoAutomaticamente",
        "fechaRecepcionINSS", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${empleadoId},
        'empresa-001',
        ${tipo},
        'pendiente_confirmacion_inss',
        ${numeroParteINSS || null},
        ${new Date(fechaInicio)},
        ${medico || null},
        ${diagnostico || null},
        ${porcentaje},
        false,
        NOW(),
        NOW()
      )
    `

    // Log de auditoría
    await prisma.$executeRaw`
      INSERT INTO "BajaMedicaLog" ("id", "bajaId", "accion", "descripcion", "usuarioId", "timestamp")
      SELECT gen_random_uuid()::text, id, 'REGISTRADA_MANUAL', 'Baja registrada manualmente por administrador', ${session.user.id || 'admin'}, NOW()
      FROM "BajaMedica" WHERE "numeroParteINSS" = ${numeroParteINSS || ''} ORDER BY "createdAt" DESC LIMIT 1
    `.catch(() => null)

    return NextResponse.json({ ok: true, message: 'Baja registrada correctamente' })

  } catch (error: any) {
    console.error('POST /api/bajas error:', error)
    return NextResponse.json({ error: 'Error al registrar baja' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

