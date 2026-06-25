import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { enviarEmailAccesoTemporal } from "@/lib/email"

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE "SolicitudGerencial"
      SET estado = 'rechazada', "resueltaEn" = NOW()
      WHERE estado = 'pendiente'
      AND "creadaEn" < NOW() - INTERVAL '48 hours'
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "SolicitudGerencial"
      WHERE estado = 'rechazada'
      AND "resueltaEn" < NOW() - INTERVAL '24 hours'
    `)
    const solicitudes = await prisma.$queryRaw`
      SELECT * FROM "SolicitudGerencial" ORDER BY "creadaEn" DESC
    ` as any[]
    return NextResponse.json(solicitudes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { nombre, email, cargo, telefono, dni, departamento, tipoContrato, jornada, horario, permisos, mensaje } = body
    const sueldoBase = body.sueldoBase ? parseFloat(body.sueldoBase) : null
    if (!nombre || !email || !cargo) return NextResponse.json({ error: "Nombre, email y cargo son obligatorios" }, { status: 400 })

    await prisma.$executeRaw`
      INSERT INTO "SolicitudGerencial" (id, nombre, email, cargo, telefono, dni, departamento, "tipoContrato", jornada, horario, "sueldoBase", permisos, mensaje)
      VALUES (gen_random_uuid()::text, ${nombre}, ${email}, ${cargo}, ${telefono||""}, ${dni||""}, ${departamento||""}, ${tipoContrato||"indefinido"}, ${jornada||"completa"}, ${horario||"manana"}, ${sueldoBase}, ${JSON.stringify(permisos||{})}::jsonb, ${mensaje||""})
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { id, accion, masterPassword, motivo } = body

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    const solicitudes = await prisma.$queryRaw`
      SELECT * FROM "SolicitudGerencial" WHERE id = ${id} LIMIT 1
    ` as any[]
    if (!solicitudes.length) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    const sol = solicitudes[0]

    if (accion === "aprobar") {
      const rawPassword = Math.random().toString(36).slice(-8) + "Gerencial" + Math.floor(Math.random() * 999) + "!"
      const hashedPassword = await bcrypt.hash(rawPassword, 10)
      await prisma.user.create({
        data: {
          email: sol.email.toLowerCase(),
          name: sol.nombre,
          role: "EMPLEADO",
          password: hashedPassword,
          empresaId: "empresa-001"
        }
      })
      const aprobada = "aprobada"
      await prisma.$executeRaw`UPDATE "SolicitudGerencial" SET estado = ${aprobada}, "resueltaEn" = NOW() WHERE id = ${id}`
      const accionStr = "aprobada"
      const realizadoPor = "Super Admin"
      const motivoStr = ""
      await prisma.$executeRaw`INSERT INTO "HistorialGerencial" (id, "solicitudId", nombre, email, cargo, accion, motivo, "realizadoPor") VALUES (gen_random_uuid()::text, ${id}, ${sol.nombre}, ${sol.email}, ${sol.cargo||""}, ${accionStr}, ${motivoStr}, ${realizadoPor})`

      const empresa = await prisma.empresa.findFirst({ where: { id: "empresa-001" } })
      const emailResult = await enviarEmailAccesoTemporal({
        nombre: sol.nombre,
        email: sol.email,
        contrasenaTemporal: rawPassword,
        empresaNombre: empresa?.nombre || "Tu empresa",
        loginUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      })

      return NextResponse.json({ ok: true, tempPassword: rawPassword, nombre: sol.nombre, email: sol.email, emailEnviado: emailResult.ok })
    }

    if (accion === "rechazar") {
      const rechazada = "rechazada"
      await prisma.$executeRaw`UPDATE "SolicitudGerencial" SET estado = ${rechazada}, "resueltaEn" = NOW() WHERE id = ${id}`
      const accionStr = "rechazada"
      const realizadoPor = "Super Admin"
      const motivoStr = motivo || ""
      await prisma.$executeRaw`INSERT INTO "HistorialGerencial" (id, "solicitudId", nombre, email, cargo, accion, motivo, "realizadoPor") VALUES (gen_random_uuid()::text, ${id}, ${sol.nombre}, ${sol.email}, ${sol.cargo||""}, ${accionStr}, ${motivoStr}, ${realizadoPor})`
      return NextResponse.json({ ok: true })
    }

    if (accion === "eliminar_usuario") {
      const usuario = await prisma.user.findFirst({ where: { email: sol.email.toLowerCase() } })
      if (usuario) await prisma.user.delete({ where: { id: usuario.id } })
      await prisma.$executeRaw`DELETE FROM "SolicitudGerencial" WHERE id = ${id}`
      const accionStr = "eliminado"
      const realizadoPor = "Super Admin"
      const motivoStr = motivo || ""
      await prisma.$executeRaw`INSERT INTO "HistorialGerencial" (id, "solicitudId", nombre, email, cargo, accion, motivo, "realizadoPor") VALUES (gen_random_uuid()::text, ${id}, ${sol.nombre}, ${sol.email}, ${sol.cargo||""}, ${accionStr}, ${motivoStr}, ${realizadoPor})`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    await prisma.$executeRaw`DELETE FROM "SolicitudGerencial" WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar solicitud" }, { status: 500 })
  }
}