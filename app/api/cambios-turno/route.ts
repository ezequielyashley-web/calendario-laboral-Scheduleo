import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get("estado")
    const tipo = searchParams.get("tipo")

    const where: any = { esDemostracion: false }
    if (estado && estado !== "TODOS") where.estado = estado
    if (tipo && tipo !== "TODOS") where.tipo = tipo

    const cambios = await prisma.cambioTurno.findMany({
      where,
      include: {
        empleadoOrigen: {
          select: { id: true, nombre: true, apellidos: true, numeroEmpleado: true, grupoTrabajo: { select: { nombre: true, color: true } } }
        },
        empleadoDestino: {
          select: { id: true, nombre: true, apellidos: true, numeroEmpleado: true, grupoTrabajo: { select: { nombre: true, color: true } } }
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cambios)
  } catch (error) {
    console.error("GET /api/cambios-turno error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await req.json()
    const { empleadoOrigenId, empleadoDestinoId, tipo, fechaOrigen, fechaDestino, turnoOrigen, turnoDestino, motivo } = body

    if (!empleadoOrigenId || !tipo || !turnoOrigen) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (tipo === "ENTRE_EMPLEADOS" && !empleadoDestinoId) {
      return NextResponse.json({ error: "Debes seleccionar el empleado receptor" }, { status: 400 })
    }

    // Validar mismas funciones y grupo para cambio entre empleados
    let alertaGrupo = false
    let alertaPuesto = false
    if (tipo === "ENTRE_EMPLEADOS" && empleadoDestinoId) {
      const [origen, destino] = await Promise.all([
        prisma.empleado.findUnique({ where: { id: empleadoOrigenId }, select: { puestoDeTrabajoId: true, grupoTrabajoId: true } }),
        prisma.empleado.findUnique({ where: { id: empleadoDestinoId }, select: { puestoDeTrabajoId: true, grupoTrabajoId: true } }),
      ])
      if (origen && destino) {
        if (origen.puestoDeTrabajoId !== destino.puestoDeTrabajoId) alertaPuesto = true
        if (origen.grupoTrabajoId !== destino.grupoTrabajoId) alertaGrupo = true
      }
      if (alertaPuesto) {
        return NextResponse.json({ error: "Los empleados no tienen el mismo puesto de trabajo. No se puede realizar el cambio de turno.", alertaPuesto: true }, { status: 400 })
      }
    }

    const cambio = await prisma.cambioTurno.create({
      data: {
        id: crypto.randomUUID(),
        empleadoOrigenId,
        empleadoDestinoId: empleadoDestinoId || empleadoOrigenId,
        tipo,
        fecha: fechaOrigen ? new Date(fechaOrigen) : new Date(),
        fechaOrigen: fechaOrigen ? new Date(fechaOrigen) : null,
        fechaDestino: fechaDestino ? new Date(fechaDestino) : null,
        turnoOrigen,
        turnoDestino: turnoDestino || turnoOrigen,
        motivo: motivo || null,
        estado: "PENDIENTE",
        empresaId: "empresa-001",
        updatedAt: new Date(),
      },
      include: {
        empleadoOrigen: { select: { nombre: true, apellidos: true } },
        empleadoDestino: { select: { nombre: true, apellidos: true } },
      }
    })

    // Notificación push al admin
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/push/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "🔄 Nueva solicitud de cambio de turno",
          mensaje: `${cambio.empleadoOrigen.nombre} solicita cambio de turno`,
          url: "/cambios-turno",
          empresaId: "empresa-001",
        }),
      })
    } catch { }

    return NextResponse.json({ ...cambio, alertaGrupo }, { status: 201 })
  } catch (error) {
    console.error("POST /api/cambios-turno error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}


