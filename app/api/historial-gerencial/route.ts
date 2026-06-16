import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const historial = await prisma.$queryRaw`
      SELECT * FROM "HistorialGerencial" ORDER BY "creadoEn" DESC
    ` as any[]
    return NextResponse.json(historial)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { solicitudId, nombre, email, cargo, accion, motivo, realizadoPor } = await req.json()
    await prisma.$executeRaw`
      INSERT INTO "HistorialGerencial" (id, "solicitudId", nombre, email, cargo, accion, motivo, "realizadoPor")
      VALUES (gen_random_uuid()::text, ${solicitudId||null}, ${nombre}, ${email}, ${cargo||""}, ${accion}, ${motivo||""}, ${realizadoPor||""})
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al registrar historial" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { masterPassword } = await req.json()
    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })
    await prisma.$executeRawUnsafe(`DELETE FROM "HistorialGerencial"`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al limpiar historial" }, { status: 500 })
  }
}