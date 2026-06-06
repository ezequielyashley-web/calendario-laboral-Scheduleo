import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import webpush from "web-push"

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:admin@empresa.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
)

export async function POST(req: NextRequest) {
  try {
    const { titulo, mensaje, url, empresaId } = await req.json()

    const subs = await prisma.$queryRaw`
      SELECT * FROM "PushSubscription" WHERE "empresaId" = ${empresaId || "empresa-001"}
    ` as any[]

    const resultados = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ titulo, mensaje, url: url || "/configuracion" })
        )
      )
    )

    const enviadas = resultados.filter(r => r.status === "fulfilled").length
    return NextResponse.json({ ok: true, enviadas, total: subs.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al enviar notificación" }, { status: 500 })
  }
}
