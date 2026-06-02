"use client"

import { useState } from "react"

type Fichaje = {
  id: number
  empleado: string
  grupo: string
  fecha: string
  entrada: string
  salida: string
  horas: number
  tipo: 'normal' | 'extra' | 'festivo'
  estado: 'correcto' | 'tardio' | 'sin_salida' | 'ausente'
}

const grupoColor: Record<string,string> = {
  G1A:'#0284c7', G1B:'#0369a1', G2A:'#0891b2',
  G2B:'#0e7490', G3A:'#6366f1', G3B:'#4f46e5',
}

const estadoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  correcto:   { bg:'#dcfce7', color:'#15803d', label:'Correcto'    },
  tardio:     { bg:'#fef9c3', color:'#854d0e', label:'Tardío'      },
  sin_salida: { bg:'#fee2e2', color:'#b91c1c', label:'Sin salida'  },
  ausente:    { bg:'#f1f5f9', color:'#475569', label:'Ausente'     },
}

const tipoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  normal:  { bg:'#f1f5f9', color:'#475569', label:'Normal'  },
  extra:   { bg:'#fef9c3', color:'#854d0e', label:'Extra'   },
  festivo: { bg:'#f5f3ff', color:'#6d28d9', label:'Festivo' },
}

const fichajes: Fichaje[] = [
  { id:1,  empleado:'Juan Pérez García',   grupo:'G1A', fecha:'01/05/2026', entrada:'08:02', salida:'16:05', horas:8.0, tipo:'normal',  estado:'correcto'   },
  { id:2,  empleado:'María García López',  grupo:'G2A', fecha:'01/05/2026', entrada:'08:18', salida:'16:10', horas:7.9, tipo:'festivo', estado:'tardio'     },
  { id:3,  empleado:'Carlos López Martín', grupo:'G1B', fecha:'01/05/2026', entrada:'07:55', salida:'16:00', horas:8.1, tipo:'festivo', estado:'correcto'   },
  { id:4,  empleado:'Ana Martínez Sanz',   grupo:'G2B', fecha:'01/05/2026', entrada:'',      salida:'',      horas:0,   tipo:'normal',  estado:'ausente'    },
  { id:5,  empleado:'Pedro Sánchez Ruiz',  grupo:'G3A', fecha:'01/05/2026', entrada:'08:05', salida:'',      horas:0,   tipo:'normal',  estado:'sin_salida' },
  { id:6,  empleado:'Laura Torres Vega',   grupo:'G3B', fecha:'01/05/2026', entrada:'08:00', salida:'18:30', horas:10.5,tipo:'extra',   estado:'correcto'   },
  { id:7,  empleado:'Juan Pérez García',   grupo:'G1A', fecha:'30/04/2026', entrada:'08:01', salida:'16:02', horas:8.0, tipo:'normal',  estado:'correcto'   },
  { id:8,  empleado:'María García López',  grupo:'G2A', fecha:'30/04/2026', entrada:'08:00', salida:'16:00', horas:8.0, tipo:'normal',  estado:'correcto'   },
]

const dias = ['01/05/2026','30/04/2026','29/04/2026','28/04/2026']

function Avatar({ nombre, size=30 }: { nombre:string, size?:number }) {
  const initials = nombre.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
  const colors   = ['#0284c7','#0369a1','#6366f1','#0891b2','#d97706','#16a34a']
  const color    = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:4, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontSize:size*0.36, fontWeight:700 }}>
      {initials}
    </div>
  )
}

export default function FichajesDesktop() {
  const [diaActivo, setDiaActivo]     = useState(dias[0])
  const [filterGrupo, setFilterGrupo] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showRegistrar, setShowRegistrar] = useState(false)

  const lista = fichajes.filter(f =>
    f.fecha === diaActivo &&
    (filterGrupo  === 'todos' || f.grupo  === filterGrupo) &&
    (filterEstado === 'todos' || f.estado === filterEstado)
  )

  const stats = {
    total:     lista.length,
    correctos: lista.filter(f=>f.estado==='correcto').length,
    tardios:   lista.filter(f=>f.estado==='tardio').length,
    sinSalida: lista.filter(f=>f.estado==='sin_salida').length,
    ausentes:  lista.filter(f=>f.estado==='ausente').length,
    horasTotal:lista.reduce((s,f)=>s+f.horas,0).toFixed(1),
  }

  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Correctos',  value:stats.correctos, color:'#16a34a' },
          { label:'Tardíos',    value:stats.tardios,   color:'#d97706' },
          { label:'Sin salida', value:stats.sinSalida, color:'#b91c1c' },
          { label:'Horas total',value:stats.horasTotal,color:'#0284c7' },
        ].map((k,i) => {
          const [hov, setHov] = useState(false)
          return (
            <div key={i} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
              style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'16px 20px', borderLeft:`3px solid ${k.color}`,
                boxShadow:hov?'var(--shadow-lg)':'var(--shadow-sm)', transform:hov?'scale(1.03) translateY(-2px)':'scale(1)', transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease' }}>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>{k.label}</p>
              <p style={{ fontSize:28, fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</p>
            </div>
          )
        })}
      </div>

      {/* Selector de día + filtros */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'14px 16px', boxShadow:'var(--shadow-sm)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        {/* Tabs días */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {dias.map(d => (
            <button key={d} onClick={()=>setDiaActivo(d)}
              style={{ padding:'5px 12px', fontSize:12, fontWeight:600, borderRadius:4, transition:'all .15s',
                background: diaActivo===d ? 'var(--accent)' : 'var(--surface-2)',
                color:      diaActivo===d ? '#fff'          : 'var(--text-secondary)',
                border:     `1px solid ${diaActivo===d ? 'var(--accent)' : 'var(--border-strong)'}` }}>
              {d}
            </button>
          ))}
        </div>

        <div style={{ width:1, height:24, background:'var(--border)', flexShrink:0 }} />

        <select className="input-base text-sm w-auto" value={filterGrupo} onChange={e=>setFilterGrupo(e.target.value)}>
          <option value="todos">Todos los grupos</option>
          {Object.keys(grupoColor).map(g=><option key={g} value={g}>{g}</option>)}
        </select>

        <select className="input-base text-sm w-auto" value={filterEstado} onChange={e=>setFilterEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="correcto">Correcto</option>
          <option value="tardio">Tardío</option>
          <option value="sin_salida">Sin salida</option>
          <option value="ausente">Ausente</option>
        </select>

        <button onClick={()=>setShowRegistrar(true)} className="btn-primary text-sm px-4 py-2 ml-auto whitespace-nowrap">
          + Registrar fichaje
        </button>
      </div>

      {/* Tabla fichajes */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Fichajes — {diaActivo}</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{lista.length} registros</p>
          </div>
          <button className="btn-secondary text-xs px-3 py-1.5">Exportar</button>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface-2)' }}>
                {['Empleado','Grupo','Entrada','Salida','Horas','Tipo','Estado','Acciones'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map(f => {
                const [rowHov, setRowHov] = useState(false)
                const es = estadoStyle[f.estado]
                const ts = tipoStyle[f.tipo]
                return (
                  <tr key={f.id} onMouseEnter={()=>setRowHov(true)} onMouseLeave={()=>setRowHov(false)}
                    style={{ background:rowHov?'var(--surface-2)':'transparent', transition:'background .15s', borderBottom:'1px solid var(--border)' }}>

                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar nombre={f.empleado} size={30} />
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{f.empleado}</span>
                      </div>
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:grupoColor[f.grupo], borderRadius:3, padding:'2px 8px' }}>{f.grupo}</span>
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      {f.entrada
                        ? <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{f.entrada}</span>
                        : <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>—</span>}
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      {f.salida
                        ? <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{f.salida}</span>
                        : <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>—</span>}
                    </td>

                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>
                      {f.horas > 0 ? `${f.horas}h` : '—'}
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:ts.color, background:ts.bg, borderRadius:3, padding:'2px 8px' }}>{ts.label}</span>
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:es.color, background:es.bg, borderRadius:3, padding:'2px 8px' }}>{es.label}</span>
                    </td>

                    <td style={{ padding:'12px 16px' }}>
                      <button style={{ fontSize:11, padding:'3px 10px', borderRadius:3, background:'var(--surface-2)', color:'var(--text-secondary)', border:'1px solid var(--border-strong)', fontWeight:600, cursor:'pointer', transition:'all .15s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--accent)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border-strong)'}>
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Resumen horas */}
        <div style={{ padding:'10px 20px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:16 }}>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Total horas del día:</span>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--accent)' }}>{stats.horasTotal}h</span>
        </div>
      </div>

      {/* Resumen semanal */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:20, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:16 }}>Resumen semanal por grupo</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {Object.entries(grupoColor).map(([g, color]) => {
            const horas = Math.floor(Math.random()*20)+30
            return (
              <div key={g} style={{ padding:'12px 14px', background:'var(--surface-2)', borderRadius:4, border:'1px solid var(--border)', borderLeft:`3px solid ${color}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{g}</span>
                  <span style={{ fontSize:12, fontWeight:600, color }}>{ horas}h</span>
                </div>
                <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(horas/50)*100}%`, background:color, borderRadius:2 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal registrar fichaje */}
      {showRegistrar && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowRegistrar(false) }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:440 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Registrar fichaje</p>
              <button onClick={()=>setShowRegistrar(false)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding:20 }} className="space-y-4">
              {[
                { label:'Empleado',   type:'select', opts:fichajes.map(f=>f.empleado).filter((v,i,a)=>a.indexOf(v)===i) },
                { label:'Fecha',      type:'date'   },
                { label:'Hora entrada',type:'time'  },
                { label:'Hora salida', type:'time'  },
              ].map(f=>(
                <div key={f.label}>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>{f.label}</label>
                  {f.type==='select'
                    ? <select className="input-base text-sm"><option>Seleccionar empleado...</option>{f.opts?.map(o=><option key={o}>{o}</option>)}</select>
                    : <input type={f.type} className="input-base text-sm" />
                  }
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Tipo</label>
                <div style={{ display:'flex', gap:6 }}>
                  {['Normal','Extra','Festivo'].map(t => (
                    <button key={t} style={{ flex:1, padding:'6px', fontSize:12, fontWeight:600, borderRadius:4, background:'var(--surface-2)', color:'var(--text-secondary)', border:'1px solid var(--border-strong)', cursor:'pointer' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:8, paddingTop:8 }}>
                <button onClick={()=>setShowRegistrar(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button className="btn-primary flex-1 py-2 text-sm">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
