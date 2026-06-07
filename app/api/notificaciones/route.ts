import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const notifs = await prisma.$queryRaw`
      SELECT * FROM "Notificacion"
      WHERE "empresaId" = 'empresa-001'
      ORDER BY "creadoEn" DESC
      LIMIT 50
    ` as any[]
    return NextResponse.json(notifs)
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (id) {
      await prisma.$executeRaw`UPDATE "Notificacion" SET leida = true WHERE id = ${id}`
    } else {
      await prisma.$executeRaw`UPDATE "Notificacion" SET leida = true WHERE "empresaId" = 'empresa-001'`
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
