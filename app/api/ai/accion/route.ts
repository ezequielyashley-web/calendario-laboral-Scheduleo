import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { tipo, datos, userId } = await req.json()
    if (!userId) return NextResponse.json({ error: "Usuario no identificado" }, { status: 401 })

    const usuarios = await prisma.$queryRaw`
      SELECT role FROM "User" WHERE id = ${userId} LIMIT 1
    ` as any[]
    const rol = usuarios[0]?.role

    if (rol !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No tienes permisos suficientes para realizar esta accion. Solo el Super Admin puede ejecutar acciones desde ScheduleoAI." }, { status: 403 })
    }

    if (tipo === "crear_grupo") {
      const { nombre, color, descripcion } = datos
      if (!nombre) return NextResponse.json({ error: "Falta el nombre del grupo" }, { status: 400 })

      const existe = await prisma.$queryRaw`
        SELECT id FROM "GrupoTrabajo" WHERE "empresaId" = 'empresa-001' AND nombre = ${nombre} LIMIT 1
      ` as any[]
      if (existe.length) return NextResponse.json({ error: `Ya existe un grupo llamado "${nombre}"` }, { status: 400 })

      const id = "grp-" + Math.random().toString(36).slice(2, 10)
      await prisma.$executeRaw`
        INSERT INTO "GrupoTrabajo" (id, "empresaId", nombre, descripcion, color, "createdAt", "updatedAt")
        VALUES (${id}, 'empresa-001', ${nombre}, ${descripcion || null}, ${color || '#673DE6'}, NOW(), NOW())
      `
      return NextResponse.json({ ok: true, mensaje: `Grupo "${nombre}" creado correctamente.` })
    }

    if (tipo === "asignar_libranza") {
      const { empleadoNombre, grupoLibranzaNombre } = datos
      if (!empleadoNombre || !grupoLibranzaNombre) return NextResponse.json({ error: "Faltan datos para asignar la libranza" }, { status: 400 })

      const empleado = await prisma.$queryRaw`
        SELECT id, nombre, apellidos FROM "Empleado"
        WHERE "empresaId" = 'empresa-001' AND (nombre ILIKE ${'%' + empleadoNombre + '%'} OR CONCAT(nombre,' ',apellidos) ILIKE ${'%' + empleadoNombre + '%'})
        LIMIT 1
      ` as any[]
      if (!empleado.length) return NextResponse.json({ error: `No se encontro al empleado "${empleadoNombre}"` }, { status: 404 })

      const grupo = await prisma.$queryRaw`
        SELECT id, nombre FROM "GrupoLibranza" WHERE nombre ILIKE ${'%' + grupoLibranzaNombre + '%'} LIMIT 1
      ` as any[]
      if (!grupo.length) return NextResponse.json({ error: `No se encontro el grupo de libranza "${grupoLibranzaNombre}"` }, { status: 404 })

      const existente = await prisma.$queryRaw`
        SELECT id FROM "EmpleadoGrupoLibranza" WHERE "empleadoId" = ${empleado[0].id} AND "grupoLibranzaId" = ${grupo[0].id} AND "fechaFin" IS NULL LIMIT 1
      ` as any[]
      if (existente.length) return NextResponse.json({ error: `${empleado[0].nombre} ya pertenece a ese grupo de libranza` }, { status: 400 })

      const id = crypto.randomUUID()
      await prisma.$executeRaw`
        INSERT INTO "EmpleadoGrupoLibranza" (id, "empleadoId", "grupoLibranzaId", "fechaInicio", "createdAt")
        VALUES (${id}, ${empleado[0].id}, ${grupo[0].id}, NOW(), NOW())
      `
      return NextResponse.json({ ok: true, mensaje: `${empleado[0].nombre} ${empleado[0].apellidos} asignado al grupo de libranza "${grupo[0].nombre}".` })
    }

    if (tipo === "eliminar_grupo") {
      const { nombre } = datos
      if (!nombre) return NextResponse.json({ error: "Falta el nombre del grupo a eliminar" }, { status: 400 })

      const grupo = await prisma.$queryRaw`
        SELECT id, nombre FROM "GrupoTrabajo" WHERE "empresaId" = 'empresa-001' AND nombre ILIKE ${'%' + nombre + '%'} LIMIT 1
      ` as any[]
      if (!grupo.length) return NextResponse.json({ error: `No se encontro el grupo "${nombre}"` }, { status: 404 })

      const empleadosEnGrupo = await prisma.$queryRaw`
        SELECT COUNT(*) as total FROM "Empleado" WHERE "grupoTrabajoId" = ${grupo[0].id}
      ` as any[]
      const total = Number(empleadosEnGrupo[0]?.total || 0)
      if (total > 0) return NextResponse.json({ error: `No se puede eliminar el grupo "${grupo[0].nombre}" porque tiene ${total} empleados asignados. Reasigna a los empleados primero.` }, { status: 400 })

      await prisma.$executeRaw`DELETE FROM "GrupoTrabajo" WHERE id = ${grupo[0].id}`
      return NextResponse.json({ ok: true, mensaje: `Grupo "${grupo[0].nombre}" eliminado correctamente.` })
    }

    if (tipo === "asignar_libranza_grupo") {
      const { grupoTrabajoNombre, grupoLibranzaNombre } = datos
      if (!grupoTrabajoNombre || !grupoLibranzaNombre) return NextResponse.json({ error: "Faltan datos para la asignacion masiva" }, { status: 400 })

      const grupoTrabajo = await prisma.$queryRaw`
        SELECT id, nombre FROM "GrupoTrabajo" WHERE "empresaId" = 'empresa-001' AND nombre ILIKE ${'%' + grupoTrabajoNombre + '%'} LIMIT 1
      ` as any[]
      if (!grupoTrabajo.length) return NextResponse.json({ error: `No se encontro el grupo de trabajo "${grupoTrabajoNombre}"` }, { status: 404 })

      const grupoLibranza = await prisma.$queryRaw`
        SELECT id, nombre FROM "GrupoLibranza" WHERE nombre ILIKE ${'%' + grupoLibranzaNombre + '%'} LIMIT 1
      ` as any[]
      if (!grupoLibranza.length) return NextResponse.json({ error: `No se encontro el grupo de libranza "${grupoLibranzaNombre}"` }, { status: 404 })

      const empleados = await prisma.$queryRaw`
        SELECT id, nombre, apellidos FROM "Empleado" WHERE "grupoTrabajoId" = ${grupoTrabajo[0].id}
      ` as any[]
      if (!empleados.length) return NextResponse.json({ error: `El grupo "${grupoTrabajo[0].nombre}" no tiene empleados asignados` }, { status: 400 })

      let asignados = 0
      for (const emp of empleados) {
        const existente = await prisma.$queryRaw`
          SELECT id FROM "EmpleadoGrupoLibranza" WHERE "empleadoId" = ${emp.id} AND "grupoLibranzaId" = ${grupoLibranza[0].id} AND "fechaFin" IS NULL LIMIT 1
        ` as any[]
        if (!existente.length) {
          const id = crypto.randomUUID()
          await prisma.$executeRaw`
            INSERT INTO "EmpleadoGrupoLibranza" (id, "empleadoId", "grupoLibranzaId", "fechaInicio", "createdAt")
            VALUES (${id}, ${emp.id}, ${grupoLibranza[0].id}, NOW(), NOW())
          `
          asignados++
        }
      }
      return NextResponse.json({ ok: true, mensaje: `${asignados} empleados del grupo "${grupoTrabajo[0].nombre}" asignados al grupo de libranza "${grupoLibranza[0].nombre}".` })
    }

    if (tipo === "aprobar_vacaciones_bloque") {
      const { empleadoNombre } = datos

      let vacaciones
      if (empleadoNombre && empleadoNombre !== "todos") {
        vacaciones = await prisma.$queryRaw`
          SELECT v.id, e.nombre, e.apellidos FROM "Vacacion" v
          INNER JOIN "Empleado" e ON e.id = v."empleadoId"
          WHERE v.estado = 'PENDIENTE' AND (e.nombre ILIKE ${'%' + empleadoNombre + '%'} OR CONCAT(e.nombre,' ',e.apellidos) ILIKE ${'%' + empleadoNombre + '%'})
        ` as any[]
      } else {
        vacaciones = await prisma.$queryRaw`
          SELECT v.id, e.nombre, e.apellidos FROM "Vacacion" v
          INNER JOIN "Empleado" e ON e.id = v."empleadoId"
          WHERE v.estado = 'PENDIENTE'
        ` as any[]
      }

      if (!vacaciones.length) return NextResponse.json({ error: "No hay solicitudes de vacaciones pendientes que coincidan" }, { status: 404 })

      for (const v of vacaciones) {
        await prisma.$executeRaw`UPDATE "Vacacion" SET estado = 'APROBADA' WHERE id = ${v.id}`
      }

      return NextResponse.json({ ok: true, mensaje: `${vacaciones.length} solicitud(es) de vacaciones aprobadas correctamente.` })
    }

    return NextResponse.json({ error: "Tipo de accion no reconocida" }, { status: 400 })
  } catch (error: any) {
    console.error("Error ejecutando accion AI:", error)
    return NextResponse.json({ error: "Error al ejecutar la accion" }, { status: 500 })
  }
}