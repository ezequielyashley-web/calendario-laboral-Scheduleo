import { NextRequest, NextResponse } from "next/server"

const ipStore = new Map<string, { count: number; resetTime: number }>()

function checkIP(ip: string): boolean {
  const now = Date.now()
  const record = ipStore.get(ip)
  if (!record || now > record.resetTime) {
    ipStore.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }
  if (record.count >= 30) return false
  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const isLoginRoute = request.nextUrl.pathname.startsWith("/api/auth/login-custom")

  if (isLoginRoute && !checkIP(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta mas tarde." }, { status: 429 })
  }

  const response = NextResponse.next()

  // Evitar cache en paginas protegidas
  const isProtected = !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    !request.nextUrl.pathname.startsWith("/api/auth")

  if (isProtected) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

  // Headers de seguridad
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
  )
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sello-beta.png|sello-beta.webp).*)"],
}