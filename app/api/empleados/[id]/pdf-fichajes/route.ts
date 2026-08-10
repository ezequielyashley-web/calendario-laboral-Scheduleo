import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { InformeFichajesPDF } from "@/lib/pdf/InformeFichajesPDF"
import { createElement } from "react"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { id } = await params
    const empleado = await prisma.empleado.findUnique({ where: { id } })
    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    const fichajes = await prisma.$queryRaw`
      SELECT fecha, "horaEntrada", "horaSalida" FROM "Fichaje"
      WHERE "empleadoId" = ${id} ORDER BY fecha DESC LIMIT 200
    ` as any[]

    const empresa: any = await prisma.empresa.findUnique({ where: { id: "empresa-001" } })

    const buffer = await renderToBuffer(
      createElement(InformeFichajesPDF, {
        titulo: "Informe de fichajes",
        subtitulo: `${empleado.nombre} ${empleado.apellidos} — ${empresa?.nombreComercial || empresa?.nombre || "Empresa"}`,
        fichajes,
        mostrarEmpleado: false
      }) as any
    )

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="fichajes-${empleado.nombre}-${empleado.apellidos}.pdf"`
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}