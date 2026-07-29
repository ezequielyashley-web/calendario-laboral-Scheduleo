import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, empresa, motivo } = await req.json()
    if (!nombre || !nombre.trim()) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    if (!email || !email.trim()) return NextResponse.json({ error: "El email es obligatorio" }, { status: 400 })

    await prisma.solicitudAccesoPublica.create({
      data: {
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        empresa: empresa ? empresa.trim() : null,
        motivo: motivo ? motivo.trim() : null,
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/solicitar-acceso:", error)
    return NextResponse.json({ error: "Error al enviar la solicitud" }, { status: 500 })
  }
}