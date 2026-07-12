import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const invitacion = await prisma.invitacion.findUnique({ where: { token } })
    if (!invitacion) {
      return NextResponse.json({ error: "Invitacion no encontrada" }, { status: 404 })
    }
    if (invitacion.estado !== "pendiente") {
      return NextResponse.json({ error: "Esta invitacion ya fue utilizada" }, { status: 400 })
    }
    if (invitacion.expiresAt < new Date()) {
      return NextResponse.json({ error: "Esta invitacion ha caducado" }, { status: 400 })
    }
    return NextResponse.json({ email: invitacion.email, rol: invitacion.rol })
  } catch (error) {
    console.error("Error en GET /api/invitaciones/[token]:", error)
    return NextResponse.json({ error: "Error al verificar la invitacion" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const invitacion = await prisma.invitacion.findUnique({ where: { token } })
    if (!invitacion) {
      return NextResponse.json({ error: "Invitacion no encontrada" }, { status: 404 })
    }
    if (invitacion.estado !== "pendiente") {
      return NextResponse.json({ error: "Esta invitacion ya fue utilizada" }, { status: 400 })
    }
    if (invitacion.expiresAt < new Date()) {
      return NextResponse.json({ error: "Esta invitacion ha caducado" }, { status: 400 })
    }

    const { nombre, password } = await req.json()
    if (!nombre || !nombre.trim() || !password || password.length < 8) {
      return NextResponse.json({ error: "Nombre y contrasena (minimo 8 caracteres) son obligatorios" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const id = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "SolicitudGerencial" (id, nombre, email, cargo, "passwordHash", origen, permisos, estado, "creadaEn")
      VALUES (${id}, ${nombre.trim()}, ${invitacion.email}, ${invitacion.rol}, ${passwordHash}, 'invitacion', ${JSON.stringify(invitacion.permisos)}::jsonb, 'pendiente', NOW())
    `

    await prisma.invitacion.update({
      where: { id: invitacion.id },
      data: { estado: "usada" }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en POST /api/invitaciones/[token]:", error)
    return NextResponse.json({ error: "Error al completar el registro" }, { status: 500 })
  }
}