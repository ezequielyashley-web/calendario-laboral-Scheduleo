import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { runAsync } from "@/lib/asyncTask"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { para, nombre, asunto, cuerpo } = await req.json()
  if (!para || !asunto || !cuerpo) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })

  runAsync("email-panel-ejecutivo", () => resend.emails.send({
    from: "Scheduleo <verificacion@scheduleo.es>",
    to: para,
    subject: asunto,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8f9fa;border-radius:12px;">
        <div style="background:#0b0e1a;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
          <span style="font-size:20px;font-weight:700;color:#c9a14d;">Scheduleo</span>
          <span style="font-size:12px;color:#8d92ab;display:block;margin-top:4px;">Panel Ejecutivo</span>
        </div>
        <p style="font-size:14px;color:#374151;margin-bottom:8px;">Hola <strong>${nombre}</strong>,</p>
        <div style="background:#fff;border-radius:8px;padding:20px;border:1px solid #E5E7EB;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${cuerpo}</div>
        <p style="font-size:11px;color:#9CA3AF;margin-top:20px;text-align:center;">Mensaje enviado desde el Panel Ejecutivo de Scheduleo</p>
      </div>
    `
  }))

  return NextResponse.json({ ok: true })
}