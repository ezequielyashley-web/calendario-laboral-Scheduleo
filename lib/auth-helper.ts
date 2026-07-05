import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function requireAuth(req: NextRequest): Promise<{ userId: string; role: string; empresaId: string } | NextResponse> {
  const cookieName = process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token"
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName })
  if (!token?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  return {
    userId: token.id as string,
    role: (token.role as string) || "EMPLEADO",
    empresaId: (token.empresaId as string) || "empresa-001"
  }
}

export function isUnauthorized(result: any): result is NextResponse {
  return result instanceof NextResponse
}