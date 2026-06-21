import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })

    const usuario = await prisma.$queryRaw`
      SELECT id, name, email, password, role, permisos, genero
      FROM "User" WHERE email = ${email.toLowerCase()} LIMIT 1
    ` as any[]

    if (!usuario.length) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    const u = usuario[0]

    const valid = await bcrypt.compare(password, u.password)
    if (!valid) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })

    const esSuperAdmin = u.role === "SUPER_ADMIN"
    const permisos = u.permisos || {}
    const esGerencial = !esSuperAdmin && Object.keys(permisos).some(k => permisos[k])

    if (!esSuperAdmin && !esGerencial) {
      return NextResponse.json({ error: "No tienes acceso al panel ejecutivo" }, { status: 403 })
    }

    await prisma.$executeRaw`UPDATE "User" SET "ultimaActividad" = NOW() WHERE id = ${u.id}`

    return NextResponse.json({
      ok: true,
      usuario: { id: u.id, name: u.name, email: u.email, role: u.role, genero: u.genero }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al verificar acceso" }, { status: 500 })
  }
}