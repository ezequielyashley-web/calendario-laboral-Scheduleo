import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  const miId = auth.userId
  const conId = req.nextUrl.searchParams.get("con")
  if (!conId) return NextResponse.json([])
  const mensajes = await prisma.mensajePanelEjecutivo.findMany({
    where: {
      OR: [
        { remitenteId: miId, destinatarioId: conId },
        { remitenteId: conId, destinatarioId: miId },
      ]
    },
    orderBy: { createdAt: "asc" },
    take: 100
  })
  return NextResponse.json(mensajes)
}
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  const { paraId, texto } = await req.json()
  if (!paraId || !texto?.trim()) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  const mensaje = await prisma.mensajePanelEjecutivo.create({
    data: { remitenteId: auth.userId, destinatarioId: paraId, texto: texto.trim() }
  })
  return NextResponse.json(mensaje)
}