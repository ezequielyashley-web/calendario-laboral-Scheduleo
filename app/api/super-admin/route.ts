import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const superAdmins = await prisma.$queryRaw`
      SELECT id, email, name, role, "createdAt" FROM "User" WHERE role = 'SUPER_ADMIN' ORDER BY "createdAt" ASC
    ` as any[]

    const usuario = superAdmins[0] || null

    return NextResponse.json({ usuario, superAdmins })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener super admins" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { masterPassword, name, genero, cargo, departamento, telefono } = body

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    await prisma.user.update({
      where: { id: master.id },
      data: { name, ...(genero && { genero }), ...(cargo !== undefined && { cargo }), ...(departamento !== undefined && { departamento }), ...(telefono !== undefined && { telefono }) }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { masterPassword, name, email } = body

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    if (!email || !name) return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 })

    const existe = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existe) return NextResponse.json({ error: "El email ya existe" }, { status: 400 })

    const rawPassword = Math.random().toString(36).slice(-8) + "Admin" + Math.floor(Math.random() * 999) + "!"
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        role: "SUPER_ADMIN",
        password: hashedPassword,
        empresaId: "empresa-001"
      }
    })

    return NextResponse.json({ ok: true, tempPassword: rawPassword })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear super admin" }, { status: 500 })
  }
}
