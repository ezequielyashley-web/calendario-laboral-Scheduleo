"use client"

import { useState, useEffect } from "react"

export default function DashboardDesktop() {
  const [stats, setStats] = useState({
    empleadosActivos: 0,
    enVacaciones: 0,
    pendientesAprobacion: 0,
    horasTrabajadas: 0,
  })

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-4 gap-6">
        <MetricCard
          title="Empleados Activos"
          value="68"
          icon="👥"
          color="bg-blue-500"
        />
        <MetricCard
          title="En Vacaciones"
          value="12"
          icon="🏖️"
          color="bg-green-500"
        />
        <MetricCard
          title="Pendientes"
          value="5"
          icon="⏳"
          color="bg-yellow-500"
        />
        <MetricCard
          title="Horas Mes"
          value="5,440"
          icon="⏰"
          color="bg-purple-500"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Asistencia Semanal</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {[85, 92, 88, 95, 90, 87, 0].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-cyan-500 rounded-t"
                  style={{ height: `${val}%` }}
                />
                <span className="text-sm mt-2">
                  {["L", "M", "X", "J", "V", "S", "D"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Distribución por Turno</h3>
          <div className="space-y-3">
            {[
              { grupo: "G1A (Azul)", empleados: 12, color: "bg-blue-500" },
              { grupo: "G1B (Azul)", empleados: 11, color: "bg-blue-400" },
              { grupo: "G2A (Rojo)", empleados: 11, color: "bg-red-500" },
              { grupo: "G2B (Rojo)", empleados: 12, color: "bg-red-400" },
              { grupo: "G3A (Verde)", empleados: 11, color: "bg-green-500" },
              { grupo: "G3B (Verde)", empleados: 11, color: "bg-green-400" },
            ].map((g) => (
              <div key={g.grupo}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{g.grupo}</span>
                  <span>{g.empleados} empleados</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${g.color} h-2 rounded-full`}
                    style={{ width: `${(g.empleados / 12) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {[
            { accion: "Solicitud vacaciones", usuario: "Juan Pérez", tiempo: "Hace 5 min" },
            { accion: "Cambio turno aprobado", usuario: "María García", tiempo: "Hace 15 min" },
            { accion: "Fichaje entrada", usuario: "Carlos López", tiempo: "Hace 30 min" },
          ].map((act, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">{act.accion}</p>
                <p className="text-sm text-gray-500">{act.usuario}</p>
              </div>
              <span className="text-sm text-gray-400">{act.tiempo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
