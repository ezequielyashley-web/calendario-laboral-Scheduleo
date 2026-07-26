import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { getEmpleadoData } from "@/lib/empleadoData"
import ExcelJS from "exceljs"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const empleadosRaw = await prisma.$queryRaw`
      SELECT * FROM "Empleado" WHERE "empresaId" = 'empresa-001' AND "esDemostracion" = false ORDER BY nombre ASC
    ` as any[]

    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Scheduleo 2.0"
    const hoja = workbook.addWorksheet("Empleados")

    hoja.columns = [
      { header: "N. Empleado", key: "numeroEmpleado", width: 14 },
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Apellidos", key: "apellidos", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "DNI/NIE", key: "dni", width: 14 },
      { header: "Telefono", key: "telefono", width: 16 },
      { header: "Cargo", key: "cargo", width: 20 },
      { header: "Departamento", key: "departamento", width: 20 },
      { header: "Fecha contratacion", key: "fechaContratacion", width: 18 },
    ]

    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
    hoja.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF673DE6" } }

    for (const emp of empleadosRaw) {
      const sensible = getEmpleadoData(emp)
      hoja.addRow({
        numeroEmpleado: emp.numeroEmpleado,
        nombre: emp.nombre,
        apellidos: emp.apellidos,
        email: emp.email,
        dni: sensible.dni,
        telefono: sensible.telefono,
        cargo: emp.cargo,
        departamento: emp.departamento,
        fechaContratacion: emp.fechaContratacion ? new Date(emp.fechaContratacion).toLocaleDateString("es-ES") : "",
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="empleados.xlsx"`
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al generar el Excel" }, { status: 500 })
  }
}