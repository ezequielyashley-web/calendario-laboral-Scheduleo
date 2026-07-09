import { generateSecret, generateURI, verify } from "otplib"
import QRCode from "qrcode"
import bcrypt from "bcryptjs"
import crypto from "crypto"

/**
 * Genera un secreto TOTP nuevo (en base32, formato estandar).
 * Este secreto se debe cifrar (con lib/encryption.ts) antes de guardarlo en BD.
 */
export function generarSecretoTOTP(): string {
  return generateSecret()
}

/**
 * Genera la URL otpauth:// y la imagen QR (como data URL PNG) para que
 * el usuario la escanee con Google Authenticator / Authy.
 */
export async function generarQRCode(email: string, secreto: string): Promise<string> {
  const otpauthUrl = generateURI({ issuer: "Scheduleo", label: email, secret: secreto })
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { width: 220, margin: 1 })
  return qrDataUrl
}

/**
 * Verifica un codigo de 6 digitos introducido por el usuario contra el
 * secreto guardado (ya descifrado). Admite +/-1 paso de 30s de margen
 * (comportamiento por defecto de otplib) para tolerar pequenos desfases
 * de reloj entre el movil y el servidor.
 */
export async function verificarCodigoTOTP(codigo: string, secreto: string): Promise<boolean> {
  try {
    const resultado = await verify({ token: codigo.trim(), secret: secreto })
    return resultado.valid
  } catch {
    return false
  }
}

/**
 * Genera un lote de codigos de respaldo de un solo uso (formato XXXX-XXXX).
 * Devuelve los codigos en texto plano (para mostrarlos UNA vez al usuario)
 * junto con sus hashes bcrypt (para guardar en BackupCode2FA).
 */
export function generarCodigosBackup(cantidad = 10): { plano: string; hash: string }[] {
  const codigos: { plano: string; hash: string }[] = []
  for (let i = 0; i < cantidad; i++) {
    const parte1 = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4)
    const parte2 = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4)
    const plano = `${parte1}-${parte2}`
    const hash = bcrypt.hashSync(plano, 10)
    codigos.push({ plano, hash })
  }
  return codigos
}

/**
 * Verifica un codigo de backup introducido por el usuario contra una
 * lista de hashes guardados (los que aun no estan marcados como usados).
 * Devuelve el indice del hash que coincide, o -1 si ninguno coincide.
 */
export function verificarCodigoBackup(codigo: string, hashes: string[]): number {
  const normalizado = codigo.trim().toUpperCase()
  for (let i = 0; i < hashes.length; i++) {
    if (bcrypt.compareSync(normalizado, hashes[i])) return i
  }
  return -1
}