import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const empleadoId = searchParams.get("empleadoId")
    const anno = searchParams.get("anno") || new Date().getFullYear().toString()

    if (!empleadoId) return NextResponse.json({ error: "Falta empleadoId" }, { status: 400 })

    const asignaciones = await prisma.empleadoGrupoLibranza.findMany({
      where: { empleadoId, fechaFin: null },
      include: {
        grupoLibranza: {
          include: {
            dias: {
              where: {
                fecha: {
                  gte: new Date(`${anno}-01-01`),
                  lte: new Date(`${anno}-12-31`)
                }
              },
              orderBy: { fecha: "asc" }
            }
          }
        }
      }
    })

    const grupos = asignaciones.map(a => ({
      id: a.grupoLibranza.id,
      nombre: a.grupoLibranza.nombre,
      color: a.grupoLibranza.color,
      tipo: a.grupoLibranza.tipo,
      dias: a.grupoLibranza.dias.map(d => ({
        fecha: d.fecha,
        observacion: d.observacion
      }))
    }))

    const diasLibres = asignaciones.flatMap(a =>
      a.grupoLibranza.dias.map(d => d.fecha.toISOString().split("T")[0])
    )

    return NextResponse.json({ grupos, diasLibres })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener dias" }, { status: 500 })
  }
}
