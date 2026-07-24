import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const usuario = await prisma.user.findFirst({
      where: { id: auth.userId }
    }) as any
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    let notificaciones = 0
    try {
      const notifs = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Notificacion" WHERE "usuarioId" = ${usuario.id} AND leida = false
      ` as any[]
      notificaciones = Number(notifs[0]?.count || 0)
    } catch {}
    let empresa = "Mi Empresa S.L."
    try {
      const emp = await prisma.$queryRaw`
        SELECT nombre FROM "Empresa" WHERE id = ${usuario.empresaId} LIMIT 1
      ` as any[]
      if (emp[0]?.nombre) empresa = emp[0].nombre
    } catch {}
    // Cambios de permisos desde ultimo login
    let cambiosPermisos: any[] = []
    try {
      if (usuario.ultimoLogin) {
        const cambios = await prisma.$queryRaw`
          SELECT * FROM "HistorialPermisos"
          WHERE "usuarioId" = ${usuario.id}
          AND "creadoEn" > ${usuario.ultimoLogin}
          ORDER BY "creadoEn" DESC
          LIMIT 1
        ` as any[]
        if (cambios.length > 0) {
          const ultimo = cambios[0]
          const antes = ultimo.permisosAntes || {}
          const despues = ultimo.permisosDespues || {}
          const added = Object.keys(despues).filter(k => despues[k] && !antes[k])
          const removed = Object.keys(antes).filter(k => antes[k] && !despues[k])
          if (added.length > 0 || removed.length > 0) {
            cambiosPermisos = [{ added, removed, fecha: ultimo.creadoEn }]
          }
        }
      }
    } catch {}
    const ultimoLogin = usuario.ultimoLogin
    try {
      await prisma.$executeRaw`UPDATE "User" SET "ultimoLogin" = NOW() WHERE id = ${usuario.id}`
    } catch {}
    return NextResponse.json({
      nombre: usuario.name,
      email: usuario.email,
      cargo: usuario.cargo || "",
      departamento: usuario.departamento || "",
      permisos: usuario.permisos || {},
      genero: usuario.genero || "masculino",
      role: usuario.role,
      empresa,
      notificaciones,
      ultimoLogin,
      cambiosPermisos
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}