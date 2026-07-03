import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const config = await prisma.$queryRaw`
      SELECT "modoDemo" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    return NextResponse.json({ modoDemo: config[0]?.modoDemo ?? false })
  } catch {
    return NextResponse.json({ modoDemo: false })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { modoDemo } = await req.json()
    await prisma.$executeRaw`
      UPDATE "Configuracion" SET "modoDemo" = ${modoDemo}
    `
    return NextResponse.json({ ok: true, modoDemo })
  } catch (error) {
    console.error("Error actualizando modoDemo:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}