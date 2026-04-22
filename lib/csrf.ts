/**
 * SCHEDULEO - FASE 6: CSRF PROTECTION
 * Protección contra ataques Cross-Site Request Forgery
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Store de tokens (en producción usar Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>()

// Limpiar tokens expirados cada hora
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key)
    }
  }
}, 60 * 60 * 1000)

/**
 * Genera un token CSRF único
 */
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  
  // Guardar token con expiración de 1 hora
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 60 * 60 * 1000
  })
  
  return token
}

/**
 * Verifica si un token CSRF es válido
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId)
  
  if (!stored) return false
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId)
    return false
  }
  
  return stored.token === token
}

/**
 * Middleware de protección CSRF
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  // Solo aplicar a métodos que modifican datos
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return null
  }

  // Excepciones: rutas de API públicas
  const publicRoutes = ['/api/auth/signin', '/api/auth/callback']
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return null
  }

  // Obtener token del header o body
  const headerToken = request.headers.get('x-csrf-token')
  const sessionId = request.cookies.get('sessionId')?.value

  if (!sessionId || !headerToken) {
    return NextResponse.json(
      { error: 'Token CSRF faltante o inválido' },
      { status: 403 }
    )
  }

  // Verificar token
  if (!verifyCSRFToken(sessionId, headerToken)) {
    return NextResponse.json(
      { error: 'Token CSRF inválido o expirado' },
      { status: 403 }
    )
  }

  return null // Permitir la petición
}

/**
 * Hook de React para obtener token CSRF
 */
export async function getCSRFToken(): Promise<string> {
  const response = await fetch('/api/csrf-token')
  const data = await response.json()
  return data.token
}
