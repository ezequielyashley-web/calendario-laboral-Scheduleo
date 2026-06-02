/**
 * CRON: /api/cron/actualizar-normativa
 * ──────────────────────────────────────
 * Se ejecuta 1 vez al día (a las 06:00 UTC).
 * Busca en fuentes oficiales si hay cambios en la normativa
 * de bajas médicas y actualiza la base de datos si los hay.
 *
 * Fuentes consultadas:
 * - BOE (boe.es) — Boletín Oficial del Estado
 * - Seguridad Social (seg-social.es)
 * - INSS (inss.gob.es)
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const runtime    = 'nodejs'
export const maxDuration = 30

// Términos de búsqueda para detectar cambios normativos
const TERMINOS_BUSQUEDA = [
  'baja médica normativa 2026 España cambio',
  'incapacidad temporal RD 1060 2022 modificación',
  'INSS partes baja actualización BOE 2026',
  'menstruación incapacitante normativa actualización',
]

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const log: string[] = []
  let actualizaciones = 0

  try {
    log.push(`[${new Date().toISOString()}] Iniciando verificación de normativa...`)

    // Obtener normativa actual de la BD
    const normativaActual = await prisma.$queryRaw`
      SELECT clave, titulo, descripcion, version, "fechaActualizacion"
      FROM "Normativa"
      ORDER BY clave
    ` as any[]

    log.push(`Normativas en BD: ${normativaActual.length}`)

    // Buscar cambios usando la API de web search de Anthropic
    for (const termino of TERMINOS_BUSQUEDA) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type':      'application/json',
            'x-api-key':         process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            tools: [{ type: 'web_search_20250305', name: 'web_search' }],
            messages: [{
              role: 'user',
              content: `Busca si ha habido cambios en la normativa española sobre: "${termino}" en los últimos 30 días. Responde SOLO con JSON: {"hayCambios": boolean, "resumen": "string", "fuente": "string"}. Si no hay cambios recientes responde hayCambios: false.`
            }]
          }),
        })

        if (!response.ok) {
          log.push(`⚠ Error búsqueda "${termino}": ${response.status}`)
          continue
        }

        const data = await response.json()
        const texto = data.content
          ?.filter((c: any) => c.type === 'text')
          ?.map((c: any) => c.text)
          ?.join('') || '{}'

        // Extraer JSON de la respuesta
        const jsonMatch = texto.match(/\{[\s\S]*?\}/)
        if (!jsonMatch) continue

        const resultado = JSON.parse(jsonMatch[0])

        if (resultado.hayCambios && resultado.resumen) {
          log.push(`🔔 Posible cambio detectado: ${resultado.resumen}`)

          // Registrar alerta en BD para que el admin la revise
          await prisma.$executeRaw`
            INSERT INTO "Normativa" ("id","clave","titulo","descripcion","actualizadoPor","updatedAt")
            VALUES (
              gen_random_uuid()::text,
              ${'alerta_' + Date.now()},
              ${'⚠ Posible cambio normativo detectado'},
              ${`${resultado.resumen} Fuente: ${resultado.fuente || 'búsqueda automática'}. Fecha: ${new Date().toLocaleDateString('es-ES')}. REVISAR Y CONFIRMAR MANUALMENTE.`},
              'cron_automatico',
              NOW()
            )
            ON CONFLICT ("clave") DO NOTHING
          `.catch(() => null)

          actualizaciones++
        } else {
          log.push(`✓ Sin cambios: "${termino}"`)
        }

        // Esperar entre búsquedas para no saturar
        await new Promise(r => setTimeout(r, 1000))

      } catch (err: any) {
        log.push(`⚠ Error en búsqueda: ${err.message}`)
      }
    }

    // Actualizar fecha de última comprobación en todas las normativas
    await prisma.$executeRaw`
      UPDATE "Normativa"
      SET "updatedAt" = NOW()
      WHERE "actualizadoPor" != 'cron_automatico'
        AND clave NOT LIKE 'alerta_%'
    `.catch(() => null)

    log.push(`Comprobación completada. Alertas generadas: ${actualizaciones}`)

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      actualizaciones,
      log,
    })

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message, log }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
