import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { InformeFichajesPDF } from "@/lib/pdf/InformeFichajesPDF"
import { createElement } from "react"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const fichajesRaw = await prisma.$queryRaw`
      SELECT f.fecha, f."horaEntrada", f."horaSalida", e.nombre, e.apellidos
      FROM "Fichaje" f
      INNER JOIN "Empleado" e ON e.id = f."empleadoId"
      WHERE e."empresaId" = 'empresa-001' AND e."esDemostracion" = false
      ORDER BY f.fecha DESC
      LIMIT 500
    ` as any[]

    const fichajes = fichajesRaw.map(f => ({
      fecha: f.fecha,
      horaEntrada: f.horaEntrada,
      horaSalida: f.horaSalida,
      empleadoNombre: `${f.nombre} ${f.apellidos}`
    }))

    const empresa: any = await prisma.empresa.findUnique({ where: { id: "empresa-001" } })

    const buffer = await renderToBuffer(
      createElement(InformeFichajesPDF, {
        titulo: "Informe general de fichajes",
        subtitulo: `${empresa?.nombreComercial || empresa?.nombre || "Empresa"} — ultimos 500 registros`,
        fichajes,
        mostrarEmpleado: true
      }) as any
    )

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="fichajes-empresa.pdf"`
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}