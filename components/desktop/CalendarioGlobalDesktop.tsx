"use client"

import { useState } from "react"

export default function CalendarioGlobalDesktop() {
  const [mesActual, setMesActual] = useState(new Date())
  const [vistaEmpleado, setVistaEmpleado] = useState("todos")

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
        <div className="flex gap-4">
          <button onClick={() => setMesActual(new Date(mesActual.setMonth(mesActual.getMonth() - 1)))} 
                  className="px-4 py-2 border rounded hover:bg-gray-50">
            ← Mes Anterior
          </button>
          <h3 className="text-xl font-bold px-4 py-2">
            {mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => setMesActual(new Date(mesActual.setMonth(mesActual.getMonth() + 1)))}
                  className="px-4 py-2 border rounded hover:bg-gray-50">
            Mes Siguiente →
          </button>
        </div>
        
        <select className="px-4 py-2 border rounded-lg" value={vistaEmpleado} onChange={e => setVistaEmpleado(e.target.value)}>
          <option value="todos">Todos los empleados</option>
          <option value="G1A">Solo G1A</option>
          <option value="G1B">Solo G1B</option>
          <option value="G2A">Solo G2A</option>
        </select>
      </div>

      {/* Calendario Grid */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-7 gap-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(dia => (
            <div key={dia} className="text-center font-bold py-2 bg-gray-100 rounded">
              {dia}
            </div>
          ))}
          
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="border rounded p-2 h-24 hover:bg-gray-50 cursor-pointer">
              <div className="text-sm font-bold mb-1">{i + 1}</div>
              <div className="text-xs space-y-1">
                <div className="bg-blue-100 text-blue-700 px-1 rounded">G1A: 12</div>
                <div className="bg-red-100 text-red-700 px-1 rounded">G2A: 11</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="font-bold mb-3">Leyenda</h4>
        <div className="grid grid-cols-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 rounded"></div>
            <span className="text-sm">Trabajo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-200 rounded"></div>
            <span className="text-sm">Descanso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-200 rounded"></div>
            <span className="text-sm">Vacaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-200 rounded"></div>
            <span className="text-sm">Festivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-200 rounded"></div>
            <span className="text-sm">Baja médica</span>
          </div>
        </div>
      </div>
    </div>
  )
}
