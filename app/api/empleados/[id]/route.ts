import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const empleado = await prisma.empleado.findUnique({
      where: { id: params.id },
      include: {
        puestoDeTrabajo: true,
        grupoTrabajo: true,
        fichajes: { orderBy: { entrada: "desc" }, take: 50 },
        vacaciones: { orderBy: { createdAt: "desc" } },
      }
    })

    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    const [deudas, bajas, historialCargos, permisos, justificantes] = await Promise.all([
      prisma.$queryRaw`SELECT * FROM "Deuda" WHERE "empleadoId" = ${params.id} ORDER BY "createdAt" DESC` as Promise<any[]>,
      prisma.$queryRaw`SELECT * FROM "BajaMedica" WHERE "empleadoId" = ${params.id} ORDER BY "fechaInicio" DESC` as Promise<any[]>,
      prisma.$queryRaw`SELECT * FROM "HistorialCargo" WHERE "empleadoId" = ${params.id} ORDER BY "fechaInicio" DESC` as Promise<any[]>,
      prisma.$queryRaw`SELECT * FROM "PermisoSalida" WHERE "empleadoId" = ${params.id} ORDER BY fecha DESC` as Promise<any[]>,
      prisma.$queryRaw`SELECT * FROM "Justificante" WHERE "empleadoId" = ${params.id} ORDER BY "createdAt" DESC` as Promise<any[]>,
    ])

    return NextResponse.json({ ...empleado, deudas, bajas, historialCargos, permisos, justificantes })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener empleado" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { nombre, apellidos, dni, telefono, fechaNacimiento, fechaContratacion } = body

    const empleado = await prisma.empleado.update({
      where: { id: params.id },
      data: {
        ...(nombre && { nombre }),
        ...(apellidos && { apellidos }),
        ...(dni && { dni }),
        ...(telefono && { telefono }),
        ...(fechaNacimiento && { fechaNacimiento: new Date(fechaNacimiento) }),
        ...(fechaContratacion && { fechaContratacion: new Date(fechaContratacion) }),
      }
    })

    return NextResponse.json(empleado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar empleado" }, { status: 500 })
  }
}