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
    e.stopPropagation() // Evitar que se cierre el mes expandido
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
        className="bg-white rounded-lg border border-green-200 shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      >
        {/* Header verde */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 text-white">
          <h3 className="text-xs font-bold uppercase tracking-wide text-center">{MESES[mesIndex]}</h3>
        </div>

        <div className="p-2">
          {/* Grid de días mini */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Días vacíos antes del mes */}
            {Array.from({ length: primerDiaSemana }).map((_, i) => (
              <div key={`empty-${i}`} className="w-5 h-5"></div>
            ))}

            {/* Días del mes */}
            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1
              const esDomingo = new Date(2026, mesIndex, dia).getDay() === 0

              let bgColor = 'text-gray-600'
              if (esDomingo && !esDiciembre) {
                bgColor = 'bg-red-100 text-red-800'
              } else if (esDomingo && esDiciembre) {
                bgColor = 'bg-red-50 text-red-600'
              }

              return (
                <div
                  key={dia}
                  className={`w-5 h-5 text-[10px] flex items-center justify-center rounded ${bgColor}`}
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

  // Calendario expandido para vista mensual
  const renderMesExpandido = (mesIndex: number) => {
    const { diasEnMes, primerDiaSemana } = getDaysInMonth(mesIndex)
    const esDiciembre = mesIndex === 11

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMesExpandido(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver a vista anual
          </button>
          <h2 className="text-2xl font-bold text-blue-900">{MESES[mesIndex]} 2026</h2>
          <div className="w-40"></div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 shadow-md overflow-hidden">
          {/* Header verde */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <h3 className="text-lg font-bold uppercase tracking-wide">{MESES[mesIndex]}</h3>
          </div>

          <div className="p-6">
            {/* Headers días con fondo gris cálido */}
            <div className="grid grid-cols-7 gap-2 mb-3 bg-stone-200 rounded p-3">
              {DIAS_SEMANA.map((dia, idx) => (
                <div key={idx} className="text-center text-sm font-bold text-stone-700 uppercase">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-2">
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
                let borderColor = 'border-blue-200'
                let textColor = 'text-blue-900'
                let tooltip = ''

                // LÓGICA ESPECIAL: Solo en diciembre los domingos son laborables
                if (esDomingo && !esDiciembre) {
                  // Domingos NO laborables
                  bgColor = 'bg-red-400 hover:bg-red-500'
                  borderColor = 'border-red-500'
                  textColor = 'text-white'
                } else if (esDomingo && esDiciembre) {
                  // Domingos laborables en diciembre
                  bgColor = 'bg-red-100 hover:bg-red-200'
                  borderColor = 'border-red-300'
                  textColor = 'text-red-800'
                  tooltip = 'Domingo laboral (Diciembre)'
                } else if (esFestivo) {
                  bgColor = 'bg-purple-300 hover:bg-purple-400'
                  borderColor = 'border-purple-400'
                  textColor = 'text-purple-900'
                  tooltip = esFestivo
                }

                return (
                  <button
                    key={dia}
                    onClick={(e) => handleDiaClick(mesIndex, dia, fecha, e)}
                    className={`group relative aspect-square rounded border ${bgColor} ${borderColor} ${textColor} flex items-center justify-center text-sm font-semibold transition-all shadow-sm`}
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
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white rounded-lg border border-blue-200 shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="px-4 py-2 bg-blue-50 rounded-md border border-blue-300">
              <span className="text-lg font-bold text-blue-900">2026</span>
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50">
              Hoy
            </button>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 text-sm font-medium border border-blue-300 rounded-md">
              <option>Todos los grupos</option>
              <option>G1A - Azul (12)</option>
              <option>G1B - Azul (11)</option>
              <option>G2A - Rojo (11)</option>
              <option>G2B - Rojo (12)</option>
              <option>G3A - Verde (11)</option>
              <option>G3B - Verde (11)</option>
            </select>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-md">
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Título dinámico */}
      <div>
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
      <div className="flex items-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-blue-300 rounded"></div>
          <span className="text-xs font-medium text-blue-900">Día laboral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-blue-900">Domingo (no laboral)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-300 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-blue-900">Festivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-blue-900">Vacaciones</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-300 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-blue-900">Baja médica</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-blue-900">Domingo laboral (Diciembre)</span>
        </div>
      </div>

      {/* Vista Anual o Expandida */}
      {mesExpandido === null ? (
        <div className="grid grid-cols-3 gap-6">
          {MESES.map((_, index) => renderMiniMes(index))}
        </div>
      ) : (
        renderMesExpandido(mesExpandido)
      )}

      {/* Panel lateral de edición */}
      {showPanel && diaSeleccionado && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 p-6 overflow-y-auto z-50">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Editar Día</h3>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDiaSeleccionado(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Fecha:</strong> {diaSeleccionado.dia} de {MESES[diaSeleccionado.mes]} 2026
              </p>
              <p className="text-xs text-gray-500">{diaSeleccionado.fecha}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de día
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="trabajo">Trabajo</option>
                  <option value="libre">Libre</option>
                  <option value="domingo">Domingo</option>
                  <option value="festivo">Festivo</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="baja">Baja médica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Acción especial
                </label>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                    🌴 Crear Libranza
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    📅 Agregar Evento
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                    🎉 Marcar Festivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Agregar notas para este día..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDiaSeleccionado(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
