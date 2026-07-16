import { after } from "next/server"
import { prisma } from "@/lib/prisma"

// Umbral: si hay 5 o mas fallos de tareas asincronas en 7 dias, se recomienda migrar a QStash
const UMBRAL_FALLOS = 5
const DIAS_VENTANA = 7

export function runAsync(nombreTarea: string, tarea: () => Promise<any>) {
  after(async () => {
    try {
      await tarea()
    } catch (error) {
      console.error(`Error en tarea asincrona [${nombreTarea}]:`, error)
      try {
        await prisma.logAuditoria.create({
          data: {
            userId: "system",
            accion: "ASYNC_TASK_FAILED",
            entidad: "AsyncTask",
            entidadId: nombreTarea,
            detalles: error instanceof Error ? error.message : String(error),
          }
        })
      } catch (logError) {
        console.error("Error al registrar fallo de tarea asincrona:", logError)
      }
    }
  })
}

export async function contarFallosAsyncRecientes(dias: number = DIAS_VENTANA): Promise<number> {
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
  return prisma.logAuditoria.count({
    where: {
      accion: "ASYNC_TASK_FAILED",
      timestamp: { gte: desde }
    }
  })
}

export async function debeRecomendarQStash(): Promise<{ recomendar: boolean; fallos: number }> {
  const fallos = await contarFallosAsyncRecientes(DIAS_VENTANA)
  return { recomendar: fallos >= UMBRAL_FALLOS, fallos }
}