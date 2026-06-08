import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { grupoLibranzaId, anno, fechas } = body

    if (!grupoLibranzaId || !anno || !Array.isArray(fechas)) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Borrar dias existentes del anno para este grupo
    await prisma.$executeRaw`
      DELETE FROM "DiaLibranza"
      WHERE "grupoLibranzaId" = ${grupoLibranzaId}
      AND EXTRACT(YEAR FROM fecha) = ${anno}
    `

    // Insertar nuevos dias
    if (fechas.length > 0) {
      for (const fecha of fechas) {
        await prisma.$executeRaw`
          INSERT INTO "DiaLibranza" (id, "grupoLibranzaId", fecha, "createdAt")
          VALUES (gen_random_uuid()::text, ${grupoLibranzaId}, ${new Date(fecha + "T00:00:00")}::timestamp, NOW())
        `
      }
    }

    return NextResponse.json({ ok: true, diasGuardados: fechas.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar dias" }, { status: 500 })
  }
}
