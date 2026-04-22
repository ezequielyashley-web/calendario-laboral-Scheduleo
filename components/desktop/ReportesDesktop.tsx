"use client"

import { useState } from "react"

export default function ReportesDesktop() {
  const [tipoReporte, setTipoReporte] = useState("asistencia")
  const [periodo, setPeriodo] = useState("mes")

  return (
    <div className="space-y-6">
      {/* Generador de reportes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-4">Generar Reporte</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Reporte</label>
            <select className="w-full px-4 py-2 border rounded-lg" value={tipoReporte} onChange={e => setTipoReporte(e.target.value)}>
              <option value="asistencia">Asistencia</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="horas">Horas trabajadas</option>
              <option value="fichajes">Fichajes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Período</label>
            <select className="w-full px-4 py-2 border rounded-lg" value={periodo} onChange={e => setPeriodo(e.target.value)}>
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
              <option value="trimestre">Último trimestre</option>
              <option value="ano">Último año</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
              📊 Generar
            </button>
          </div>
        </div>
      </div>

      {/* Preview del reporte */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Reporte de Asistencia - Último Mes</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">📥 Exportar Excel</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">📄 Exportar PDF</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Empleado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Días trabajados</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Horas totales</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Ausencias</th>
                <th className="px-4 py-3 text-left text-sm font-medium">% Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nombre: "Juan Pérez", dias: 22, horas: 176, ausencias: 0, asistencia: 100 },
                { nombre: "María García", dias: 20, horas: 160, ausencias: 2, asistencia: 91 },
                { nombre: "Carlos López", dias: 22, horas: 176, ausencias: 0, asistencia: 100 },
              ].map((emp, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{emp.nombre}</td>
                  <td className="px-4 py-3">{emp.dias}</td>
                  <td className="px-4 py-3">{emp.horas}h</td>
                  <td className="px-4 py-3">{emp.ausencias}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      emp.asistencia === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {emp.asistencia}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico resumen */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-4">Evolución Mensual</h3>
        <div className="h-64 flex items-end justify-around gap-4">
          {[
            { mes: "Ene", valor: 95 },
            { mes: "Feb", valor: 92 },
            { mes: "Mar", valor: 97 },
            { mes: "Abr", valor: 94 },
          ].map((dato, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="text-sm font-bold mb-1">{dato.valor}%</div>
              <div className="w-full bg-cyan-500 rounded-t" style={{ height: `${dato.valor}%` }}></div>
              <span className="text-sm mt-2">{dato.mes}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
