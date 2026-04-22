/**
 * SCHEDULEO - MIDDLEWARE PRINCIPAL
 * Aplica todas las protecciones de seguridad (Fase 6)
 */

import { NextRequest, NextResponse } from 'next/server'
import { applySecurityMiddlewares } from './lib/security-middleware'

export function middleware(request: NextRequest) {
  // Aplicar todos los middlewares de seguridad
  const securityResponse = applySecurityMiddlewares(request)
  if (securityResponse) return securityResponse

  // Continuar con el flujo normal
  return NextResponse.next()
}

// Configurar rutas donde aplicar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
