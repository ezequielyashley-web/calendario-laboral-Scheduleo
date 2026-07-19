import { NextRequest, NextResponse } from "next/server"
import { validarFormatoUsername, usernameDisponible } from "@/lib/username"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = (searchParams.get("username") || "").trim()

    const errorFormato = validarFormatoUsername(username)
    if (errorFormato) return NextResponse.json({ disponible: false, error: errorFormato })

    const disponible = await usernameDisponible(username)
    return NextResponse.json({ disponible, error: disponible ? null : "Ese nombre de usuario ya esta en uso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ disponible: false, error: "Error al comprobar disponibilidad" }, { status: 500 })
  }
}