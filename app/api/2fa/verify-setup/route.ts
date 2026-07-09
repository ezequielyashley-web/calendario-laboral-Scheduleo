import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { verificarCodigoTOTP, generarCodigosBackup } from "@/lib/totp"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const { codigo } = await req.json()
    if (!codigo) return NextResponse.json({ error: "Introduce el codigo de 6 digitos" }, { status: 400 })

    const usuario = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!usuario || !usuario.totpSecretEnc) {
      return NextResponse.json({ error: "No hay una configuracion de 2FA en curso" }, { status: 400 })
    }

    const secreto = decrypt(usuario.totpSecretEnc)
    const esValido = await verificarCodigoTOTP(codigo, secreto)
    if (!esValido) {
      return NextResponse.json({ error: "Codigo incorrecto. Verifica la hora de tu dispositivo e intentalo de nuevo." }, { status: 400 })
    }

    // Codigo correcto: activar TOTP como metodo de 2FA
    await prisma.user.update({
      where: { id: auth.userId },
      data: { totpEnabled: true, metodo2FA: "totp" }
    })

    // Generar codigos de backup nuevos (esto invalida cualquier lote anterior)
    await prisma.backupCode2FA.deleteMany({ where: { userId: auth.userId } })
    const codigosBackup = generarCodigosBackup(10)
    await prisma.backupCode2FA.createMany({
      data: codigosBackup.map(c => ({
        id: crypto.randomUUID(),
        userId: auth.userId,
        codigoHash: c.hash,
      }))
    })

    return NextResponse.json({
      ok: true,
      codigosBackup: codigosBackup.map(c => c.plano)
    })
  } catch (error) {
    console.error("Error en /api/2fa/verify-setup:", error)
    return NextResponse.json({ error: "Error al verificar el codigo" }, { status: 500 })
  }
}