/**
 * Monitor de email INSS — Scheduleo 2.0
 * ─────────────────────────────────────
 * Conecta vía IMAP a bajas@empresa.com cada 5 minutos.
 * Detecta emails del INSS, extrae datos del parte y
 * crea la baja automáticamente en la base de datos.
 *
 * Normativa: RD 1060/2022 · Orden ISM/2/2023
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Tipos ──────────────────────────────────────────────────────
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

// ── Remitentes INSS conocidos ──────────────────────────────────
const INSS_SENDERS = [
  'noreply@seg-social.es',
  'inss@seg-social.gob.es',
  'notificaciones@tgss.es',
  'bajas@inss.es',
  'it@seg-social.gob.es',
]

// ── Palabras clave en asunto que indican parte IT ──────────────
const INSS_KEYWORDS = [
  'parte de baja',
  'incapacidad temporal',
  'parte médico',
  'IT/',
  'baja laboral',
  'parte de alta',
  'alta médica',
]

/**
 * Conecta al servidor IMAP y escanea emails no leídos.
 * Requiere: imapflow instalado (npm install imapflow)
 */
export async function monitorearEmailINSS(): Promise<{
  procesados: number
  errores: number
  detalles: string[]
}> {
  const resultado = { procesados: 0, errores: 0, detalles: [] as string[] }

  // Leer credenciales IMAP desde BD con fallback a .env.local
  let host = process.env.IMAP_HOST
  let user = process.env.IMAP_USER
  let pass = process.env.IMAP_PASS
  let imapPort = Number(process.env.IMAP_PORT || 993)
  let imapTls = process.env.IMAP_TLS !== "false"
  let imapFolder = process.env.IMAP_FOLDER || "INBOX"
  try {
    const { prisma } = await import("@/lib/prisma")
    const configs: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Configuracion" WHERE id = ${"default"}`)
    const config = configs[0]
    if (config?.imap_host) host = config.imap_host
    if (config?.imap_user) user = config.imap_user
    if (config?.imap_pass) pass = config.imap_pass
    if (config?.imap_port) imapPort = Number(config.imap_port)
    if (config?.imap_tls !== undefined) imapTls = config.imap_tls
    if (config?.imap_folder) imapFolder = config.imap_folder
  } catch { }
  if (!host || !user || !pass) {
    resultado.detalles.push("Credenciales IMAP no configuradas. Ve a Configuracion > Email IMAP")
    return resultado
  }
      logger: false,
    })

    await client.connect()

    // Abrir bandeja de entrada (INBOX o carpeta dedicada)
    const mailbox = await client.mailboxOpen(imapFolder)
    resultado.detalles.push(`📬 Buzón abierto: ${mailbox.path} — ${mailbox.exists} mensajes`)

    // Buscar emails no leídos de remitentes INSS
    const unseen = await client.search({
      seen: false,
      from: INSS_SENDERS.join(' '),
    }).catch(() => client.search({ seen: false }) as any)

    resultado.detalles.push(`📩 Emails no leídos encontrados: ${unseen.length}`)

    for (const uid of unseen) {
      try {
        // Descargar email completo
        const message = await client.fetchOne(uid.toString(), {
          envelope: true,
          bodyStructure: true,
          source: true,
        })

        if (!message?.envelope) continue

        const asunto = message.envelope.subject || ''
        const remitente = message.envelope.from?.[0]?.address || ''

        // Verificar si es email del INSS
        const esINSS = INSS_SENDERS.some(s => remitente.toLowerCase().includes(s)) ||
                       INSS_KEYWORDS.some(k => asunto.toLowerCase().includes(k.toLowerCase()))

        if (!esINSS) continue

        resultado.detalles.push(`📋 Email INSS detectado: "${asunto}" de ${remitente}`)

        // Extraer datos del parte del asunto/cuerpo del email
        const parteData = extraerDatosParteEmail(asunto, remitente)

        // Buscar empleado en BD por NIF si lo tenemos
        let empleadoId = 'pendiente'
        if (parteData.nif) {
          const user = await prisma.user.findFirst({
            where: { email: { contains: parteData.nif } }
          }).catch(() => null)
          if (user) empleadoId = user.id
        }

        // Verificar si ya existe este parte
        if (parteData.numeroParteINSS) {
          const existe = await prisma.$queryRaw`
            SELECT id FROM "BajaMedica" WHERE "numeroParteINSS" = ${parteData.numeroParteINSS} LIMIT 1
          `.catch(() => []) as any[]

          if (existe.length > 0) {
            resultado.detalles.push(`⏭ Parte ${parteData.numeroParteINSS} ya registrado — omitido`)
            // Marcar email como leído
            await client.messageFlagsAdd(uid.toString(), ['\\Seen'])
            continue
          }
        }

        // Crear baja en la base de datos
        const nuevaBaja = await prisma.$executeRaw`
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

        // Log de auditoría
        await prisma.$executeRaw`
          INSERT INTO "BajaMedicaLog" ("id", "bajaId", "accion", "descripcion", "timestamp")
          VALUES (
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            'RECIBIDA_INSS',
            ${`Parte recibido automáticamente vía email INSS. Asunto: ${asunto}`},
            NOW()
          )
        `.catch(() => null)

        // Marcar email como leído
        await client.messageFlagsAdd(uid.toString(), ['\\Seen'])

        resultado.procesados++
        resultado.detalles.push(`✅ Baja creada automáticamente para parte: ${parteData.numeroParteINSS || 'sin número'}`)

      } catch (emailError: any) {
        resultado.errores++
        resultado.detalles.push(`❌ Error procesando email: ${emailError.message}`)
      }
    }

    await client.logout()

  } catch (error: any) {
    resultado.errores++
    resultado.detalles.push(`❌ Error conexión IMAP: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }

  return resultado
}

/**
 * Extrae datos del parte del asunto y cuerpo del email INSS
 * El INSS incluye en el asunto: número de parte, NIF y fecha
 * Ejemplo: "Parte IT/2026/00123 - DNI 12345678A - Inicio 15/04/2026"
 */
function extraerDatosParteEmail(asunto: string, remitente: string): Partial<ParteINSS> {
  const datos: Partial<ParteINSS> = {
    emailOrigen: remitente,
    emailAsunto: asunto,
    rawData: { asunto, remitente, timestamp: new Date().toISOString() },
  }

  // Extraer número de parte (formato INSS: IT/YYYY/NNNNN o 2026-INSS-NNNNN)
  const regexParte = /(?:IT\/|INSS-|parte\s+n[.º]?\s*)(\d{4}[-\/]\w+[-\/]\d+)/i
  const matchParte = asunto.match(regexParte)
  if (matchParte) datos.numeroParteINSS = matchParte[0]

  // Extraer NIF/DNI
  const regexNIF = /\b([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z])\b/
  const matchNIF = asunto.match(regexNIF)
  if (matchNIF) datos.nif = matchNIF[1]

  // Extraer fecha de inicio
  const regexFecha = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
  const matchFecha = asunto.match(regexFecha)
  if (matchFecha) {
    datos.fechaInicio = new Date(`${matchFecha[3]}-${matchFecha[2].padStart(2,'0')}-${matchFecha[1].padStart(2,'0')}`)
  } else {
    datos.fechaInicio = new Date()
  }

  return datos
}

/**
 * Detecta el tipo de baja según el asunto del email
 */
function detectarTipoBaja(asunto: string): string {
  const lower = asunto.toLowerCase()
  if (lower.includes('accidente') || lower.includes(' at ') || lower.includes('contingencias profesionales')) return 'at'
  if (lower.includes('maternidad') || lower.includes('nacimiento') || lower.includes('recema')) return 'maternidad'
  if (lower.includes('paternidad')) return 'paternidad'
  if (lower.includes('menstruación') || lower.includes('menstruacion')) return 'menstruacion'
  if (lower.includes('semana 39') || lower.includes('semana39')) return 'semana39'
  if (lower.includes('interrupción') || lower.includes('interrupcion') && lower.includes('embarazo')) return 'interrupcion_embarazo'
  return 'it_comun'
}




