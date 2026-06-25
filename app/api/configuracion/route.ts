import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const config = await prisma.$queryRaw`
      SELECT * FROM "Configuracion" WHERE id = 'default'
    ` as any[]
    
    const data = config[0] || {}
    
    return NextResponse.json({
      imap_host: data.imap_host || "",
      imap_port: data.imap_port || 993,
      imap_tls: data.imap_tls ?? true,
      imap_user: data.imap_user || "",
      imap_pass: data.imap_pass ? "••••••••" : "",
      imap_folder: data.imap_folder || "INBOX",
      tiene_password: !!data.imap_pass,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { imap_host, imap_port, imap_tls, imap_user, imap_pass, imap_folder } = body

    await prisma.$executeRaw`
      INSERT INTO "Configuracion" (id, imap_host, imap_port, imap_tls, imap_user, imap_pass, imap_folder, updated_at)
      VALUES ('default', ${imap_host}, ${imap_port}, ${imap_tls}, ${imap_user}, ${imap_pass}, ${imap_folder}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        imap_host = ${imap_host},
        imap_port = ${imap_port},
        imap_tls = ${imap_tls},
        imap_user = ${imap_user},
        imap_pass = CASE WHEN ${imap_pass} = '••••••••' THEN "Configuracion".imap_pass ELSE ${imap_pass} END,
        imap_folder = ${imap_folder},
        updated_at = NOW()
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 })
  }
}
