import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || ""
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    const [consultasHoy, tokensMes] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as total FROM "ChatAI" WHERE "userId"=${userId} AND rol='user' AND "createdAt">=${hoy}` as Promise<any[]>,
      prisma.$queryRaw`SELECT COALESCE(SUM(tokens),0) as total FROM "ChatAI" WHERE "createdAt">=${inicioMes}` as Promise<any[]>
    ])

    return NextResponse.json({
      consultas: Number((await consultasHoy)[0]?.total || 0),
      tokens: Number((await tokensMes)[0]?.total || 0)
    })
  } catch {
    return NextResponse.json({ consultas: 0, tokens: 0 })
  }
}