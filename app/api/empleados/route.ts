import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { getEmpleadoData, prepararCamposCifrados } from "@/lib/empleadoData"
import { validarDatosEmpleado, sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/validation"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/security-middleware"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const config = await prisma.$queryRaw`
      SELECT "modoDemo" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    const modoDemo = config[0]?.modoDemo ?? false

    const empleados = modoDemo
      ? await prisma.$queryRaw`
          SELECT e.*, gt.nombre as "grupoNombre", gt.color as "grupoColor"
          FROM "Empleado" e
          LEFT JOIN "GrupoTrabajo" gt ON e."grupoTrabajoId" = gt.id
          WHERE e."empresaId" = 'empresa-001' AND e."esDemostracion" = true
          ORDER BY e."numeroEmpleado"
        ` as any[]
      : await prisma.$queryRaw`
          SELECT e.*, gt.nombre as "grupoNombre", gt.color as "grupoColor"
          FROM "Empleado" e
          LEFT JOIN "GrupoTrabajo" gt ON e."grupoTrabajoId" = gt.id
          WHERE e."empresaId" = 'empresa-001' AND e."esDemostracion" = false
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
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    // Rate limiting: max 10 creaciones por IP por hora
    const ip = getClientIP(req)
    const rl = checkRateLimit(`empleados-post-${ip}`, 10, 60 * 60 * 1000)
    if (!rl.success) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta de nuevo en 1 hora." }, { status: 429 })
    }

    const body = await req.json()
    const {
      nombre, apellidos, email, pin,
      dni, naf, iban, telefono, salario,
      fechaNacimiento, fechaContratacion,
      grupoTrabajoId, puestoDeTrabajoId,
      diasVacaciones, diasAsuntosPropios,
    } = body

    // Validar y sanitizar inputs
    const errores = validarDatosEmpleado({ nombre, apellidos, email, pin, dni, naf, iban, salario })
    if (errores.length > 0) {
      return NextResponse.json({ error: errores[0], errores }, { status: 400 })
    }

    // Sanitizar
    const nombreLimpio   = sanitizeText(nombre)
    const apellidosLimpio = sanitizeText(apellidos)
    const emailLimpio    = sanitizeEmail(email)
    const telefonoLimpio = telefono ? sanitizePhone(telefono) : undefined

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
          email:    emailLimpio,
          password: passwordHash,
          name: `${nombreLimpio} ${apellidosLimpio}`,
          role: 'EMPLEADO',
          empresaId: 'empresa-001',
        }
      })

      const empleado = await tx.empleado.create({
        data: {
          userId:            user.id,
          empresaId:         'empresa-001',
          numeroEmpleado:    nuevoNumero,
          nombre:            nombreLimpio,
          apellidos:         apellidosLimpio,
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

    // Audit log
    await prisma.logAuditoria.create({
      data: {
        userId:    resultado.user.id,
        accion:    "EMPLEADO_CREADO",
        entidad:   "Empleado",
        entidadId: resultado.empleado.id,
        detalles:  `Empleado real creado: ${nombreLimpio} ${apellidosLimpio} (${resultado.empleado.numeroEmpleado}). Datos sensibles cifrados AES-256-GCM.`,
        ip:        getClientIP(req),
      }
    }).catch(() => null)

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
