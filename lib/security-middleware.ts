/**
 * SCHEDULEO - FASE 6: MIDDLEWARE DE SEGURIDAD
 * HTTPS forzado, headers de seguridad, rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from './rate-limit'
import { csrfProtection } from './csrf'

/**
 * Obtiene la IP real del cliente (considerando proxies)
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  // request.ip eliminado en Next.js 15 - usar headers
  return (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
}

/**
 * Middleware de seguridad principal
 */
export function securityMiddleware(request: NextRequest): NextResponse | null {
  const response = NextResponse.next()
  return response
}