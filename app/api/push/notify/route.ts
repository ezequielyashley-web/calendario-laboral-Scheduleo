import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { enviarNotificacionPush } from "@/lib/pushNotify"

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const { titulo, mensaje, url, empresaId } = await req.json()
    const resultado = await enviarNotificacionPush(titulo, mensaje, url, empresaId)
    return NextResponse.json({ ok: true, ...resultado })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al enviar notificación" }, { status: 500 })
  }
}