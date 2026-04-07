export default function GruposPage() {
  const grupos = [
    { id: 1, nombre: 'G1A', color: 'blue', empleados: 12, turno: 'Mañana-Tarde', dias: 'MXJVS' },
    { id: 2, nombre: 'G1B', color: 'blue', empleados: 11, turno: 'Mañana-Tarde', dias: 'MXJVS' },
    { id: 3, nombre: 'G2A', color: 'red', empleados: 11, turno: 'Tarde-Noche', dias: 'MXJVS' },
    { id: 4, nombre: 'G2B', color: 'red', empleados: 12, turno: 'Tarde-Noche', dias: 'MXJVS' },
    { id: 5, nombre: 'G3A', color: 'green', empleados: 11, turno: 'Rotativo', dias: 'MXJVS' },
    { id: 6, nombre: 'G3B', color: 'green', empleados: 11, turno: 'Rotativo', dias: 'MXJVS' },
    { id: 7, nombre: 'L1', color: 'purple', empleados: 0, turno: 'Lunes', dias: 'L' },
    { id: 8, nombre: 'L2', color: 'purple', empleados: 0, turno: 'Lunes', dias: 'L' },
    { id: 9, nombre: 'L3', color: 'purple', empleados: 0, turno: 'Lunes', dias: 'L' },
  ]

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
    }
    return colors[color] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Grupos de Trabajo</h1>
          <p className="text-gray-600">Gestión de grupos y turnos</p>
        </div>
        <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
          + Nuevo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full text-lg font-bold ${getColorClass(grupo.color)}`}>
                {grupo.nombre}
              </span>
              <div className="flex gap-2">
                <button className="text-sky-600 hover:text-sky-800 text-sm">Editar</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Empleados:</span>
                <span className="font-semibold text-gray-800">{grupo.empleados}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Turno:</span>
                <span className="font-semibold text-gray-800">{grupo.turno}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Días:</span>
                <span className="font-semibold text-gray-800">{grupo.dias}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full px-3 py-2 text-sm bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors">
                Ver Empleados del Grupo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🏷️</div>
          <div>
            <h3 className="font-semibold text-sky-900">Fase 4 Completada</h3>
            <p className="text-sm text-sky-700 mt-1">
              Sistema de grupos de trabajo con 9 grupos (6 semanales + 3 de lunes).
              Colores: Azul (G1), Rojo (G2), Verde (G3), Morado (Lunes).
              En la siguiente fase agregaremos funcionalidad CRUD completa.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
