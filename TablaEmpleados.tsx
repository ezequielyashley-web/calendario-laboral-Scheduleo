'use client'

// SCHEDULEO - TABLA DE EMPLEADOS (SESIÓN 2)
// Con filtros, búsqueda y paginación

import { useState, useEffect } from 'react'

interface Empleado {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  sede: string
  grupo: string
  activo: boolean
}

export default function TablaEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [filtrados, setFiltrados] = useState<Empleado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroSede, setFiltroSede] = useState('todas')
  const [filtroGrupo, setFiltroGrupo] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [paginaActual, setPaginaActual] = useState(1)
  const [loading, setLoading] = useState(true)
  const porPagina = 10

  // Cargar empleados (simulado - en producción sería una API call)
  useEffect(() => {
    // Simulación de datos
    const empleadosDemo: Empleado[] = Array.from({ length: 80 }, (_, i) => ({
      id: `emp-${i + 1}`,
      nombre: ['Ana', 'Juan', 'María', 'Carlos', 'Laura'][i % 5],
      apellidos: ['García López', 'Rodríguez Pérez', 'González Martín'][i % 3],
      email: `empleado${i + 1}@empresa.com`,
      telefono: `6${(i + 10000000).toString().slice(0, 8)}`,
      sede: i < 45 ? 'Madrid Centro' : 'Vallecas',
      grupo: ['G1A', 'G1B', 'G2A', 'G2B', 'G3A', 'G3B'][i % 6],
      activo: i < 78
    }))
    
    setEmpleados(empleadosDemo)
    setFiltrados(empleadosDemo)
    setLoading(false)
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let resultado = empleados

    // Filtro de búsqueda
    if (busqueda) {
      resultado = resultado.filter(emp =>
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    // Filtro de sede
    if (filtroSede !== 'todas') {
      resultado = resultado.filter(emp => emp.sede === filtroSede)
    }

    // Filtro de grupo
    if (filtroGrupo !== 'todos') {
      resultado = resultado.filter(emp => emp.grupo === filtroGrupo)
    }

    // Filtro de estado
    if (filtroEstado === 'activos') {
      resultado = resultado.filter(emp => emp.activo)
    } else if (filtroEstado === 'inactivos') {
      resultado = resultado.filter(emp => !emp.activo)
    }

    setFiltrados(resultado)
    setPaginaActual(1)
  }, [busqueda, filtroSede, filtroGrupo, filtroEstado, empleados])

  // Paginación
  const indiceInicio = (paginaActual - 1) * porPagina
  const indiceFin = indiceInicio + porPagina
  const empleadosPagina = filtrados.slice(indiceInicio, indiceFin)
  const totalPaginas = Math.ceil(filtrados.length / porPagina)

  const colorGrupo = (grupo: string) => {
    const colores: { [key: string]: string } = {
      'G1A': 'bg-blue-100 text-blue-800',
      'G1B': 'bg-blue-200 text-blue-900',
      'G2A': 'bg-red-100 text-red-800',
      'G2B': 'bg-red-200 text-red-900',
      'G3A': 'bg-green-100 text-green-800',
      'G3B': 'bg-green-200 text-green-900'
    }
    return colores[grupo] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, email..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
            />
          </div>

          {/* Filtro Sede */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sede
            </label>
            <select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
            >
              <option value="todas">Todas las sedes</option>
              <option value="Madrid Centro">Madrid Centro</option>
              <option value="Vallecas">Vallecas</option>
            </select>
          </div>

          {/* Filtro Grupo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Grupo
            </label>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
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

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {indiceInicio + 1}-{Math.min(indiceFin, filtrados.length)} de {filtrados.length} empleados
          </span>
          <button
            onClick={() => {
              setBusqueda('')
              setFiltroSede('todas')
              setFiltroGrupo('todos')
              setFiltroEstado('todos')
            }}
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Sede</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Grupo</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {empleadosPagina.map((empleado, index) => (
                <tr
                  key={empleado.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {empleado.nombre} {empleado.apellidos}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {empleado.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {empleado.telefono}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {empleado.sede}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colorGrupo(empleado.grupo)}`}>
                      {empleado.grupo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      empleado.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
                      Ver perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPaginaActual(num)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  num === paginaActual
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
