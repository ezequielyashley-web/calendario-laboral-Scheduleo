import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
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