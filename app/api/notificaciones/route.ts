import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ mensajesNoLeidos: 0, solicitudesPendientes: 0, total: 0 })

    const userId = (session.user as any).id
    if (!userId) return NextResponse.json({ mensajesNoLeidos: 0, solicitudesPendientes: 0, total: 0 })

    const mensajes = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM "Mensaje" m
      INNER JOIN "Conversacion" c ON c.id = m."conversacionId"
      WHERE m."leido" = false
        AND m."autorId" != ${userId}
        AND (c."solicitante_id" = ${userId} OR c."receptor_id" = ${userId})
        AND c."estado" = 'aceptada'
    ` as any[]

    const solicitudes = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM "Conversacion"
      WHERE "receptor_id" = ${userId}
        AND "estado" = 'pendiente'
    ` as any[]

    const mensajesNoLeidos = Number(mensajes[0]?.total || 0)
    const solicitudesPendientes = Number(solicitudes[0]?.total || 0)

    return NextResponse.json({ mensajesNoLeidos, solicitudesPendientes, total: mensajesNoLeidos + solicitudesPendientes })
  } catch (error) {
    console.error('Error notificaciones:', error)
    return NextResponse.json({ mensajesNoLeidos: 0, solicitudesPendientes: 0, total: 0 })
  }
}