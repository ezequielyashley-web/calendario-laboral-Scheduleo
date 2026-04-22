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
  
  return request.ip || 'unknown'
}

/**
 * Middleware de seguridad principal
 */
export function securityMiddleware(request: NextRequest): NextResponse | null {
  const response = NextResponse.next()

  // 1. FORZAR HTTPS EN PRODUCCIÓN
  if (
    process.env.NODE_ENV === 'production' &&
    !request.nextUrl.protocol.startsWith('https')
  ) {
    const httpsUrl = new URL(request.nextUrl)
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl)
  }

  // 2. HEADERS DE SEGURIDAD
  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevenir MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection (legacy pero útil)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  )

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

/**
 * Rate limiting para rutas de login
 */
export function loginRateLimiting(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request)
  const path = request.nextUrl.pathname

  // Solo aplicar a rutas de autenticación
  if (!path.includes('/api/auth')) {
    return null
  }

  // Verificar rate limit
  const result = checkRateLimit(ip, 5, 15 * 60 * 1000) // 5 intentos en 15 min

  if (!result.success) {
    const resetMinutes = Math.ceil((result.resetTime - Date.now()) / 60000)
    return NextResponse.json(
      {
        error: 'Demasiados intentos de inicio de sesión',
        message: `Intenta de nuevo en ${resetMinutes} minutos`,
        resetTime: result.resetTime
      },
      { status: 429 } // Too Many Requests
    )
  }

  return null
}

/**
 * Combina todos los middlewares de seguridad
 */
export function applySecurityMiddlewares(request: NextRequest): NextResponse | null {
  // 1. Headers de seguridad y HTTPS
  let response = securityMiddleware(request)
  if (response) return response

  // 2. Rate limiting en login
  response = loginRateLimiting(request)
  if (response) return response

  // 3. CSRF protection
  response = csrfProtection(request)
  if (response) return response

  return null
}
