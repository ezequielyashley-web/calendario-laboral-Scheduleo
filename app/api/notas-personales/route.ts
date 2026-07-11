import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const notas = await prisma.notaPersonal.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: "desc" }
    })
    return NextResponse.json(notas)
  } catch (error) {
    console.error("Error en GET /api/notas-personales:", error)
    return NextResponse.json({ error: "Error al obtener las notas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const { contenido } = await req.json()
    if (!contenido || !contenido.trim()) {
      return NextResponse.json({ error: "La nota no puede estar vacia" }, { status: 400 })
    }

    const nota = await prisma.notaPersonal.create({
      data: { userId: auth.userId, contenido: contenido.trim() }
    })
    return NextResponse.json(nota, { status: 201 })
  } catch (error) {
    console.error("Error en POST /api/notas-personales:", error)
    return NextResponse.json({ error: "Error al crear la nota" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const { id, contenido } = await req.json()
    if (!id || !contenido || !contenido.trim()) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const nota = await prisma.notaPersonal.findUnique({ where: { id } })
    if (!nota || nota.userId !== auth.userId) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 })
    }

    const actualizada = await prisma.notaPersonal.update({
      where: { id },
      data: { contenido: contenido.trim() }
    })
    return NextResponse.json(actualizada)
  } catch (error) {
    console.error("Error en PATCH /api/notas-personales:", error)
    return NextResponse.json({ error: "Error al actualizar la nota" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 })

    const nota = await prisma.notaPersonal.findUnique({ where: { id } })
    if (!nota || nota.userId !== auth.userId) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 })
    }

    await prisma.notaPersonal.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en DELETE /api/notas-personales:", error)
    return NextResponse.json({ error: "Error al borrar la nota" }, { status: 500 })
  }
}