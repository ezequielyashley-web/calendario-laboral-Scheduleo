import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(req.url)
    const accion = url.searchParams.get('accion')

    const usuarios = await prisma.$queryRaw`
      SELECT id, name, email, role, genero, "createdAt",
             "ultimaActividad", "esFundador", "ordenSuperAdmin", "asignadoPor", cargo, departamento
      FROM "User" WHERE id = ${id} LIMIT 1
    ` as any[]

    if (!usuarios?.length) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    const u = usuarios[0]
    const usuario = { ...u, nombre: u.name, rol: u.role }

    if (!accion) return NextResponse.json({ usuario })

    if (accion === 'notas') {
      let notas: any[] = []
      try {
        notas = await prisma.$queryRaw`
          SELECT n.id, n.contenido, n."creadoEn", n."autor_id", u.name as "autorNombre"
          FROM "NotaPrivada" n
          LEFT JOIN "User" u ON u.id = n."autor_id"
          WHERE n."usuarioId" = ${id} ORDER BY n."creadoEn" DESC
        ` as any[]
      } catch { notas = [] }
      return NextResponse.json({ notas })
    }

    if (accion === 'actividad') {
      let actividad: any[] = []
      try {
        actividad = await prisma.$queryRaw`
          SELECT id, "usuarioId", accion, motivo, "creadoEn"
          FROM "HistorialGerencial"
          WHERE "usuarioId" = ${id} ORDER BY "creadoEn" DESC LIMIT 100
        ` as any[]
      } catch { actividad = [] }
      return NextResponse.json({ actividad })
    }

    if (accion === 'sesiones') {
      let sesiones: any[] = []
      try {
        sesiones = await prisma.$queryRaw`
          SELECT id, ip, dispositivo, "creadoEn" FROM "SesionLog"
          WHERE "usuarioId" = ${id} ORDER BY "creadoEn" DESC LIMIT 20
        ` as any[]
      } catch { sesiones = [] }
      return NextResponse.json({ sesiones, ultimaActividad: u.ultimaActividad })
    }

    if (accion === 'vacaciones') {
      let vacaciones: any[] = []
      try {
        vacaciones = await prisma.$queryRaw`
          SELECT id, "fechaInicio", "fechaFin", estado, motivo, "creadoEn"
          FROM "Vacacion" WHERE "empleadoId" = ${id} ORDER BY "creadoEn" DESC LIMIT 50
        ` as any[]
      } catch { vacaciones = [] }
      return NextResponse.json({ vacaciones })
    }

    if (accion === 'permisos') {
      let permisos: any = null
      try {
        const rows = await prisma.$queryRaw`
          SELECT permisos FROM "User" WHERE id = ${id} LIMIT 1
        ` as any[]
        permisos = rows[0]?.permisos || null
      } catch { permisos = null }
      return NextResponse.json({ permisos })
    }

    return NextResponse.json({ usuario })
  } catch (error) {
    console.error('Error GET /panel-ejecutivo/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { accion } = body

    if (accion === 'actualizar_datos') {
      const { nombre, genero } = body
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET name = $1, genero = $2 WHERE id = $3`,
        nombre, genero || null, id
      )
      return NextResponse.json({ ok: true })
    }

    if (accion === 'resetear_password') {
      const { nuevaPassword } = body
      const { validatePassword } = require('@/lib/validation')
      const validacion = validatePassword(nuevaPassword)
      if (!validacion.valid) {
        return NextResponse.json({ error: validacion.errors.join('. ') }, { status: 400 })
      }
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash(nuevaPassword, 10)
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET password = $1 WHERE id = $2`, hash, id
      )
      return NextResponse.json({ ok: true })
    }

    if (accion === 'revocar_acceso') {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET activo = false WHERE id = $1`, id
      )
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Accion no valida' }, { status: 400 })
  } catch (error) {
    console.error('Error PATCH /panel-ejecutivo/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { accion } = body

    if (accion === 'agregar_nota') {
      const { contenido, autorId } = body
      const notaId = `nota_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      await prisma.$executeRawUnsafe(
        `INSERT INTO "NotaPrivada" (id, "usuarioId", "autor_id", contenido, "creadoEn") VALUES ($1, $2, $3, $4, NOW())`,
        notaId, id, autorId, contenido
      )
      return NextResponse.json({ ok: true, id: notaId })
    }

    if (accion === 'eliminar_nota') {
      const { notaId } = body
      await prisma.$executeRawUnsafe(
        `DELETE FROM "NotaPrivada" WHERE id = $1 AND "usuarioId" = $2`, notaId, id
      )
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Accion no valida' }, { status: 400 })
  } catch (error) {
    console.error('Error POST /panel-ejecutivo/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}