import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { unstable_cache } from 'next/cache'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token"
    })
    if (!token?.email) return NextResponse.json({ role: "EMPLEADO", permisos: {} })

    const emailLimpio = (token.email as string).toLowerCase()
    const getCachedUsuario = unstable_cache(
      async (email: string) => {
        return await prisma.user.findFirst({ where: { email } }) as any
      },
      [`session-info-${emailLimpio}`],
      { tags: [`session-info-${emailLimpio}`] }
    )
    const usuario = await getCachedUsuario(emailLimpio)

    if (!usuario) return NextResponse.json({ role: "EMPLEADO", permisos: {} })
    return NextResponse.json({
      id: usuario.id,
      role: usuario.role,
      permisos: usuario.permisos || {},
      name: usuario.name,
      email: usuario.email,
      totpEnabled: usuario.totpEnabled || false,
      metodo2FA: usuario.metodo2FA || "email"
    })
  } catch(e) {
    console.error(e)
    return NextResponse.json({ role: "EMPLEADO", permisos: {} })
  }
}