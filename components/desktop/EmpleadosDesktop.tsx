"use client"

import { useState } from "react"

export default function EmpleadosDesktop() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSede, setFilterSede] = useState("todas")
  const [filterGrupo, setFilterGrupo] = useState("todos")

  const empleados = [
    { id: 1, nombre: "Juan Pérez", email: "juan@empresa.com", sede: "Madrid Centro", grupo: "G1A", rol: "EMPLEADO" },
    { id: 2, nombre: "María García", email: "maria@empresa.com", sede: "Vallecas", grupo: "G2A", rol: "EMPLEADO" },
    { id: 3, nombre: "Carlos López", email: "carlos@empresa.com", sede: "Madrid Centro", grupo: "G1B", rol: "ADMIN_SEDE" },
  ]

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="flex-1 px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterSede}
            onChange={(e) => setFilterSede(e.target.value)}
          >
            <option value="todas">Todas las sedes</option>
            <option value="madrid">Madrid Centro</option>
            <option value="vallecas">Vallecas</option>
          </select>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
          >
            <option value="todos">Todos los grupos</option>
            <option value="G1A">G1A</option>
            <option value="G1B">G1B</option>
            <option value="G2A">G2A</option>
          </select>
          <button className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
            + Nuevo Empleado
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sede</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Grupo</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rol</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{emp.nombre}</td>
                <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                <td className="px-6 py-4">{emp.sede}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {emp.grupo}
                  </span>
                </td>
                <td className="px-6 py-4">{emp.rol}</td>
                <td className="px-6 py-4">
                  <button className="text-cyan-600 hover:text-cyan-700 mr-3">Editar</button>
                  <button className="text-red-600 hover:text-red-700">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Mostrando 1-3 de 68 empleados</span>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded hover:bg-gray-50">Anterior</button>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded">1</button>
          <button className="px-4 py-2 border rounded hover:bg-gray-50">2</button>
          <button className="px-4 py-2 border rounded hover:bg-gray-50">Siguiente</button>
        </div>
      </div>
    </div>
  )
}
