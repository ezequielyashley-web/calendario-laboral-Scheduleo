import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const empresa = await prisma.empresa.findFirst({
      where: { id: "empresa-001" }
    })
    return NextResponse.json(empresa || {})
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener empresa" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, logo, colorSidebar, colorAccent } = body

    const empresa = await prisma.empresa.update({
      where: { id: "empresa-001" },
      data: {
        ...(nombre && { nombre }),
        ...(logo !== undefined && { logo }),
        ...(colorSidebar && { colorSidebar }),
        ...(colorAccent && { colorAccent }),
      }
    })

    return NextResponse.json(empresa)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar empresa" }, { status: 500 })
  }
}
