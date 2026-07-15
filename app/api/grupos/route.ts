import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const cached = unstable_cache(
      () => prisma.grupoTrabajo.findMany({
        where: { empresaId: auth.empresaId },
        orderBy: { nombre: "asc" }
      }),
      [`grupos-trabajo-${auth.empresaId}`],
      { tags: ["grupos-trabajo"] }
    )
    const grupos = await cached()

    return NextResponse.json(grupos)
  } catch (error) {
    console.error("Error en /api/grupos:", error)
    return NextResponse.json({ error: "Error al obtener los grupos" }, { status: 500 })
  }
}