import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { accion, fechaFin, observaciones, baseReguladora, convenioCubre100 } = body

    const baja = await prisma.bajaMedica.findUnique({ where: { id } })
    if (!baja) return NextResponse.json({ error: 'Baja no encontrada' }, { status: 404 })

    let data: any = { updatedAt: new Date() }

    if (accion === 'CONFIRMAR_INSS') {
      data.confirmadaDatosEconomicos = true
      data.fechaConfirmacion = new Date()
      data.confirmadoPorId = (session.user as any)?.id || null
      data.estado = 'activa'
      if (baseReguladora) data.baseReguladora = baseReguladora
      if (convenioCubre100 !== undefined) data.convenioCubre100 = convenioCubre100
    } else if (accion === 'ALTA_MEDICA') {
      data.estado = 'alta'
      data.fechaFin = fechaFin ? new Date(fechaFin) : new Date()
      const inicio = new Date(baja.fechaInicio)
      const fin = new Date(data.fechaFin)
      data.diasDuracion = Math.floor((fin.getTime() - inicio.getTime()) / 86400000)
    } else if (accion === 'EDITAR') {
      if (body.medico) data.medico = body.medico
      if (body.diagnostico) data.diagnostico = body.diagnostico
      if (body.numeroParteINSS) data.numeroParteINSS = body.numeroParteINSS
      if (baseReguladora) data.baseReguladora = baseReguladora
      if (convenioCubre100 !== undefined) data.convenioCubre100 = convenioCubre100
    }

    const updated = await prisma.bajaMedica.update({ where: { id }, data })

    // Log auditoría
    try {
      await prisma.$executeRaw`
        INSERT INTO "BajaMedicaLog" (id, "bajaId", accion, descripcion, "usuarioId", timestamp)
        VALUES (gen_random_uuid()::text, ${id}, ${accion}, ${observaciones || accion}, ${(session.user as any)?.id || 'admin'}, NOW())
      `
    } catch { }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/bajas/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const baja = await prisma.bajaMedica.findUnique({ where: { id } })
    if (!baja) return NextResponse.json({ error: 'Baja no encontrada' }, { status: 404 })
    if (baja.estado === 'activa') return NextResponse.json({ error: 'No se puede eliminar una baja activa' }, { status: 400 })

    await prisma.bajaMedica.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/bajas/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

