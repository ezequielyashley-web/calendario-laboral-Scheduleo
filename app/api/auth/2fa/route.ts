import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

export const runtime = "nodejs"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, action, code, userId } = await req.json()

    // ACCION: enviar codigo
    if (action === "send") {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      return NextResponse.json({ ok: true, skip: true }) // BYPASS TEMPORAL

      // Generar codigo 6 digitos
      const codigo = Math.floor(100000 + Math.random() * 900000).toString()
      const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

      // Guardar en BD
      await prisma.$executeRaw`
        INSERT INTO "TwoFactorCode" (id, "userId", code, expires)
        VALUES (gen_random_uuid()::text, ${user.id}, ${codigo}, ${expires})
      `

      // Limpiar codigos viejos
      await prisma.$executeRaw`
        DELETE FROM "TwoFactorCode"
        WHERE "userId" = ${user.id} AND expires < NOW()
      `

      // Enviar email
      await resend.emails.send({
        from: "Scheduleo <onboarding@resend.dev>",
        to: process.env.RESEND_TEST_EMAIL || email,
        subject: "Codigo de verificacion — Scheduleo",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <div style="text-align:center;margin-bottom:24px">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#3b82f6,#1e40af)">
                <span style="font-size:24px;font-weight:800;color:#fff">S</span>
              </div>
            </div>
            <h1 style="font-size:22px;font-weight:700;color:#1e293b;text-align:center;margin-bottom:8px">Verificacion en dos pasos</h1>
            <p style="color:#64748b;text-align:center;margin-bottom:32px">Usa este codigo para completar tu inicio de sesion</p>
            <div style="background:#f0f4ff;border:2px dashed #6366f1;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px">
              <div style="font-size:42px;font-weight:800;color:#4f46e5;letter-spacing:10px;font-family:monospace">${codigo}</div>
            </div>
            <p style="color:#94a3b8;font-size:13px;text-align:center">Este codigo expira en <strong>10 minutos</strong>. No lo compartas con nadie.</p>
            <p style="color:#cbd5e1;font-size:12px;text-align:center;margin-top:24px">Si no has intentado iniciar sesion, ignora este email.</p>
          </div>
        `
      })

      return NextResponse.json({ ok: true, userId: user.id })
    }

    // ACCION: verificar codigo
    if (action === "verify") {
      const codigos = await prisma.$queryRaw`
        SELECT * FROM "TwoFactorCode"
        WHERE "userId" = ${userId}
        AND code = ${code}
        AND used = false
        AND expires > NOW()
        ORDER BY "createdAt" DESC
        LIMIT 1
      ` as any[]

      if (!codigos.length) {
        return NextResponse.json({ error: "Codigo invalido o expirado" }, { status: 400 })
      }

      // Marcar como usado
      await prisma.$executeRaw`
        UPDATE "TwoFactorCode" SET used = true WHERE id = ${codigos[0].id}
      `

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error en 2FA" }, { status: 500 })
  }
}