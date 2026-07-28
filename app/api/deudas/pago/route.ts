import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    if (auth.role !== "SUPER_ADMIN") {
      const solicitante = await prisma.user.findUnique({ where: { id: auth.userId } })
      const permisos: any = (solicitante as any)?.permisos || {}
      if (!permisos.deudas_mod) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    const body = await req.json()
    const { deudaId, importe, notas } = body
    const pagoId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "PagoDeuda" (id, "deudaId", importe, notas)
      VALUES (${pagoId}, ${deudaId}, ${importe}, ${notas || ""})
    `
    await prisma.$executeRaw`
      UPDATE "Deuda" SET
        "importePagado" = "importePagado" + ${importe},
        "cuotasPagadas" = "cuotasPagadas" + 1,
        estado = CASE WHEN "importePagado" + ${importe} >= "importeTotal" THEN 'PAGADA' ELSE estado END,
        "updatedAt" = NOW()
      WHERE id = ${deudaId}
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 })
  }
}