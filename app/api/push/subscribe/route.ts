import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json()
    const { endpoint, keys } = subscription

    await prisma.$executeRaw`
      INSERT INTO "PushSubscription" (id, "userId", "empresaId", endpoint, "p256dh", auth)
      VALUES (gen_random_uuid()::text, ${userId || "admin-001"}, 'empresa-001', ${endpoint}, ${keys.p256dh}, ${keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET "p256dh" = ${keys.p256dh}, auth = ${keys.auth}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar suscripción" }, { status: 500 })
  }
}
