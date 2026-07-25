import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"

async function quitarFondo(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const formData = new FormData()
  formData.append("image_file", new Blob([new Uint8Array(buffer)], { type: mimeType }), "logo")
  formData.append("size", "auto")

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": process.env.REMOVEBG_API_KEY || "" },
    body: formData
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("Error de remove.bg:", errorText)
    throw new Error("No se pudo quitar el fondo de la imagen")
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No se recibio ningun archivo" }, { status: 400 })
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "La imagen no puede superar 2MB" }, { status: 400 })
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      return NextResponse.json({ error: "Solo se permiten imagenes PNG o JPG" }, { status: 400 })
    }

    const bufferOriginal = Buffer.from(await file.arrayBuffer())

    let bufferFinal: Buffer
    try {
      bufferFinal = await quitarFondo(bufferOriginal, file.type)
    } catch (e) {
      console.error("Fallo quitando fondo, se usa la imagen original:", e)
      bufferFinal = bufferOriginal
    }

    // remove.bg siempre devuelve PNG con transparencia
    const nombreArchivo = `empresa-001-${Date.now()}.png`

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY

    const res = await fetch(`${supabaseUrl}/storage/v1/object/logos/${nombreArchivo}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "image/png",
        "x-upsert": "true"
      },
      body: new Uint8Array(bufferFinal)
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Error subiendo logo a Supabase Storage:", errorText)
      return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
    }

    const url = `${supabaseUrl}/storage/v1/object/public/logos/${nombreArchivo}`
    return NextResponse.json({ ok: true, url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 })
  }
}