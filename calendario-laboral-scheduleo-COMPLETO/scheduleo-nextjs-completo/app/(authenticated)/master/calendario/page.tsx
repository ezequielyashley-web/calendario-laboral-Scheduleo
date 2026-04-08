'use client'

import { useState } from 'react'

export default function CalendarioPage() {
  const [vistaExpandida, setVistaExpandida] = useState<number | null>(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState<{ mes: number; dia: number } | null>(null)
  const [showPanel, setShowPanel] = useState(false)

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const getDaysInMonth = (mes: number) => {
    const date = new Date(2026, mes)
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startDayOfWeek }
  }

  const getDayColor = (tipo: string) => {
    const colors: Record<string, string> = {
      trabajo: 'bg-white border-gray-300 hover:border-sky-500',
      libre: 'bg-green-100 border-green-300 hover:border-green-500',
      domingo: 'bg-red-100 border-red-300 hover:border-red-500',
      festivo: 'bg-purple-100 border-purple-300 hover:border-purple-500'
    }
    return colors[tipo] || 'bg-gray-50 border-gray-200'
  }

  const handleDiaClick = (mes: number, dia: number) => {
    setDiaSeleccionado({ mes, dia })
    setShowPanel(true)
  }

  const handleGuardar = () => {
    // Aquí se guardaría el cambio en el día
    setShowPanel(false)
    setDiaSeleccionado(null)
  }

  const renderMiniCalendario = (mesIndex: number) => {
    const { daysInMonth, startDayOfWeek } = getDaysInMonth(mesIndex)
    
    return (
      <div
        onClick={() => setVistaExpandida(mesIndex)}
        className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">
          {meses[mesIndex]}
        </h3>
        <div className="grid grid-cols-7 gap-0.5">
          {/* Espacios vacíos */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="w-5 h-5"></div>
          ))}
          {/* Días */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dia = i + 1
            const esDomingo = (startDayOfWeek + i) % 7 === 0
            return (
              <div
                key={dia}
                className={`w-5 h-5 text-[10px] flex items-center justify-center rounded ${
                  esDomingo ? 'bg-red-100 text-red-800' : 'text-gray-600'
                }`}
              >
                {dia}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderCalendarioExpandido = (mesIndex: number) => {
    const { daysInMonth, startDayOfWeek } = getDaysInMonth(mesIndex)
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setVistaExpandida(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Volver a vista anual
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{meses[mesIndex]} 2026</h2>
          <div className="w-32"></div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dias.map((dia) => (
              <div key={dia} className="text-center font-semibold text-gray-600 py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dia = index + 1
              const esDomingo = (startDayOfWeek + index) % 7 === 0
              const tipo = esDomingo ? 'domingo' : 'trabajo'
              
              return (
                <button
                  key={dia}
                  onClick={() => handleDiaClick(mesIndex, dia)}
                  className={`aspect-square border-2 rounded-lg p-2 transition-all ${getDayColor(tipo)}`}
                >
                  <div className="font-semibold text-gray-800">{dia}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Contenido principal */}
      <div className={`flex-1 space-y-6 transition-all ${showPanel ? 'mr-80' : ''}`}>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendario Anual 2026</h1>
          <p className="text-gray-600">
            {vistaExpandida === null 
              ? 'Haz clic en un mes para ver los detalles' 
              : 'Haz clic en un día para editarlo'}
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300"></div>
            <span>Trabajo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300"></div>
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300"></div>
            <span>Domingo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300"></div>
            <span>Festivo</span>
          </div>
        </div>

        {/* Vista Anual o Expandida */}
        {vistaExpandida === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {meses.map((_, index) => (
              <div key={index}>{renderMiniCalendario(index)}</div>
            ))}
          </div>
        ) : (
          renderCalendarioExpandido(vistaExpandida)
        )}
      </div>

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
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Fecha:</strong> {diaSeleccionado.dia} de {meses[diaSeleccionado.mes]} 2026
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de día
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                  <option value="trabajo">Trabajo</option>
                  <option value="libre">Libre</option>
                  <option value="domingo">Domingo</option>
                  <option value="festivo">Festivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Acción especial
                </label>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm">
                    🌴 Crear Libranza
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    📅 Agregar Evento
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                    🎉 Marcar Festivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  rows={4}
                  placeholder="Agregar notas para este día..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGuardar}
                className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDiaSeleccionado(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
