import { prisma } from "@/lib/prisma"
import { prepararCamposCifrados } from "@/lib/empleadoData"

export async function crearEmpleadoParaGerencial(params: {
  userId: string
  empresaId: string
  nombre: string
  apellidos?: string | null
  dni?: string | null
  telefono?: string | null
  sueldoBase?: string | number | null
}) {
  const yaExiste = await prisma.empleado.findUnique({ where: { userId: params.userId } })
  if (yaExiste) return yaExiste

  const ultimo = await prisma.$queryRaw`
    SELECT "numeroEmpleado" FROM "Empleado"
    WHERE "empresaId" = ${params.empresaId} AND "numeroEmpleado" LIKE 'GER-%'
    ORDER BY "numeroEmpleado" DESC LIMIT 1
  ` as any[]
  let nuevoNumero = "GER-001"
  if (ultimo.length > 0) {
    const num = parseInt(ultimo[0].numeroEmpleado?.replace(/\D/g, "") || "0") + 1
    nuevoNumero = `GER-${String(num).padStart(3, "0")}`
  }

  const camposSensibles = prepararCamposCifrados(
    {
      dni: params.dni || undefined,
      telefono: params.telefono || undefined,
      salario: params.sueldoBase ? String(params.sueldoBase) : undefined,
    },
    false
  )

  return prisma.empleado.create({
    data: {
      userId: params.userId,
      empresaId: params.empresaId,
      numeroEmpleado: nuevoNumero,
      nombre: params.nombre,
      apellidos: params.apellidos || "",
      esDemostracion: false,
      fechaContratacion: new Date(),
      ...camposSensibles,
    }
  })
}