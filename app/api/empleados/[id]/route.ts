import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { getEmpleadoData, prepararCamposCifrados } from "@/lib/empleadoData"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const empleadoRaw = await prisma.$queryRaw`SELECT * FROM "Empleado" WHERE id = ${id}` as any[]
    if (!empleadoRaw.length) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    const empleadoBase = empleadoRaw[0]

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

    // Descifrar datos sensibles
    const sensible = getEmpleadoData(empleadoBase)

    let deudas: any[] = []
    let bajas: any[] = []
    let historialCargos: any[] = []
    let cambiosTurno: any[] = []
    let permisos: any[] = []
    let justificantes: any[] = []

    try { deudas         = await prisma.$queryRaw`SELECT * FROM "Deuda" WHERE empleadoid = ${id}` as any[] } catch(e) { console.error("Deudas:", e) }
    try { bajas          = await prisma.$queryRaw`SELECT * FROM "BajaMedica" WHERE "empleadoId" = ${id}` as any[] } catch(e) { console.error("Bajas:", e) }
    try { historialCargos= await prisma.$queryRaw`SELECT * FROM "HistorialCargo" WHERE "empleadoId" = ${id}` as any[] } catch(e) { console.error("HistorialCargo:", e) }
    try { permisos       = await prisma.$queryRaw`SELECT * FROM "PermisoSalida" WHERE "empleadoId" = ${id}` as any[] } catch(e) { console.error("Permisos:", e) }
    try { justificantes  = await prisma.$queryRaw`SELECT * FROM "Justificante" WHERE "empleadoId" = ${id}` as any[] } catch(e) { console.error("Justificantes:", e) }
    try {
      cambiosTurno = await prisma.cambioTurno.findMany({
        where: { OR: [{ empleadoOrigenId: id }, { empleadoDestinoId: id }], estado: "APROBADO" },
        include: {
          empleadoOrigen:  { select: { nombre: true, apellidos: true } },
          empleadoDestino: { select: { nombre: true, apellidos: true } },
        }
      })
    } catch(e) { console.error("CambiosTurno:", e) }

    return NextResponse.json({
      ...empleado,
      // Datos sensibles descifrados
      dni:      sensible.dni,
      naf:      sensible.naf,
      iban:     sensible.iban,
      telefono: sensible.telefono,
      salario:  sensible.salario,
      // Nunca exponer campos cifrados al frontend
      dniEnc:      undefined,
      nafEnc:      undefined,
      ibanEnc:     undefined,
      telefonoEnc: undefined,
      salarioEnc:  undefined,
      // Resto
      esDemostracion: empleadoBase.esDemostracion ?? false,
      sueldoBase:     empleadoBase.sueldoBase,
      deudas,
      bajas,
      historialCargos,
      permisos,
      justificantes,
      cambiosTurno,
    })
  } catch (error) {
    console.error("ERROR PRINCIPAL:", error)
    return NextResponse.json({ error: "Error al obtener empleado" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { nombre, apellidos, dni, telefono, naf, iban, salario, fechaNacimiento, fechaContratacion } = body

    // Obtener esDemostracion actual del empleado
    const actual = await prisma.$queryRaw`
      SELECT "esDemostracion" FROM "Empleado" WHERE id = ${id}
    ` as any[]
    if (!actual.length) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    const esDemostracion = actual[0].esDemostracion ?? false

    // Preparar campos cifrados o planos segun tipo
    const camposSensibles = prepararCamposCifrados(
      { dni, naf, iban, telefono, salario: salario ? String(salario) : undefined },
      esDemostracion
    )

    const empleado = await prisma.empleado.update({
      where: { id },
      data: {
        ...(nombre           && { nombre }),
        ...(apellidos        && { apellidos }),
        ...(fechaNacimiento  && { fechaNacimiento:  new Date(fechaNacimiento) }),
        ...(fechaContratacion && { fechaContratacion: new Date(fechaContratacion) }),
        // Campos sensibles (cifrados o planos segun esDemostracion)
        ...camposSensibles,
      }
    })

    revalidateTag("empleados-ligero", { expire: 0 })
    return NextResponse.json({ ok: true, id: empleado.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar empleado" }, { status: 500 })
  }
}