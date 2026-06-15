import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
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
    const { nombre, email, cargo, telefono, mensaje } = await req.json()
    if (!nombre || !email || !cargo) return NextResponse.json({ error: "Nombre, email y cargo son obligatorios" }, { status: 400 })

    await prisma.$executeRaw`
      INSERT INTO "SolicitudGerencial" (id, nombre, email, cargo, telefono, mensaje)
      VALUES (gen_random_uuid()::text, ${nombre}, ${email}, ${cargo}, ${telefono || ""}, ${mensaje || ""})
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, accion, masterPassword } = await req.json()

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 403 })

    const solicitudes = await prisma.$queryRaw`
      SELECT * FROM "SolicitudGerencial" WHERE id = ${id} LIMIT 1
    ` as any[]
    if (!solicitudes.length) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    const sol = solicitudes[0]

    if (accion === "aprobar") {
      // Crear usuario
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
      await prisma.$executeRaw`
        UPDATE "SolicitudGerencial" SET estado = 'aprobada', "resueltaEn" = NOW() WHERE id = ${id}
      `
      return NextResponse.json({ ok: true, tempPassword: rawPassword, nombre: sol.nombre, email: sol.email })
    }

    if (accion === "rechazar") {
      await prisma.$executeRaw`
        UPDATE "SolicitudGerencial" SET estado = 'rechazada', "resueltaEn" = NOW() WHERE id = ${id}
      `
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 })
  }
}