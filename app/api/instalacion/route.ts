import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { crearEmpleadoParaGerencial } from "@/lib/crearEmpleadoGerencial"
import { validarFormatoUsername, usernameDisponible } from "@/lib/username"

export async function GET() {
  try {
    const existeSuperAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    return NextResponse.json({ disponible: !existeSuperAdmin })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ disponible: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const existeSuperAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (existeSuperAdmin) {
      return NextResponse.json({ error: "Ya existe un Super Admin. Esta instalacion ya se completo." }, { status: 403 })
    }

    const body = await req.json()
    const { nombre, apellidos, email, password, claveInstalacion, username } = body

    if (!process.env.SETUP_SECRET) {
      return NextResponse.json({ error: "El sistema no tiene configurada la clave de instalacion (SETUP_SECRET)" }, { status: 500 })
    }
    if (claveInstalacion !== process.env.SETUP_SECRET) {
      return NextResponse.json({ error: "Clave de instalacion incorrecta" }, { status: 403 })
    }

    if (!nombre || !apellidos || !email || !password || password.length < 8) {
      return NextResponse.json({ error: "Todos los campos son obligatorios y la contrasena debe tener al menos 8 caracteres" }, { status: 400 })
    }

    const emailLimpio = email.toLowerCase().trim()
    const yaExiste = await prisma.user.findUnique({ where: { email: emailLimpio } })
    if (yaExiste) return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 400 })

    const usernameLimpio = (username || "").trim()
    const errorFormatoUsername = validarFormatoUsername(usernameLimpio)
    if (errorFormatoUsername) return NextResponse.json({ error: errorFormatoUsername }, { status: 400 })
    const disponibleUsername = await usernameDisponible(usernameLimpio)
    if (!disponibleUsername) return NextResponse.json({ error: "Ese nombre de usuario ya esta en uso" }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 10)

    const nuevoUser = await prisma.user.create({
      data: {
        email: emailLimpio,
        name: `${nombre} ${apellidos}`,
        username: usernameLimpio,
        role: "SUPER_ADMIN",
        password: passwordHash,
        empresaId: "empresa-001",
      }
    })

    await crearEmpleadoParaGerencial({
      userId: nuevoUser.id,
      empresaId: "empresa-001",
      nombre,
      apellidos,
    }).catch(err => console.error("Error creando Empleado vinculado en instalacion:", err))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear el Super Admin" }, { status: 500 })
  }
}