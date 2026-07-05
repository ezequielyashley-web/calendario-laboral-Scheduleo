import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token"
    })
    if (!token?.id) return NextResponse.json({ mensajesNoLeidos: 0, solicitudesPendientes: 0, total: 0 })

    const userId = token.id as string

    const mensajes = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM "Mensaje" m
      INNER JOIN "Conversacion" c ON c.id = m."conversacionId"
      WHERE m."leido" = false
        AND m."autorId" != ${userId}
        AND (c."solicitante_id" = ${userId} OR c."receptor_id" = ${userId})
        AND c."estado" = 'activa'
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
    console.error(error)
    return NextResponse.json({ mensajesNoLeidos: 0, solicitudesPendientes: 0, total: 0 })
  }
}