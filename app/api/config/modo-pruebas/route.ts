import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const config = await prisma.$queryRaw`
      SELECT "modoDemo", "modoPruebas" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    const modoDemo = config[0]?.modoDemo ?? false
    const modoPruebasManual = config[0]?.modoPruebas ?? false
    return NextResponse.json({ modoPruebas: modoDemo || modoPruebasManual, modoPruebasManual, modoDemo })
  } catch {
    return NextResponse.json({ modoPruebas: false, modoPruebasManual: false, modoDemo: false })
  }
}
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo el Super Admin puede modificar esto" }, { status: 403 })
  }
  try {
    const { modoPruebas } = await req.json()
    await prisma.$executeRaw`
      UPDATE "Configuracion" SET "modoPruebas" = ${modoPruebas}
    `
    return NextResponse.json({ ok: true, modoPruebas })
  } catch (error) {
    console.error("Error actualizando modoPruebas:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}