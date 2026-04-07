'use client'

import { useState } from 'react'

export default function CalendarioPage() {
  const [currentMonth] = useState(new Date(2026, 3)) // Abril 2026

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startDayOfWeek }
  }

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentMonth)
  
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Ejemplo de días con turnos (datos de ejemplo)
  const diasConTurno: Record<number, string> = {
    1: 'trabajo', 5: 'trabajo', 6: 'libre', 7: 'domingo',
    8: 'trabajo', 12: 'trabajo', 13: 'libre', 14: 'domingo',
    15: 'trabajo', 19: 'trabajo', 20: 'libre', 21: 'domingo',
    22: 'trabajo', 26: 'trabajo', 27: 'libre', 28: 'domingo',
    29: 'trabajo', 30: 'trabajo'
  }

  const getDayColor = (tipo: string) => {
    const colors: Record<string, string> = {
      trabajo: 'bg-white border-gray-300',
      libre: 'bg-green-100 border-green-300',
      domingo: 'bg-red-100 border-red-300',
      festivo: 'bg-purple-100 border-purple-300'
    }
    return colors[tipo] || 'bg-gray-50 border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 capitalize">{monthName}</h1>
          <p className="text-gray-600">Calendario de turnos</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            ‹ Anterior
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Siguiente ›
          </button>
        </div>
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

      {/* Calendario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {days.map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {/* Espacios vacíos antes del primer día */}
          {Array.from({ length: startDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {/* Días del mes */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const tipo = diasConTurno[day] || 'trabajo'
            
            return (
              <div
                key={day}
                className={`aspect-square border-2 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer ${getDayColor(tipo)}`}
              >
                <div className="font-semibold text-gray-800">{day}</div>
                {tipo === 'trabajo' && (
                  <div className="text-xs text-gray-500 mt-1">M-T</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📅</div>
          <div>
            <h3 className="font-semibold text-sky-900">Fase 5 Completada</h3>
            <p className="text-sm text-sky-700 mt-1">
              Calendario mensual con visualización de turnos.
              Colores: Blanco (trabajo), Verde (libre), Rojo (domingo), Morado (festivo).
              Los datos son de ejemplo. En la siguiente fase agregaremos funcionalidad de navegación y edición.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
