"use client"
import { useState } from "react"

interface Vacacion {
  id: string
  empleado: { nombre: string; apellidos: string; numeroEmpleado: string }
  fechaInicio: string
  fechaFin: string
  diasTotales: number
  estado: string
  observaciones?: string
}

interface Props {
  vacacion: Vacacion | null
  accion: "APROBADA" | "RECHAZADA" | null
  onClose: () => void
  onConfirm: (id: string, estado: string, observaciones: string) => void
}

export default function ModalAprobar({ vacacion, accion, onClose, onConfirm }: Props) {
  const [observaciones, setObservaciones] = useState("")
  const [loading, setLoading] = useState(false)

  if (!vacacion || !accion) return null

  const esAprobar = accion === "APROBADA"

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm(vacacion.id, accion, observaciones)
    setLoading(false)
    setObservaciones("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${esAprobar ? "bg-green-500" : "bg-red-500"}`}>
          <h2 className="text-white font-bold text-lg">
            {esAprobar ? "✅ Aprobar vacaciones" : "❌ Rechazar vacaciones"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-500">Empleado</p>
            <p className="font-semibold text-gray-800">
              {vacacion.empleado.nombre} {vacacion.empleado.apellidos}
            </p>
            <p className="text-xs text-gray-400">Nº {vacacion.empleado.numeroEmpleado}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Fecha inicio</p>
              <p className="font-medium text-gray-800 text-sm">
                {new Date(vacacion.fechaInicio).toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Fecha fin</p>
              <p className="font-medium text-gray-800 text-sm">
                {new Date(vacacion.fechaFin).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-500">Días laborables</p>
            <p className="text-2xl font-bold text-blue-700">{vacacion.diasTotales}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones {!esAprobar && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              rows={3}
              placeholder={esAprobar ? "Opcional..." : "Motivo del rechazo..."}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (!esAprobar && !observaciones.trim())}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors ${
              esAprobar ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Procesando..." : esAprobar ? "Aprobar" : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  )
}
