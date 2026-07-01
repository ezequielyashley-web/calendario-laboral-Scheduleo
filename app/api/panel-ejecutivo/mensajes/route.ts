import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const miId = req.nextUrl.searchParams.get("yo")
  const conId = req.nextUrl.searchParams.get("con")
  if (!miId || !conId) return NextResponse.json([])
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
  const { remitenteId, paraId, texto } = await req.json()
  if (!remitenteId || !paraId || !texto?.trim()) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  const mensaje = await prisma.mensajePanelEjecutivo.create({
    data: { remitenteId, destinatarioId: paraId, texto: texto.trim() }
  })
  return NextResponse.json(mensaje)
}