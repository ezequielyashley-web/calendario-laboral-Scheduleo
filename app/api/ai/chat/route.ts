import { NextRequest, NextResponse } from "next/server"
import { chatAI } from "@/lib/ai"
import { prisma } from "@/lib/prisma"

const PALABRAS_BLOQUEADAS = [
  "base de datos", "database", "drop table", "delete from", "select *",
  "contrasena de otro", "api key", "token secreto", "hack", "exploit",
  "datos de todos", "exportar todo", "dump", "injection",
  "ignora tus instrucciones", "ignora las instrucciones", "olvida tus instrucciones",
  "ignore your instructions", "system prompt", "eres ahora", "actua como si",
  "nuevo rol", "sin restricciones", "sin filtros", "modo desarrollador",
  "jailbreak", "dan mode", "bypass", "saltate las reglas", "sin limites",
  "eres libre de", "no tienes reglas", "cambia tu personalidad"
]

const MAX_LONGITUD_MENSAJE = 1000


async function getDatosSistema(): Promise<string> {
  try {
    const [empleados, grupos, vacaciones, bajas] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as total FROM "Empleado" WHERE "empresaId"='empresa-001' AND "esDemostracion"=false` as Promise<any[]>,
      prisma.$queryRaw`SELECT nombre FROM "GrupoTrabajo" WHERE "empresaId"='empresa-001'` as Promise<any[]>,
      prisma.$queryRaw`SELECT v.id, e.nombre, e.apellidos, v."fechaInicio", v."fechaFin" FROM "Vacacion" v INNER JOIN "Empleado" e ON e.id = v."empleadoId" WHERE v.estado='PENDIENTE' LIMIT 20` as Promise<any[]>,
      prisma.$queryRaw`SELECT COUNT(*) as total FROM "BajaMedica"` as Promise<any[]>,
    ])
    const configDemo = await prisma.$queryRaw`SELECT "modoDemo" FROM "Configuracion" LIMIT 1` as any[]
    const modoDemo = configDemo[0]?.modoDemo

    if (modoDemo) {
      const empDemo = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "Empleado" WHERE "esDemostracion"=true` as any[]
      const vacsDetalle = (vacaciones as any[]).map((v:any) => `${v.nombre} ${v.apellidos} (${new Date(v.fechaInicio).toLocaleDateString('es-ES')} - ${new Date(v.fechaFin).toLocaleDateString('es-ES')})`).join(", ") || "Ninguna"
    return `
DATOS DEL SISTEMA (Modo demostración activo):
- Empleados ficticios: ${Number(empDemo[0]?.total || 0)}
- Grupos: ${(grupos as any[]).map((g:any) => g.nombre).join(", ") || "Ninguno"}
- Vacaciones pendientes (${(vacaciones as any[]).length}): ${vacsDetalle}
- Bajas médicas activas: ${Number((bajas as any[])[0]?.total || 0)}`
    }

    const vacsDetalleReal = (vacaciones as any[]).map((v:any) => `${v.nombre} ${v.apellidos} (${new Date(v.fechaInicio).toLocaleDateString('es-ES')} - ${new Date(v.fechaFin).toLocaleDateString('es-ES')})`).join(", ") || "Ninguna"
    return `
DATOS DEL SISTEMA (Datos reales):
- Empleados activos: ${Number((empleados as any[])[0]?.total || 0)}
- Grupos de trabajo: ${(grupos as any[]).map((g:any) => g.nombre).join(", ") || "Ninguno"}
- Vacaciones pendientes de aprobar (${(vacaciones as any[]).length}): ${vacsDetalleReal}
- Bajas médicas activas: ${Number((bajas as any[])[0]?.total || 0)}`
  } catch {
    return "No se pudieron cargar los datos del sistema."
  }
}
async function getContextoUsuario(userId: string): Promise<string> {
  if (!userId) return "Usuario no identificado."
  try {
    const usuario = await prisma.$queryRaw`
      SELECT id, name, email, role FROM "User" WHERE id = ${userId} LIMIT 1
    ` as any[]
    if (!usuario.length) return "Usuario no identificado."
    const u = usuario[0]
    const empresa = await prisma.$queryRaw`
      SELECT nombre, "nombreComercial" FROM "Empresa" WHERE id = 'empresa-001' LIMIT 1
    ` as any[]
    const emp = empresa[0]

    return `
USUARIO ACTUAL:
- Nombre: ${u.name}
- Email: ${u.email}
- Rol: ${u.role}
- ID: ${u.id}

EMPRESA:
- Nombre: ${emp?.nombreComercial || emp?.nombre || "Mi Empresa"}

PERMISOS SEGUN ROL:
${u.role === "SUPER_ADMIN" ? `- Acceso TOTAL al sistema
- Puede crear, modificar y eliminar grupos
- Puede gestionar todos los empleados
- Puede ver y modificar toda la configuracion
- Puede aprobar/rechazar cualquier solicitud` :
u.role === "ADMIN" ? `- Puede ver empleados de su empresa
- Puede aprobar vacaciones y cambios de turno
- Puede gestionar fichajes
- NO puede modificar configuracion del sistema
- NO puede eliminar empleados` :
`- Solo puede ver su propio perfil
- NO puede modificar datos de otros empleados
- NO puede aprobar solicitudes
- NO puede acceder a configuracion`}

IMPORTANTE: Si el usuario solicita una accion que no corresponde a su rol, RECHAZALA amablemente e indica que no tiene permisos suficientes.`
  } catch {
    return "No se pudo cargar el contexto del usuario."
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mensajes, userId, contexto } = await req.json()
    if (!mensajes) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (userId) {
      const consultas = await prisma.$queryRaw`
        SELECT COUNT(*) as total FROM "ChatAI"
        WHERE "userId" = ${userId} AND rol = 'user' AND "createdAt" >= ${hoy}
      ` as any[]
      const total = Number(consultas[0]?.total || 0)
      if (total >= 20) return NextResponse.json({ error: "Has alcanzado el limite de 20 consultas diarias." }, { status: 429 })
    }

    const ultimoMensaje = mensajes[mensajes.length - 1]?.contenido?.toLowerCase() || ""

    if (ultimoMensaje.length > MAX_LONGITUD_MENSAJE) {
      return NextResponse.json({ error: "Tu mensaje es demasiado largo. Maximo 1000 caracteres." }, { status: 400 })
    }
    const bloqueado = PALABRAS_BLOQUEADAS.some(p => ultimoMensaje.includes(p))
    if (bloqueado) {
      return NextResponse.json({
        respuesta: "No puedo ayudarte con eso. Solo puedo asistirte con temas de gestion laboral en Scheduleo.",
        tokens: 0, proveedor: "filtro"
      })
    }

    const [contextoUsuario, datosSistema] = await Promise.all([getContextoUsuario(userId || ""), getDatosSistema()])
    const contextoCompleto = contextoUsuario + "\n\n" + datosSistema + (contexto ? `\n\nCONTEXTO ADICIONAL:\n${contexto}` : "")

    const resultado = await chatAI(mensajes, contextoCompleto)

    if (userId) {
      await prisma.$executeRaw`
        INSERT INTO "ChatAI" (id, "userId", rol, contenido, tokens, proveedor)
        VALUES (gen_random_uuid()::text, ${userId}, 'user', ${ultimoMensaje}, 0, ${resultado.proveedor})
      `
      await prisma.$executeRaw`
        INSERT INTO "ChatAI" (id, "userId", rol, contenido, tokens, proveedor)
        VALUES (gen_random_uuid()::text, ${userId}, 'assistant', ${resultado.respuesta}, ${resultado.tokens}, ${resultado.proveedor})
      `
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error("Error en chatAI:", error)
    return NextResponse.json({ error: error.message || "Error en ScheduleoAI" }, { status: 500 })
  }
}