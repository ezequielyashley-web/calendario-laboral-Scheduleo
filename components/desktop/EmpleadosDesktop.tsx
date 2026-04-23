"use client"

import { useState } from "react"

export default function EmpleadosDesktop() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSede, setFilterSede] = useState("todas")
  const [filterGrupo, setFilterGrupo] = useState("todos")
  const [showNegocio, setShowNegocio] = useState(true) // Toggle para mostrar columna negocio
  const [editingEmpleado, setEditingEmpleado] = useState<any>(null)

  const empleados = [
    { id: 1, nombre: "Juan Pérez García", email: "juan@empresa.com", telefono: "+34 600 123 456", sede: "Madrid Centro", grupo: "G1A", rol: "EMPLEADO", avatar: "👨", estado: "activo", negocio: "Restaurante" },
    { id: 2, nombre: "María García López", email: "maria@empresa.com", telefono: "+34 611 234 567", sede: "Vallecas", grupo: "G2A", rol: "EMPLEADO", avatar: "👩", estado: "activo", negocio: "Pescadería" },
    { id: 3, nombre: "Carlos López Martín", email: "carlos@empresa.com", telefono: "+34 622 345 678", sede: "Madrid Centro", grupo: "G1B", rol: "ADMIN_SEDE", avatar: "👨‍💼", estado: "activo", negocio: "Hotel" },
    { id: 4, nombre: "Ana Martínez Sanz", email: "ana@empresa.com", telefono: "+34 633 456 789", sede: "Vallecas", grupo: "G2B", rol: "EMPLEADO", avatar: "👩", estado: "vacaciones", negocio: "Catering" },
    { id: 5, nombre: "Pedro Sánchez Ruiz", email: "pedro@empresa.com", telefono: "", sede: "Madrid Centro", grupo: "G3A", rol: "EMPLEADO", avatar: "👨", estado: "activo", negocio: "Restaurante" },
  ]

  const tiposNegocio = [
    { value: "Restaurante", label: "Restaurante", emoji: "🍽️", color: "from-orange-400 to-red-400" },
    { value: "Pescadería", label: "Pescadería", emoji: "🐟", color: "from-blue-400 to-cyan-400" },
    { value: "Hotel", label: "Hotel", emoji: "🏨", color: "from-purple-400 to-pink-400" },
    { value: "Catering", label: "Catering", emoji: "🍱", color: "from-green-400 to-emerald-400" },
    { value: "Panadería", label: "Panadería", emoji: "🥖", color: "from-yellow-400 to-amber-400" },
    { value: "Bar/Cafetería", label: "Bar/Cafetería", emoji: "☕", color: "from-amber-600 to-orange-600" },
  ]

  const grupoColors: any = {
    'G1A': { bg: 'from-[#7BA8A8] to-[#6B9999]', text: 'text-white', emoji: '🔵' },
    'G1B': { bg: 'from-[#6B9999] to-[#7BA8A8]', text: 'text-white', emoji: '🔵' },
    'G2A': { bg: 'from-[#00A896] to-[#008B8B]', text: 'text-white', emoji: '💠' },
    'G2B': { bg: 'from-[#008B8B] to-[#00A896]', text: 'text-white', emoji: '💠' },
    'G3A': { bg: 'from-[#7BA8A8] to-[#6B9999]', text: 'text-white', emoji: '🟦' },
    'G3B': { bg: 'from-[#6B9999] to-[#7BA8A8]', text: 'text-white', emoji: '🟦' },
  }

  const getNegocioInfo = (negocio: string) => {
    return tiposNegocio.find(t => t.value === negocio) || tiposNegocio[0]
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Filtros y búsqueda */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full pl-14 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#00A896] dark:focus:ring-[#7BA8A8] focus:border-transparent transition-all shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro Sede */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🏢</span>
            <select
              className="pl-12 pr-8 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A896] dark:focus:ring-[#7BA8A8] focus:border-transparent transition-all shadow-lg appearance-none cursor-pointer"
              value={filterSede}
              onChange={(e) => setFilterSede(e.target.value)}
            >
              <option value="todas">Todas las sedes</option>
              <option value="madrid">Madrid Centro</option>
              <option value="vallecas">Vallecas</option>
            </select>
          </div>

          {/* Filtro Grupo */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">👥</span>
            <select
              className="pl-12 pr-8 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A896] dark:focus:ring-[#7BA8A8] focus:border-transparent transition-all shadow-lg appearance-none cursor-pointer"
              value={filterGrupo}
              onChange={(e) => setFilterGrupo(e.target.value)}
            >
              <option value="todos">Todos los grupos</option>
              <option value="G1A">G1A</option>
              <option value="G1B">G1B</option>
              <option value="G2A">G2A</option>
              <option value="G2B">G2B</option>
              <option value="G3A">G3A</option>
              <option value="G3B">G3B</option>
            </select>
          </div>

          {/* Botón nuevo empleado */}
          <button className="px-6 py-3 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2 whitespace-nowrap">
            <span className="text-xl">➕</span>
            Nuevo Empleado
          </button>
        </div>

        {/* Toggle mostrar tipo de negocio */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => setShowNegocio(!showNegocio)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              showNegocio
                ? "bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white shadow-lg"
                : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50"
            }`}
          >
            <span className="text-lg">{showNegocio ? "👁️" : "👁️‍🗨️"}</span>
            {showNegocio ? "Mostrar tipo de negocio" : "Ocultar tipo de negocio"}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {showNegocio ? "Columna visible en la tabla" : "Columna oculta"}
          </span>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="glass-card overflow-hidden">
        {/* Desktop - Tabla */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#7BA8A8]/20 to-[#00A896]/20 dark:from-[#7BA8A8]/30 dark:to-[#00A896]/30 backdrop-blur-sm border-b-2 border-[#00A896]/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Empleado</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Sede</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Grupo</th>
                {showNegocio && (
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Tipo Negocio</th>
                )}
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp) => {
                const negocioInfo = getNegocioInfo(emp.negocio)
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#7BA8A8] to-[#00A896] rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {emp.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-gray-100">{emp.nombre}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200/50 dark:bg-gray-600/50 text-gray-800 dark:text-gray-200 rounded-lg font-semibold text-sm">
                        <span className="text-lg">🏢</span>
                        {emp.sede}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${grupoColors[emp.grupo].bg} ${grupoColors[emp.grupo].text} rounded-xl font-bold text-sm shadow-lg`}>
                        <span className="text-lg">{grupoColors[emp.grupo].emoji}</span>
                        {emp.grupo}
                      </span>
                    </td>
                    {showNegocio && (
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${negocioInfo.color} text-white rounded-xl font-bold text-sm shadow-lg`}>
                          <span className="text-lg">{negocioInfo.emoji}</span>
                          {negocioInfo.label}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {emp.telefono ? (
                        <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                          <span className="text-lg">📱</span>
                          {emp.telefono}
                        </span>
                      ) : (
                        <button
                          onClick={() => setEditingEmpleado(emp)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-200/50 dark:bg-yellow-700/50 text-yellow-800 dark:text-yellow-200 rounded-lg hover:bg-yellow-300/50 dark:hover:bg-yellow-600/50 transition-all font-semibold text-sm"
                        >
                          <span className="text-lg">➕</span>
                          Agregar teléfono
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm ${
                        emp.estado === 'activo' 
                          ? 'bg-green-200/50 dark:bg-green-700/50 text-green-800 dark:text-green-200'
                          : 'bg-yellow-200/50 dark:bg-yellow-700/50 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        {emp.estado === 'activo' ? 'Activo' : 'Vacaciones'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingEmpleado(emp)}
                          className="px-3 py-2 bg-[#00A896]/20 dark:bg-[#00A896]/30 text-[#00A896] dark:text-[#7BA8A8] rounded-lg hover:bg-[#00A896]/30 dark:hover:bg-[#00A896]/40 transition-all font-semibold text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button className="px-3 py-2 bg-red-200/50 dark:bg-red-700/50 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-300/50 dark:hover:bg-red-600/50 transition-all font-semibold text-sm">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile - Cards */}
        <div className="lg:hidden p-4 space-y-4">
          {empleados.map((emp) => {
            const negocioInfo = getNegocioInfo(emp.negocio)
            return (
              <div key={emp.id} className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#7BA8A8] to-[#00A896] rounded-full flex items-center justify-center text-3xl shadow-lg">
                    {emp.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{emp.nombre}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{emp.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Grupo</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${grupoColors[emp.grupo].bg} ${grupoColors[emp.grupo].text} rounded-lg font-bold text-xs`}>
                      {grupoColors[emp.grupo].emoji} {emp.grupo}
                    </span>
                  </div>
                  {showNegocio && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Negocio</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${negocioInfo.color} text-white rounded-lg font-bold text-xs`}>
                        {negocioInfo.emoji} {negocioInfo.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Teléfono</p>
                  {emp.telefono ? (
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">📱 {emp.telefono}</span>
                  ) : (
                    <button
                      onClick={() => setEditingEmpleado(emp)}
                      className="text-sm px-3 py-1 bg-yellow-200/50 text-yellow-800 rounded-lg font-semibold"
                    >
                      ➕ Agregar teléfono
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                  <button
                    onClick={() => setEditingEmpleado(emp)}
                    className="flex-1 px-3 py-2 bg-[#00A896]/20 text-[#00A896] rounded-lg font-semibold text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-200/50 text-red-800 rounded-lg font-semibold text-sm">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de edición */}
      {editingEmpleado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
                Editar Empleado
              </h2>
              <button
                onClick={() => setEditingEmpleado(null)}
                className="w-10 h-10 rounded-full bg-red-200/50 dark:bg-red-700/50 text-red-800 dark:text-red-200 hover:bg-red-300/50 dark:hover:bg-red-600/50 transition-all font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  📱 Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="+34 600 000 000"
                  defaultValue={editingEmpleado.telefono}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A896] dark:focus:ring-[#7BA8A8] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  🏢 Tipo de Negocio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tiposNegocio.map((tipo) => (
                    <button
                      key={tipo.value}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        editingEmpleado.negocio === tipo.value
                          ? `bg-gradient-to-r ${tipo.color} text-white border-transparent shadow-lg scale-105`
                          : "bg-white/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:scale-105"
                      }`}
                    >
                      <div className="text-3xl mb-2">{tipo.emoji}</div>
                      <div className="font-bold text-sm">{tipo.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingEmpleado(null)}
                  className="flex-1 px-6 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setEditingEmpleado(null)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  ✅ Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            Mostrando 1-5 de 68 empleados
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all font-semibold text-gray-700 dark:text-gray-300">
              ← Anterior
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white rounded-lg font-bold shadow-lg">
              1
            </button>
            <button className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all font-semibold text-gray-700 dark:text-gray-300">
              2
            </button>
            <button className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all font-semibold text-gray-700 dark:text-gray-300">
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
