import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { solicitudId, emailOriginal, nombre, email, telefono, dni, cargo, departamento, sueldoBase, tipoContrato, jornada, horario, genero, permisos, masterPassword } = body

    // Verificar contrasena master
    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    // Buscar usuario por email original
    const usuario = await prisma.user.findFirst({ where: { email: emailOriginal.toLowerCase() } }) as any
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    const permisosAntes = usuario.permisos || {}

    // Actualizar usuario en User
    await prisma.$executeRawUnsafe(`
      UPDATE "User" SET
        name = '${nombre.replace(/'/g, "''")}',
        email = '${email.toLowerCase().replace(/'/g, "''")}',
        cargo = '${(cargo||"").replace(/'/g, "''")}',
        departamento = '${(departamento||"").replace(/'/g, "''")}',
        genero = '${genero||"masculino"}',
        permisos = '${JSON.stringify(permisos||{})}'::jsonb
      WHERE id = '${usuario.id}'
    `)

    // Actualizar solicitud
    const sueldoVal = sueldoBase ? parseFloat(sueldoBase) : null
    if (solicitudId) {
      await prisma.$executeRaw`
        UPDATE "SolicitudGerencial" SET
          nombre = ${nombre},
          email = ${email.toLowerCase()},
          cargo = ${cargo||""},
          telefono = ${telefono||""},
          dni = ${dni||""},
          departamento = ${departamento||""},
          "tipoContrato" = ${tipoContrato||"indefinido"},
          jornada = ${jornada||"completa"},
          horario = ${horario||"manana"},
          "sueldoBase" = ${sueldoVal}
        WHERE id = ${solicitudId}
      `
    }

    // Registrar en historial de permisos si cambiaron
    const permisosStr = JSON.stringify(permisos || {})
    const permisosAntesStr = JSON.stringify(permisosAntes)
    if (permisosStr !== permisosAntesStr) {
      await prisma.$executeRaw`
        INSERT INTO "HistorialPermisos" (id, "usuarioId", "usuarioNombre", "usuarioEmail", "permisosAntes", "permisosDespues", "modificadoPor")
        VALUES (gen_random_uuid()::text, ${usuario.id}, ${nombre}, ${email.toLowerCase()}, ${JSON.stringify(permisosAntes)}::jsonb, ${JSON.stringify(permisos||{})}::jsonb, ${"Super Admin"})
      `
    }

    // Registrar en historial gerencial
    await prisma.$executeRaw`
      INSERT INTO "HistorialGerencial" (id, "solicitudId", nombre, email, cargo, accion, motivo, "realizadoPor")
      VALUES (gen_random_uuid()::text, ${solicitudId||null}, ${nombre}, ${email.toLowerCase()}, ${cargo||""}, ${"editado"}, ${"Datos actualizados por Super Admin"}, ${"Super Admin"})
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}