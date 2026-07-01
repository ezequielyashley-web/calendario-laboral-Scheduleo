import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const conId = req.nextUrl.searchParams.get("con")
  if (!conId) return NextResponse.json([])
  const mensajes = await prisma.mensajeGerencial.findMany({
    where: {
      OR: [
        { remitenteId: session.user.id, destinatarioId: conId },
        { remitenteId: conId, destinatarioId: session.user.id },
      ]
    },
    orderBy: { createdAt: "asc" },
    take: 100
  })
  return NextResponse.json(mensajes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { paraId, texto } = await req.json()
  if (!paraId || !texto?.trim()) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  const mensaje = await prisma.mensajeGerencial.create({
    data: { remitenteId: session.user.id, destinatarioId: paraId, texto: texto.trim() }
  })
  return NextResponse.json(mensaje)
}