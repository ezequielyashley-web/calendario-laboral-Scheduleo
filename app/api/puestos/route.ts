import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { unstable_cache, revalidateTag } from "next/cache"

async function fetchPuestosConEmpleados(empresaId: string) {
  const puestos = await prisma.$queryRaw`
    SELECT p.*,
      COUNT(e.id)::int as total_empleados
    FROM "PuestoDeTrabajo" p
    LEFT JOIN "Empleado" e ON e."puestoDeTrabajoId" = p.id
    WHERE p."empresaId" = ${empresaId}
    GROUP BY p.id
    ORDER BY p.nombre ASC
  ` as any[]

  const puestosConEmpleados = await Promise.all(puestos.map(async (p: any) => {
    const empleados = await prisma.$queryRaw`
      SELECT id, nombre, apellidos, "numeroEmpleado", "grupoTrabajoId"
      FROM "Empleado"
      WHERE "puestoDeTrabajoId" = ${p.id}
      AND "esDemostracion" = false
      ORDER BY nombre ASC
    ` as any[]
    return { ...p, empleados }
  }))

  return puestosConEmpleados
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get("empresaId") || "empresa-001"

    const cached = unstable_cache(
      () => fetchPuestosConEmpleados(empresaId),
      [`puestos-${empresaId}`],
      { tags: ["puestos"] }
    )
    const puestosConEmpleados = await cached()

    return NextResponse.json(puestosConEmpleados)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener puestos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { nombre, descripcion, empresaId, masterPassword } = await req.json()
    if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })

    const empresa = await prisma.$queryRaw`
      SELECT "masterPasswordHash" FROM "Empresa" WHERE id = ${empresaId || "empresa-001"}
    ` as any[]
    if (!empresa.length) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 })
    const isValid = await bcrypt.compare(masterPassword, empresa[0].masterPasswordHash)
    if (!isValid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 401 })

    const id = `puesto-${Date.now()}`
    await prisma.$executeRaw`
      INSERT INTO "PuestoDeTrabajo" (id, "empresaId", nombre, descripcion, "createdAt", "updatedAt")
      VALUES (${id}, ${empresaId || "empresa-001"}, ${nombre}, ${descripcion || ""}, NOW(), NOW())
    `
    revalidateTag("puestos", { expire: 0 })
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear puesto" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { id, nombre, descripcion, empleadoId, accion, masterPassword } = await req.json()

    const empresa = await prisma.$queryRaw`
      SELECT "masterPasswordHash" FROM "Empresa" WHERE id = 'empresa-001'
    ` as any[]
    if (!empresa.length) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 })
    const isValid = await bcrypt.compare(masterPassword, empresa[0].masterPasswordHash)
    if (!isValid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 401 })

    // Editar puesto
    if (accion === "editar") {
      await prisma.$executeRaw`
        UPDATE "PuestoDeTrabajo" SET nombre = ${nombre}, descripcion = ${descripcion}, "updatedAt" = NOW()
        WHERE id = ${id}
      `
      revalidateTag("puestos", { expire: 0 })
      return NextResponse.json({ ok: true })
    }

    // Asignar empleado a puesto
    if (accion === "asignar") {
      await prisma.$executeRaw`
        UPDATE "Empleado" SET "puestoDeTrabajoId" = ${id}, "updatedAt" = NOW()
        WHERE id = ${empleadoId}
      `
      // Notificacion push pendiente para app movil
      return NextResponse.json({ ok: true })
    }

    // Quitar empleado de puesto
    if (accion === "quitar") {
      await prisma.$executeRaw`
        UPDATE "Empleado" SET "puestoDeTrabajoId" = NULL, "updatedAt" = NOW()
        WHERE id = ${empleadoId}
      `
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar puesto" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const masterPassword = searchParams.get("masterPassword")

    const empresa = await prisma.$queryRaw`
      SELECT "masterPasswordHash" FROM "Empresa" WHERE id = 'empresa-001'
    ` as any[]
    const isValid = await bcrypt.compare(masterPassword || "", empresa[0].masterPasswordHash)
    if (!isValid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 401 })

    const empleados = await prisma.$queryRaw`
      SELECT COUNT(*)::int as total FROM "Empleado" WHERE "puestoDeTrabajoId" = ${id}
    ` as any[]
    if (empleados[0].total > 0) {
      return NextResponse.json({ error: "No puedes eliminar un puesto con empleados asignados" }, { status: 400 })
    }

    await prisma.$executeRaw`DELETE FROM "PuestoDeTrabajo" WHERE id = ${id}`
    revalidateTag("puestos", { expire: 0 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar puesto" }, { status: 500 })
  }
}