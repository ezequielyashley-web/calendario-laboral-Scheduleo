import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { llamarModeloIA } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el Super Admin puede probar el asistente" }, { status: 403 })
    }

    const { proveedor, modelo, mensaje } = await req.json()
    if (!proveedor || !modelo || !mensaje?.trim()) {
      return NextResponse.json({ error: "Faltan datos para la prueba" }, { status: 400 })
    }

    const config = await prisma.configuracionAIProveedor.findUnique({ where: { proveedor } })
    if (!config?.apiKeyEnc) {
      return NextResponse.json({ error: "Este proveedor no tiene una clave configurada" }, { status: 400 })
    }

    const apiKey = decrypt(config.apiKeyEnc)
    const resultado = await llamarModeloIA(
      proveedor,
      modelo,
      apiKey,
      [{ rol: "user", contenido: mensaje.trim() }],
      "Eres ScheduleoAI, el asistente de Scheduleo. Responde brevemente en español, este es un mensaje de prueba desde el panel de configuracion."
    )

    return NextResponse.json({ respuesta: resultado.respuesta, tokens: resultado.tokens })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error?.message || "Error al probar el asistente" }, { status: 500 })
  }
}