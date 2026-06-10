import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_BASE64 = process.env.ENCRYPTION_KEY!

function getKey(): Buffer {
  if (!KEY_BASE64) throw new Error('ENCRYPTION_KEY no definida en variables de entorno')
  return Buffer.from(KEY_BASE64, 'base64')
}

/**
 * Cifra un texto plano con AES-256-GCM
 * Devuelve string con formato: iv:authTag:ciphertext (todo en base64)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return ''
  const key = getKey()
  const iv = crypto.randomBytes(12) // 96 bits recomendado para GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64')
  ].join(':')
}

/**
 * Descifra un string con formato iv:authTag:ciphertext
 * Devuelve el texto plano original
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return ''
  const key = getKey()
  const parts = encryptedData.split(':')
  if (parts.length !== 3) throw new Error('Formato de dato cifrado invalido')

  const iv = Buffer.from(parts[0], 'base64')
  const authTag = Buffer.from(parts[1], 'base64')
  const ciphertext = Buffer.from(parts[2], 'base64')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8')
}

/**
 * Cifra solo si el valor existe y no esta vacio
 */
export function encryptIfExists(value: string | null | undefined): string {
  if (!value) return ''
  return encrypt(value)
}

/**
 * Descifra solo si el valor existe y no esta vacio
 */
export function decryptIfExists(value: string | null | undefined): string | null {
  if (!value) return null
  return decrypt(value)
}