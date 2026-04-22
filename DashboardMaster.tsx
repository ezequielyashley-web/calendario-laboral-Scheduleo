'use client'

// SCHEDULEO - DASHBOARD MASTER (SESIÓN 2)
// KPIs + Gráficos con Chart.js

import { useEffect, useState } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DashboardStats {
  totalEmpleados: number
  empleadosActivos: number
  vacacionesPendientes: number
  fichajesHoy: number
}

export default function DashboardMaster() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmpleados: 80,
    empleadosActivos: 78,
    vacacionesPendientes: 5,
    fichajesHoy: 65
  })

  // Datos para gráfico de líneas (Fichajes últimos 7 días)
  const fichajesData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Fichajes',
        data: [72, 68, 75, 70, 65, 45, 12],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Datos para gráfico de barras (Empleados por sede)
  const empleadosPorSedeData = {
    labels: ['Madrid Centro', 'Vallecas'],
    datasets: [
      {
        label: 'Empleados',
        data: [45, 35],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  }

  // Datos para gráfico de dona (Distribución por grupos)
  const gruposData = {
    labels: ['G1A', 'G1B', 'G2A', 'G2B', 'G3A', 'G3B'],
    datasets: [
      {
        data: [13, 13, 13, 13, 14, 14],
        backgroundColor: [
          '#3b82f6', // G1A
          '#60a5fa', // G1B
          '#ef4444', // G2A
          '#f87171', // G2B
          '#22c55e', // G3A
          '#4ade80'  // G3B
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Empleados */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Empleados</p>
              <p className="text-4xl font-bold mt-2">{stats.totalEmpleados}</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-100">2 sedes activas</span>
          </div>
        </div>

        {/* Empleados Activos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Activos Hoy</p>
              <p className="text-4xl font-bold mt-2">{stats.empleadosActivos}</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-100">{((stats.empleadosActivos / stats.totalEmpleados) * 100).toFixed(0)}% asistencia</span>
          </div>
        </div>

        {/* Vacaciones Pendientes */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Solicitudes Pendientes</p>
              <p className="text-4xl font-bold mt-2">{stats.vacacionesPendientes}</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-100">Requieren aprobación</span>
          </div>
        </div>

        {/* Fichajes Hoy */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Fichajes Hoy</p>
              <p className="text-4xl font-bold mt-2">{stats.fichajesHoy}</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-100">Últimas 24 horas</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fichajes últimos 7 días */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Fichajes Última Semana</h3>
          <div className="h-64">
            <Line data={fichajesData} options={chartOptions} />
          </div>
        </div>

        {/* Empleados por sede */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Empleados por Sede</h3>
          <div className="h-64">
            <Bar data={empleadosPorSedeData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Distribución por grupos */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución por Grupos de Trabajo</h3>
        <div className="h-80">
          <Doughnut data={gruposData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
