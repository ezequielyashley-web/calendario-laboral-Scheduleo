import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const userId = auth.userId

    await prisma.$executeRaw`
      UPDATE "User" SET "ultimaActividad" = NOW() WHERE id = ${userId}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error heartbeat" }, { status: 500 })
  }
}