import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el SUPER_ADMIN puede editar su perfil aqui" }, { status: 403 })
    }

    const { name, email, cargo, departamento } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 })
    }

    const actualizado = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name,
        email: email.toLowerCase(),
        cargo: cargo || null,
        departamento: departamento || null,
      }
    })

    return NextResponse.json({
      ok: true,
      name: actualizado.name,
      email: actualizado.email,
      cargo: (actualizado as any).cargo,
      departamento: (actualizado as any).departamento,
    })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Ese email ya esta en uso por otro usuario" }, { status: 400 })
    }
    console.error("Error en /api/panel-ejecutivo/actualizar-perfil:", error)
    return NextResponse.json({ error: "Error al actualizar el perfil" }, { status: 500 })
  }
}