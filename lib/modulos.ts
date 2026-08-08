import { prisma } from "@/lib/prisma"

export async function moduloActivo(clave: string, empresaId: string = "empresa-001"): Promise<boolean> {
  const rows = await prisma.$queryRaw`
    SELECT em."activo" FROM "EmpresaModulo" em
    JOIN "Modulo" m ON m."id" = em."moduloId"
    WHERE em."empresaId" = ${empresaId} AND m."clave" = ${clave}
    LIMIT 1
  ` as any[]
  return rows[0]?.activo === true
}