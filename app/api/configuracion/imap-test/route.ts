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

    const Imap = (await import("imap")).default

    const mensajes = await new Promise<number>((resolve, reject) => {
      const imap = new Imap({
        user,
        password: pass,
        host,
        port: parseInt(port) || 993,
        tls: tls ?? true,
        tlsOptions: { rejectUnauthorized: false },
        connTimeout: 10000,
        authTimeout: 10000,
      })

      imap.once("ready", () => {
        imap.openBox(folder || "INBOX", true, (err, box) => {
          if (err) { imap.end(); reject(err); return }
          const total = box.messages.total
          imap.end()
          resolve(total)
        })
      })

      imap.once("error", (err: any) => reject(err))
      imap.connect()
    })

    return NextResponse.json({ ok: true, mensajes })
  } catch (error: any) {
    console.error("IMAP test error:", error)
    return NextResponse.json({ error: `Error de conexion IMAP: ${error.message || "Verifica los datos"}` }, { status: 500 })
  }
}
