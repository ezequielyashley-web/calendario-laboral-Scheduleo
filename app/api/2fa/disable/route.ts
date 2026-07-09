import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    await prisma.user.update({
      where: { id: auth.userId },
      data: { totpEnabled: false, metodo2FA: "email", totpSecretEnc: "" }
    })
    await prisma.backupCode2FA.deleteMany({ where: { userId: auth.userId } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/2fa/disable:", error)
    return NextResponse.json({ error: "Error al desactivar el 2FA" }, { status: 500 })
  }
}