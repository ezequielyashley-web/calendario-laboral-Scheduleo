"use client"
import InfoPanel from "@/components/InfoPanel"

import { useState } from "react"

const reportes = {
  asistencia: {
    label: 'Asistencia',
    metricas: [
      { label:'Asistencia promedio', valor:'94.5%', tendencia:'+2.3%', up:true,  color:'#16a34a' },
      { label:'Ausencias',           valor:'5.5%',  tendencia:'-1.2%', up:false, color:'#b91c1c' },
      { label:'Llegadas tarde',      valor:'3.2%',  tendencia:'-0.8%', up:false, color:'#d97706' },
    ]
  },
  vacaciones: {
    label: 'Vacaciones',
    metricas: [
      { label:'Días aprobados',  valor:'248', tendencia:'+12', up:true,  color:'#16a34a' },
      { label:'Días pendientes', valor:'45',  tendencia:'-8',  up:false, color:'#d97706' },
      { label:'Días rechazados', valor:'3',   tendencia:'0',   up:false, color:'#b91c1c' },
    ]
  },
  fichajes: {
    label: 'Fichajes',
    metricas: [
      { label:'Fichajes correctos', valor:'96.8%', tendencia:'+1.5%', up:true,  color:'#16a34a' },
      { label:'Fichajes tardíos',   valor:'2.1%',  tendencia:'-0.5%', up:false, color:'#d97706' },
      { label:'Sin fichar',         valor:'1.1%',  tendencia:'-0.3%', up:false, color:'#b91c1c' },
    ]
  },
  horas: {
    label: 'Horas',
    metricas: [
      { label:'Horas trabajadas',      valor:'5.440h', tendencia:'+120h', up:true, color:'#16a34a' },
      { label:'Horas extra',           valor:'248h',   tendencia:'+32h',  up:true, color:'#d97706' },
      { label:'Promedio/empleado',     valor:'80h',    tendencia:'+2h',   up:true, color:'#6366f1' },
    ]
  },
}

const barras = [
  { dia:'L', pct:85, emp:58 }, { dia:'M', pct:92, emp:63 }, { dia:'X', pct:88, emp:60 },
  { dia:'J', pct:95, emp:65 }, { dia:'V', pct:90, emp:61 }, { dia:'S', pct:87, emp:59 },
  { dia:'D', pct:20, emp:14, danger:true },
]

const grupos = [
  { nombre:'G1A', empleados:12, color:'#6366f1' }, { nombre:'G1B', empleados:11, color:'#4f46e5' },
  { nombre:'G2A', empleados:11, color:'#0891b2' }, { nombre:'G2B', empleados:12, color:'#0e7490' },
  { nombre:'G3A', empleados:11, color:'#6366f1' }, { nombre:'G3B', empleados:11, color:'#4f46e5' },
]

const empleados = [
  { nombre:'Juan Pérez',    grupo:'G1A', asistencia:98, horas:168, estado:'Excelente' },
  { nombre:'María García',  grupo:'G2A', asistencia:95, horas:164, estado:'Muy bien'  },
  { nombre:'Carlos López',  grupo:'G1B', asistencia:92, horas:160, estado:'Bien'      },
  { nombre:'Ana Martínez',  grupo:'G2B', asistencia:88, horas:156, estado:'Regular'   },
]

const rangos = ['semana','mes','trimestre','año']
const sedes  = ['Todas las sedes','Madrid Centro','Vallecas']

const estadoColor: Record<string,string> = { Excelente:'#16a34a', 'Muy bien':'#6366f1', Bien:'#d97706', Regular:'#b91c1c' }
const grupoColorMap: Record<string,string> = { G1A:'#6366f1', G1B:'#4f46e5', G2A:'#0891b2', G2B:'#0e7490', G3A:'#6366f1', G3B:'#4f46e5' }

function Card({ children, style={}, hoverable=true }: { children:React.ReactNode, style?:React.CSSProperties, hoverable?:boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => hoverable && setHov(true)}
      onMouseLeave={() => hoverable && setHov(false)}
      style={{
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6,
        boxShadow: hov ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hov ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
        transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function ReportesDesktop() {
  const [tipo, setTipo]   = useState<keyof typeof reportes>('asistencia')
  const [rango, setRango] = useState('mes')
  const [sede, setSede]   = useState('Todas las sedes')
  const [barHov, setBarHov] = useState<number|null>(null)

  const reporte = reportes[tipo]

  return (
    <div className="space-y-5">
      {!modoDemo && (
        <div style={{ padding:"10px 16px", background:"#fef9c3", border:"1px solid #fde68a", borderRadius:8, display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#854d0e" }}>
          <span>⚠️</span>
          <span><strong>Modo real activo</strong> — Los reportes muestran datos de ejemplo. Proximamente se conectaran a datos reales.</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <InfoPanel titulo="Como usar Reportes" color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" items={[
          { icon: "📊", titulo: "Tipos de reporte", desc: "Selecciona entre Asistencia, Horas extra, Vacaciones o Incidencias para ver el reporte correspondiente." },
          { icon: "📅", titulo: "Rango de fechas", desc: "Filtra por dia, semana, mes o año para acotar los datos que necesitas analizar." },
          { icon: "🏢", titulo: "Filtro por sede", desc: "Si tienes varias sedes puedes ver los datos de cada una por separado." },
          { icon: "📤", titulo: "Exportar", desc: "Exporta cualquier reporte en CSV o PDF para compartirlo o guardarlo." },
          { icon: "📈", titulo: "Graficos", desc: "Los reportes incluyen graficos visuales para identificar tendencias rapidamente." },
        ]} />
      </div>
      {/* Controles */}
      <Card hoverable={false} style={{ padding:16 }}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

          {/* Tabs tipo */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {(Object.keys(reportes) as (keyof typeof reportes)[]).map(t => (
              <button key={t} onClick={() => setTipo(t)}
                style={{
                  padding:'6px 16px', fontSize:12, fontWeight:600, borderRadius:4,
                  transition:'all .15s',
                  background: tipo===t ? 'var(--accent)' : 'var(--surface-2)',
                  color:      tipo===t ? '#fff' : 'var(--text-secondary)',
                  border:     `1px solid ${tipo===t ? 'var(--accent)' : 'var(--border-strong)'}`,
                }}
              >
                {reportes[t].label}
              </button>
            ))}
          </div>

          {/* Filtros */}
          <div style={{ display:'flex', gap:8 }}>
            <select className="input-base text-xs py-1.5 px-2 w-auto" value={rango} onChange={e => setRango(e.target.value)}>
              {rangos.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
            <select className="input-base text-xs py-1.5 px-2 w-auto" value={sede} onChange={e => setSede(e.target.value)}>
              {sedes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn-primary text-xs px-4 py-1.5">Exportar PDF</button>
          </div>
        </div>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reporte.metricas.map((m, i) => {
          const [hov, setHov] = useState(false)
          return (
            <div key={i}
              onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              style={{
                background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:20,
                boxShadow: hov ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                transform: hov ? 'scale(1.04) translateY(-3px)' : 'scale(1) translateY(0)',
                transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease',
                borderLeft: `3px solid ${m.color}`,
              }}
            >
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>{m.label}</p>
              <p style={{ fontSize:30, fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>{m.valor}</p>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:8, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, background: m.up?'#dcfce7':'#fee2e2', color: m.up?'#15803d':'#b91c1c' }}>
                {m.up ? '↑' : '↓'} {m.tendencia}
              </span>
            </div>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Barras */}
        <Card style={{ padding:20 }}>
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Asistencia semanal</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Porcentaje por día</p>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:160 }}>
            {barras.map((d, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}
                onMouseEnter={() => setBarHov(i)} onMouseLeave={() => setBarHov(null)}>
                {barHov===i && (
                  <div style={{ fontSize:10, fontWeight:600, padding:'2px 5px', borderRadius:3, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                    {d.emp}
                  </div>
                )}
                <div style={{ width:'100%', borderRadius:'3px 3px 0 0', background: d.danger?'#ef4444':barHov===i?'#4f46e5':'#6366f1', height:`${d.pct}%`, opacity: barHov!==null&&barHov!==i?0.5:1, transition:'all .15s' }} />
                <span style={{ fontSize:10, color:'var(--text-muted)' }}>{d.dia}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Grupos */}
        <Card style={{ padding:20 }}>
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Distribución por grupo</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Empleados activos</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {grupos.map((g, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8, height:8, background:g.color, borderRadius:2 }} />
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{g.nombre}</span>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{g.empleados}/12</span>
                </div>
                <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(g.empleados/12)*100}%`, background:g.color, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabla */}
      <Card hoverable={false} style={{ overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Detalle por empleado</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Rendimiento del periodo seleccionado</p>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface-2)' }}>
                {['Empleado','Grupo','Asistencia','Horas','Estado'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleados.map((e, i) => {
                const [rowHov, setRowHov] = useState(false)
                return (
                  <tr key={i} onMouseEnter={() => setRowHov(true)} onMouseLeave={() => setRowHov(false)}
                    style={{ background: rowHov?'var(--surface-2)':'transparent', transition:'background .15s', borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{e.nombre}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:grupoColorMap[e.grupo], borderRadius:3, padding:'2px 8px' }}>{e.grupo}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-primary)' }}>{e.asistencia}%</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-primary)' }}>{e.horas}h</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:estadoColor[e.estado], background:estadoColor[e.estado]+'18', borderRadius:3, padding:'2px 8px' }}>{e.estado}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
