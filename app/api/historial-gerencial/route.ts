import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (email) {
      const historial = await prisma.$queryRaw`
        SELECT * FROM "HistorialGerencial" WHERE email = ${email.toLowerCase()} ORDER BY "creadoEn" DESC
      ` as any[]
      return NextResponse.json(historial)
    }

    const historial = await prisma.$queryRaw`
      SELECT * FROM "HistorialGerencial" ORDER BY "creadoEn" DESC LIMIT 50
    ` as any[]
    return NextResponse.json(historial)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 })
  }
}