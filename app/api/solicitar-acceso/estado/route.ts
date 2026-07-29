import { NextRequest, NextResponse } from "next/server"
import { peekRateLimit } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = (searchParams.get("email") || "").toLowerCase().trim()
  if (!email) return NextResponse.json({ bloqueado: false, segundosRestantes: 0 })

  const estado = peekRateLimit("solicitar-acceso_email_" + email)
  return NextResponse.json(estado)
}