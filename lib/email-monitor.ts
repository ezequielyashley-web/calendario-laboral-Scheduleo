/**
 * Monitor de email INSS - Scheduleo 2.0
 * Conecta via IMAP a bajas@empresa.com cada 5 minutos.
 * Normativa: RD 1060/2022 - Orden ISM/2/2023
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type ParteINSS = {
  numeroParteINSS: string
  nombreEmpleado:  string
  nif:             string
  fechaInicio:     Date
  fechaFin?:       Date
  tipo:            string
  diagnostico?:    string
  medico?:         string
  emailOrigen:     string
  emailAsunto:     string
  rawData:         Record<string, unknown>
}

const INSS_SENDERS = [
  'noreply@seg-social.es',
  'inss@seg-social.gob.es',
  'notificaciones@tgss.es',
  'bajas@inss.es',
  'it@seg-social.gob.es',
]

const INSS_KEYWORDS = [
  'parte de baja',
  'incapacidad temporal',
  'parte medico',
  'IT/',
  'baja laboral',
  'parte de alta',
  'alta medica',
]

export async function monitorearEmailINSS(): Promise<{
  procesados: number
  errores: number
  detalles: string[]
}> {
  const resultado = { procesados: 0, errores: 0, detalles: [] as string[] }

  let host = process.env.IMAP_HOST
  let user = process.env.IMAP_USER
  let pass = process.env.IMAP_PASS
  let imapPort = Number(process.env.IMAP_PORT || 993)
  let imapTls = process.env.IMAP_TLS !== 'false'
  let imapFolder = process.env.IMAP_FOLDER || 'INBOX'

  try {
    const { prisma: prismaClient } = await import('@/lib/prisma')
    const configs: any[] = await prismaClient.$queryRawUnsafe(
      `SELECT * FROM "Configuracion" WHERE id = 'default'`
    )
    const config = configs[0]
    if (config?.imap_host)   host       = config.imap_host
    if (config?.imap_user)   user       = config.imap_user
    if (config?.imap_pass)   pass       = config.imap_pass
    if (config?.imap_port)   imapPort   = Number(config.imap_port)
    if (config?.imap_tls !== undefined) imapTls = config.imap_tls
    if (config?.imap_folder) imapFolder = config.imap_folder
  } catch { }

  if (!host || !user || !pass) {
    resultado.detalles.push('Credenciales IMAP no configuradas. Ve a Configuracion > Email IMAP')
    return resultado
  }

  try {
    const { ImapFlow } = await import('imapflow')
    const client = new ImapFlow({
      host,
      port: imapPort,
      secure: imapTls,
      auth: { user: user!, pass: pass! },
      logger: false,
    })

    await client.connect()

    const mailbox = await client.mailboxOpen(imapFolder)
    resultado.detalles.push(`Buzon abierto: ${mailbox.path} - ${mailbox.exists} mensajes`)

    const unseenRaw = await client.search({ seen: false }).catch(() => [] as number[])
    const unseen: number[] = Array.isArray(unseenRaw) ? unseenRaw : []
    resultado.detalles.push(`Emails no leidos encontrados: ${unseen.length}`)
    // unseen ya es number[] garantizado

    for (const uid of unseen) {
      try {
        const message = await client.fetchOne(uid.toString(), {
          envelope: true,
          bodyStructure: true,
          source: true,
        })

        // Guard: fetchOne puede devolver false
        if (!message) continue
        if (!(message as any).envelope) continue

        const msg = message as any
        const asunto    = msg.envelope?.subject || ''
        const remitente = msg.envelope?.from?.[0]?.address || ''

        const esINSS = INSS_SENDERS.some(s => remitente.toLowerCase().includes(s)) ||
                       INSS_KEYWORDS.some(k => asunto.toLowerCase().includes(k.toLowerCase()))

        if (!esINSS) continue

        resultado.detalles.push(`Email INSS detectado: "${asunto}" de ${remitente}`)

        const parteData = extraerDatosParteEmail(asunto, remitente)

        let empleadoId = 'pendiente'
        if (parteData.nif) {
          const foundUser = await prisma.user.findFirst({
            where: { email: { contains: parteData.nif } }
          }).catch(() => null)
          if (foundUser) empleadoId = foundUser.id
        }

        if (parteData.numeroParteINSS) {
          const existe = await prisma.$queryRaw`
            SELECT id FROM "BajaMedica"
            WHERE "numeroParteINSS" = ${parteData.numeroParteINSS} LIMIT 1
          `.catch(() => []) as any[]

          if (existe.length > 0) {
            resultado.detalles.push(`Parte ${parteData.numeroParteINSS} ya registrado - omitido`)
            await client.messageFlagsAdd(uid.toString(), ['\\Seen'])
            continue
          }
        }

        await prisma.$executeRaw`
          INSERT INTO "BajaMedica" (
            "id", "empleadoId", "empresaId", "tipo", "estado",
            "numeroParteINSS", "fechaInicio", "emailOrigen", "emailAsunto",
            "parteOficial", "creadoAutomaticamente", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            ${empleadoId},
            'empresa-001',
            ${detectarTipoBaja(asunto)},
            'pendiente_confirmacion_inss',
            ${parteData.numeroParteINSS || null},
            ${parteData.fechaInicio || new Date()},
            ${remitente},
            ${asunto},
            ${JSON.stringify(parteData)}::jsonb,
            true,
            NOW()
          )
        `.catch((e: any) => {
          throw new Error(`Error al crear baja en BD: ${e.message}`)
        })

        await client.messageFlagsAdd(uid.toString(), ['\\Seen'])
        resultado.procesados++
        resultado.detalles.push(`Baja creada para parte: ${parteData.numeroParteINSS || 'sin numero'}`)

      } catch (emailError: any) {
        resultado.errores++
        resultado.detalles.push(`Error procesando email: ${emailError.message}`)
      }
    }

    await client.logout()

  } catch (error: any) {
    resultado.errores++
    resultado.detalles.push(`Error conexion IMAP: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }

  return resultado
}

function extraerDatosParteEmail(asunto: string, remitente: string): Partial<ParteINSS> {
  const datos: Partial<ParteINSS> = {
    emailOrigen: remitente,
    emailAsunto: asunto,
    rawData: { asunto, remitente, timestamp: new Date().toISOString() },
  }

  const regexParte = /(?:IT\/|INSS-|parte\s+n[.o]?\s*)(\d{4}[-\/]\w+[-\/]\d+)/i
  const matchParte = asunto.match(regexParte)
  if (matchParte) datos.numeroParteINSS = matchParte[0]

  const regexNIF = /\b([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z])\b/
  const matchNIF = asunto.match(regexNIF)
  if (matchNIF) datos.nif = matchNIF[1]

  const regexFecha = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
  const matchFecha = asunto.match(regexFecha)
  if (matchFecha) {
    datos.fechaInicio = new Date(
      `${matchFecha[3]}-${matchFecha[2].padStart(2,'0')}-${matchFecha[1].padStart(2,'0')}`
    )
  } else {
    datos.fechaInicio = new Date()
  }

  return datos
}

function detectarTipoBaja(asunto: string): string {
  const lower = asunto.toLowerCase()
  if (lower.includes('accidente') || lower.includes(' at ') || lower.includes('contingencias profesionales')) return 'at'
  if (lower.includes('maternidad') || lower.includes('nacimiento')) return 'maternidad'
  if (lower.includes('paternidad')) return 'paternidad'
  if (lower.includes('menstruacion')) return 'menstruacion'
  if (lower.includes('semana 39') || lower.includes('semana39')) return 'semana39'
  if (lower.includes('interrupcion') && lower.includes('embarazo')) return 'interrupcion_embarazo'
  return 'it_comun'
}