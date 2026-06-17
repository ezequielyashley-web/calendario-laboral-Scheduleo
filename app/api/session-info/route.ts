import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth() as any
    if (!session?.user?.email) return NextResponse.json({ role: "EMPLEADO", permisos: {} })

    const usuario = await prisma.user.findFirst({
      where: { email: session.user.email.toLowerCase() }
    }) as any

    if (!usuario) return NextResponse.json({ role: "EMPLEADO", permisos: {} })

    return NextResponse.json({
      role: usuario.role,
      permisos: usuario.permisos || {},
      name: usuario.name,
      email: usuario.email
    })
  } catch {
    return NextResponse.json({ role: "EMPLEADO", permisos: {} })
  }
}