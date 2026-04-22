export const getPasswordResetEmailHTML = (resetUrl: string, userName?: string) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Scheduleo</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Scheduleo</h1>
              <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 14px;">Sistema de Gestión Laboral</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${userName ? `<p style="color: #374151; font-size: 16px; margin: 0 0 16px 0;">Hola ${userName},</p>` : ''}
              
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Scheduleo.
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
                Haz clic en el botón de abajo para crear una nueva contraseña:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #0891b2; 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 32px; 
                              border-radius: 6px; 
                              font-size: 16px; 
                              font-weight: bold; 
                              display: inline-block;">
                      Restablecer Contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0 0 24px 0;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              
              <div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin: 0 0 24px 0; word-break: break-all;">
                <a href="${resetUrl}" style="color: #0891b2; font-size: 14px; text-decoration: none;">${resetUrl}</a>
              </div>

              <!-- Security Warning -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: bold;">⚠️ Importante:</p>
                <p style="color: #92400e; font-size: 14px; margin: 8px 0 0 0; line-height: 20px;">
                  Este enlace expirará en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este email.
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 24px 0 0 0;">
                Si tienes problemas, contacta al soporte técnico.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 18px;">
                © ${new Date().getFullYear()} Scheduleo. Todos los derechos reservados.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                Este es un email automático, por favor no responder.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getPasswordResetEmailText = (resetUrl: string, userName?: string) => {
  return `
${userName ? `Hola ${userName},` : 'Hola,'}

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Scheduleo.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetUrl}

⚠️ IMPORTANTE:
- Este enlace expirará en 1 hora
- Si no solicitaste este cambio, ignora este email

Si tienes problemas, contacta al soporte técnico.

© ${new Date().getFullYear()} Scheduleo. Todos los derechos reservados.
  `.trim();
};
