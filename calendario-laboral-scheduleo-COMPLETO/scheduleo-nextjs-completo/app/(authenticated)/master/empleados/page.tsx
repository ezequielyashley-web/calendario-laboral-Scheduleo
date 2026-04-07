export default function EmpleadosPage() {
  const empleados = [
    { id: 1, nombre: 'Juan Pérez', grupo: 'G1A', puesto: 'Pescadero', email: 'juan@empresa.com' },
    { id: 2, nombre: 'María García', grupo: 'G1B', puesto: 'Pescadera', email: 'maria@empresa.com' },
    { id: 3, nombre: 'Carlos López', grupo: 'G2A', puesto: 'Pescadero', email: 'carlos@empresa.com' },
    { id: 4, nombre: 'Ana Martínez', grupo: 'G2B', puesto: 'Cajera', email: 'ana@empresa.com' },
    { id: 5, nombre: 'Pedro Sánchez', grupo: 'G3A', puesto: 'Pescadero', email: 'pedro@empresa.com' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
          <p className="text-gray-600">Gestión de personal</p>
        </div>
        <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
          + Nuevo Empleado
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {empleados.map((empleado) => (
              <tr key={empleado.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                      {empleado.nombre.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{empleado.nombre}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {empleado.grupo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {empleado.puesto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {empleado.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-sky-600 hover:text-sky-900 mr-4">Editar</button>
                  <button className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">👥</div>
          <div>
            <h3 className="font-semibold text-sky-900">Fase 3 Completada</h3>
            <p className="text-sm text-sky-700 mt-1">
              Página de empleados con tabla funcional. Los datos son de ejemplo.
              En la siguiente fase agregaremos funcionalidad real de CRUD.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
