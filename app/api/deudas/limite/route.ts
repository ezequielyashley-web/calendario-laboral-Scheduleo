import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

async function puedeGestionarDeudas(userId: string): Promise<boolean> {
  const solicitante = await prisma.user.findUnique({ where: { id: userId } })
  const permisos: any = (solicitante as any)?.permisos || {}
  return !!permisos.deudas_mod
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    if (auth.role !== "SUPER_ADMIN") {
      const solicitante = await prisma.user.findUnique({ where: { id: auth.userId } })
      const permisos: any = (solicitante as any)?.permisos || {}
      if (!permisos.deudas_ver) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"
    const limites = await prisma.$queryRaw`
      SELECT l.*, e.nombre as empleado_nombre
      FROM "LimiteAnticipo" l
      LEFT JOIN "Empleado" e ON e.id = l."empleadoId"
      WHERE l."empresaId" = ${empresaId}
      ORDER BY l."esGeneral" DESC
    ` as any[]
    return NextResponse.json(limites)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener limites" }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    if (auth.role !== "SUPER_ADMIN") {
      const autorizado = await puedeGestionarDeudas(auth.userId)
      if (!autorizado) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    const body = await req.json()
    const { empleadoId, empresaId, limite, esGeneral } = body
    const id = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "LimiteAnticipo" (id, "empleadoId", "empresaId", limite, "esGeneral")
      VALUES (${id}, ${empleadoId || null}, ${empresaId || "empresa-001"}, ${limite}, ${esGeneral || false})
      ON CONFLICT ("empleadoId", "empresaId") DO UPDATE SET limite = ${limite}, "esGeneral" = ${esGeneral || false}
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar limite" }, { status: 500 })
  }
}