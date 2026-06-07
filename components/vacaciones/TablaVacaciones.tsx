"use client"
import { useState, useEffect, useCallback } from "react"
import ModalAprobar from "./ModalAprobar"
import StatsVacaciones from "./StatsVacaciones"

interface Vacacion {
  id: string
  empleadoId: string
  empleado: {
    id: string
    nombre: string
    apellidos: string
    numeroEmpleado: string
    diasVacaciones: number
    grupoTrabajo?: { nombre: string; color: string }
  }
  fechaInicio: string
  fechaFin: string
  diasTotales: number
  estado: string
  observaciones?: string
  aprobadoPor?: string
  fechaAprobacion?: string
  createdAt: string
}

const ESTADOS = ["TODAS", "PENDIENTE", "APROBADA", "RECHAZADA", "CANCELADA"]

const estadoConfig: Record<string, { label: string; clase: string }> = {
  PENDIENTE:  { label: "Pendiente",  clase: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  APROBADA:   { label: "Aprobada",   clase: "bg-green-100 text-green-700 border border-green-200" },
  RECHAZADA:  { label: "Rechazada",  clase: "bg-red-100 text-red-700 border border-red-200" },
  CANCELADA:  { label: "Cancelada",  clase: "bg-gray-100 text-gray-600 border border-gray-200" },
}

export default function TablaVacaciones() {
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState("TODAS")
  const [filtroAño, setFiltroAño] = useState(new Date().getFullYear().toString())
  const [busqueda, setBusqueda] = useState("")
  const [modalVacacion, setModalVacacion] = useState<Vacacion | null>(null)
  const [modalAccion, setModalAccion] = useState<"APROBADA" | "RECHAZADA" | null>(null)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "error" } | null>(null)

  const mostrarToast = (msg: string, tipo: "ok" | "error") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const cargarVacaciones = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== "TODAS") params.set("estado", filtroEstado)
      if (filtroAño) params.set("año", filtroAño)
      const res = await fetch(`/api/vacaciones?${params}`)
      const data = await res.json()
      setVacaciones(Array.isArray(data) ? data : [])
    } catch {
      mostrarToast("Error al cargar vacaciones", "error")
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, filtroAño])

  useEffect(() => { cargarVacaciones() }, [cargarVacaciones])

  const vacacionesFiltradas = vacaciones.filter(v => {
    const texto = `${v.empleado.nombre} ${v.empleado.apellidos} ${v.empleado.numeroEmpleado}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const handleConfirmar = async (id: string, estado: string, observaciones: string) => {
    try {
      const res = await fetch(`/api/vacaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado, observaciones }),
      })
      if (res.ok) {
        mostrarToast(estado === "APROBADA" ? "Vacación aprobada ✅" : "Vacación rechazada ❌", "ok")
        setModalVacacion(null)
        setModalAccion(null)
        cargarVacaciones()
      } else {
        const data = await res.json()
        mostrarToast(data.error || "Error al actualizar", "error")
      }
    } catch {
      mostrarToast("Error de conexión", "error")
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud?")) return
    try {
      const res = await fetch(`/api/vacaciones/${id}`, { method: "DELETE" })
      if (res.ok) {
        mostrarToast("Solicitud eliminada", "ok")
        cargarVacaciones()
      } else {
        const data = await res.json()
        mostrarToast(data.error || "Error al eliminar", "error")
      }
    } catch {
      mostrarToast("Error de conexión", "error")
    }
  }

  const años = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.tipo === "ok" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ESTADOS.map(e => <option key={e} value={e}>{e === "TODAS" ? "Todos los estados" : estadoConfig[e]?.label}</option>)}
          </select>
          <select
            value={filtroAño}
            onChange={e => setFiltroAño(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {años.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={cargarVacaciones}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            🔄 Actualizar
          </button>
          <span className="text-xs text-gray-400 ml-auto">
            {vacacionesFiltradas.length} resultado{vacacionesFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">Cargando vacaciones...</p>
            </div>
          </div>
        ) : vacacionesFiltradas.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="text-center space-y-2">
              <p className="text-4xl">🏖️</p>
              <p className="text-sm">No hay solicitudes de vacaciones</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Empleado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Período</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Días</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Solicitado</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vacacionesFiltradas.map(v => (
                  <>
                    <tr
                      key={v.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandida(expandida === v.id ? null : v.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{v.empleado.nombre} {v.empleado.apellidos}</div>
                        <div className="text-xs text-gray-400">Nº {v.empleado.numeroEmpleado}</div>
                        {v.empleado.grupoTrabajo && (
                          <div className="text-xs mt-0.5" style={{ color: v.empleado.grupoTrabajo.color }}>
                            {v.empleado.grupoTrabajo.nombre}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800">{new Date(v.fechaInicio).toLocaleDateString("es-ES")}</div>
                        <div className="text-gray-400 text-xs">→ {new Date(v.fechaFin).toLocaleDateString("es-ES")}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-lg text-sm">
                          {v.diasTotales}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoConfig[v.estado]?.clase}`}>
                          {estadoConfig[v.estado]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(v.createdAt).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center" onClick={e => e.stopPropagation()}>
                          {v.estado === "PENDIENTE" && (
                            <>
                              <button
                                onClick={() => { setModalVacacion(v); setModalAccion("APROBADA") }}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => { setModalVacacion(v); setModalAccion("RECHAZADA") }}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {v.estado !== "APROBADA" && (
                            <button
                              onClick={() => handleEliminar(v.id)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandida === v.id && (
                      <tr key={`${v.id}-exp`} className="bg-blue-50">
                        <td colSpan={6} className="px-4 py-4">
                          <StatsVacaciones empleadoId={v.empleadoId} />
                          {v.observaciones && (
                            <div className="mt-3 text-sm text-gray-600">
                              <span className="font-medium">Observaciones:</span> {v.observaciones}
                            </div>
                          )}
                          {v.aprobadoPor && (
                            <div className="mt-1 text-xs text-gray-400">
                              Gestionado por {v.aprobadoPor} el {new Date(v.fechaAprobacion!).toLocaleDateString("es-ES")}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalAprobar
        vacacion={modalVacacion}
        accion={modalAccion}
        onClose={() => { setModalVacacion(null); setModalAccion(null) }}
        onConfirm={handleConfirmar}
      />
    </div>
  )
}
