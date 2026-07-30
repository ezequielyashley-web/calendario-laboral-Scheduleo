import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const rateLimit = checkRateLimit("existe-email_" + ip, 20, 15 * 60 * 1000)
    if (!rateLimit.success) return NextResponse.json({ error: "Demasiadas comprobaciones" }, { status: 429 })

    const { email } = await req.json()
    if (!email || !email.includes("@")) return NextResponse.json({ existe: false })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    return NextResponse.json({ existe: !!user })
  } catch (error) {
    console.error("Error en /api/auth/existe-email:", error)
    return NextResponse.json({ existe: false })
  }
}