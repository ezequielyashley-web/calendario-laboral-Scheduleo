import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { getEmpleadoData } from "@/lib/empleadoData"
import { renderToBuffer } from "@react-pdf/renderer"
import { FichaEmpleadoPDF } from "@/lib/pdf/FichaEmpleadoPDF"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const { id } = await params
    const empleadoRaw = await prisma.$queryRaw`SELECT * FROM "Empleado" WHERE id = ${id}` as any[]
    if (!empleadoRaw.length) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    const empleadoBase: any = empleadoRaw[0]

    const empleado = await prisma.empleado.findUnique({
      where: { id },
      include: { puestoDeTrabajo: true, grupoTrabajo: true }
    })
    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    const sensible = getEmpleadoData(empleadoBase)
    const empresa = await prisma.empresa.findUnique({ where: { id: "empresa-001" } })

    const buffer = await renderToBuffer(
      FichaEmpleadoPDF({
        empleado: {
          nombre: empleado.nombre,
          apellidos: empleado.apellidos,
          numeroEmpleado: empleadoBase.numeroEmpleado,
          dni: sensible.dni,
          naf: sensible.naf,
          telefono: sensible.telefono,
          email: empleadoBase.email,
          cargo: empleadoBase.cargo,
          departamento: empleadoBase.departamento,
          fechaContratacion: empleadoBase.fechaContratacion,
          fechaNacimiento: empleadoBase.fechaNacimiento,
          salario: sensible.salario,
          puestoDeTrabajo: empleado.puestoDeTrabajo,
          grupoTrabajo: empleado.grupoTrabajo,
        },
        empresa: empresa || undefined
      })
    )

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ficha-${empleado.nombre}-${empleado.apellidos}.pdf"`
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}