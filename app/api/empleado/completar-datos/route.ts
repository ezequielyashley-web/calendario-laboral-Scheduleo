import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { prepararCamposCifrados } from "@/lib/empleadoData"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const empleado = await prisma.empleado.findUnique({
      where: { userId: auth.userId },
      select: {
        id: true,
        estadoDatosPersonales: true,
        motivoRechazoDatos: true,
        fechaNacimiento: true,
      }
    })
    if (!empleado) return NextResponse.json({ error: "No tienes ficha de empleado vinculada" }, { status: 404 })

    return NextResponse.json(empleado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener estado de datos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const body = await req.json()
    const { dni, naf, iban, telefono, direccion, fechaNacimiento } = body

    const empleado = await prisma.empleado.findUnique({ where: { userId: auth.userId } })
    if (!empleado) return NextResponse.json({ error: "No tienes ficha de empleado vinculada" }, { status: 404 })

    if (!dni || !naf || !iban || !telefono || !direccion || !fechaNacimiento) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    const camposSensibles = prepararCamposCifrados({ dni, naf, iban, telefono, direccion }, false)

    await prisma.empleado.update({
      where: { id: empleado.id },
      data: {
        ...camposSensibles,
        fechaNacimiento: new Date(fechaNacimiento),
        estadoDatosPersonales: "en_revision",
        motivoRechazoDatos: null,
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar los datos" }, { status: 500 })
  }
}