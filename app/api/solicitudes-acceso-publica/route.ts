import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { Resend } from "resend"
import { runAsync } from "@/lib/asyncTask"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const solicitudes = await prisma.solicitudAccesoPublica.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(solicitudes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    if (auth.role !== "SUPER_ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const { id, accion, masterPassword } = await req.json()

    const master = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!master) return NextResponse.json({ error: "No hay SUPER_ADMIN" }, { status: 403 })
    const valid = await bcrypt.compare(masterPassword, master.password)
    if (!valid) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 403 })

    const sol = await prisma.solicitudAccesoPublica.findUnique({ where: { id } })
    if (!sol) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })

    if (accion === "rechazar") {
      await prisma.solicitudAccesoPublica.update({ where: { id }, data: { estado: "rechazada", revisadoPor: auth.userId, revisadoEn: new Date() } })
      return NextResponse.json({ ok: true })
    }

    if (accion === "aprobar") {
      const yaExiste = await prisma.user.findUnique({ where: { email: sol.email.toLowerCase() } })
      if (yaExiste) return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 400 })

      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const partesNombre = sol.nombre.trim().split(" ")
      const nombre = partesNombre[0]
      const apellidos = partesNombre.slice(1).join(" ") || null

      await prisma.invitacion.create({
        data: {
          email: sol.email.toLowerCase(),
          token,
          rol: "GERENCIAL",
          permisos: {},
          expiresAt,
          nombre,
          apellidos,
        }
      })

      await prisma.solicitudAccesoPublica.update({ where: { id }, data: { estado: "aprobada", revisadoPor: auth.userId, revisadoEn: new Date() } })

      const empresa = await prisma.empresa.findFirst({ where: { id: "empresa-001" } })
      const nombreEmpresa = empresa?.nombre || "Scheduleo"
      const enlace = `https://www.scheduleo.es/invitacion/${token}`

      runAsync("email-solicitud-acceso-aprobada", async () => { await resend.emails.send({
        from: "Scheduleo <verificacion@scheduleo.es>",
        to: sol.email.toLowerCase(),
        subject: `Tu solicitud de acceso a ${nombreEmpresa} ha sido aprobada`,
        html: `
          <div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;padding:40px 36px;border:1px solid #E5E7EB">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px">
              <div style="width:22px;height:22px;border-radius:6px;background:#673DE6;display:flex;align-items:center;justify-content:center">
                <span style="color:#fff;font-size:11px;font-weight:bold">S</span>
              </div>
              <span style="font-size:12px;font-weight:bold;color:#1E1B2E">SCHEDULEO</span>
            </div>
            <p style="font-size:13px;color:#1E1B2E;line-height:1.7">Hola ${nombre},</p>
            <p style="font-size:13px;color:#2D2A3A;line-height:1.7">Tu solicitud de acceso a <strong>${nombreEmpresa}</strong> ha sido revisada y aprobada. Pulsa el siguiente enlace para crear tu cuenta:</p>
            <div style="text-align:center;margin-top:24px">
              <a href="${enlace}" style="display:inline-block;background:#673DE6;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:12.5px;font-weight:bold">CREAR MI CUENTA</a>
              <div style="font-size:9.5px;color:#9CA3AF;margin-top:8px">Este enlace expira en 7 dias</div>
            </div>
          </div>
        `
      }) })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 })
  }
}