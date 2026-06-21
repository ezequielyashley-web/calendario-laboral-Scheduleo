import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const superAdmins = await prisma.$queryRaw`
      SELECT id, name, email, cargo, genero, "ultimaActividad", "esFundador", "ordenSuperAdmin", "asignadoPor", "createdAt"
      FROM "User"
      WHERE role = 'SUPER_ADMIN'
      ORDER BY "esFundador" DESC NULLS LAST, "ordenSuperAdmin" ASC NULLS LAST, "createdAt" ASC
    ` as any[]

    const gerenciales = await prisma.$queryRaw`
      SELECT id, name, email, cargo, departamento, genero, "ultimaActividad", permisos, "createdAt"
      FROM "User"
      WHERE role != 'SUPER_ADMIN'
      AND permisos IS NOT NULL
      AND permisos::text != '{}'
      ORDER BY "ultimaActividad" DESC NULLS LAST
    ` as any[]

    const ahora = Date.now()
    const conEstado = (lista: any[]) => lista.map(u => ({
      ...u,
      online: u.ultimaActividad ? (ahora - new Date(u.ultimaActividad).getTime()) < 60000 : false
    }))

    return NextResponse.json({
      superAdmins: conEstado(superAdmins),
      gerenciales: conEstado(gerenciales),
      totalOnline: conEstado([...superAdmins, ...gerenciales]).filter(u => u.online).length
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener panel" }, { status: 500 })
  }
}