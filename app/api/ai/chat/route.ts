import { NextRequest, NextResponse } from "next/server"
import { chatAI } from "@/lib/ai"
import { prisma } from "@/lib/prisma"

const PALABRAS_BLOQUEADAS = [
  "base de datos", "database", "sql", "select", "insert", "delete", "drop",
  "contrasena", "password", "api key", "token", "secreto", "secret",
  "codigo fuente", "source code", "hack", "exploit", "vulnerabilidad",
  "datos personales completos", "exportar todo", "dump"
]

export async function POST(req: NextRequest) {
  try {
    const { mensajes, userId, contexto } = await req.json()
    if (!mensajes || !userId) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })

    // Verificar rate limiting - max 20 consultas por usuario por dia
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const consultas = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "ChatAI"
      WHERE "userId" = ${userId} AND rol = 'user' AND "createdAt" >= ${hoy}
    ` as any[]
    const total = Number(consultas[0]?.total || 0)
    if (total >= 20) return NextResponse.json({ error: "Has alcanzado el limite de 20 consultas diarias." }, { status: 429 })

    // Filtro de seguridad
    const ultimoMensaje = mensajes[mensajes.length - 1]?.contenido?.toLowerCase() || ""
    const bloqueado = PALABRAS_BLOQUEADAS.some(p => ultimoMensaje.includes(p))
    if (bloqueado) {
      return NextResponse.json({
        respuesta: "No puedo ayudarte con eso. Solo puedo asistirte con temas de gestion laboral en Scheduleo.",
        tokens: 0,
        proveedor: "filtro"
      })
    }

    const resultado = await chatAI(mensajes, contexto)

    // Guardar en historial
    await prisma.$executeRaw`
      INSERT INTO "ChatAI" (id, "userId", rol, contenido, tokens, proveedor)
      VALUES (gen_random_uuid()::text, ${userId}, 'user', ${ultimoMensaje}, 0, ${resultado.proveedor})
    `
    await prisma.$executeRaw`
      INSERT INTO "ChatAI" (id, "userId", rol, contenido, tokens, proveedor)
      VALUES (gen_random_uuid()::text, ${userId}, 'assistant', ${resultado.respuesta}, ${resultado.tokens}, ${resultado.proveedor})
    `

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error("Error en chatAI:", error)
    return NextResponse.json({ error: error.message || "Error en ScheduleoAI" }, { status: 500 })
  }
}