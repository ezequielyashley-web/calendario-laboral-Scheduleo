import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el SUPER_ADMIN puede revisar datos personales" }, { status: 403 })
    }

    const pendientes = await prisma.empleado.findMany({
      where: { estadoDatosPersonales: "en_revision" },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        numeroEmpleado: true,
        fechaNacimiento: true,
        user: { select: { email: true, role: true } },
      },
      orderBy: { updatedAt: "asc" },
    })

    return NextResponse.json(pendientes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener revisiones pendientes" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el SUPER_ADMIN puede revisar datos personales" }, { status: 403 })
    }

    const body = await req.json()
    const { empleadoId, accion, motivo, masterPassword } = body

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword || "", master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } })
    if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    if (accion === "confirmar") {
      await prisma.empleado.update({
        where: { id: empleadoId },
        data: {
          estadoDatosPersonales: "confirmado",
          motivoRechazoDatos: null,
          datosRevisadosPor: auth.userId,
          datosRevisadosEn: new Date(),
        }
      })
      return NextResponse.json({ ok: true })
    }

    if (accion === "rechazar") {
      if (!motivo || !motivo.trim()) {
        return NextResponse.json({ error: "El motivo del rechazo es obligatorio" }, { status: 400 })
      }
      await prisma.empleado.update({
        where: { id: empleadoId },
        data: {
          estadoDatosPersonales: "rechazado",
          motivoRechazoDatos: motivo.trim(),
          datosRevisadosPor: auth.userId,
          datosRevisadosEn: new Date(),
        }
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al procesar la revision" }, { status: 500 })
  }
}