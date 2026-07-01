import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    await Promise.all([
      (prisma as any).fichaje.deleteMany({ where: { esDemo: true } }),
      (prisma as any).vacacion.deleteMany({ where: { esDemo: true } }),
      (prisma as any).bajaMedica.deleteMany({ where: { esDemo: true } }),
      (prisma as any).cambioTurno.deleteMany({ where: { esDemo: true } }),
      (prisma as any).libranza.deleteMany({ where: { esDemo: true } }),
    ])
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Error al limpiar datos demo" }, { status: 500 })
  }
}