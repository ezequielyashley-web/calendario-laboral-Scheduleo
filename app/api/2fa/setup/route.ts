import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"
import { generarSecretoTOTP, generarQRCode } from "@/lib/totp"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const usuario = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    // Genera un secreto nuevo cada vez que se llama a /setup. Si el usuario
    // no completa la verificacion, el secreto queda huerfano sin activarse
    // (totpEnabled sigue en false) - no supone ningun riesgo.
    const secreto = generarSecretoTOTP()
    const secretoCifrado = encrypt(secreto)

    await prisma.user.update({
      where: { id: auth.userId },
      data: { totpSecretEnc: secretoCifrado }
    })

    const qrDataUrl = await generarQRCode(usuario.email, secreto)

    return NextResponse.json({ qr: qrDataUrl, secreto })
  } catch (error) {
    console.error("Error en /api/2fa/setup:", error)
    return NextResponse.json({ error: "Error al iniciar la configuracion 2FA" }, { status: 500 })
  }
}