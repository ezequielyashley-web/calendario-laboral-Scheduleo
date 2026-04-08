'use client'

import { useState } from 'react'

export default function CalendarioPage() {
  const [mesExpandido, setMesExpandido] = useState<number | null>(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState<{ mes: number; dia: number; fecha: string } | null>(null)
  const [showPanel, setShowPanel] = useState(false)

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

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
  }

  const handleDiaClick = (mes: number, dia: number, fecha: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDiaSeleccionado({ mes, dia, fecha })
    setShowPanel(true)
  }

  // Mini calendario para vista anual - MÁS PEQUEÑO (50%)
  const renderMiniMes = (mesIndex: number) => {
    const { diasEnMes, primerDiaSemana } = getDaysInMonth(mesIndex)
    const esDiciembre = mesIndex === 11

    return (
      <div
        key={mesIndex}
        onClick={() => handleMesClick(mesIndex)}
        className="bg-white rounded-lg border-2 border-green-300 shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      >
        {/* Header verde con año */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-1.5 text-white text-center">
          <h3 className="text-[10px] font-bold uppercase tracking-wide">{MESES[mesIndex]}</h3>
          <p className="text-[8px] opacity-90">2026</p>
        </div>

        <div className="p-1.5">
          {/* Grid de días mini CON BORDES */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Días vacíos antes del mes */}
            {Array.from({ length: primerDiaSemana }).map((_, i) => (
              <div key={`empty-${i}`} className="w-4 h-4"></div>
            ))}

            {/* Días del mes CON BORDES */}
            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1
              const esDomingo = new Date(2026, mesIndex, dia).getDay() === 0

              let bgColor = 'bg-white text-gray-700 border border-gray-300'
              if (esDomingo && !esDiciembre) {
                bgColor = 'bg-red-400 text-white border border-red-500'
              } else if (esDomingo && esDiciembre) {
                bgColor = 'bg-red-100 text-red-700 border border-red-300'
              }

              return (
                <div
                  key={dia}
                  className={`w-4 h-4 text-[8px] flex items-center justify-center rounded ${bgColor}`}
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

  // Calendario expandido para vista mensual - BORDES MÁS VISIBLES
  const renderMesExpandido = (mesIndex: number) => {
    const { diasEnMes, primerDiaSemana } = getDaysInMonth(mesIndex)
    const esDiciembre = mesIndex === 11

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMesExpandido(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
          >
            ← Volver a vista anual
          </button>
          <h2 className="text-2xl font-bold text-blue-900">{MESES[mesIndex]} 2026</h2>
          <div className="w-40"></div>
        </div>

        <div className="bg-white rounded-lg border-2 border-green-300 shadow-lg overflow-hidden">
          {/* Header verde */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <h3 className="text-lg font-bold uppercase tracking-wide">{MESES[mesIndex]} 2026</h3>
          </div>

          <div className="p-6">
            {/* Headers días con fondo gris cálido */}
            <div className="grid grid-cols-7 gap-3 mb-3 bg-stone-200 rounded p-3 border-2 border-stone-300">
              {DIAS_SEMANA.map((dia, idx) => (
                <div key={idx} className="text-center text-sm font-bold text-stone-700 uppercase">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de días CON BORDES MÁS VISIBLES */}
            <div className="grid grid-cols-7 gap-3">
              {/* Días vacíos antes del mes */}
              {Array.from({ length: primerDiaSemana }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}

              {/* Días del mes */}
              {Array.from({ length: diasEnMes }).map((_, i) => {
                const dia = i + 1
                const fecha = `2026-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                const esDomingo = new Date(2026, mesIndex, dia).getDay() === 0
                const esFestivo = FESTIVOS_2026[fecha]

                let bgColor = 'bg-white hover:bg-blue-50'
                let borderColor = 'border-blue-400 border-2'
                let textColor = 'text-blue-900'
                let tooltip = ''

                // LÓGICA ESPECIAL: Solo en diciembre los domingos son laborables
                if (esDomingo && !esDiciembre) {
                  // Domingos NO laborables
                  bgColor = 'bg-red-400 hover:bg-red-500'
                  borderColor = 'border-red-600 border-2'
                  textColor = 'text-white'
                } else if (esDomingo && esDiciembre) {
                  // Domingos laborables en diciembre
                  bgColor = 'bg-red-100 hover:bg-red-200'
                  borderColor = 'border-red-400 border-2'
                  textColor = 'text-red-800'
                  tooltip = 'Domingo laboral (Diciembre)'
                } else if (esFestivo) {
                  bgColor = 'bg-purple-300 hover:bg-purple-400'
                  borderColor = 'border-purple-500 border-2'
                  textColor = 'text-purple-900'
                  tooltip = esFestivo
                }

                return (
                  <button
                    key={dia}
                    onClick={(e) => handleDiaClick(mesIndex, dia, fecha, e)}
                    className={`group relative aspect-square rounded-lg ${bgColor} ${borderColor} ${textColor} flex items-center justify-center text-sm font-bold transition-all shadow-md hover:shadow-lg`}
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
    <div className="space-y-6 bg-blue-50 min-h-screen p-6 -m-6">
      {/* Controles */}
      <div className="bg-white rounded-lg border-2 border-blue-300 shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md border-2 border-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="px-4 py-2 bg-blue-600 text-white rounded-md border-2 border-blue-700 font-bold shadow-md">
              <span className="text-lg">2026</span>
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md border-2 border-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 border-2 border-blue-700 rounded-md hover:bg-blue-700 shadow-md">
              Hoy
            </button>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 text-sm font-medium border-2 border-blue-400 rounded-md">
              <option>Todos los grupos</option>
              <option>G1A - Azul (12)</option>
              <option>G1B - Azul (11)</option>
              <option>G2A - Rojo (11)</option>
              <option>G2B - Rojo (12)</option>
              <option>G3A - Verde (11)</option>
              <option>G3B - Verde (11)</option>
            </select>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-md border-2 border-blue-700">
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Título dinámico */}
      <div className="bg-white rounded-lg border-2 border-blue-300 shadow-md p-4">
        <h1 className="text-xl font-bold text-blue-900">
          {mesExpandido === null ? 'Calendario Anual 2026' : `${MESES[mesExpandido]} 2026`}
        </h1>
        <p className="text-sm text-blue-600">
          {mesExpandido === null 
            ? 'Haz clic en un mes para expandirlo' 
            : 'Haz clic en un día para editarlo'}
        </p>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg border-2 border-blue-300 shadow-md p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white border-2 border-blue-400 rounded"></div>
            <span className="text-xs font-medium text-blue-900">Día laboral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-400 border-2 border-red-600 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-blue-900">Domingo (no laboral)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-300 border-2 border-purple-500 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-blue-900">Festivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-300 border-2 border-green-500 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-blue-900">Vacaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-300 border-2 border-orange-500 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-blue-900">Baja médica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-100 border-2 border-red-400 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-blue-900">Domingo laboral (Diciembre)</span>
          </div>
        </div>
      </div>

      {/* Vista Anual o Expandida */}
      {mesExpandido === null ? (
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
          {MESES.map((_, index) => renderMiniMes(index))}
        </div>
      ) : (
        renderMesExpandido(mesExpandido)
      )}

      {/* Panel lateral de edición */}
      {showPanel && diaSeleccionado && (
        <div className="fixed right-0 top-0 h-full w-80 bg-blue-600 shadow-2xl border-l-4 border-blue-800 p-6 overflow-y-auto z-50">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Editar Día</h3>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDiaSeleccionado(null)
                }}
                className="text-white hover:text-blue-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-blue-700 p-3 rounded-lg">
              <p className="text-sm text-white">
                <strong>Fecha:</strong> {diaSeleccionado.dia} de {MESES[diaSeleccionado.mes]} 2026
              </p>
              <p className="text-xs text-blue-200">{diaSeleccionado.fecha}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Tipo de día
                </label>
                <select className="w-full px-3 py-2 border-2 border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300">
                  <option value="trabajo">Trabajo</option>
                  <option value="libre">Libre</option>
                  <option value="domingo">Domingo</option>
                  <option value="festivo">Festivo</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="baja">Baja médica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Acción especial
                </label>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium border-2 border-green-600">
                    🌴 Crear Libranza
                  </button>
                  <button className="w-full px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium border-2 border-blue-700">
                    📅 Agregar Evento
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium border-2 border-purple-600">
                    🎉 Marcar Festivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Notas
                </label>
                <textarea
                  className="w-full px-3 py-2 border-2 border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                  rows={4}
                  placeholder="Agregar notas para este día..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-bold border-2 border-white">
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDiaSeleccionado(null)
                }}
                className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium border-2 border-blue-800"
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
