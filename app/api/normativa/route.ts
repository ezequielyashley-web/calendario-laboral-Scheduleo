/**
 * API: /api/normativa
 * GET  → obtener normativa por clave o todas
 * POST → actualizar texto de normativa (solo admins)
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// ── GET /api/normativa?clave=bajas_it_comun ────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clave = searchParams.get('clave')

    if (clave) {
      const normativa = await prisma.$queryRaw`
        SELECT * FROM "Normativa" WHERE clave = ${clave} LIMIT 1
      ` as any[]
      return NextResponse.json({ normativa: normativa[0] || null })
    }

    // Devolver todas
    const todas = await prisma.$queryRaw`
      SELECT * FROM "Normativa" ORDER BY "clave" ASC
    ` as any[]

    return NextResponse.json({ normativa: todas })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// ── POST /api/normativa — actualizar texto ─────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { clave, titulo, descripcion, version, fuenteUrl } = body

    if (!clave || !descripcion) {
      return NextResponse.json({ error: 'clave y descripcion son obligatorios' }, { status: 400 })
    }

    await prisma.$executeRaw`
      UPDATE "Normativa"
      SET
        "titulo"              = COALESCE(${titulo || null}, "titulo"),
        "descripcion"         = ${descripcion},
        "version"             = COALESCE(${version || null}, "version"),
        "fuenteUrl"           = COALESCE(${fuenteUrl || null}, "fuenteUrl"),
        "fechaActualizacion"  = NOW(),
        "actualizadoPor"      = 'admin',
        "updatedAt"           = NOW()
      WHERE clave = ${clave}
    `

    return NextResponse.json({ ok: true, message: 'Normativa actualizada' })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

