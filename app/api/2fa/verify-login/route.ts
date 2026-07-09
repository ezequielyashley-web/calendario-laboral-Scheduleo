import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { verificarCodigoTOTP, verificarCodigoBackup } from "@/lib/totp"

export async function POST(req: NextRequest) {
  try {
    const { userId, codigo } = await req.json()
    if (!userId || !codigo) {
      return NextResponse.json({ error: "Faltan datos para verificar" }, { status: 400 })
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
      return NextResponse.json({ ok: true, usadoBackup: true })
    }

    // Si no, se trata como codigo TOTP normal de 6 digitos
    const secreto = decrypt(usuario.totpSecretEnc)
    const esValido = await verificarCodigoTOTP(codigoLimpio, secreto)
    if (!esValido) {
      return NextResponse.json({ error: "Codigo incorrecto" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/2fa/verify-login:", error)
    return NextResponse.json({ error: "Error al verificar el codigo" }, { status: 500 })
  }
}