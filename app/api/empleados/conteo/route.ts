import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isUnauthorized(auth)) return auth
  try {
    const [reales, demo] = await Promise.all([
      prisma.empleado.count({ where: { empresaId: "empresa-001", esDemostracion: false } }),
      prisma.empleado.count({ where: { empresaId: "empresa-001", esDemostracion: true } })
    ])
    return NextResponse.json({ reales, demo })
  } catch {
    return NextResponse.json({ reales: 0, demo: 50 })
  }
}