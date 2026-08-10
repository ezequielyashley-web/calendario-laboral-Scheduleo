import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { InformeVacacionesPDF } from "@/lib/pdf/InformeVacacionesPDF"
import { createElement } from "react"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { id } = await params
    const empleado = await prisma.empleado.findUnique({ where: { id } })
    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    const empleadoBase: any = empleado
    const vacaciones = await prisma.$queryRaw`
      SELECT "fechaInicio", "fechaFin", estado, motivo FROM "Vacacion"
      WHERE "empleadoId" = ${id} ORDER BY "fechaInicio" DESC
    ` as any[]

    const empresa = await prisma.empresa.findUnique({ where: { id: "empresa-001" } })

    const buffer = await renderToBuffer(
      createElement(InformeVacacionesPDF, {
        empleado: { nombre: empleado.nombre, apellidos: empleado.apellidos, numeroEmpleado: empleadoBase.numeroEmpleado },
        empresa: empresa || undefined,
        vacaciones
      }) as any
    )

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="vacaciones-${empleado.nombre}-${empleado.apellidos}.pdf"`
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}