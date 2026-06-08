import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const { subscription } = await req.json()
    const { endpoint, keys } = subscription

    const userId = (session?.user as any)?.id || "admin-001"

    // Obtener empresaId del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { empresaId: true }
    })

    const empresaId = (user as any)?.empresaId || "empresa-001"

    await prisma.$executeRaw`
      INSERT INTO "PushSubscription" (id, "userId", "empresaId", endpoint, "p256dh", auth)
      VALUES (gen_random_uuid()::text, ${userId}, ${empresaId}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET "p256dh" = ${keys.p256dh}, auth = ${keys.auth}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar suscripcion" }, { status: 500 })
  }
}
