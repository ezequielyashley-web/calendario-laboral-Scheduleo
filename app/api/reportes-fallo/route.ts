import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
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
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
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
      const { enviarNotificacionPush } = await import("@/lib/pushNotify")
      await enviarNotificacionPush(
        "🐞 Nuevo fallo reportado",
        `${reportadoPor || "Alguien"} reporto un fallo en ${pagina || "la app"}`,
        "/configuracion",
        "empresa-001"
      )
    } catch { /* no bloquear si falla el push */ }

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (error) {
    console.error("Error al crear reporte de fallo:", error)
    return NextResponse.json({ error: "Error al crear el reporte" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
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