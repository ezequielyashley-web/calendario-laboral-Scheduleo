"use client"
import { useState, useEffect } from "react"

interface Empleado {
  id: string
  nombre: string
  apellidos: string
  numeroEmpleado: string
  diasVacaciones: number
}

interface Props {
  onCreada: () => void
}

export default function NuevaVacacionAdmin({ onCreada }: Props) {
  const [open, setOpen] = useState(false)
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [form, setForm] = useState({
    empleadoId: "",
    fechaInicio: "",
    fechaFin: "",
    observaciones: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/empleados")
      .then(r => r.json())
      .then(data => setEmpleados(Array.isArray(data) ? data : []))
  }, [])

  const handleSubmit = async () => {
    setError("")
    if (!form.empleadoId || !form.fechaInicio || !form.fechaFin) {
      setError("Completa todos los campos obligatorios")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/vacaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al crear la vacación")
      } else {
        setOpen(false)
        setForm({ empleadoId: "", fechaInicio: "", fechaFin: "", observaciones: "" })
        onCreada()
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
      >
        <span>+</span> Nueva solicitud
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-blue-600">
              <h2 className="text-white font-bold text-lg">Nueva solicitud de vacaciones</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.empleadoId}
                  onChange={e => setForm({ ...form, empleadoId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar empleado...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.apellidos} — Nº {emp.numeroEmpleado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={e => setForm({ ...form, observaciones: e.target.value })}
                  rows={3}
                  placeholder="Opcional..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => { setOpen(false); setError("") }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? "Creando..." : "Crear solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
