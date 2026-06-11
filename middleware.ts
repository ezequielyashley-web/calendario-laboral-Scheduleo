import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_ROUTES = [
  '/api/auth',
  '/api/inspeccion/acceso',
  '/api/inspeccion/datos',
  '/api/inspeccion/alertas',
  '/api/inspeccion/estado',
  '/api/push/subscribe',
  '/api/csrf-token',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]

const CRON_ROUTES = ['/api/cron']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Assets estaticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon-') ||
    pathname.startsWith('/manifest') ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next()
  }

  // Rutas cron
  if (CRON_ROUTES.some(r => pathname.startsWith(r))) {
    const secret = request.headers.get('x-cron-secret')
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Rutas publicas
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Verificar token JWT (compatible con Edge Runtime)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // APIs protegidas
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Paginas protegidas
  if (
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/inspeccion') &&
    !pathname.startsWith('/inspector')
  ) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}