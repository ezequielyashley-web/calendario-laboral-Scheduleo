import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

export const runtime = "nodejs"
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el SUPER_ADMIN puede invitar nuevos usuarios" }, { status: 403 })
    }

    const { email, rol, permisos } = await req.json()
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "El email es obligatorio" }, { status: 400 })
    }

    const emailLimpio = email.toLowerCase().trim()

    const yaExiste = await prisma.user.findUnique({ where: { email: emailLimpio } })
    if (yaExiste) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 400 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.invitacion.create({
      data: {
        email: emailLimpio,
        token,
        rol: rol === "SUPER_ADMIN" ? "SUPER_ADMIN" : "GERENCIAL",
        permisos: permisos || {},
        expiresAt,
      }
    })

    const enlace = `https://www.scheduleo.es/invitacion/${token}`

    await resend.emails.send({
      from: "Scheduleo <verificacion@scheduleo.es>",
      to: emailLimpio,
      subject: "Te han invitado a Scheduleo",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h1 style="font-size:22px;font-weight:700;color:#1e293b;text-align:center;margin-bottom:8px">Has sido invitado a Scheduleo</h1>
          <p style="color:#64748b;text-align:center;margin-bottom:32px">Crea tu cuenta para acceder al sistema de gestion laboral.</p>
          <div style="text-align:center;margin-bottom:24px">
            <a href="${enlace}" style="display:inline-block;background:#673DE6;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700">Crear mi cuenta</a>
          </div>
          <p style="color:#94a3b8;font-size:13px;text-align:center">Este enlace expira en <strong>7 dias</strong>.</p>
          <p style="color:#cbd5e1;font-size:12px;text-align:center;margin-top:24px">Si no esperabas esta invitacion, ignora este email.</p>
        </div>
      `
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/invitaciones:", error)
    return NextResponse.json({ error: "Error al enviar la invitacion" }, { status: 500 })
  }
}