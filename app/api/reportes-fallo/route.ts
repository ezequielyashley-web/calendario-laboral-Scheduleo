import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const estado = searchParams.get("estado")
    const reportes = estado
      ? await prisma.$queryRaw`
          SELECT * FROM "ReporteFallo" WHERE "empresaId" = 'empresa-001' AND estado = ${estado} ORDER BY "createdAt" DESC
        ` as any[]
      : await prisma.$queryRaw`
          SELECT * FROM "ReporteFallo" WHERE "empresaId" = 'empresa-001' ORDER BY "createdAt" DESC
        ` as any[]
    return NextResponse.json(reportes)
  } catch (error) {
    console.error("Error al obtener reportes de fallo:", error)
    return NextResponse.json({ error: "Error al obtener reportes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { descripcion, pagina, reportadoPor, userAgent } = await req.json()
    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json({ error: "La descripcion es obligatoria" }, { status: 400 })
    }
    const id = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "ReporteFallo" (id, descripcion, pagina, "reportadoPor", "userAgent", "empresaId", estado, "createdAt", "updatedAt")
      VALUES (${id}, ${descripcion}, ${pagina || null}, ${reportadoPor || null}, ${userAgent || null}, 'empresa-001', 'pendiente', NOW(), NOW())
    `
        try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/push/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "🐞 Nuevo fallo reportado",
          mensaje: `${reportadoPor || "Alguien"} reporto un fallo en ${pagina || "la app"}`,
          url: "/configuracion",
          empresaId: "empresa-001"
        })
      })
    } catch { /* no bloquear si falla el push */ }

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (error) {
    console.error("Error al crear reporte de fallo:", error)
    return NextResponse.json({ error: "Error al crear el reporte" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, estado } = await req.json()
    if (!id || !estado) {
      return NextResponse.json({ error: "id y estado son obligatorios" }, { status: 400 })
    }
    await prisma.$executeRaw`
      UPDATE "ReporteFallo" SET estado = ${estado}, "updatedAt" = NOW() WHERE id = ${id}
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error al actualizar reporte de fallo:", error)
    return NextResponse.json({ error: "Error al actualizar el reporte" }, { status: 500 })
  }
}