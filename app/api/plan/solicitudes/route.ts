import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const solicitudes = await prisma.solicitudPlan.findMany({
      where: { estado: "pendiente" },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(solicitudes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}