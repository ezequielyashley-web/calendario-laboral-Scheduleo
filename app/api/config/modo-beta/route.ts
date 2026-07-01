import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const config = await (prisma as any).configuracion.findFirst()
    return NextResponse.json({ modoBeta: config?.modosBeta ?? true })
  } catch {
    return NextResponse.json({ modoBeta: true })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { modoBeta } = await req.json()
    const config = await (prisma as any).configuracion.findFirst()
    if (config) {
      await (prisma as any).configuracion.update({ where: { id: config.id }, data: { modosBeta: modoBeta } })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}