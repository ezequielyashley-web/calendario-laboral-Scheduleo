import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"

async function validarGroq(apiKey: string) {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return res.ok
}

async function validarOpenAI(apiKey: string) {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return res.ok
}

async function validarAnthropic(apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
  })
  return res.ok
}

async function validarGoogle(apiKey: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`)
  return res.ok
}

async function validarMistral(apiKey: string) {
  const res = await fetch("https://api.mistral.ai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return res.ok
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el Super Admin puede validar claves" }, { status: 403 })
    }

    const { proveedor, apiKey } = await req.json()
    const clave = (apiKey || "").trim()
    if (!clave) return NextResponse.json({ valido: false, error: "La clave esta vacia" })

    let valido = false
    switch (proveedor) {
      case "groq": valido = await validarGroq(clave); break
      case "openai": valido = await validarOpenAI(clave); break
      case "anthropic": valido = await validarAnthropic(clave); break
      case "google": valido = await validarGoogle(clave); break
      case "mistral": valido = await validarMistral(clave); break
      default: return NextResponse.json({ valido: false, error: "Proveedor no reconocido" })
    }

    return NextResponse.json({ valido, error: valido ? null : "La clave no es valida para este proveedor" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ valido: false, error: "Error al conectar con el proveedor" })
  }
}