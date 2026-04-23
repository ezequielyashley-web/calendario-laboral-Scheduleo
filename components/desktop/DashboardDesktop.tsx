"use client"

import { useState } from "react"

export default function DashboardDesktop() {
  const [stats, setStats] = useState({
    empleadosActivos: 68,
    enVacaciones: 12,
    pendientesAprobacion: 5,
    horasTrabajadas: 5440,
  })

  return (
    <div className="min-h-screen">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Empleados Activos"
          value={stats.empleadosActivos}
          icon="👥"
          gradient="from-[#7BA8A8] to-[#6B9999]"
          trend="+3%"
        />
        <MetricCard
          title="En Vacaciones"
          value={stats.enVacaciones}
          icon="🏖️"
          gradient="from-[#00A896] to-[#008B8B]"
          trend="-2%"
        />
        <MetricCard
          title="Pendientes"
          value={stats.pendientesAprobacion}
          icon="⏳"
          gradient="from-[#6B9999] to-[#7BA8A8]"
          trend="+1"
        />
        <MetricCard
          title="Horas Mes"
          value={stats.horasTrabajadas.toLocaleString()}
          icon="⏰"
          gradient="from-[#7BA8A8] to-[#00A896]"
          trend="+5%"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asistencia Semanal - GRÁFICO CORREGIDO */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
              Asistencia Semanal
            </span>
          </h3>
          <div className="h-72 flex items-end justify-around gap-3 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30">
            {[
              { dia: 'L', valor: 85, empleados: 58, color: '#7BA8A8' },
              { dia: 'M', valor: 92, empleados: 63, color: '#00A896' },
              { dia: 'X', valor: 88, empleados: 60, color: '#7BA8A8' },
              { dia: 'J', valor: 95, empleados: 65, color: '#00A896' },
              { dia: 'V', valor: 90, empleados: 61, color: '#7BA8A8' },
              { dia: 'S', valor: 87, empleados: 59, color: '#6B9999' },
              { dia: 'D', valor: 20, empleados: 14, color: '#EF4444' },
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/90 dark:bg-gray-200/90 px-3 py-1.5 rounded-lg text-white dark:text-gray-800 shadow-lg">
                  {item.valor}% • {item.empleados} emp
                </div>
                <div
                  className="w-full rounded-t-xl transition-all duration-500 hover:scale-105 shadow-xl relative overflow-hidden"
                  style={{
                    height: `${item.valor}%`,
                    maxHeight: '100%',
                    background: `linear-gradient(180deg, ${item.color}, ${item.color}dd)`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/30 dark:bg-white/10" />
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {item.valor}%
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold mt-2 text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg shadow-md">
                  {item.dia}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por Turno */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
              Distribución por Turno
            </span>
          </h3>
          <div className="space-y-4">
            {[
              { grupo: 'G1A (Azul)', empleados: 12, color: '#7BA8A8', total: 12, emoji: '🔵' },
              { grupo: 'G1B (Azul)', empleados: 11, color: '#6B9999', total: 12, emoji: '🔵' },
              { grupo: 'G2A (Teal)', empleados: 11, color: '#00A896', total: 12, emoji: '💠' },
              { grupo: 'G2B (Teal)', empleados: 12, color: '#008B8B', total: 12, emoji: '💠' },
              { grupo: 'G3A (Patina)', empleados: 11, color: '#7BA8A8', total: 12, emoji: '🟦' },
              { grupo: 'G3B (Patina)', empleados: 11, color: '#6B9999', total: 12, emoji: '🟦' },
            ].map((g, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="text-lg">{g.emoji}</span>
                    {g.grupo}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">{g.empleados} empleados</span>
                </div>
                <div className="relative w-full bg-gray-300/50 dark:bg-gray-600/50 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-4 rounded-full transition-all duration-700 shadow-md group-hover:shadow-lg relative overflow-hidden"
                    style={{
                      width: `${(g.empleados / g.total) * 100}%`,
                      background: `linear-gradient(90deg, ${g.color}, ${g.color}dd)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 dark:bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
            Actividad Reciente
          </span>
        </h3>
        <div className="space-y-3">
          {[
            { accion: 'Solicitud vacaciones', usuario: 'Juan Pérez', tiempo: 'Hace 5 min', emoji: '🏖️' },
            { accion: 'Cambio turno aprobado', usuario: 'María García', tiempo: 'Hace 15 min', emoji: '✅' },
            { accion: 'Fichaje entrada', usuario: 'Carlos López', tiempo: 'Hace 30 min', emoji: '⏰' },
            { accion: 'Baja médica registrada', usuario: 'Ana Martínez', tiempo: 'Hace 1 hora', emoji: '🏥' },
          ].map((act, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl group-hover:scale-125 transition-transform duration-300">
                  {act.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{act.accion}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{act.usuario}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{act.tiempo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, gradient, trend }: any) {
  return (
    <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-15 dark:opacity-25 group-hover:opacity-25 dark:group-hover:opacity-35 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{title}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
          <div className="text-5xl drop-shadow-2xl group-hover:scale-125 transition-transform duration-300">
            {icon}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold ${
            trend.startsWith('+') ? 'text-[#00A896]' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {trend}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">vs mes anterior</span>
        </div>
      </div>

      <div className={`absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 dark:opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`} />
    </div>
  )
}
