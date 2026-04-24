"use client"

import { useState } from "react"

type Grupo = {
  id: string
  nombre: string
  tipo: "ENTRE_SEMANA" | "LUNES"
  color: string
  emoji: string
  empleados: number
  diasTrabajo: string[]
  libranzas: { fecha: string, tipo: "COMPLETA" | "MEDIA" }[]
}

export default function GestionGruposDesktop() {
  const [grupos, setGrupos] = useState<Grupo[]>([
    { id: "g1a", nombre: "G1A", tipo: "ENTRE_SEMANA", color: "#7BA8A8", emoji: "🔵", empleados: 12, diasTrabajo: ["M", "X", "J", "V", "S"], libranzas: [] },
    { id: "g1b", nombre: "G1B", tipo: "ENTRE_SEMANA", color: "#6B9999", emoji: "🔵", empleados: 11, diasTrabajo: ["M", "X", "J", "V", "S"], libranzas: [] },
    { id: "g2a", nombre: "G2A", tipo: "ENTRE_SEMANA", color: "#00A896", emoji: "💠", empleados: 11, diasTrabajo: ["M", "X", "J", "V", "S"], libranzas: [] },
    { id: "g2b", nombre: "G2B", tipo: "ENTRE_SEMANA", color: "#008B8B", emoji: "💠", empleados: 12, diasTrabajo: ["M", "X", "J", "V", "S"], libranzas: [] },
    { id: "g3a", nombre: "G3A", tipo: "ENTRE_SEMANA", color: "#7BA8A8", emoji: "🟦", empleados: 11, diasTrabajo: ["M", "X", "J", "V", "S"], libranzas: [] },
    { id: "g3b", nombre: "G3B", tipo: "ENTRE_SEMANA", color: "#6B9999", emoji: "🟦", empleados: 11, diasTrabajo: ["M", "X", "J", "V", "S"], libranzas: [] },
    { id: "l1", nombre: "L1", tipo: "LUNES", color: "#9333EA", emoji: "📅", empleados: 4, diasTrabajo: ["L"], libranzas: [] },
    { id: "l2", nombre: "L2", tipo: "LUNES", color: "#A855F7", emoji: "📅", empleados: 3, diasTrabajo: ["L"], libranzas: [] },
    { id: "l3", nombre: "L3", tipo: "LUNES", color: "#C084FC", emoji: "📅", empleados: 3, diasTrabajo: ["L"], libranzas: [] },
  ])

  const [vistaActual, setVistaActual] = useState<"lista" | "calendario" | "mover">("lista")
  const [modalCrear, setModalCrear] = useState(false)
  const [grupoEditar, setGrupoEditar] = useState<Grupo | null>(null)
  const [empleadosMover, setEmpleadosMover] = useState(false)

  const gruposEntreSemana = grupos.filter(g => g.tipo === "ENTRE_SEMANA")
  const gruposLunes = grupos.filter(g => g.tipo === "LUNES")

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-4xl">👥</span>
              Gestión de Grupos de Turno
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold">
              Crea, edita y organiza los grupos de trabajo
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setVistaActual("lista")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center gap-2 ${
                vistaActual === "lista"
                  ? 'bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white scale-105'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 hover:scale-105'
              }`}
            >
              <span className="text-xl">📋</span>
              Lista Grupos
            </button>

            <button
              onClick={() => setVistaActual("calendario")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center gap-2 ${
                vistaActual === "calendario"
                  ? 'bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white scale-105'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 hover:scale-105'
              }`}
            >
              <span className="text-xl">📅</span>
              Asignar Días
            </button>

            <button
              onClick={() => setVistaActual("mover")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center gap-2 ${
                vistaActual === "mover"
                  ? 'bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white scale-105'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 hover:scale-105'
              }`}
            >
              <span className="text-xl">↔️</span>
              Mover Empleados
            </button>

            <button
              onClick={() => {
                setGrupoEditar(null)
                setModalCrear(true)
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              Nuevo Grupo
            </button>
          </div>
        </div>
      </div>

      {/* Vista Lista */}
      {vistaActual === "lista" && (
        <>
          {/* Grupos Entre Semana */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="text-3xl">🗓️</span>
              <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
                Grupos Entre Semana (MXJVS)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gruposEntreSemana.map((grupo) => (
                <GrupoCard
                  key={grupo.id}
                  grupo={grupo}
                  onEditar={() => {
                    setGrupoEditar(grupo)
                    setModalCrear(true)
                  }}
                  onEliminar={() => {
                    if (confirm(`¿Eliminar grupo ${grupo.nombre}?`)) {
                      setGrupos(grupos.filter(g => g.id !== grupo.id))
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Grupos Lunes */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="text-3xl">📅</span>
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Grupos Lunes
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gruposLunes.map((grupo) => (
                <GrupoCard
                  key={grupo.id}
                  grupo={grupo}
                  onEditar={() => {
                    setGrupoEditar(grupo)
                    setModalCrear(true)
                  }}
                  onEliminar={() => {
                    if (confirm(`¿Eliminar grupo ${grupo.nombre}?`)) {
                      setGrupos(grupos.filter(g => g.id !== grupo.id))
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Vista Calendario */}
      {vistaActual === "calendario" && (
        <VistaCalendario grupos={grupos} />
      )}

      {/* Vista Mover Empleados */}
      {vistaActual === "mover" && (
        <VistaMoverEmpleados grupos={grupos} />
      )}

      {/* Modal Crear/Editar Grupo */}
      {modalCrear && (
        <ModalCrearGrupo
          grupoEditar={grupoEditar}
          onCerrar={() => {
            setModalCrear(false)
            setGrupoEditar(null)
          }}
          onGuardar={(nuevoGrupo) => {
            if (grupoEditar) {
              setGrupos(grupos.map(g => g.id === grupoEditar.id ? nuevoGrupo : g))
            } else {
              setGrupos([...grupos, { ...nuevoGrupo, id: Date.now().toString() }])
            }
            setModalCrear(false)
            setGrupoEditar(null)
          }}
        />
      )}
    </div>
  )
}

// Componente Card de Grupo
function GrupoCard({ grupo, onEditar, onEliminar }: { grupo: Grupo, onEditar: () => void, onEliminar: () => void }) {
  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300"
            style={{ background: `linear-gradient(135deg, ${grupo.color}, ${grupo.color}dd)` }}
          >
            {grupo.emoji}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{grupo.nombre}</h3>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {grupo.tipo === "ENTRE_SEMANA" ? "Entre Semana" : "Solo Lunes"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">👥 Empleados:</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{grupo.empleados}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">📅 Días:</span>
          <div className="flex gap-1">
            {grupo.diasTrabajo.map((dia, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-xs font-bold text-white shadow-md"
                style={{ background: grupo.color }}
              >
                {dia}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEditar}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm flex items-center justify-center gap-2"
        >
          <span>✏️</span>
          Editar
        </button>
        <button
          onClick={onEliminar}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm flex items-center justify-center gap-2"
        >
          <span>🗑️</span>
          Eliminar
        </button>
      </div>
    </div>
  )
}

// Modal Crear/Editar Grupo
function ModalCrearGrupo({ grupoEditar, onCerrar, onGuardar }: any) {
  const [nombre, setNombre] = useState(grupoEditar?.nombre || "")
  const [tipo, setTipo] = useState<"ENTRE_SEMANA" | "LUNES">(grupoEditar?.tipo || "ENTRE_SEMANA")
  const [color, setColor] = useState(grupoEditar?.color || "#7BA8A8")
  const [emoji, setEmoji] = useState(grupoEditar?.emoji || "🔵")

  const coloresPreset = [
    { color: "#7BA8A8", nombre: "Patina Blue" },
    { color: "#00A896", nombre: "Teal" },
    { color: "#6B9999", nombre: "Deep Patina" },
    { color: "#008B8B", nombre: "Dark Teal" },
    { color: "#9333EA", nombre: "Purple" },
    { color: "#EC4899", nombre: "Pink" },
    { color: "#F59E0B", nombre: "Amber" },
    { color: "#10B981", nombre: "Emerald" },
  ]

  const emojisPreset = ["🔵", "💠", "🟦", "📅", "⭐", "🎯", "🌟", "💎"]

  const diasSemana = tipo === "ENTRE_SEMANA"
    ? ["M", "X", "J", "V", "S"]
    : ["L"]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
          <span className="text-3xl">{grupoEditar ? "✏️" : "➕"}</span>
          {grupoEditar ? "Editar Grupo" : "Crear Nuevo Grupo"}
        </h2>

        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Grupo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-base w-full"
              placeholder="Ej: G1A, L1, Grupo Mañanas..."
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Grupo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTipo("ENTRE_SEMANA")}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg ${
                  tipo === "ENTRE_SEMANA"
                    ? 'bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white scale-105'
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50'
                }`}
              >
                🗓️ Entre Semana (MXJVS)
              </button>
              <button
                onClick={() => setTipo("LUNES")}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg ${
                  tipo === "LUNES"
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50'
                }`}
              >
                📅 Solo Lunes
              </button>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {coloresPreset.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setColor(preset.color)}
                  className={`h-16 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 ${
                    color === preset.color ? 'ring-4 ring-offset-2 ring-[#00A896] scale-110' : ''
                  }`}
                  style={{ background: preset.color }}
                  title={preset.nombre}
                />
              ))}
            </div>
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Emoji
            </label>
            <div className="grid grid-cols-4 gap-3">
              {emojisPreset.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-16 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 text-3xl flex items-center justify-center ${
                    emoji === e
                      ? 'bg-gradient-to-r from-[#7BA8A8] to-[#00A896] scale-110'
                      : 'bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-700/60 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">Vista Previa:</p>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
              >
                {emoji}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{nombre || "Nombre del Grupo"}</h3>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {tipo === "ENTRE_SEMANA" ? "Entre Semana" : "Solo Lunes"}
                </p>
                <div className="flex gap-1 mt-1">
                  {diasSemana.map((dia, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg text-xs font-bold text-white shadow-md"
                      style={{ background: color }}
                    >
                      {dia}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onCerrar}
            className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!nombre.trim()) {
                alert("El nombre es obligatorio")
                return
              }
              onGuardar({
                nombre,
                tipo,
                color,
                emoji,
                empleados: grupoEditar?.empleados || 0,
                diasTrabajo: diasSemana,
                libranzas: grupoEditar?.libranzas || [],
              })
            }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            💾 Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// Vista Calendario (placeholder)
function VistaCalendario({ grupos }: { grupos: Grupo[] }) {
  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        📅 Asignar Días a Grupos
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Vista de calendario para asignar días (próximamente)
      </p>
    </div>
  )
}

// Vista Mover Empleados (placeholder)
function VistaMoverEmpleados({ grupos }: { grupos: Grupo[] }) {
  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        ↔️ Mover Empleados Entre Grupos
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Interfaz para mover empleados (próximamente)
      </p>
    </div>
  )
}
