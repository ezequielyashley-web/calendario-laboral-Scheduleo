import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import crypto from "crypto"

export async function GET() {
  try {
    const tokens = await prisma.$queryRaw`
      SELECT * FROM "TokenInspeccion" 
      WHERE "empresaId" = 'empresa-001'
      ORDER BY "creadoEn" DESC
    ` as any[]
    return NextResponse.json(tokens)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { masterPassword, horas, creadoPor } = await req.json()

    const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!admin) return NextResponse.json({ error: "No se encontró admin" }, { status: 401 })

    const ok = await bcrypt.compare(masterPassword, admin.hashedPin)
    if (!ok) return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })

    const token = crypto.randomBytes(32).toString("hex")
    const expiraEn = new Date(Date.now() + (horas || 24) * 3600000)

    await prisma.$executeRaw`
      INSERT INTO "TokenInspeccion" (id, "empresaId", token, "creadoPor", "expiraEn")
      VALUES (gen_random_uuid()::text, 'empresa-001', ${token}, ${creadoPor || "SUPER_ADMIN"}, ${expiraEn.toISOString()}::timestamptz)
    `

    return NextResponse.json({ token, expiraEn })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al generar token" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    await prisma.$executeRaw`DELETE FROM "TokenInspeccion" WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
