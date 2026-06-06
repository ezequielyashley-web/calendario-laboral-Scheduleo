import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { token, seccion } = await req.json()
    const ip = req.headers.get("x-forwarded-for") || "desconocida"

    const tokens = await prisma.$queryRaw`
      SELECT * FROM "TokenInspeccion"
      WHERE token = ${token}
      AND "expiraEn" > NOW()
      AND usado = false
      LIMIT 1
    ` as any[]

    if (!tokens.length) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })

    await prisma.$executeRaw`
      INSERT INTO "LogAccesoInspector" (id, "empresaId", token, ip, "seccionConsultada")
      VALUES (gen_random_uuid()::text, 'empresa-001', ${token}, ${ip}, ${seccion || "acceso"})
    `

    return NextResponse.json({ ok: true, empresa: "empresa-001" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
