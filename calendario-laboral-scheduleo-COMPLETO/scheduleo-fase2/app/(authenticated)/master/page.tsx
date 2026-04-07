export default function MasterDashboard() {
  const stats = [
    { label: 'Total Empleados', value: '68', color: 'bg-blue-500' },
    { label: 'Grupos Activos', value: '9', color: 'bg-green-500' },
    { label: 'Vacaciones Pendientes', value: '12', color: 'bg-yellow-500' },
    { label: 'Bajas Activas', value: '3', color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white text-2xl font-bold`}>
                {stat.value}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {[
              { action: 'Nueva solicitud de vacaciones', user: 'Juan Pérez', time: 'Hace 5 min' },
              { action: 'Aprobación de cambio de turno', user: 'María García', time: 'Hace 15 min' },
              { action: 'Registro de baja IT', user: 'Carlos López', time: 'Hace 1 hora' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Próximos Eventos</h2>
          <div className="space-y-3">
            {[
              { event: 'Fin de periodo vacacional', date: '15 Abril 2026' },
              { event: 'Revisión de nóminas', date: '20 Abril 2026' },
              { event: 'Reunión de coordinación', date: '25 Abril 2026' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.event}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
                <div className="text-2xl">📅</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">✅</div>
          <div>
            <h3 className="font-semibold text-sky-900">Fase 2 Completada</h3>
            <p className="text-sm text-sky-700 mt-1">
              Panel Master con Sidebar, Header y Dashboard funcionales. 
              Navegación lista para agregar más módulos en la Fase 3.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
