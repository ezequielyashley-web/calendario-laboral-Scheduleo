'use client'

import { useState, useEffect } from 'react'

export default function CalendarioPage() {
  const [mesExpandido, setMesExpandido] = useState<number | null>(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState<{ mes: number; dia: number; fecha: string } | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [vistaActual, setVistaActual] = useState<'año' | 'mes' | 'semana'>('año')
  const [empleadoFiltro, setEmpleadoFiltro] = useState('todos')
  const [tema, setTema] = useState<'claro' | 'oscuro' | 'auto'>('claro')
  const [temaActivo, setTemaActivo] = useState<'claro' | 'oscuro'>('claro')

  // Detectar preferencia del sistema
  useEffect(() => {
    if (tema === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setTemaActivo(mediaQuery.matches ? 'oscuro' : 'claro')
      
      const handler = (e: MediaQueryListEvent) => {
        setTemaActivo(e.matches ? 'oscuro' : 'claro')
      }
      
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setTemaActivo(tema)
    }
  }, [tema])

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const DIAS_SEMANA_MINI = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  const FESTIVOS_2026: Record<string, string> = {
    '2026-01-01': 'Año Nuevo',
    '2026-01-06': 'Reyes Magos',
    '2026-04-03': 'Viernes Santo',
    '2026-04-06': 'Lunes de Pascua',
    '2026-05-01': 'Día del Trabajo',
    '2026-08-15': 'Asunción',
    '2026-10-12': 'Día de la Hispanidad',
    '2026-11-01': 'Todos los Santos',
    '2026-12-06': 'Constitución',
    '2026-12-08': 'Inmaculada',
    '2026-12-25': 'Navidad',
  }

  // Colores según tema
  const colores = temaActivo === 'oscuro' ? {
    fondo: 'bg-gray-900',
    card: 'bg-gray-800 border-gray-700',
    texto: 'text-gray-100',
    textoSecundario: 'text-gray-400',
    header: 'bg-cyan-600', // Azul del proyecto
    headerHover: 'hover:bg-cyan-700',
    input: 'bg-gray-700 border-gray-600 text-white',
    boton: 'bg-cyan-600 hover:bg-cyan-700',
    botonSecundario: 'bg-gray-700 hover:bg-gray-600',
  } : {
    fondo: 'bg-gray-50',
    card: 'bg-white border-gray-200',
    texto: 'text-slate-800',
    textoSecundario: 'text-slate-600',
    header: 'bg-cyan-600', // Azul del proyecto
    headerHover: 'hover:bg-cyan-700',
    input: 'bg-white border-gray-300',
    boton: 'bg-cyan-600 hover:bg-cyan-700',
    botonSecundario: 'bg-gray-200 hover:bg-gray-300',
  }

  const getDaysInMonth = (mes: number) => {
    const primerDia = new Date(2026, mes, 1)
    const ultimoDia = new Date(2026, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    
    let primerDiaSemana = primerDia.getDay()
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1
    
    return { diasEnMes, primerDiaSemana }
  }

  const handleMesClick = (mesIndex: number) => {
    setMesExpandido(mesIndex)
    setVistaActual('mes')
  }

  const handleDiaClick = (mes: number, dia: number, fecha: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setDiaSeleccionado({ mes, dia, fecha })
    setShowPanel(true)
  }

  // Mini calendario para vista anual
  const renderMiniMes = (mesIndex: number) => {
    const { diasEnMes, primerDiaSemana } = getDaysInMonth(mesIndex)
    const esDiciembre = mesIndex === 11

    return (
      <div
        key={mesIndex}
        onClick={() => handleMesClick(mesIndex)}
        className={`${colores.card} rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border overflow-hidden`}
      >
        <div className={`${colores.header} p-2.5 text-white`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-center">{MESES[mesIndex]}</h3>
          <p className="text-[10px] text-cyan-100 text-center font-medium">2026</p>
        </div>

        <div className={`p-2.5 ${temaActivo === 'oscuro' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-7 gap-0.5 mb-1.5">
            {DIAS_SEMANA_MINI.map((dia, idx) => (
              <div key={idx} className={`text-center text-[8px] font-semibold ${colores.textoSecundario} uppercase`}>
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: primerDiaSemana }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1
              const fecha = `2026-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
              const esDomingo = new Date(2026, mesIndex, dia).getDay() === 0
              const esFestivo = FESTIVOS_2026[fecha]

              let bgColor = temaActivo === 'oscuro' 
                ? 'bg-gray-600 text-gray-100 hover:bg-gray-500' 
                : 'bg-white text-gray-700 hover:bg-blue-50'
              let borderClass = temaActivo === 'oscuro' ? 'border-gray-500' : 'border-gray-200'
              
              if (esDomingo && !esDiciembre) {
                bgColor = 'bg-red-500 text-white'
                borderClass = 'border-red-600'
              } else if (esDomingo && esDiciembre) {
                bgColor = 'bg-red-100 text-red-800'
                borderClass = 'border-red-200'
              } else if (esFestivo) {
                bgColor = 'bg-purple-500 text-white'
                borderClass = 'border-purple-600'
              }

              return (
                <div
                  key={dia}
                  className={`aspect-square text-[8px] font-medium flex items-center justify-center rounded border ${bgColor} ${borderClass} transition-colors`}
                >
                  {dia}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Calendario expandido - Días 50% más pequeños
  const renderMesExpandido = (mesIndex: number) => {
    const { diasEnMes, primerDiaSemana } = getDaysInMonth(mesIndex)
    const esDiciembre = mesIndex === 11

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setMesExpandido(null)
              setVistaActual('año')
            }}
            className={`px-4 py-2 ${colores.boton} text-white rounded-lg transition-colors font-medium shadow-md text-sm flex items-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Volver
          </button>
          <h2 className={`text-2xl font-bold ${colores.texto}`}>{MESES[mesIndex]} 2026</h2>
          <div className="w-24"></div>
        </div>

        <div className={`${colores.card} rounded-xl shadow-lg border overflow-hidden`}>
          <div className={`${colores.header} p-4`}>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">{MESES[mesIndex]} 2026</h3>
          </div>

          <div className="p-6">
            <div className={`grid grid-cols-7 gap-2 mb-3 ${temaActivo === 'oscuro' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 border ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-200'}`}>
              {DIAS_SEMANA.map((dia, idx) => (
                <div key={idx} className={`text-center text-sm font-semibold ${colores.texto} uppercase`}>
                  {dia}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: primerDiaSemana }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}

              {Array.from({ length: diasEnMes }).map((_, i) => {
                const dia = i + 1
                const fecha = `2026-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                const esDomingo = new Date(2026, mesIndex, dia).getDay() === 0
                const esFestivo = FESTIVOS_2026[fecha]

                let bgColor = temaActivo === 'oscuro'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'bg-white hover:bg-blue-50 text-slate-700'
                let borderColor = temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-200'
                let tooltip = ''

                if (esDomingo && !esDiciembre) {
                  bgColor = 'bg-red-500 hover:bg-red-600 text-white'
                  borderColor = 'border-red-600'
                } else if (esDomingo && esDiciembre) {
                  bgColor = 'bg-red-100 hover:bg-red-200 text-red-800'
                  borderColor = 'border-red-300'
                  tooltip = 'Domingo laboral (Diciembre)'
                } else if (esFestivo) {
                  bgColor = 'bg-purple-500 hover:bg-purple-600 text-white'
                  borderColor = 'border-purple-600'
                  tooltip = esFestivo
                }

                return (
                  <button
                    key={dia}
                    onClick={(e) => handleDiaClick(mesIndex, dia, fecha, e)}
                    className={`group relative aspect-square rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center text-sm font-semibold transition-all shadow-sm hover:shadow-md`}
                    title={tooltip}
                  >
                    {dia}
                    {tooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {tooltip}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${colores.fondo} p-6 -m-6`}>
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${colores.texto} mb-2`}>
          {mesExpandido === null ? 'Calendario Anual 2026' : `${MESES[mesExpandido]} 2026`}
        </h1>
        <p className={colores.textoSecundario}>
          {mesExpandido === null ? 'Haz clic en un mes para expandirlo' : 'Haz clic en un día para editarlo'}
        </p>
      </div>

      {/* CONTROLES */}
      <div className={`${colores.card} rounded-xl shadow-md border p-4 mb-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className={`p-2 ${colores.textoSecundario} border ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} rounded-lg hover:bg-opacity-10 transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className={`px-6 py-2 ${colores.header} text-white rounded-lg font-bold text-lg shadow-md`}>
              2026
            </div>
            <button className={`p-2 ${colores.textoSecundario} border ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} rounded-lg hover:bg-opacity-10 transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button className={`px-4 py-2 text-sm font-semibold text-white ${colores.boton} rounded-lg shadow-md transition-colors`}>
              Hoy
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Selector de Tema */}
            <div className="flex border ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden">
              <button 
                className={`px-3 py-2 text-xs font-semibold transition-colors ${tema === 'claro' ? `${colores.header} text-white` : `${colores.card} ${colores.texto}`}`}
                onClick={() => setTema('claro')}
                title="Modo Claro"
              >
                ☀️
              </button>
              <button 
                className={`px-3 py-2 text-xs font-semibold transition-colors border-l ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} ${tema === 'oscuro' ? `${colores.header} text-white` : `${colores.card} ${colores.texto}`}`}
                onClick={() => setTema('oscuro')}
                title="Modo Oscuro"
              >
                🌙
              </button>
              <button 
                className={`px-3 py-2 text-xs font-semibold transition-colors border-l ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} ${tema === 'auto' ? `${colores.header} text-white` : `${colores.card} ${colores.texto}`}`}
                onClick={() => setTema('auto')}
                title="Automático (sistema)"
              >
                🔄
              </button>
            </div>

            <select 
              value={empleadoFiltro}
              onChange={(e) => setEmpleadoFiltro(e.target.value)}
              className={`px-4 py-2 text-sm border ${colores.input} rounded-lg font-medium transition-colors`}
            >
              <option value="todos">Todos los empleados</option>
              <option value="g1a">G1A - Azul (12)</option>
              <option value="g1b">G1B - Azul (11)</option>
              <option value="g2a">G2A - Rojo (11)</option>
              <option value="g2b">G2B - Rojo (12)</option>
              <option value="g3a">G3A - Verde (11)</option>
              <option value="g3b">G3B - Verde (11)</option>
            </select>
            
            <div className={`flex border ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
              <button 
                className={`px-3 py-2 text-xs font-semibold transition-colors ${vistaActual === 'año' ? `${colores.header} text-white` : `${colores.card} ${colores.texto}`}`}
                onClick={() => setVistaActual('año')}
              >
                Año
              </button>
              <button 
                className={`px-3 py-2 text-xs font-semibold transition-colors border-l ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} ${vistaActual === 'mes' ? `${colores.header} text-white` : `${colores.card} ${colores.texto}`}`}
                onClick={() => setVistaActual('mes')}
              >
                Mes
              </button>
              <button 
                className={`px-3 py-2 text-xs font-semibold transition-colors border-l ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-300'} ${vistaActual === 'semana' ? `${colores.header} text-white` : `${colores.card} ${colores.texto}`}`}
                onClick={() => setVistaActual('semana')}
              >
                Semana
              </button>
            </div>
            
            <button className={`px-4 py-2 text-sm ${colores.boton} text-white rounded-lg font-semibold shadow-md transition-colors`}>
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* LEYENDA */}
      <div className={`${colores.card} rounded-xl shadow-md border p-4 mb-6`}>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 ${temaActivo === 'oscuro' ? 'bg-gray-600' : 'bg-white'} border ${temaActivo === 'oscuro' ? 'border-gray-500' : 'border-gray-300'} rounded`}></div>
            <span className={`text-sm font-medium ${colores.texto}`}>Laboral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
            <span className={`text-sm font-medium ${colores.texto}`}>Domingo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded shadow-sm"></div>
            <span className={`text-sm font-medium ${colores.texto}`}>Festivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
            <span className={`text-sm font-medium ${colores.texto}`}>Vacaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded shadow-sm"></div>
            <span className={`text-sm font-medium ${colores.texto}`}>Baja médica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className={`text-sm font-medium ${colores.texto}`}>Dom laboral (Dic)</span>
          </div>
        </div>
      </div>

      {/* Vista Anual o Expandida */}
      {mesExpandido === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {MESES.map((_, index) => renderMiniMes(index))}
        </div>
      ) : (
        renderMesExpandido(mesExpandido)
      )}

      {/* Panel lateral */}
      {showPanel && diaSeleccionado && (
        <div className={`fixed right-0 top-0 h-full w-96 ${colores.card} shadow-2xl border-l p-6 overflow-y-auto z-50`}>
          <div className="space-y-6">
            <div className={`flex items-center justify-between pb-4 border-b ${temaActivo === 'oscuro' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${colores.texto}`}>Editar Día</h3>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDiaSeleccionado(null)
                }}
                className={`${colores.textoSecundario} hover:${colores.texto} transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className={`${temaActivo === 'oscuro' ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg border ${temaActivo === 'oscuro' ? 'border-gray-600' : 'border-gray-200'}`}>
              <p className={`text-sm font-semibold ${colores.texto} mb-1`}>
                {diaSeleccionado.dia} de {MESES[diaSeleccionado.mes]} 2026
              </p>
              <p className={`text-xs ${colores.textoSecundario}`}>{diaSeleccionado.fecha}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold ${colores.texto} mb-2`}>
                  Tipo de día
                </label>
                <select className={`w-full px-3 py-2 border ${colores.input} rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500`}>
                  <option value="trabajo">Trabajo</option>
                  <option value="libre">Libre</option>
                  <option value="domingo">Domingo</option>
                  <option value="festivo">Festivo</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="baja">Baja médica</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${colores.texto} mb-3`}>
                  Acciones rápidas
                </label>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <span>🌴</span>
                    Crear Libranza
                  </button>
                  <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <span>📅</span>
                    Agregar Evento
                  </button>
                  <button className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <span>🎉</span>
                    Marcar Festivo
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${colores.texto} mb-2`}>
                  Notas
                </label>
                <textarea
                  className={`w-full px-3 py-2 border ${colores.input} rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none`}
                  rows={4}
                  placeholder="Agregar notas para este día..."
                ></textarea>
              </div>
            </div>

            <div className={`flex gap-3 pt-4 border-t ${temaActivo === 'oscuro' ? 'border-gray-700' : 'border-gray-200'}`}>
              <button className={`flex-1 px-4 py-2.5 ${colores.boton} text-white rounded-lg transition-colors font-semibold`}>
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDiaSeleccionado(null)
                }}
                className={`flex-1 px-4 py-2.5 ${colores.botonSecundario} ${colores.texto} rounded-lg transition-colors font-medium`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
