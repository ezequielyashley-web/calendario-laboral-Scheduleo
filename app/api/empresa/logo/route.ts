import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"

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

    const extension = file.type === "image/png" ? "png" : "jpg"
    const nombreArchivo = `empresa-001-${Date.now()}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY

    const res = await fetch(`${supabaseUrl}/storage/v1/object/logos/${nombreArchivo}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": file.type,
        "x-upsert": "true"
      },
      body: buffer
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