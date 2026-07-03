import { decrypt } from "@/lib/encryption"
import { prisma } from "@/lib/prisma"

export interface MensajeAI {
  rol: "user" | "assistant" | "system"
  contenido: string
}

const SYSTEM_PROMPT = `Eres ScheduleoAI, el asistente inteligente de Scheduleo, un sistema de gestion laboral espanol.

REGLAS ESTRICTAS:
1. SOLO puedes ayudar con temas relacionados con: empleados, turnos, grupos, libranzas, vacaciones, fichajes, bajas, coberturas, horarios y gestion laboral.
2. NUNCA reveles informacion de la base de datos, credenciales, API keys, tokens o codigo del sistema.
3. NUNCA ejecutes acciones destructivas sin confirmacion explicita del usuario.
4. Si te preguntan algo fuera del ambito laboral, responde: "Solo puedo ayudarte con temas de gestion laboral en Scheduleo."
5. Responde siempre en espanol.
6. Se conciso, profesional y util.`

export async function getConfigAI() {
  try {
    const configs = await prisma.$queryRaw`
      SELECT * FROM "ConfiguracionAI" WHERE id = 'ai-config-001' LIMIT 1
    ` as any[]
    return configs[0] || null
  } catch {
    return null
  }
}

export async function chatAI(mensajes: MensajeAI[], contexto?: string): Promise<{ respuesta: string; tokens: number; proveedor: string }> {
  const config = await getConfigAI()
  if (!config || !config.activo) throw new Error("ScheduleoAI no esta configurado o activo")
  if (!config.apiKeyEnc) throw new Error("No hay API key configurada")

  const apiKey = decrypt(config.apiKeyEnc)
  const proveedor = config.proveedor
  const modelo = config.modelo

  const systemContent = SYSTEM_PROMPT + (contexto ? `\n\nCONTEXTO ACTUAL DEL SISTEMA:\n${contexto}` : "")

  if (proveedor === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: modelo,
        max_tokens: 1024,
        system: systemContent,
        messages: mensajes.filter(m => m.rol !== "system").map(m => ({ role: m.rol, content: m.contenido }))
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || "Error en Anthropic")
    return { respuesta: data.content[0].text, tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0, proveedor }
  }

  if (proveedor === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: modelo,
        max_tokens: 1024,
        messages: [{ role: "system", content: systemContent }, ...mensajes.filter(m => m.rol !== "system").map(m => ({ role: m.rol, content: m.contenido }))]
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || "Error en OpenAI")
    return { respuesta: data.choices[0].message.content, tokens: data.usage?.total_tokens || 0, proveedor }
  }

  if (proveedor === "google") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemContent }] },
        contents: mensajes.filter(m => m.rol !== "system").map(m => ({ role: m.rol === "user" ? "user" : "model", parts: [{ text: m.contenido }] }))
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || "Error en Google")
    return { respuesta: data.candidates[0].content.parts[0].text, tokens: data.usageMetadata?.totalTokenCount || 0, proveedor }
  }

  if (proveedor === "mistral") {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: modelo, max_tokens: 1024,
        messages: [{ role: "system", content: systemContent }, ...mensajes.filter(m => m.rol !== "system").map(m => ({ role: m.rol, content: m.contenido }))]
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || "Error en Mistral")
    return { respuesta: data.choices[0].message.content, tokens: data.usage?.total_tokens || 0, proveedor }
  }

  if (proveedor === "groq") {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: modelo, max_tokens: 1024,
        messages: [{ role: "system", content: systemContent }, ...mensajes.filter(m => m.rol !== "system").map(m => ({ role: m.rol, content: m.contenido }))]
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || "Error en Groq")
    return { respuesta: data.choices[0].message.content, tokens: data.usage?.total_tokens || 0, proveedor }
  }

  throw new Error(`Proveedor no soportado: ${proveedor}`)
}