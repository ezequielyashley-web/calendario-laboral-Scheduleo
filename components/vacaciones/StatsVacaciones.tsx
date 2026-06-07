"use client"
import { useEffect, useState } from "react"

interface Stats {
  empleado: { nombre: string; apellidos: string }
  año: number
  vacaciones: {
    diasTotales: number
    diasAprobados: number
    diasPendientes: number
    diasDisponibles: number
  }
  asuntosPropios: {
    diasTotales: number
    diasAprobados: number
    diasPendientes: number
    diasDisponibles: number
  }
}

interface Props {
  empleadoId: string
}

export default function StatsVacaciones({ empleadoId }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!empleadoId) return
    setLoading(true)
    fetch(`/api/vacaciones/stats?empleadoId=${empleadoId}&año=${new Date().getFullYear()}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [empleadoId])

  if (loading) return (
    <div className="grid grid-cols-4 gap-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-xl h-20" />
      ))}
    </div>
  )

  if (!stats) return null

  const pctVac = Math.round((stats.vacaciones.diasAprobados / stats.vacaciones.diasTotales) * 100)
  const pctAP  = Math.round((stats.asuntosPropios.diasAprobados / stats.asuntosPropios.diasTotales) * 100)

  return (
    <div className="space-y-3">

      {/* Vacaciones normales */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vacaciones {stats.año}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total asignados', valor:stats.vacaciones.diasTotales,    color:'text-blue-700',   bg:'bg-blue-50 border-blue-100' },
          { label:'Aprobados',       valor:stats.vacaciones.diasAprobados,   color:'text-green-700',  bg:'bg-green-50 border-green-100' },
          { label:'Pendientes',      valor:stats.vacaciones.diasPendientes,  color:'text-yellow-700', bg:'bg-yellow-50 border-yellow-100' },
          { label:'Disponibles',     valor:stats.vacaciones.diasDisponibles, color:'text-purple-700', bg:'bg-purple-50 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
            <p className={`text-xs font-medium ${s.color} opacity-80`}>{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.valor}</p>
            <p className={`text-xs ${s.color} opacity-60`}>días laborables</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Uso vacaciones {stats.año}</span>
          <span>{pctVac}% usado</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width:`${Math.min(pctVac,100)}%` }} />
        </div>
      </div>

      {/* Asuntos propios */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Asuntos propios {stats.año}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total (Art.37 ET)', valor:stats.asuntosPropios.diasTotales,    color:'text-pink-700',   bg:'bg-pink-50 border-pink-100' },
          { label:'Aprobados',         valor:stats.asuntosPropios.diasAprobados,   color:'text-green-700',  bg:'bg-green-50 border-green-100' },
          { label:'Pendientes',        valor:stats.asuntosPropios.diasPendientes,  color:'text-yellow-700', bg:'bg-yellow-50 border-yellow-100' },
          { label:'Disponibles',       valor:stats.asuntosPropios.diasDisponibles, color:'text-purple-700', bg:'bg-purple-50 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
            <p className={`text-xs font-medium ${s.color} opacity-80`}>{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.valor}</p>
            <p className={`text-xs ${s.color} opacity-60`}>días</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Uso asuntos propios {stats.año}</span>
          <span>{pctAP}% usado</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-pink-400 to-pink-600 h-3 rounded-full transition-all duration-500"
            style={{ width:`${Math.min(pctAP,100)}%` }} />
        </div>
      </div>

    </div>
  )
}
