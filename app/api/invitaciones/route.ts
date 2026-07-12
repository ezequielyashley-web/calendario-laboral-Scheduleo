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

    const { email, rol, permisos, cargo, departamento, tipoContrato, jornada, horario, sueldoBase, funciones } = await req.json()
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
        cargo: cargo || null,
        departamento: departamento || null,
        tipoContrato: tipoContrato || null,
        jornada: jornada || null,
        horario: horario || null,
        sueldoBase: sueldoBase ? parseFloat(sueldoBase) : null,
        funciones: funciones || null,
      }
    })

    const empresa = await prisma.empresa.findFirst({ where: { id: "empresa-001" } })
    const nombreEmpresa = empresa?.nombre || "tu empresa"
    const enlace = `https://www.scheduleo.es/invitacion/${token}`
    const fechaHoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })

    const filasDatos = [
      cargo ? { label: "Cargo", valor: cargo } : null,
      departamento ? { label: "Departamento", valor: departamento } : null,
      tipoContrato ? { label: "Tipo de contrato", valor: tipoContrato } : null,
      jornada ? { label: "Jornada", valor: jornada } : null,
      horario ? { label: "Horario", valor: horario } : null,
      sueldoBase ? { label: "Salario bruto anual", valor: `${parseFloat(sueldoBase).toLocaleString("es-ES")} €` } : null,
    ].filter(Boolean) as { label: string; valor: string }[]

    const filasHtml = filasDatos.map((f, i) => `
      <tr>
        <td style="font-size:11px;color:#6B7280;padding:5px 0;${i < filasDatos.length - 1 ? "border-bottom:0.5px solid #EEE;" : ""}">${f.label}</td>
        <td style="font-size:11.5px;color:#1E1B2E;font-weight:500;padding:5px 0;text-align:right;${i < filasDatos.length - 1 ? "border-bottom:0.5px solid #EEE;" : ""}">${f.valor}</td>
      </tr>`).join("")

    const funcionesHtml = funciones
      ? funciones.split("\n").filter((l: string) => l.trim()).map((l: string) => `&middot; ${l.trim()}<br/>`).join("")
      : "&middot; Acceso al sistema de gestion laboral Scheduleo segun los permisos asignados<br/>"

    await resend.emails.send({
      from: "Scheduleo <verificacion@scheduleo.es>",
      to: emailLimpio,
      subject: `Invitacion de acceso e incorporacion — ${nombreEmpresa}`,
      html: `
        <div style="max-width:580px;margin:0 auto;background:#ffffff;position:relative;font-family:Georgia,'Times New Roman',serif;padding:28px 20px;border:0.5px solid #E5E7EB;overflow:hidden">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0">
            <span style="font-size:480px;font-weight:500;color:#6B7280;opacity:0.09;font-family:Arial,sans-serif;line-height:1">S</span>
          </div>
          <div style="position:relative;z-index:1">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;font-family:Arial,sans-serif">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:22px;height:22px;border-radius:6px;background:#1E1B2E;display:flex;align-items:center;justify-content:center">
                  <span style="color:#fff;font-size:11px;font-weight:bold">S</span>
                </div>
                <span style="font-size:12px;font-weight:bold;color:#1E1B2E;letter-spacing:0.02em">SCHEDULEO</span>
              </div>
              <span style="font-size:10px;color:#9CA3AF">${fechaHoy}</span>
            </div>
            <p style="font-size:10.5px;color:#9CA3AF;font-family:Arial,sans-serif;margin:0 0 22px">Asunto: invitacion de acceso e incorporacion al puesto en ${nombreEmpresa}</p>
            <p style="font-size:12.5px;color:#1E1B2E;line-height:1.75;margin:0 0 16px">Estimado/a Sr./Sra.:</p>
            <p style="font-size:12.5px;color:#2D2A3A;line-height:1.75;margin:0 0 16px;text-align:justify">
              Por medio de la presente, la direccion de <strong>${nombreEmpresa}</strong> le comunica que ha sido designado/a para incorporarse a la empresa con las siguientes condiciones, y para acceder al sistema de gestion laboral <strong>Scheduleo</strong> con perfil ${rol === "SUPER_ADMIN" ? "de administracion" : "gerencial"}:
            </p>
            ${filasDatos.length > 0 ? `<table style="width:100%;border-collapse:collapse;margin:0 0 20px;font-family:Arial,sans-serif">${filasHtml}</table>` : ""}
            <p style="font-size:11.5px;font-weight:bold;color:#1E1B2E;margin:0 0 8px;font-family:Arial,sans-serif">Funciones y responsabilidades del puesto</p>
            <div style="font-size:12.5px;color:#2D2A3A;line-height:1.9;margin:0 0 20px">${funcionesHtml}</div>
            <p style="font-size:12.5px;color:#2D2A3A;line-height:1.75;margin:0 0 16px;text-align:justify">
              Este nombramiento conlleva acceso a informacion laboral de terceros, por lo que se le solicita tratar dicha informacion con la debida confidencialidad, conforme al Reglamento General de Proteccion de Datos (RGPD) y la Ley Organica 3/2018.
            </p>
            <p style="font-size:12.5px;color:#2D2A3A;line-height:1.75;margin:0 0 16px;text-align:justify">Para formalizar su acceso, cree sus credenciales personales a traves del siguiente enlace:</p>
            <div style="text-align:center;margin:26px 0;font-family:Arial,sans-serif">
              <a href="${enlace}" style="display:inline-block;background:#1E1B2E;color:#fff;text-decoration:none;padding:11px 28px;font-size:12px;letter-spacing:0.02em">CREAR MIS CREDENCIALES</a>
            </div>
            <p style="font-size:12.5px;color:#2D2A3A;line-height:1.75;margin:0 0 16px;text-align:justify">
              Este enlace constituye un <strong>codigo de un solo uso</strong>: una vez utilizado para crear su cuenta, quedara invalidado de forma permanente. Tiene ademas una <strong>caducidad de siete (7) dias naturales</strong> desde la fecha de este correo.
            </p>
            <p style="font-size:12.5px;color:#2D2A3A;line-height:1.75;margin:0 0 28px;text-align:justify">
              Tras crear su cuenta, su solicitud quedara pendiente de revision y aprobacion por parte de la administracion del sistema.
            </p>
            <p style="font-size:12.5px;color:#1E1B2E;line-height:1.6;margin:0">Atentamente,</p>
            <p style="font-size:12.5px;color:#1E1B2E;line-height:1.6;margin:3px 0 0;font-weight:bold">La direccion de ${nombreEmpresa}</p>
            <div style="border-top:0.5px solid #E5E7EB;margin-top:32px;padding-top:14px;font-family:Arial,sans-serif">
              <p style="font-size:9.5px;color:#B0B3B9;margin:0;line-height:1.6">Este mensaje ha sido generado automaticamente por Scheduleo. Este correo y su contenido son confidenciales y de uso exclusivo del destinatario.</p>
            </div>
          </div>
        </div>
      `
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/invitaciones:", error)
    return NextResponse.json({ error: "Error al enviar la invitacion" }, { status: 500 })
  }
}