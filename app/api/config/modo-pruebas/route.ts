import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export async function GET() {
  try {
    const config = await prisma.$queryRaw`
      SELECT "modoDemo", "modoPruebas" FROM "Configuracion" WHERE id = 'config-001'
    ` as any[]
    const modoDemo = config[0]?.modoDemo ?? false
    const modoPruebasManual = config[0]?.modoPruebas ?? false
    // El Modo Pruebas esta activo si el Modo Demo esta encendido (automatico),
    // o si se activo manualmente desde Configuracion (con el Modo Demo apagado)
    return NextResponse.json({ modoPruebas: modoDemo || modoPruebasManual, modoPruebasManual, modoDemo })
  } catch {
    return NextResponse.json({ modoPruebas: false, modoPruebasManual: false, modoDemo: false })
  }
}
export async function POST(req: NextRequest) {
  try {
    const { modoPruebas } = await req.json()
    await prisma.$executeRaw`
      UPDATE "Configuracion" SET "modoPruebas" = ${modoPruebas}
    `
    return NextResponse.json({ ok: true, modoPruebas })
  } catch (error) {
    console.error("Error actualizando modoPruebas:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}