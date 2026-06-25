import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (email) {
      const historial = await prisma.$queryRaw`
        SELECT * FROM "HistorialGerencial" WHERE email = ${email.toLowerCase()} ORDER BY "creadoEn" DESC
      ` as any[]
      return NextResponse.json(historial)
    }

    const historial = await prisma.$queryRaw`
      SELECT * FROM "HistorialGerencial" ORDER BY "creadoEn" DESC LIMIT 50
    ` as any[]
    return NextResponse.json(historial)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 })
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json().catch(() => ({}))
    const { id, masterPassword } = body

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword || "", master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    if (id) {
      await prisma.$executeRaw`DELETE FROM "HistorialGerencial" WHERE id = ${id}`
      return NextResponse.json({ ok: true, eliminado: "individual" })
    }

    await prisma.$executeRaw`DELETE FROM "HistorialGerencial"`
    return NextResponse.json({ ok: true, eliminado: "todo" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar historial" }, { status: 500 })
  }
}