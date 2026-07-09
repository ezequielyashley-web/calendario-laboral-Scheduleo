import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token"
    })
    if (!token?.email) return NextResponse.json({ role: "EMPLEADO", permisos: {} })
    const usuario = await prisma.user.findFirst({
      where: { email: (token.email as string).toLowerCase() }
    }) as any
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