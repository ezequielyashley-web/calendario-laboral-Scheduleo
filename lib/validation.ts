/**
 * SCHEDULEO - FASE 6: VALIDACIÓN Y SANITIZACIÓN
 * Protección contra XSS, SQL Injection y inputs maliciosos
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * VALIDACIÓN DE CONTRASEÑAS
 * Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
 */
export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: 'débil' | 'media' | 'fuerte'
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  let strength: 'débil' | 'media' | 'fuerte' = 'débil'

  // Mínimo 8 caracteres
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres')
  }

  // Al menos una mayúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos una letra mayúscula')
  }

  // Al menos una minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('Al menos una letra minúscula')
  }

  // Al menos un número
  if (!/[0-9]/.test(password)) {
    errors.push('Al menos un número')
  }

  // Calcular fortaleza
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength = 'fuerte'
    } else if (password.length >= 10) {
      strength = 'media'
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * SANITIZACIÓN DE TEXTO
 * Elimina HTML peligroso, scripts, etc.
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  // Eliminar HTML peligroso
  const cleaned = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No permitir ningún tag HTML
    ALLOWED_ATTR: []
  })

  // Trim y limitar longitud
  return cleaned.trim().slice(0, 1000)
}

/**
 * SANITIZACIÓN DE EMAIL
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '') // Solo caracteres válidos
    .slice(0, 100)
}

/**
 * VALIDACIÓN DE EMAIL
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * SANITIZACIÓN DE NOMBRE
 * Permite letras, espacios, guiones y apóstrofes
 */
export function sanitizeName(name: string): string {
  if (!name) return ''
  
  return name
    .trim()
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '') // Solo letras españolas, espacios, guiones
    .slice(0, 100)
}

/**
 * SANITIZACIÓN DE NÚMERO DE TELÉFONO
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  
  return phone
    .replace(/[^0-9+\s()-]/g, '') // Solo números y caracteres de teléfono
    .slice(0, 20)
}

/**
 * VALIDACIÓN DE PIN (legacy - mantener para compatibilidad)
 */
export function validatePIN(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/**
 * PREVENCIÓN DE SQL INJECTION
 * Escapar caracteres peligrosos en queries
 */
export function escapeSQLInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments
}

/**
 * VALIDACIÓN DE FECHA
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * SANITIZACIÓN DE URL
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url)
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}
