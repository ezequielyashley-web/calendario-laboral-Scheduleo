import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function verificarMaster(masterPassword: string): Promise<boolean> {
  const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
  if (!master) return false
  return bcrypt.compare(masterPassword, master.password)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json()
    const { action, masterPassword, name, email, role, nuevoEmail } = body
    const { id } = await params

    const valid = await verificarMaster(masterPassword)
    if (!valid) return NextResponse.json({ error: "Contrasena master incorrecta" }, { status: 403 })

    // Cambiar email
    if (action === "cambiarEmail") {
      if (!nuevoEmail) return NextResponse.json({ error: "El nuevo email es obligatorio" }, { status: 400 })
      const existe = await prisma.user.findUnique({ where: { email: nuevoEmail.toLowerCase() } })
      if (existe) return NextResponse.json({ error: "Ese email ya esta en uso" }, { status: 400 })
      await prisma.user.update({ where: { id }, data: { email: nuevoEmail.toLowerCase() } })
      return NextResponse.json({ ok: true, message: `Email actualizado a ${nuevoEmail}` })
    }

    // Editar nombre, email y rol
    if (action === "editar") {
      await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email: email.toLowerCase() }),
          ...(role && { role }),
        }
      })
      return NextResponse.json({ ok: true, message: "Usuario actualizado" })
    }

    // Reset contrasena
    if (action === "reset") {
      const rawPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + "!"
      const hashedPassword = await bcrypt.hash(rawPassword, 10)
      await prisma.user.update({ where: { id }, data: { password: hashedPassword } })
      return NextResponse.json({ ok: true, tempPassword: rawPassword })
    }

    // Pausar usuario
    if (action === "pausar") {
      await prisma.user.update({ where: { id }, data: { role: "PAUSADO" } })
      return NextResponse.json({ ok: true, message: "Usuario pausado" })
    }

    // Reactivar usuario
    if (action === "reactivar") {
      await prisma.user.update({ where: { id }, data: { role: "EMPLEADO" } })
      return NextResponse.json({ ok: true, message: "Usuario reactivado" })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json()
    const { masterPassword } = body
    const { id } = await params

    const valid = await verificarMaster(masterPassword)
    if (!valid) return NextResponse.json({ error: "Contrasena master incorrecta" }, { status: 403 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true, message: "Usuario eliminado" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}