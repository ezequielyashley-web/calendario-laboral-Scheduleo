import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getEmpleadoData, prepararCamposCifrados } from "@/lib/empleadoData"

export async function GET(req: NextRequest) {
  try {
    const config = await prisma.$queryRaw`
      SELECT "modoDemo" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    const modoDemo = config[0]?.modoDemo ?? false

    const empleados = await prisma.$queryRaw`
      SELECT e.*, gt.nombre as "grupoNombre", gt.color as "grupoColor"
      FROM "Empleado" e
      LEFT JOIN "GrupoTrabajo" gt ON e."grupoTrabajoId" = gt.id
      WHERE e."empresaId" = 'empresa-001'
      AND e."esDemostracion" = ${modoDemo}
      ORDER BY e."numeroEmpleado"
    ` as any[]

    const empleadosDecifrados = empleados.map((e: any) => {
      const sensible = getEmpleadoData(e)
      return {
        ...e,
        dni:         sensible.dni,
        naf:         sensible.naf,
        iban:        sensible.iban,
        telefono:    sensible.telefono,
        salario:     sensible.salario,
        dniEnc:      undefined,
        nafEnc:      undefined,
        ibanEnc:     undefined,
        telefonoEnc: undefined,
        salarioEnc:  undefined,
      }
    })

    return NextResponse.json(empleadosDecifrados)
  } catch (error) {
    console.error(error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      nombre, apellidos, email, pin,
      dni, naf, iban, telefono, salario,
      fechaNacimiento, fechaContratacion,
      grupoTrabajoId, puestoDeTrabajoId,
      diasVacaciones, diasAsuntosPropios,
    } = body

    if (!nombre || !apellidos || !email) {
      return NextResponse.json({ error: "Nombre, apellidos y email son obligatorios" }, { status: 400 })
    }

    // Empleados reales: esDemostracion = false
    const esDemostracion = false

    // Cifrar datos sensibles
    const camposSensibles = prepararCamposCifrados(
      { dni, naf, iban, telefono, salario: salario ? String(salario) : undefined },
      esDemostracion
    )

    // Generar numero de empleado correlativo
    const ultimo = await prisma.$queryRaw`
      SELECT "numeroEmpleado" FROM "Empleado"
      WHERE "empresaId" = 'empresa-001' AND "esDemostracion" = false
      ORDER BY "numeroEmpleado" DESC LIMIT 1
    ` as any[]

    let nuevoNumero = "EMP-001"
    if (ultimo.length > 0) {
      const num = parseInt(ultimo[0].numeroEmpleado?.replace(/\D/g, '') || '0') + 1
      nuevoNumero = `EMP-${String(num).padStart(3, '0')}`
    }

    // Hash del PIN
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(pin || '1234', 10)

    // Crear User + Empleado en transaccion
    const resultado = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: passwordHash,
          name: `${nombre} ${apellidos}`,
          role: 'EMPLEADO',
          empresaId: 'empresa-001',
        }
      })

      const empleado = await tx.empleado.create({
        data: {
          userId:            user.id,
          empresaId:         'empresa-001',
          numeroEmpleado:    nuevoNumero,
          nombre,
          apellidos,
          esDemostracion,
          diasVacaciones:    diasVacaciones    ?? 22,
          diasAsuntosPropios: diasAsuntosPropios ?? 6,
          ...(grupoTrabajoId   && { grupoTrabajoId }),
          ...(puestoDeTrabajoId && { puestoDeTrabajoId }),
          ...(fechaNacimiento   && { fechaNacimiento:   new Date(fechaNacimiento) }),
          ...(fechaContratacion && { fechaContratacion: new Date(fechaContratacion) }),
          ...camposSensibles,
        }
      })

      return { user, empleado }
    })

    return NextResponse.json({
      ok: true,
      id:             resultado.empleado.id,
      numeroEmpleado: resultado.empleado.numeroEmpleado,
      email:          resultado.user.email,
    }, { status: 201 })

  } catch (error: any) {
    console.error("Error creando empleado DETALLE:", error?.message, error?.code, error?.meta)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "El email ya existe en el sistema" }, { status: 409 })
    }
    return NextResponse.json({ error: "Error al crear empleado" }, { status: 500 })
  }
}