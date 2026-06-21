import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailAccesoTemporal({
  nombre,
  email,
  contrasenaTemporal,
  empresaNombre,
  loginUrl,
}: {
  nombre: string
  email: string
  contrasenaTemporal: string
  empresaNombre: string
  loginUrl: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Scheduleo <onboarding@resend.dev>",
      to: email,
      subject: `Tu acceso a Scheduleo ha sido aprobado - ${empresaNombre}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 32px 0;">
          <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
            <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 32px 28px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px;">📅</div>
                <span style="color: #fff; font-size: 17px; font-weight: 600;">Scheduleo</span>
              </div>
              <h1 style="color: #fff; font-size: 22px; font-weight: 700; margin: 20px 0 6px;">¡Bienvenido, ${nombre}!</h1>
              <p style="color: rgba(255,255,255,0.75); font-size: 14px; margin: 0;">Tu solicitud de acceso gerencial ha sido aprobada</p>
            </div>
            <div style="padding: 28px;">
              <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 20px;">
                El equipo de <strong>${empresaNombre}</strong> te ha concedido acceso al sistema de gestión Scheduleo. A continuación encontrarás tus credenciales temporales de acceso.
              </p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="margin-bottom: 14px;">
                  <div style="font-size: 11px; font-weight: 700; color: #6366f1; letter-spacing: 0.06em; margin-bottom: 4px;">EMAIL DE ACCESO</div>
                  <div style="font-size: 15px; color: #111827; font-weight: 600;">${email}</div>
                </div>
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #6366f1; letter-spacing: 0.06em; margin-bottom: 4px;">CONTRASEÑA TEMPORAL</div>
                  <div style="font-size: 18px; color: #111827; font-weight: 700; font-family: monospace; letter-spacing: 1px;">${contrasenaTemporal}</div>
                </div>
              </div>
              <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="font-size: 12px; color: #92400e; margin: 0; line-height: 1.5;">
                  ⚠️ Por seguridad, te recomendamos cambiar esta contraseña en tu primer inicio de sesión.
                </p>
              </div>
              <a href="${loginUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #4338ca, #6366f1); color: #fff; text-decoration: none; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700;">
                Entrar al sistema →
              </a>
            </div>
          </div>
          <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 20px;">
            Este es un email automático de Scheduleo. Si no esperabas este mensaje, contacta con tu administrador.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Error enviando email:", error)
      return { ok: false, error }
    }

    return { ok: true, data }
  } catch (error) {
    console.error("Error en enviarEmailAccesoTemporal:", error)
    return { ok: false, error }
  }
}

export function generarContrasenaTemporal(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let pass = ""
  for (let i = 0; i < 10; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass
}