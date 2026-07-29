import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

function validarEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const rateLimitIP = checkRateLimit("solicitar-acceso_ip_" + ip, 5, 60 * 60 * 1000)
    if (!rateLimitIP.success) {
      return NextResponse.json({ error: "Demasiadas solicitudes desde esta conexion. Intenta mas tarde." }, { status: 429 })
    }

    const { nombre, email, empresa, motivo, aceptaTratamiento } = await req.json()

    if (!nombre || !nombre.trim()) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    if (!email || !validarEmail(email)) return NextResponse.json({ error: "Introduce un email valido" }, { status: 400 })
    if (aceptaTratamiento !== true) return NextResponse.json({ error: "Debes aceptar el tratamiento de datos para continuar" }, { status: 400 })

    const emailLimpio = email.toLowerCase().trim()
    const rateLimitEmail = checkRateLimit("solicitar-acceso_email_" + emailLimpio, 3, 60 * 60 * 1000)
    if (!rateLimitEmail.success) {
      return NextResponse.json({ error: "Ya se ha enviado una solicitud reciente con este email. Intenta mas tarde." }, { status: 429 })
    }

    const yaExisteUsuario = await prisma.user.findUnique({ where: { email: emailLimpio } })
    if (yaExisteUsuario) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email. Usa el inicio de sesion." }, { status: 400 })
    }

    const pendienteExistente = await prisma.solicitudAccesoPublica.findFirst({
      where: { email: emailLimpio, estado: "pendiente" }
    })
    if (pendienteExistente) {
      return NextResponse.json({ ok: true })
    }

    await prisma.solicitudAccesoPublica.create({
      data: {
        nombre: nombre.trim().slice(0, 120),
        email: emailLimpio,
        empresa: empresa ? empresa.trim().slice(0, 160) : null,
        motivo: motivo ? motivo.trim().slice(0, 600) : null,
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/solicitar-acceso:", error)
    return NextResponse.json({ error: "Error al enviar la solicitud" }, { status: 500 })
  }
}