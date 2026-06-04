import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const empleado = await prisma.empleado.findUnique({
      where: { id },
      include: {
        puestoDeTrabajo: true,
        grupoTrabajo: true,
        fichajes: { orderBy: { fecha: "desc" }, take: 50 },
        vacaciones: { orderBy: { createdAt: "desc" } },
      }
    })

    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    let deudas = []
    let bajas = []
    let historialCargos = []
    let permisos = []
    let justificantes = []

    try { deudas = await prisma.$queryRaw`SELECT * FROM "Deuda" WHERE empleadoid = ${id}` as any[] } catch(e) { console.error("Deudas:", e) }
    try { bajas = await prisma.$queryRaw`SELECT * FROM "BajaMedica" WHERE empleadoid = ${id}` as any[] } catch(e) { console.error("Bajas:", e) }
    try { historialCargos = await prisma.$queryRaw`SELECT * FROM "HistorialCargo" WHERE empleadoid = ${id}` as any[] } catch(e) { console.error("HistorialCargo:", e) }
    try { permisos = await prisma.$queryRaw`SELECT * FROM "PermisoSalida" WHERE empleadoid = ${id}` as any[] } catch(e) { console.error("Permisos:", e) }
    try { justificantes = await prisma.$queryRaw`SELECT * FROM "Justificante" WHERE empleadoid = ${id}` as any[] } catch(e) { console.error("Justificantes:", e) }

    return NextResponse.json({ ...empleado, deudas, bajas, historialCargos, permisos, justificantes })
  } catch (error) {
    console.error("ERROR PRINCIPAL:", error)
    return NextResponse.json({ error: "Error al obtener empleado" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { nombre, apellidos, dni, telefono, fechaNacimiento, fechaContratacion } = body
    const empleado = await prisma.empleado.update({
      where: { id },
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