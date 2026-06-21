import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 })

    await prisma.$executeRaw`
      UPDATE "User" SET "ultimaActividad" = NOW() WHERE id = ${userId}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error heartbeat" }, { status: 500 })
  }
}