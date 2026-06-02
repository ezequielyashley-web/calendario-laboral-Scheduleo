/**
 * CRON JOB: /api/cron/monitor-bajas
 * ───────────────────────────────────
 * Vercel llama a este endpoint cada 5 minutos.
 * Monitorea bajas@empresa.com buscando emails del INSS.
 *
 * Configurado en vercel.json como cron job.
 * Protegido por CRON_SECRET para evitar llamadas externas.
 */

import { NextRequest, NextResponse } from 'next/server'
import { monitorearEmailINSS } from '@/lib/email-monitor'

export const runtime = 'nodejs'
export const maxDuration = 30 // Vercel Free: máx 30 segundos

export async function GET(req: NextRequest) {
  // Verificar que la llamada viene de Vercel Cron
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const inicio = Date.now()
  console.log(`[CRON] Monitor bajas INSS iniciado — ${new Date().toISOString()}`)

  try {
    const resultado = await monitorearEmailINSS()

    const duracion = Date.now() - inicio
    console.log(`[CRON] Monitor bajas INSS completado en ${duracion}ms`)
    console.log(`[CRON] Procesados: ${resultado.procesados} | Errores: ${resultado.errores}`)
    resultado.detalles.forEach(d => console.log(`[CRON] ${d}`))

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      duracionMs: duracion,
      procesados: resultado.procesados,
      errores: resultado.errores,
      detalles: resultado.detalles,
    })

  } catch (error: any) {
    console.error('[CRON] Error monitor bajas:', error)
    return NextResponse.json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
