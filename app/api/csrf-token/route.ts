import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import crypto from 'crypto'

// Store CSRF tokens in memory (use Redis in production)
const csrfTokens = new Map<string, { token: string; timestamp: number }>()

// Limpiar tokens expirados (más de 1 hora)
function cleanExpiredTokens() {
  const now = Date.now()
  for (const [key, value] of csrfTokens.entries()) {
    if (now - value.timestamp > 3600000) {
      csrfTokens.delete(key)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Generar ID de sesión (usar sessionId real en producción)
    const sessionId = session?.user?.email || request.ip || 'anonymous'

    // Limpiar tokens expirados
    cleanExpiredTokens()

    // Generar nuevo token CSRF
    const token = crypto.randomBytes(32).toString('hex')

    // Guardar token
    csrfTokens.set(sessionId, {
      token,
      timestamp: Date.now(),
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generando CSRF token:', error)
    return NextResponse.json(
      { error: 'Error generando token' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const sessionId = session?.user?.email || request.ip || 'anonymous'

    const body = await request.json()
    const { token } = body

    const storedData = csrfTokens.get(sessionId)

    if (!storedData || storedData.token !== token) {
      return NextResponse.json(
        { valid: false, error: 'Token CSRF inválido' },
        { status: 403 }
      )
    }

    // Verificar que no haya expirado (1 hora)
    if (Date.now() - storedData.timestamp > 3600000) {
      csrfTokens.delete(sessionId)
      return NextResponse.json(
        { valid: false, error: 'Token CSRF expirado' },
        { status: 403 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error validando CSRF token:', error)
    return NextResponse.json(
      { error: 'Error validando token' },
      { status: 500 }
    )
  }
}
