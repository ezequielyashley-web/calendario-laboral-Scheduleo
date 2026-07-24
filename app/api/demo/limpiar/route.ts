import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo el Super Admin puede hacer esto" }, { status: 403 })
  }
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