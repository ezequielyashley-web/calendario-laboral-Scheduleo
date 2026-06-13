/**
 * SCHEDULEO - VALIDACION Y SANITIZACION
 * Proteccion contra XSS, SQL Injection e inputs maliciosos
 */

/**
 * VALIDACION DE CONTRASENAS
 */
export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: 'debil' | 'media' | 'fuerte'
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  let strength: 'debil' | 'media' | 'fuerte' = 'debil'
  if (password.length < 12) errors.push('Minimo 12 caracteres')
  if (!/[A-Z]/.test(password)) errors.push('Al menos una letra mayuscula')
  if (!/[a-z]/.test(password)) errors.push('Al menos una letra minuscula')
  if (!/[0-9]/.test(password)) errors.push('Al menos un numero')
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Al menos un simbolo (!@#$...)')
  if (errors.length === 0) {
    if (password.length >= 16 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) strength = 'fuerte'
    else if (password.length >= 12) strength = 'media'
  }
  return { valid: errors.length === 0, errors, strength }
}

/**
 * SANITIZACION DE TEXTO
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 1000)
}

/**
 * SANITIZACION DE EMAIL
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '').slice(0, 100)
}

/**
 * VALIDACION DE EMAIL
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * SANITIZACION DE NOMBRE
 */
export function sanitizeName(name: string): string {
  if (!name) return ''
  return name.trim().replace(/[^a-zA-ZaeiouAEIOUanNuU\s'-]/g, '').slice(0, 100)
}

/**
 * SANITIZACION DE TELEFONO
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/[^0-9+\s()-]/g, '').slice(0, 20)
}

/**
 * VALIDACION DE PIN
 */
export function validatePIN(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/**
 * VALIDACION DE DNI/NIE espanol
 * DNI: 8 digitos + letra
 * NIE: X/Y/Z + 7 digitos + letra
 */
export function validateDNI(dni: string): boolean {
  if (!dni) return true // opcional
  const dniRegex = /^[0-9]{8}[A-Z]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  const upper = dni.toUpperCase().trim()
  if (!dniRegex.test(upper) && !nieRegex.test(upper)) return false
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
  if (dniRegex.test(upper)) {
    return upper[8] === letras[parseInt(upper.slice(0, 8)) % 23]
  }
  // NIE: sustituir X=0, Y=1, Z=2
  const nieNum = upper.replace('X', '0').replace('Y', '1').replace('Z', '2')
  return upper[8] === letras[parseInt(nieNum.slice(0, 8)) % 23]
}

/**
 * VALIDACION DE NAF (Numero Afiliacion Seguridad Social)
 * Formato: 2 digitos provincia + 9 digitos
 */
export function validateNAF(naf: string): boolean {
  if (!naf) return true // opcional
  return /^\d{11,12}$/.test(naf.replace(/\s/g, ''))
}

/**
 * VALIDACION DE IBAN espanol
 * Formato: ES + 22 digitos
 */
export function validateIBAN(iban: string): boolean {
  if (!iban) return true // opcional
  const clean = iban.replace(/\s/g, '').toUpperCase()
  if (!/^ES\d{22}$/.test(clean)) return false
  // Verificacion modulo 97
  const rearranged = clean.slice(4) + clean.slice(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55))
  let remainder = 0
  for (const chunk of numeric.match(/.{1,9}/g) || []) {
    remainder = parseInt(String(remainder) + chunk) % 97
  }
  return remainder === 1
}

/**
 * VALIDACION DE SALARIO
 */
export function validateSalario(salario: string | number): boolean {
  if (!salario) return true // opcional
  const num = parseFloat(String(salario))
  return !isNaN(num) && num >= 0 && num <= 999999
}

/**
 * VALIDAR TODOS LOS DATOS DE EMPLEADO
 * Devuelve array de errores (vacio = OK)
 */
export function validarDatosEmpleado(datos: {
  nombre?: string
  apellidos?: string
  email?: string
  pin?: string
  dni?: string
  naf?: string
  iban?: string
  salario?: string | number
}): string[] {
  const errores: string[] = []
  if (!datos.nombre?.trim()) errores.push('El nombre es obligatorio')
  if (!datos.apellidos?.trim()) errores.push('Los apellidos son obligatorios')
  if (!datos.email?.trim()) errores.push('El email es obligatorio')
  if (datos.email && !validateEmail(datos.email)) errores.push('El email no tiene un formato valido')
  if (datos.pin && !validatePIN(datos.pin)) errores.push('El PIN debe tener exactamente 4 digitos')
  if (datos.dni && !validateDNI(datos.dni)) errores.push('El DNI/NIE no es valido')
  if (datos.naf && !validateNAF(datos.naf)) errores.push('El NAF debe tener 11 o 12 digitos')
  if (datos.iban && !validateIBAN(datos.iban)) errores.push('El IBAN espanol no es valido (ES + 22 digitos)')
  if (datos.salario && !validateSalario(datos.salario)) errores.push('El salario debe ser un numero entre 0 y 999.999')
  return errores
}

/**
 * PREVENCION DE SQL INJECTION
 */
export function escapeSQLInput(input: string): string {
  if (!input) return ''
  return input.replace(/'/g, "''").replace(/;/g, '').replace(/--/g, '').replace(/\/\*/g, '')
}

/**
 * VALIDACION DE FECHA
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * SANITIZACION DE URL
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return ''
    return parsed.toString()
  } catch {
    return ''
  }
}
export function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return { level: score, label: 'Debil',   color: '#dc2626' }
  if (score <= 3) return { level: score, label: 'Media',   color: '#d97706' }
  if (score <= 4) return { level: score, label: 'Fuerte',  color: '#16a34a' }
  return             { level: score, label: 'Muy fuerte', color: '#0284c7' }
}