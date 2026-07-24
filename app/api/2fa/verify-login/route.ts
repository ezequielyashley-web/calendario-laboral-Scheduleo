import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { verificarCodigoTOTP, verificarCodigoBackup } from "@/lib/totp"
import { checkRateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

async function generarSessionGrant(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 1000)
  await prisma.sessionGrant.create({
    data: { userId, token, expiresAt }
  })
  return token
}

export async function POST(req: NextRequest) {
  try {
    const { userId, codigo } = await req.json()
    if (!userId || !codigo) {
      return NextResponse.json({ error: "Faltan datos para verificar" }, { status: 400 })
    }

    const rl = checkRateLimit(`2fa-totp-${userId}`, 5, 10 * 60 * 1000)
    if (!rl.success) {
      return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." }, { status: 429 })
    }

    const usuario = await prisma.user.findUnique({ where: { id: userId } })
    if (!usuario || !usuario.totpEnabled || !usuario.totpSecretEnc) {
      return NextResponse.json({ error: "Este usuario no tiene TOTP activado" }, { status: 400 })
    }
    const codigoLimpio = codigo.trim()
    // Si el codigo tiene formato XXXX-XXXX, se trata como codigo de backup
    if (/^[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(codigoLimpio)) {
      const backups = await prisma.backupCode2FA.findMany({
        where: { userId, usado: false }
      })
      const idx = verificarCodigoBackup(codigoLimpio, backups.map(b => b.codigoHash))
      if (idx === -1) {
        return NextResponse.json({ error: "Codigo de backup invalido" }, { status: 400 })
      }
      await prisma.backupCode2FA.update({
        where: { id: backups[idx].id },
        data: { usado: true }
      })
      const sessionGrant = await generarSessionGrant(userId)
      return NextResponse.json({ ok: true, usadoBackup: true, sessionGrant })
    }
    // Si no, se trata como codigo TOTP normal de 6 digitos
    const secreto = decrypt(usuario.totpSecretEnc)
    const esValido = await verificarCodigoTOTP(codigoLimpio, secreto)
    if (!esValido) {
      return NextResponse.json({ error: "Codigo incorrecto" }, { status: 400 })
    }
    const sessionGrant = await generarSessionGrant(userId)
    return NextResponse.json({ ok: true, sessionGrant })
  } catch (error) {
    console.error("Error en /api/2fa/verify-login:", error)
    return NextResponse.json({ error: "Error al verificar el codigo" }, { status: 500 })
  }
}