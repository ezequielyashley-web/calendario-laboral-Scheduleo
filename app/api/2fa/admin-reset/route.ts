import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Solo el SUPER_ADMIN puede resetear el 2FA de otros usuarios" }, { status: 403 })
    }

    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: "Falta el userId" }, { status: 400 })

    await prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: false, metodo2FA: "email", totpSecretEnc: "" }
    })
    await prisma.backupCode2FA.deleteMany({ where: { userId } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/2fa/admin-reset:", error)
    return NextResponse.json({ error: "Error al resetear el 2FA" }, { status: 500 })
  }
}