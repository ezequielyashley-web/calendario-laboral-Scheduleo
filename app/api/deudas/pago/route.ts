import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
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
