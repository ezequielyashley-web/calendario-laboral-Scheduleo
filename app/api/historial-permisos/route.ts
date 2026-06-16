import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const usuarioId = searchParams.get("usuarioId")
    
    if (usuarioId) {
      const historial = await prisma.$queryRaw`
        SELECT * FROM "HistorialPermisos" WHERE "usuarioId" = ${usuarioId} ORDER BY "creadoEn" DESC
      ` as any[]
      return NextResponse.json(historial)
    }
    
    const historial = await prisma.$queryRaw`
      SELECT * FROM "HistorialPermisos" ORDER BY "creadoEn" DESC LIMIT 50
    ` as any[]
    return NextResponse.json(historial)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { usuarioEmail, permisosNuevos, masterPassword } = await req.json()

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    const usuario = await prisma.user.findFirst({ where: { email: usuarioEmail.toLowerCase() } }) as any
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    const permisosAntes = usuario.permisos || {}

    // Actualizar permisos
    await prisma.$executeRawUnsafe(`
      UPDATE "User" SET permisos = '${JSON.stringify(permisosNuevos)}'::jsonb WHERE id = '${usuario.id}'
    `)

    // Registrar en historial
    await prisma.$executeRaw`
      INSERT INTO "HistorialPermisos" (id, "usuarioId", "usuarioNombre", "usuarioEmail", "permisosAntes", "permisosDespues", "modificadoPor")
      VALUES (gen_random_uuid()::text, ${usuario.id}, ${usuario.name}, ${usuario.email}, ${JSON.stringify(permisosAntes)}::jsonb, ${JSON.stringify(permisosNuevos)}::jsonb, ${"Super Admin"})
    `

    // Registrar en historial gerencial
    await prisma.$executeRaw`
      INSERT INTO "HistorialGerencial" (id, "solicitudId", nombre, email, cargo, accion, motivo, "realizadoPor")
      VALUES (gen_random_uuid()::text, ${null}, ${usuario.name}, ${usuario.email}, ${usuario.cargo||""}, ${"permisos_modificados"}, ${"Permisos actualizados por Super Admin"}, ${"Super Admin"})
    `

    return NextResponse.json({ ok: true, permisosAntes, permisosDespues: permisosNuevos })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al modificar permisos" }, { status: 500 })
  }
}