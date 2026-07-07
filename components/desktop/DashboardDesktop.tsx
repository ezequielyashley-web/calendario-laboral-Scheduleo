"use client"

import InspectorBanner from "@/components/desktop/InspectorBanner"
import { useState, useEffect } from "react"

const kpis = [
  { label:"Empleados activos", trend:"",   up:true,  color:"#6366f1", bg:"#ede9fe", icon:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { label:"En vacaciones",     trend:"",   up:false, color:"#ec4899", bg:"#fce7f3", icon:"M18 3a3 3 0 0 0-3 3l-7 3a3 3 0 0 0 0 6l7 3a3 3 0 1 0 3-3l-7-3 7-3A3 3 0 0 0 18 3z" },
  { label:"Solicitudes",       trend:"",   up:false, color:"#d97706", bg:"#fef9c3", icon:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
  { label:"Horas este mes",    trend:"",   up:true,  color:"#fff",    bg:"linear-gradient(135deg,#6366f1,#8b5cf6)", gradient:true, icon:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" },
]

const asistencia = [
  { dia:'L', pct:0 }, { dia:'M', pct:0 }, { dia:'X', pct:0 },
  { dia:'J', pct:0 }, { dia:'V', pct:0 }, { dia:'S', pct:0 },
  { dia:'D', pct:0, danger:true },
]

const grupos = [
  { nombre:'G1A', empleados:0, total:12, color:'#6366f1' },
  { nombre:'G1B', empleados:0, total:12, color:'#4f46e5' },
  { nombre:'G2A', empleados:0, total:12, color:'#8b5cf6' },
  { nombre:'G2B', empleados:0, total:12, color:'#a78bfa' },
  { nombre:'G3A', empleados:0, total:12, color:'#c4b5fd' },
  { nombre:'G3B', empleados:0, total:12, color:'#ddd6fe' },
]

export default function DashboardDesktop() {
  const [stats, setStats] = useState({ activos:0, vacaciones:0, solicitudes:0, horas:0 })
  const [actividadReal, setActividadReal] = useState<any[]>([])
  const [gruposReal, setGruposReal] = useState(grupos)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/empleados?empresaId=empresa-001').then(r=>r.json()),
      fetch('/api/vacaciones?empresaId=empresa-001').then(r=>r.json()),
      fetch('/api/bajas?empresaId=empresa-001').then(r=>r.json()),
      fetch('/api/cambios-turno').then(r=>r.json()),
    ]).then(([emps, vacs, bajas, cambios]) => {
      const empleados = Array.isArray(emps) ? emps : []
      const vacaciones = Array.isArray(vacs) ? vacs : []
      const bajasArr = Array.isArray(bajas) ? bajas : []
      const cambiosArr = Array.isArray(cambios) ? cambios : []

      const activos = empleados.filter((e:any) => e.activo !== false).length
      const enVacaciones = vacaciones.filter((v:any) => v.estado === 'APROBADA').length
      const solicitudesPend = vacaciones.filter((v:any) => v.estado === 'PENDIENTE').length +
        cambiosArr.filter((c:any) => c.estado === 'PENDIENTE').length
      setStats({ activos, vacaciones: enVacaciones, solicitudes: solicitudesPend, horas: activos * 80 })

      const gruposActualizados = grupos.map(g => ({
        ...g,
        empleados: empleados.filter((e:any) => e.grupoTrabajo?.nombre === g.nombre || e.grupo === g.nombre).length
      }))
      setGruposReal(gruposActualizados)

      const act: any[] = []
      vacaciones.slice(0,2).forEach((v:any) => act.push({ icon:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", txt:'Solicitud vacaciones', emp:v.nombreEmpleado||v.empleado?.nombre||'Empleado', tiempo:'Reciente', color:'#6366f1', bg:'#ede9fe' }))
      cambiosArr.slice(0,1).forEach((c:any) => act.push({ icon:"M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3", txt:'Cambio de turno', emp:c.empleadoOrigen?.nombre||'Empleado', tiempo:'Reciente', color:'#16a34a', bg:'#dcfce7' }))
      bajasArr.slice(0,1).forEach((b:any) => act.push({ icon:"M22 12h-4l-3 9L9 3l-3 9H2", txt:'Baja medica', emp:b.nombreEmpleado||'Empleado', tiempo:'Reciente', color:'#d97706', bg:'#fef9c3' }))
      setActividadReal(act)
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])

  const kpisReales = [
    { ...kpis[0], valor: cargando ? '...' : stats.activos },
    { ...kpis[1], valor: cargando ? '...' : stats.vacaciones },
    { ...kpis[2], valor: cargando ? '...' : stats.solicitudes },
    { ...kpis[3], valor: cargando ? '...' : stats.horas.toLocaleString() },
  ]

  return (
    <div className="dashboard-responsive-wrap" style={{ padding:"28px 32px" }}>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-responsive-wrap { padding: 16px 14px !important; }
          .dashboard-kpis-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; margin-bottom: 16px !important; }
          .dashboard-panels-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .dashboard-activity-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <InspectorBanner />

      {/* KPIs */}
      <div className="dashboard-kpis-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:28 }}>
        {kpisReales.map((k, i) => (
          <div key={i} style={{ background:k.gradient?k.bg:"#fff", borderRadius:16, padding:28, border:k.gradient?"none":"0.5px solid #e8eaf0", boxShadow:"0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ width:54, height:54, background:k.gradient?"rgba(255,255,255,0.2)":k.bg, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={k.gradient?"#fff":k.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={k.icon}/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize:32, fontWeight:700, color:k.gradient?"#fff":"#111827", marginBottom:6, letterSpacing:"-0.5px" }}>{k.valor}</div>
            <div style={{ fontSize:13, fontWeight:500, color:k.gradient?"rgba(255,255,255,0.8)":"#6B7280" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Asistencia + Grupos */}
      <div className="dashboard-panels-grid" style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16, marginBottom:16 }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, border:"0.5px solid #e8eaf0", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:500, color:"#1e1b4b" }}>Asistencia semanal</div>
            <span style={{ fontSize:11, color:"#6366f1", background:"#ede9fe", padding:"4px 10px", borderRadius:20 }}>Esta semana</span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:120 }}>
            {asistencia.map((d, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ width:"100%", background:"#f0f4ff", height:"100%", borderRadius:"8px 8px 0 0", display:"flex", alignItems:"flex-end" }}>
                  <div style={{ width:"100%", background:d.danger?"#fca5a5":"#c7d2fe", height:d.pct+"%", borderRadius:"6px 6px 0 0" }}/>
                </div>
                <span style={{ fontSize:11, color:"#a0aec0" }}>{d.dia}</span>
              </div>
            ))}
          </div>
          {!cargando && stats.activos === 0 && (
            <div style={{ textAlign:"center", color:"#a0aec0", fontSize:12, marginTop:12 }}>Sin datos de asistencia</div>
          )}
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:20, border:"0.5px solid #e8eaf0", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:14, fontWeight:500, color:"#1e1b4b", marginBottom:16 }}>Distribucion por turno</div>
          {gruposReal.map((g, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:12, color:"#718096", width:32 }}>{g.nombre}</span>
              <div style={{ flex:1, background:"#f0f4ff", borderRadius:4, height:6 }}>
                <div style={{ width:(g.empleados/g.total*100)+"%", background:g.color, height:6, borderRadius:4 }}/>
              </div>
              <span style={{ fontSize:12, color:"#718096", width:36, textAlign:"right" }}>{g.empleados}/{g.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ background:"#fff", borderRadius:16, padding:20, border:"0.5px solid #e8eaf0", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:14, fontWeight:500, color:"#1e1b4b", marginBottom:16 }}>Actividad reciente</div>
        {actividadReal.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 0", color:"#a0aec0", fontSize:13 }}>
            No hay actividad reciente
          </div>
        ) : (
          <div className="dashboard-activity-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
            {actividadReal.map((a:any, i:number) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#f8f9ff", borderRadius:10 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:a.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={a.icon}/>
                  </svg>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"#1e1b4b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.txt}</div>
                  <div style={{ fontSize:11, color:"#a0aec0" }}>{a.emp} · {a.tiempo}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
