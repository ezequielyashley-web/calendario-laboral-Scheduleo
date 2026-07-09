import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Credenciales requeridas" }, { status: 400 })

    const identifier = email.toLowerCase().trim()

    const users = await prisma.$queryRaw`
      SELECT id, email, name, password, role FROM "User" WHERE LOWER(email) = ${identifier} LIMIT 1
    ` as any[]

    if (!users.length || !users[0].password) {
      return NextResponse.json({ error: "Email o contrasena incorrectos" }, { status: 401 })
    }

    const user = users[0]
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Email o contrasena incorrectos" }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      needsTwoFA: true
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}