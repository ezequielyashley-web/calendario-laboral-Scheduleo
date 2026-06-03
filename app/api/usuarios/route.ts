import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        empresaId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, role, empresaId, masterPassword } = body

    // Verificar contraseña master
    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contraseña master incorrecta" }, { status: 403 })

    // Generar contraseña aleatoria
    const rawPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + "!"
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const usuario = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        role: role || "EMPLEADO",
        password: hashedPassword,
        empresaId: empresaId || "empresa-001",
      }
    })

    return NextResponse.json({ id: usuario.id, email: usuario.email, name: usuario.name, tempPassword: rawPassword })
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "El email ya existe" }, { status: 400 })
    console.error(error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
