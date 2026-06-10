import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { host, port, tls, user, pass, folder } = await req.json()

    if (!host || !user || !pass) {
      return NextResponse.json({ error: "Host, usuario y contrasena son obligatorios" }, { status: 400 })
    }

    const { ImapFlow } = await import("imapflow")

    const client = new ImapFlow({
      host,
      port: parseInt(port) || 993,
      secure: tls ?? true,
      auth: { user, pass },
      logger: false,
    })

    await client.connect()
    const mailbox = await client.mailboxOpen(folder || "INBOX")
    const mensajes = mailbox.exists
    await client.logout()

    return NextResponse.json({ ok: true, mensajes })
  } catch (error: any) {
    console.error("IMAP test error:", error)
    return NextResponse.json({
      error: `Error de conexion IMAP: ${error.message || "Verifica los datos"}`
    }, { status: 500 })
  }
}