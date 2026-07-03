import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
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