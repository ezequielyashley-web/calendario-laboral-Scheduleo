import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { debeRecomendarQStash } from "@/lib/asyncTask"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ recomendar: false, fallos: 0 })
    }
    const resultado = await debeRecomendarQStash()
    return NextResponse.json(resultado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ recomendar: false, fallos: 0 })
  }
}