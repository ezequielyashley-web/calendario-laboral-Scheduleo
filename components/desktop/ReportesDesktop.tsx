"use client"

import { useState } from "react"

export default function ReportesDesktop() {
  const [tipoReporte, setTipoReporte] = useState<"asistencia" | "vacaciones" | "fichajes" | "horas">("asistencia")
  const [rangoFecha, setRangoFecha] = useState<"semana" | "mes" | "trimestre" | "año">("mes")
  const [sede, setSede] = useState("todas")
  const [mostrarRango, setMostrarRango] = useState(false)
  const [mostrarSede, setMostrarSede] = useState(false)

  const reportes = {
    asistencia: {
      titulo: "📊 Reporte de Asistencia",
      emoji: "📊",
      color: "from-[#7BA8A8] to-[#00A896]",
      metricas: [
        { label: "Asistencia Promedio", valor: "94.5%", tendencia: "+2.3%", color: "from-green-400 to-emerald-500" },
        { label: "Ausencias", valor: "5.5%", tendencia: "-1.2%", color: "from-red-400 to-orange-500" },
        { label: "Llegadas Tarde", valor: "3.2%", tendencia: "-0.8%", color: "from-yellow-400 to-amber-500" },
      ]
    },
    vacaciones: {
      titulo: "🏖️ Reporte de Vacaciones",
      emoji: "🏖️",
      color: "from-purple-400 to-pink-500",
      metricas: [
        { label: "Días Aprobados", valor: "248", tendencia: "+12", color: "from-green-400 to-emerald-500" },
        { label: "Días Pendientes", valor: "45", tendencia: "-8", color: "from-yellow-400 to-amber-500" },
        { label: "Días Rechazados", valor: "3", tendencia: "0", color: "from-red-400 to-orange-500" },
      ]
    },
    fichajes: {
      titulo: "⏰ Reporte de Fichajes",
      emoji: "⏰",
      color: "from-blue-400 to-cyan-500",
      metricas: [
        { label: "Fichajes Correctos", valor: "96.8%", tendencia: "+1.5%", color: "from-green-400 to-emerald-500" },
        { label: "Fichajes Tardíos", valor: "2.1%", tendencia: "-0.5%", color: "from-yellow-400 to-amber-500" },
        { label: "Sin Fichar", valor: "1.1%", tendencia: "-0.3%", color: "from-red-400 to-orange-500" },
      ]
    },
    horas: {
      titulo: "⏱️ Reporte de Horas",
      emoji: "⏱️",
      color: "from-orange-400 to-red-500",
      metricas: [
        { label: "Horas Trabajadas", valor: "5,440h", tendencia: "+120h", color: "from-green-400 to-emerald-500" },
        { label: "Horas Extra", valor: "248h", tendencia: "+32h", color: "from-yellow-400 to-amber-500" },
        { label: "Horas Promedio/Empleado", valor: "80h", tendencia: "+2h", color: "from-blue-400 to-cyan-500" },
      ]
    }
  }

  const reporteActual = reportes[tipoReporte]

  const datosGraficoBarras = [
    { dia: 'Lun', valor: 85, empleados: 58 },
    { dia: 'Mar', valor: 92, empleados: 63 },
    { dia: 'Mié', valor: 88, empleados: 60 },
    { dia: 'Jue', valor: 95, empleados: 65 },
    { dia: 'Vie', valor: 90, empleados: 61 },
    { dia: 'Sáb', valor: 87, empleados: 59 },
    { dia: 'Dom', valor: 20, empleados: 14 },
  ]

  const datosGrupos = [
    { grupo: 'G1A', empleados: 12, color: '#7BA8A8', emoji: '🔵' },
    { grupo: 'G1B', empleados: 11, color: '#6B9999', emoji: '🔵' },
    { grupo: 'G2A', empleados: 11, color: '#00A896', emoji: '💠' },
    { grupo: 'G2B', empleados: 12, color: '#008B8B', emoji: '💠' },
    { grupo: 'G3A', empleados: 11, color: '#7BA8A8', emoji: '🟦' },
    { grupo: 'G3B', empleados: 11, color: '#6B9999', emoji: '🟦' },
  ]

  const rangosOpciones = [
    { valor: 'semana', label: 'Esta Semana', emoji: '📅' },
    { valor: 'mes', label: 'Este Mes', emoji: '📆' },
    { valor: 'trimestre', label: 'Trimestre', emoji: '📊' },
    { valor: 'año', label: 'Año 2026', emoji: '🗓️' },
  ]

  const sedesOpciones = [
    { valor: 'todas', label: 'Todas las sedes', emoji: '🏢' },
    { valor: 'madrid', label: 'Madrid Centro', emoji: '🏙️' },
    { valor: 'vallecas', label: 'Vallecas', emoji: '🏘️' },
  ]

  return (
    <div className="min-h-screen space-y-6 relative">
      {/* Selector de Reporte */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(reportes) as Array<keyof typeof reportes>).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoReporte(tipo)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center gap-2 ${
                  tipoReporte === tipo
                    ? `bg-gradient-to-r ${reportes[tipo].color} text-white scale-105`
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 hover:scale-105'
                }`}
              >
                <span className="text-xl">{reportes[tipo].emoji}</span>
                {reportes[tipo].titulo.replace(/^.+ /, '')}
              </button>
            ))}
          </div>

          <div className="flex gap-2 relative z-[300]">
            {/* Selector de Rango */}
            <div className="relative">
              <button
                onClick={() => {
                  setMostrarRango(!mostrarRango)
                  setMostrarSede(false)
                }}
                className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all shadow-lg font-semibold flex items-center gap-2 min-w-[160px]"
              >
                <span>{rangosOpciones.find(r => r.valor === rangoFecha)?.emoji}</span>
                <span>{rangosOpciones.find(r => r.valor === rangoFecha)?.label}</span>
                <span className="ml-auto">▼</span>
              </button>

              {mostrarRango && (
                <div className="absolute top-full mt-2 w-full backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-[400] overflow-hidden">
                  {rangosOpciones.map((opcion) => (
                    <button
                      key={opcion.valor}
                      onClick={() => {
                        setRangoFecha(opcion.valor as any)
                        setMostrarRango(false)
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all font-semibold text-sm ${
                        rangoFecha === opcion.valor
                          ? 'bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white'
                          : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-xl">{opcion.emoji}</span>
                      {opcion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selector de Sede */}
            <div className="relative">
              <button
                onClick={() => {
                  setMostrarSede(!mostrarSede)
                  setMostrarRango(false)
                }}
                className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all shadow-lg font-semibold flex items-center gap-2 min-w-[160px]"
              >
                <span>{sedesOpciones.find(s => s.valor === sede)?.emoji}</span>
                <span>{sedesOpciones.find(s => s.valor === sede)?.label}</span>
                <span className="ml-auto">▼</span>
              </button>

              {mostrarSede && (
                <div className="absolute top-full mt-2 w-full backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-[400] overflow-hidden">
                  {sedesOpciones.map((opcion) => (
                    <button
                      key={opcion.valor}
                      onClick={() => {
                        setSede(opcion.valor)
                        setMostrarSede(false)
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all font-semibold text-sm ${
                        sede === opcion.valor
                          ? 'bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white'
                          : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-xl">{opcion.emoji}</span>
                      {opcion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2">
              <span className="text-lg">📥</span>
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Header del Reporte */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl relative z-0">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent flex items-center gap-3">
          <span className="text-4xl">{reporteActual.emoji}</span>
          {reporteActual.titulo}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold">
          Periodo: {rangoFecha === 'semana' ? 'Semana actual' : rangoFecha === 'mes' ? 'Mayo 2026' : rangoFecha === 'trimestre' ? 'Q2 2026' : 'Año 2026'}
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
        {reporteActual.metricas.map((metrica, i) => (
          <div
            key={i}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">{metrica.label}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">{metrica.valor}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${metrica.color} text-white font-bold text-sm shadow-lg`}>
              <span>{metrica.tendencia.startsWith('+') || metrica.tendencia.startsWith('-') ? (metrica.tendencia.startsWith('+') ? '📈' : '📉') : '➡️'}</span>
              {metrica.tendencia}
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0">
        {/* Gráfico de Barras */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
              Asistencia Semanal
            </span>
          </h3>
          <div className="h-72 flex items-end justify-around gap-3 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30">
            {datosGraficoBarras.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/90 dark:bg-gray-200/90 px-3 py-1.5 rounded-lg text-white dark:text-gray-800 shadow-lg">
                  {item.valor}% • {item.empleados} emp
                </div>
                <div
                  className="w-full rounded-t-xl transition-all duration-500 hover:scale-105 shadow-xl relative overflow-hidden"
                  style={{
                    height: `${item.valor}%`,
                    maxHeight: '100%',
                    background: item.dia === 'Dom' 
                      ? 'linear-gradient(180deg, #EF4444, #DC2626)' 
                      : `linear-gradient(180deg, #7BA8A8, #00A896)`,
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

        {/* Distribución por Grupo */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
              Distribución por Grupo
            </span>
          </h3>
          <div className="space-y-4">
            {datosGrupos.map((g, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="text-lg">{g.emoji}</span>
                    Grupo {g.grupo}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">{g.empleados} empleados</span>
                </div>
                <div className="relative w-full bg-gray-300/50 dark:bg-gray-600/50 rounded-full h-5 overflow-hidden backdrop-blur-sm shadow-lg">
                  <div
                    className="h-5 rounded-full transition-all duration-700 shadow-md group-hover:shadow-xl relative overflow-hidden"
                    style={{
                      width: `${(g.empleados / 12) * 100}%`,
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

      {/* Tabla de Detalles */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl relative z-0">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
            Detalles por Empleado
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#7BA8A8]/20 to-[#00A896]/20 dark:from-[#7BA8A8]/30 dark:to-[#00A896]/30 backdrop-blur-sm border-b-2 border-[#00A896]/30">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Empleado</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Grupo</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Asistencia</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Horas</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nombre: 'Juan Pérez', grupo: 'G1A', asistencia: 98, horas: 168, estado: 'Excelente' },
                { nombre: 'María García', grupo: 'G2A', asistencia: 95, horas: 164, estado: 'Muy Bien' },
                { nombre: 'Carlos López', grupo: 'G1B', asistencia: 92, horas: 160, estado: 'Bien' },
                { nombre: 'Ana Martínez', grupo: 'G2B', asistencia: 88, horas: 156, estado: 'Regular' },
              ].map((emp, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{emp.nombre}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white rounded-lg font-bold text-sm shadow-md">
                      {emp.grupo}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{emp.asistencia}%</td>
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{emp.horas}h</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg font-bold text-sm shadow-md ${
                      emp.asistencia >= 95 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                      emp.asistencia >= 90 ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white' :
                      emp.asistencia >= 85 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                      'bg-gradient-to-r from-red-400 to-orange-500 text-white'
                    }`}>
                      {emp.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
