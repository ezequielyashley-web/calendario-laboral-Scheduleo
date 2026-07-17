import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true, tourBienvenidaVisto: true },
    })
    if (!user) return NextResponse.json({ mostrar: false })

    const aplica = user.role === "SUPER_ADMIN" || user.role === "GERENCIAL"
    return NextResponse.json({
      mostrar: aplica && !user.tourBienvenidaVisto,
      role: user.role,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ mostrar: false })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    await prisma.user.update({
      where: { id: auth.userId },
      data: { tourBienvenidaVisto: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al marcar el tour como visto" }, { status: 500 })
  }
}