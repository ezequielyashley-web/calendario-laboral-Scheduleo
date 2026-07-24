import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const config = await prisma.$queryRaw`
      SELECT "modosBeta" FROM "Configuracion" LIMIT 1
    ` as any[]
    return NextResponse.json({ modoBeta: config[0]?.modosBeta ?? false })
  } catch {
    return NextResponse.json({ modoBeta: false })
  }
}
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo el Super Admin puede modificar esto" }, { status: 403 })
  }
  try {
    const { modoBeta } = await req.json()
    await prisma.$executeRaw`
      UPDATE "Configuracion" SET "modosBeta" = ${modoBeta}
    `
    return NextResponse.json({ ok: true, modoBeta })
  } catch (error) {
    console.error("Error actualizando modosBeta:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}