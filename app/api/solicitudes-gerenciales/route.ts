import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Auto-rechazar expiradas 48h usando SQL directo sin parametros en INTERVAL
    await prisma.$executeRawUnsafe(`
      UPDATE "SolicitudGerencial"
      SET estado = 'rechazada', "resueltaEn" = NOW()
      WHERE estado = 'pendiente'
      AND "creadaEn" < NOW() - INTERVAL '48 hours'
    `)
    // Auto-eliminar rechazadas tras 24h
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
    const body = await req.json()
    const { nombre, email, cargo, telefono, dni, departamento, tipoContrato, jornada, horario, permisos, mensaje } = body
    const sueldoBase = body.sueldoBase ? parseFloat(body.sueldoBase) : null
    if (!nombre || !email || !cargo) return NextResponse.json({ error: "Nombre, email y cargo son obligatorios" }, { status: 400 })

    await prisma.$executeRaw`
      INSERT INTO "SolicitudGerencial" (id, nombre, email, cargo, telefono, dni, departamento, "tipoContrato", jornada, horario, "sueldoBase", permisos, mensaje)
      VALUES (gen_random_uuid()::text, ${nombre}, ${email}, ${cargo}, ${telefono||""}, ${dni||""}, ${departamento||""}, ${tipoContrato||"indefinido"}, ${jornada||"completa"}, ${horario||"manana"}, ${sueldoBase||null}, ${JSON.stringify(permisos||{})}::jsonb, ${mensaje||""})
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
      await prisma.$executeRawUnsafe(`UPDATE "SolicitudGerencial" SET estado = 'aprobada', "resueltaEn" = NOW() WHERE id = '${id}'`)
      return NextResponse.json({ ok: true, tempPassword: rawPassword, nombre: sol.nombre, email: sol.email })
    }

    if (accion === "rechazar") {
      await prisma.$executeRawUnsafe(`UPDATE "SolicitudGerencial" SET estado = 'rechazada', "resueltaEn" = NOW() WHERE id = '${id}'`)
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
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.$executeRawUnsafe(`DELETE FROM "SolicitudGerencial" WHERE id = '${id}' AND estado = 'rechazada'`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar solicitud" }, { status: 500 })
  }
}