"use client"

import { useState } from "react"

const TrendUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)
const TrendDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>
)
const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const asistencia = [
  { dia:'L', pct:85, emp:58 }, { dia:'M', pct:92, emp:63 }, { dia:'X', pct:88, emp:60 },
  { dia:'J', pct:95, emp:65 }, { dia:'V', pct:90, emp:61 }, { dia:'S', pct:87, emp:59 },
  { dia:'D', pct:20, emp:14, danger:true },
]

const grupos = [
  { nombre:'G1A', empleados:12, total:12, color:'#0284c7' },
  { nombre:'G1B', empleados:11, total:12, color:'#0369a1' },
  { nombre:'G2A', empleados:11, total:12, color:'#0891b2' },
  { nombre:'G2B', empleados:12, total:12, color:'#0e7490' },
  { nombre:'G3A', empleados:11, total:12, color:'#6366f1' },
  { nombre:'G3B', empleados:11, total:12, color:'#4f46e5' },
]

const actividades = [
  { accion:'Solicitud vacaciones enviada',  usuario:'Juan Pérez',   tiempo:'5 min',  tipo:'info'    },
  { accion:'Cambio de turno aprobado',      usuario:'María García', tiempo:'15 min', tipo:'success' },
  { accion:'Fichaje de entrada registrado', usuario:'Carlos López', tiempo:'30 min', tipo:'neutral' },
  { accion:'Baja médica registrada',        usuario:'Ana Martínez', tiempo:'1 h',    tipo:'warning' },
]

const tipoColor: Record<string,string> = { info:'#0284c7', success:'#16a34a', neutral:'#64748b', warning:'#d97706' }

// ── Hover card helper ─────────────────────────────────────────
function HoverCard({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        boxShadow: hov ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hov ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
        transition: 'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── MetricCard ────────────────────────────────────────────────
function MetricCard({ title, value, trend, trendUp, icon, accent }:
  { title:string, value:string|number, trend:string, trendUp:boolean, icon:React.ReactNode, accent:string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
        padding: '20px', display: 'flex', flexDirection: 'column', gap: 16,
        boxShadow: hov ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hov ? 'scale(1.04) translateY(-3px)' : 'scale(1) translateY(0)',
        transition: 'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, background:`${accent}18`, color:accent, borderRadius:4 }}>
          {icon}
        </div>
        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, background: trendUp?'#dcfce7':'#fee2e2', color: trendUp?'#15803d':'#b91c1c' }}>
          {trendUp ? <TrendUpIcon/> : <TrendDownIcon/>} {trend}
        </span>
      </div>
      <div>
        <p style={{ fontSize:26, fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{title}</p>
      </div>
      <div style={{ height:2, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:'65%', background:accent, borderRadius:2 }} />
      </div>
    </div>
  )
}

export default function DashboardDesktop() {
  const [hovered, setHovered] = useState<number|null>(null)

  return (
    <div className="space-y-5">

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Empleados activos" value={68}      trend="+3%" trendUp icon={<PeopleIcon/>} accent="#0284c7"/>
        <MetricCard title="En vacaciones"      value={12}      trend="-2%" trendUp={false} icon={<SunIcon/>}   accent="#0891b2"/>
        <MetricCard title="Pendientes"         value={5}       trend="+1"  trendUp={false} icon={<AlertIcon/>} accent="#d97706"/>
        <MetricCard title="Horas este mes"     value="5.440"   trend="+5%" trendUp icon={<ClockIcon/>} accent="#16a34a"/>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Asistencia */}
        <HoverCard style={{ padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Asistencia semanal</p>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Porcentaje diario</p>
            </div>
            <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, background:'#dbeafe', color:'#1d4ed8' }}>Esta semana</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:160 }}>
            {asistencia.map((d, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end', cursor:'pointer' }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                {hovered === i && (
                  <div style={{ fontSize:10, fontWeight:600, padding:'2px 6px', borderRadius:3, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                    {d.emp} emp
                  </div>
                )}
                <div style={{ width:'100%', borderRadius:'3px 3px 0 0', transition:'all .15s', background: d.danger?'#ef4444': hovered===i?'#0369a1':'#0284c7', height:`${d.pct}%`, opacity: hovered!==null&&hovered!==i?0.5:1 }} />
                <span style={{ fontSize:10, fontWeight:500, color:'var(--text-muted)' }}>{d.dia}</span>
              </div>
            ))}
          </div>
        </HoverCard>

        {/* Distribución */}
        <HoverCard style={{ padding:20 }}>
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Distribución por turno</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Empleados por grupo</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {grupos.map((g, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8, height:8, background:g.color, borderRadius:2, flexShrink:0 }} />
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{g.nombre}</span>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{g.empleados}/{g.total}</span>
                </div>
                <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(g.empleados/g.total)*100}%`, background:g.color, borderRadius:3, transition:'width .5s ease' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)', marginTop:16, paddingTop:12, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>Total</span>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{grupos.reduce((s,g)=>s+g.empleados,0)}</span>
          </div>
        </HoverCard>
      </div>

      {/* Actividad reciente */}
      <HoverCard style={{ padding:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Actividad reciente</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Últimas acciones registradas</p>
          </div>
          <button className="btn-secondary" style={{ fontSize:11, padding:'4px 12px' }}>Ver todo</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {actividades.map((a, i) => {
            const [rowHov, setRowHov] = useState(false)
            return (
              <div key={i} onMouseEnter={() => setRowHov(true)} onMouseLeave={() => setRowHov(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:4, background: rowHov?'var(--surface-2)':'transparent', transition:'background .15s', cursor:'default' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:tipoColor[a.tipo], flexShrink:0 }} />
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.accion}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{a.usuario}</p>
                  </div>
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0, marginLeft:12 }}>{a.tiempo}</span>
              </div>
            )
          })}
        </div>
      </HoverCard>
    </div>
  )
}
