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
      LIMIT 1
    ` as any[]

    if (!tokens.length) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })

    await prisma.$executeRaw`
      INSERT INTO "LogAccesoInspector" (id, "empresaId", token, ip, "seccionConsultada")
      VALUES (gen_random_uuid()::text, 'empresa-001', ${token}, ${ip}, ${seccion || "acceso"})
    `

    if (seccion === "acceso_inicial") {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/push/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: "⚠️ Inspector accediendo al sistema",
            mensaje: `Un inspector está consultando los datos de la empresa ahora mismo. IP: ${ip}`,
            url: "/configuracion",
            empresaId: "empresa-001"
          })
        })
      } catch (e) {
        console.log("Push no disponible:", e)
      }
    }

    return NextResponse.json({ ok: true, empresa: "empresa-001" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
