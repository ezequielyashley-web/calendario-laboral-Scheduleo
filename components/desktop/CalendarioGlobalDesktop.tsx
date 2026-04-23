"use client"

import { useState } from "react"

type DayConfig = {
  day: number
  tipo: string
  grupos: string[]
  date: Date
  libranzas: { grupo: string, empleados: string[], tipo: 'completa' | 'media' }[]
  esFestivo: boolean
  esEspecial: boolean
  notaEspecial?: string
}

export default function CalendarioGlobalDesktop() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4))
  const [filterGrupo, setFilterGrupo] = useState("todos")
  const [filterSede, setFilterSede] = useState("todas")
  const [vistaDetallada, setVistaDetallada] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DayConfig | null>(null)

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const todosLosGrupos = ['G1A', 'G1B', 'G2A', 'G2B', 'G3A', 'G3B', 'L1', 'L2', 'L3']

  const grupoColors: any = {
    'G1A': { bg: 'from-[#7BA8A8] to-[#6B9999]', emoji: '🔵' },
    'G1B': { bg: 'from-[#6B9999] to-[#7BA8A8]', emoji: '🔵' },
    'G2A': { bg: 'from-[#00A896] to-[#008B8B]', emoji: '💠' },
    'G2B': { bg: 'from-[#008B8B] to-[#00A896]', emoji: '💠' },
    'G3A': { bg: 'from-[#7BA8A8] to-[#6B9999]', emoji: '🟦' },
    'G3B': { bg: 'from-[#6B9999] to-[#7BA8A8]', emoji: '🟦' },
    'L1': { bg: 'from-orange-400 to-amber-500', emoji: '🟠' },
    'L2': { bg: 'from-amber-400 to-yellow-500', emoji: '🟡' },
    'L3': { bg: 'from-yellow-400 to-lime-500', emoji: '🟢' },
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    let startingDayOfWeek = firstDay.getDay() - 1
    if (startingDayOfWeek === -1) startingDayOfWeek = 6

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      
      let tipo = 'trabajo'
      let grupos: string[] = []
      let esFestivo = false
      
      if (dayOfWeek === 0) {
        tipo = 'domingo'
      } else if ([1, 15].includes(day)) {
        tipo = 'festivo'
        esFestivo = true
      } else {
        if (dayOfWeek === 1) grupos = ['L1', 'L2', 'L3']
        else if ([2, 3, 4, 5, 6].includes(dayOfWeek)) {
          if (day % 6 === 0 || day % 6 === 1) grupos = ['G1A', 'G2A', 'G3A']
          else if (day % 6 === 2 || day % 6 === 3) grupos = ['G1B', 'G2B', 'G3B']
          else grupos = ['G1A', 'G2B', 'G3A']
        }
      }
      
      days.push({ 
        day, 
        tipo, 
        grupos, 
        date,
        libranzas: [],
        esFestivo,
        esEspecial: false
      })
    }
    
    return days
  }

  const days = getDaysInMonth()

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const getTipoStyle = (tipo: string) => {
    switch (tipo) {
      case 'domingo':
        return 'bg-gradient-to-br from-red-100/80 to-red-200/80 dark:from-red-900/40 dark:to-red-800/40 border-red-400/60 dark:border-red-600/60 shadow-lg hover:shadow-xl dark:shadow-red-900/30'
      case 'festivo':
        return 'bg-gradient-to-br from-purple-100/80 to-purple-200/80 dark:from-purple-900/40 dark:to-purple-800/40 border-purple-400/60 dark:border-purple-600/60 shadow-lg hover:shadow-xl dark:shadow-purple-900/30'
      default:
        return 'bg-gradient-to-br from-[#7BA8A8]/20 to-[#00A896]/20 dark:from-[#7BA8A8]/30 dark:to-[#00A896]/30 border-[#00A896]/40 dark:border-[#7BA8A8]/40 shadow-lg hover:shadow-xl dark:shadow-gray-900/40'
    }
  }

  const getTipoEmoji = (tipo: string) => {
    switch (tipo) {
      case 'domingo': return '😴'
      case 'festivo': return '🎉'
      default: return '💼'
    }
  }

  const handleDayClick = (dayData: DayConfig) => {
    setSelectedDay({ ...dayData })
  }

  const toggleGrupo = (grupo: string) => {
    if (!selectedDay) return
    
    const grupos = [...selectedDay.grupos]
    const index = grupos.indexOf(grupo)
    
    if (index > -1) {
      grupos.splice(index, 1)
    } else {
      grupos.push(grupo)
    }
    
    setSelectedDay({ ...selectedDay, grupos })
  }

  const toggleLibranza = (grupo: string, tipo: 'completa' | 'media') => {
    if (!selectedDay) return
    
    const libranzas = [...selectedDay.libranzas]
    const index = libranzas.findIndex(l => l.grupo === grupo)
    
    if (index > -1) {
      libranzas.splice(index, 1)
    } else {
      libranzas.push({ grupo, empleados: [], tipo })
    }
    
    setSelectedDay({ ...selectedDay, libranzas })
  }

  const guardarConfiguracion = () => {
    // Aquí iría la lógica para guardar en la base de datos
    console.log('Configuración guardada:', selectedDay)
    setSelectedDay(null)
  }

  return (
    <div className="min-h-screen space-y-4">
      {/* Controles superiores */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-10 h-10 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300 shadow-lg font-bold text-lg"
            >
              ←
            </button>
            
            <div className="text-center min-w-[160px]">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
                {meses[currentMonth.getMonth()]}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                {currentMonth.getFullYear()}
              </p>
            </div>
            
            <button
              onClick={nextMonth}
              className="w-10 h-10 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300 shadow-lg font-bold text-lg"
            >
              →
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">🏢</span>
              <select
                className="pl-10 pr-6 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A896] dark:focus:ring-[#7BA8A8] transition-all shadow-lg appearance-none cursor-pointer font-semibold"
                value={filterSede}
                onChange={(e) => setFilterSede(e.target.value)}
              >
                <option value="todas">Todas las sedes</option>
                <option value="madrid">Madrid Centro</option>
                <option value="vallecas">Vallecas</option>
              </select>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">👥</span>
              <select
                className="pl-10 pr-6 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A896] dark:focus:ring-[#7BA8A8] transition-all shadow-lg appearance-none cursor-pointer font-semibold"
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

            <button
              onClick={() => setVistaDetallada(!vistaDetallada)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-lg flex items-center gap-1.5 ${
                vistaDetallada
                  ? "bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white"
                  : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50"
              }`}
            >
              <span className="text-base">{vistaDetallada ? "📋" : "📅"}</span>
              {vistaDetallada ? "Detallada" : "Compacta"}
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-3 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gradient-to-br from-[#7BA8A8]/20 to-[#00A896]/20 dark:from-[#7BA8A8]/30 dark:to-[#00A896]/30 border-2 border-[#00A896]/40 dark:border-[#7BA8A8]/40 rounded shadow-md"></div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">💼 Laboral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gradient-to-br from-purple-100/80 to-purple-200/80 dark:from-purple-900/40 dark:to-purple-800/40 border-2 border-purple-400/60 dark:border-purple-600/60 rounded shadow-md"></div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">🎉 Festivo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gradient-to-br from-red-100/80 to-red-200/80 dark:from-red-900/40 dark:to-red-800/40 border-2 border-red-400/60 dark:border-red-600/60 rounded shadow-md"></div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">😴 Domingo</span>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, i) => (
            <div
              key={i}
              className={`text-center font-bold py-2 text-xs rounded-lg shadow-md ${
                i === 6
                  ? 'bg-gradient-to-r from-red-400/30 to-red-500/30 dark:from-red-600/40 dark:to-red-700/40 text-red-800 dark:text-red-200'
                  : 'bg-gradient-to-r from-[#7BA8A8]/30 to-[#00A896]/30 dark:from-[#7BA8A8]/40 dark:to-[#00A896]/40 text-gray-800 dark:text-gray-200'
              }`}
            >
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((dayData, i) => {
            if (!dayData) {
              return <div key={i} className="aspect-square"></div>
            }

            const { day, tipo, grupos } = dayData

            return (
              <div
                key={i}
                onClick={() => handleDayClick(dayData)}
                className={`backdrop-blur-sm border-2 rounded-lg p-1.5 transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer group ${getTipoStyle(tipo)} ${
                  vistaDetallada ? 'aspect-auto min-h-[80px]' : 'aspect-square'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100 drop-shadow-md">
                      {day}
                    </span>
                    <span className="text-sm group-hover:scale-125 transition-transform drop-shadow-md">{getTipoEmoji(tipo)}</span>
                  </div>

                  {vistaDetallada && grupos.length > 0 && (
                    <div className="flex-1 space-y-0.5 overflow-y-auto">
                      {grupos.map((grupo, idx) => (
                        <div
                          key={idx}
                          className={`text-[10px] px-1.5 py-0.5 rounded bg-gradient-to-r ${
                            grupoColors[grupo]?.bg || 'from-gray-400 to-gray-500'
                          } text-white font-bold flex items-center gap-0.5 shadow-md`}
                        >
                          <span>{grupoColors[grupo]?.emoji || '⚪'}</span>
                          <span>{grupo}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!vistaDetallada && grupos.length > 0 && (
                    <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200 text-center mt-0.5 drop-shadow-md">
                      {grupos.length} grupos
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7BA8A8] to-[#00A896] rounded-xl flex items-center justify-center text-2xl shadow-lg">
              💼
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Días Laborales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">22</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🎉
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Festivos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              😴
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Domingos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIGURACIÓN */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
                  Configurar Día
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mt-1">
                  {selectedDay.date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-12 h-12 rounded-xl bg-red-200/50 dark:bg-red-700/50 text-red-800 dark:text-red-200 hover:bg-red-300/50 dark:hover:bg-red-600/50 transition-all font-bold text-2xl shadow-lg"
              >
                ✕
              </button>
            </div>

            {/* Info del día */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="backdrop-blur-sm bg-gradient-to-br from-[#7BA8A8]/20 to-[#00A896]/20 dark:from-[#7BA8A8]/30 dark:to-[#00A896]/30 rounded-xl p-4 border border-[#00A896]/40 dark:border-[#7BA8A8]/40 shadow-lg">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Tipo de día</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {getTipoEmoji(selectedDay.tipo)}
                  {selectedDay.tipo.charAt(0).toUpperCase() + selectedDay.tipo.slice(1)}
                </p>
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-br from-blue-100/80 to-cyan-200/80 dark:from-blue-900/40 dark:to-cyan-800/40 rounded-xl p-4 border border-blue-400/60 dark:border-cyan-600/60 shadow-lg">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Grupos trabajando</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedDay.grupos.length}
                </p>
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-br from-green-100/80 to-emerald-200/80 dark:from-green-900/40 dark:to-emerald-800/40 rounded-xl p-4 border border-green-400/60 dark:border-emerald-600/60 shadow-lg">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Libranzas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedDay.libranzas.length}
                </p>
              </div>
            </div>

            {/* Sección 1: Grupos que trabajan */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-2xl">👥</span>
                Grupos Asignados
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {todosLosGrupos.map((grupo) => {
                  const isSelected = selectedDay.grupos.includes(grupo)
                  return (
                    <button
                      key={grupo}
                      onClick={() => toggleGrupo(grupo)}
                      className={`p-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg border-2 ${
                        isSelected
                          ? `bg-gradient-to-r ${grupoColors[grupo]?.bg} text-white border-transparent scale-105`
                          : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300/50 dark:border-gray-600/50 hover:scale-105'
                      }`}
                    >
                      <div className="text-xl mb-1">{grupoColors[grupo]?.emoji}</div>
                      {grupo}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sección 2: Libranzas */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-2xl">🏖️</span>
                Libranzas (Días Libres)
              </h3>
              <div className="space-y-3">
                {selectedDay.grupos.map((grupo) => {
                  const tieneLibranza = selectedDay.libranzas.find(l => l.grupo === grupo)
                  return (
                    <div
                      key={grupo}
                      className="backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-lg bg-gradient-to-r ${grupoColors[grupo]?.bg} text-white font-bold text-sm shadow-md`}>
                            {grupoColors[grupo]?.emoji} {grupo}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                            12 empleados
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleLibranza(grupo, 'completa')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
                              tieneLibranza?.tipo === 'completa'
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white scale-105'
                                : 'bg-white/50 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-500/50'
                            }`}
                          >
                            🏖️ Completa
                          </button>
                          <button
                            onClick={() => toggleLibranza(grupo, 'media')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
                              tieneLibranza?.tipo === 'media'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white scale-105'
                                : 'bg-white/50 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-500/50'
                            }`}
                          >
                            ⏰ Media
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sección 3: Marcas especiales */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Marcas Especiales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedDay({ ...selectedDay, esFestivo: !selectedDay.esFestivo })}
                  className={`p-4 rounded-xl font-bold transition-all shadow-lg border-2 ${
                    selectedDay.esFestivo
                      ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white border-transparent scale-105'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300/50 dark:border-gray-600/50'
                  }`}
                >
                  <div className="text-3xl mb-2">🎉</div>
                  Festivo
                </button>

                <button
                  onClick={() => setSelectedDay({ ...selectedDay, esEspecial: !selectedDay.esEspecial })}
                  className={`p-4 rounded-xl font-bold transition-all shadow-lg border-2 ${
                    selectedDay.esEspecial
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent scale-105'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300/50 dark:border-gray-600/50'
                  }`}
                >
                  <div className="text-3xl mb-2">⭐</div>
                  Día Especial
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setSelectedDay(null)}
                className="flex-1 px-6 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all shadow-lg"
              >
                Cancelar
              </button>
              <button
                onClick={guardarConfiguracion}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                💾 Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
