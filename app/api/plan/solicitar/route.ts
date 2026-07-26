import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { runAsync } from "@/lib/asyncTask"
const resend = new Resend(process.env.RESEND_API_KEY)

// NOTA: esta notificacion hoy se envia por email al fundador.
// Cuando exista la plataforma central de gestion de clientes,
// sustituir/complementar este aviso con una llamada webhook a esa plataforma
// (por ejemplo: notificarPlataformaCentral({ empresaId, planSolicitado })).
async function notificarSolicitud(planActual: string, planSolicitado: string, mensaje: string) {
  const fundadorRows = await prisma.$queryRaw`SELECT email FROM "User" WHERE "esFundador" = true LIMIT 1` as any[]
  const fundador = fundadorRows[0]
  if (!fundador?.email) return
  runAsync("email-solicitud-plan", () => resend.emails.send({
    from: "Scheduleo <verificacion@scheduleo.es>",
    to: fundador.email,
    subject: `Solicitud de cambio de plan: ${planActual} -> ${planSolicitado}`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#111827">Nueva solicitud de cambio de plan</h2>
      <p><strong>Plan actual:</strong> ${planActual}</p>
      <p><strong>Plan solicitado:</strong> ${planSolicitado}</p>
      ${mensaje ? `<p><strong>Mensaje:</strong> ${mensaje}</p>` : ""}
      <p style="color:#6B7280;font-size:13px">Genera la clave de activacion desde el panel de Super Admin cuando corresponda.</p>
    </div>`
  }))
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  if (auth.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const { planSolicitado, mensaje } = await req.json()
    if (!["basico", "profesional", "enterprise"].includes(planSolicitado)) {
      return NextResponse.json({ error: "Plan no valido" }, { status: 400 })
    }
    const empresa = await prisma.empresa.findUnique({ where: { id: "empresa-001" } })
    const planActual = empresa?.plan || "basico"

    const solicitud = await prisma.solicitudPlan.create({
      data: { empresaId: "empresa-001", planActual, planSolicitado, mensaje: mensaje || null }
    })

    await notificarSolicitud(planActual, planSolicitado, mensaje || "")

    return NextResponse.json({ ok: true, id: solicitud.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al enviar la solicitud" }, { status: 500 })
  }
}