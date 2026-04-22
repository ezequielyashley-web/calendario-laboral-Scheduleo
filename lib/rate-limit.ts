/**
 * SCHEDULEO - FASE 6: RATE LIMITING
 * Protección contra ataques de fuerza bruta
 * Límite: 5 intentos por IP en 15 minutos
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Store en memoria (en producción usar Redis)
const store: RateLimitStore = {}

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Verifica si una IP ha excedido el límite de intentos
 * @param identifier - IP o email del usuario
 * @param maxAttempts - Máximo de intentos permitidos (default: 5)
 * @param windowMs - Ventana de tiempo en ms (default: 15 min)
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now()
  const record = store[identifier]

  // Si no existe o expiró, crear nuevo
  if (!record || record.resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs
    }
    return {
      success: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs
    }
  }

  // Incrementar contador
  record.count++

  // Verificar si excedió el límite
  if (record.count > maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime
    }
  }

  return {
    success: true,
    remaining: maxAttempts - record.count,
    resetTime: record.resetTime
  }
}

/**
 * Resetea el contador para un identificador (usar después de login exitoso)
 */
export function resetRateLimit(identifier: string): void {
  delete store[identifier]
}

/**
 * Obtiene el tiempo restante de bloqueo en minutos
 */
export function getBlockedTime(identifier: string): number {
  const record = store[identifier]
  if (!record) return 0
  
  const now = Date.now()
  const remaining = Math.max(0, record.resetTime - now)
  return Math.ceil(remaining / 60000) // Convertir a minutos
}
