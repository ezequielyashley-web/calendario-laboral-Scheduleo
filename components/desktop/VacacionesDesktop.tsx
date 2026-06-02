"use client"

import { useState } from "react"

type Vacacion = {
  id: number
  empleado: string
  grupo: string
  desde: string
  hasta: string
  dias: number
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  tipo: 'verano' | 'invierno' | 'libre'
}

const grupoColor: Record<string,string> = {
  G1A:'#0284c7', G1B:'#0369a1', G2A:'#0891b2', G2B:'#0e7490', G3A:'#6366f1', G3B:'#4f46e5',
}

const estadoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  pendiente:  { bg:'#fef9c3', color:'#854d0e', label:'Pendiente'  },
  aprobada:   { bg:'#dcfce7', color:'#15803d', label:'Aprobada'   },
  rechazada:  { bg:'#fee2e2', color:'#b91c1c', label:'Rechazada'  },
}

const tipoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  verano:  { bg:'#fed7aa', color:'#c2410c', label:'Verano'   },
  invierno:{ bg:'#bfdbfe', color:'#1e40af', label:'Invierno' },
  libre:   { bg:'#e9d5ff', color:'#6d28d9', label:'Libre'    },
}

const vacaciones: Vacacion[] = [
  { id:1, empleado:'Juan Pérez',    grupo:'G1A', desde:'01/07/2026', hasta:'22/07/2026', dias:22, estado:'aprobada',  tipo:'verano'  },
  { id:2, empleado:'María García',  grupo:'G2A', desde:'01/08/2026', hasta:'22/08/2026', dias:22, estado:'pendiente', tipo:'verano'  },
  { id:3, empleado:'Carlos López',  grupo:'G1B', desde:'15/12/2026', hasta:'05/01/2027', dias:8,  estado:'aprobada',  tipo:'invierno'},
  { id:4, empleado:'Ana Martínez',  grupo:'G2B', desde:'10/06/2026', hasta:'18/06/2026', dias:8,  estado:'rechazada', tipo:'libre'   },
  { id:5, empleado:'Pedro Sánchez', grupo:'G3A', desde:'01/09/2026', hasta:'22/09/2026', dias:22, estado:'pendiente', tipo:'verano'  },
  { id:6, empleado:'Laura Torres',  grupo:'G3B', desde:'23/12/2026', hasta:'31/12/2026', dias:7,  estado:'aprobada',  tipo:'invierno'},
]

function Card({ children, style={} }: { children:React.ReactNode, style?:React.CSSProperties }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow: hov?'var(--shadow-lg)':'var(--shadow-sm)', transform: hov?'scale(1.02) translateY(-2px)':'scale(1)', transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease', ...style }}>
      {children}
    </div>
  )
}

export default function VacacionesDesktop() {
  const [filtroEstado, setFiltroEstado] = useState<'todos'|'pendiente'|'aprobada'|'rechazada'>('todos')
  const [filtroGrupo, setFiltroGrupo]   = useState('todos')
  const [showModal, setShowModal]       = useState(false)
  const [selected, setSelected]         = useState<Vacacion|null>(null)

  const lista = vacaciones.filter(v =>
    (filtroEstado === 'todos' || v.estado === filtroEstado) &&
    (filtroGrupo  === 'todos' || v.grupo  === filtroGrupo)
  )

  const stats = {
    total:     vacaciones.length,
    aprobadas: vacaciones.filter(v=>v.estado==='aprobada').length,
    pendientes:vacaciones.filter(v=>v.estado==='pendiente').length,
    rechazadas:vacaciones.filter(v=>v.estado==='rechazada').length,
    diasTotal: vacaciones.filter(v=>v.estado==='aprobada').reduce((s,v)=>s+v.dias,0),
  }

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total solicitudes', value:stats.total,      color:'#0284c7', bg:'#eff6ff' },
          { label:'Aprobadas',         value:stats.aprobadas,  color:'#16a34a', bg:'#dcfce7' },
          { label:'Pendientes',        value:stats.pendientes, color:'#d97706', bg:'#fef9c3' },
          { label:'Días aprobados',    value:stats.diasTotal,  color:'#6d28d9', bg:'#f5f3ff' },
        ].map((k,i) => {
          const [hov, setHov] = useState(false)
          return (
            <div key={i} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
              style={{ background:'var(--surface)', border:`1px solid var(--border)`, borderRadius:6, padding:20, borderLeft:`3px solid ${k.color}`,
                boxShadow: hov?'var(--shadow-lg)':'var(--shadow-sm)', transform: hov?'scale(1.04) translateY(-3px)':'scale(1)', transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease' }}>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>{k.label}</p>
              <p style={{ fontSize:30, fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</p>
            </div>
          )
        })}
      </div>

      {/* Filtros + botón nueva */}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:4 }}>
          {(['todos','pendiente','aprobada','rechazada'] as const).map(e => (
            <button key={e} onClick={()=>setFiltroEstado(e)}
              style={{ padding:'5px 12px', fontSize:11, fontWeight:600, borderRadius:4, transition:'all .15s',
                background: filtroEstado===e ? 'var(--accent)' : 'var(--surface-2)',
                color:      filtroEstado===e ? '#fff' : 'var(--text-secondary)',
                border:`1px solid ${filtroEstado===e ? 'var(--accent)' : 'var(--border-strong)'}` }}>
              {e.charAt(0).toUpperCase()+e.slice(1)}
            </button>
          ))}
        </div>

        <select className="input-base text-xs py-1.5 px-2 w-auto" value={filtroGrupo} onChange={e=>setFiltroGrupo(e.target.value)}>
          <option value="todos">Todos los grupos</option>
          {Object.keys(grupoColor).map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <button onClick={()=>setShowModal(true)} className="btn-primary text-xs px-4 py-2 ml-auto">
          + Nueva solicitud
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Solicitudes de vacaciones</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{lista.length} resultado{lista.length!==1?'s':''}</p>
          </div>
          <button className="btn-secondary text-xs px-3 py-1.5">Exportar</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface-2)' }}>
                {['Empleado','Grupo','Tipo','Desde','Hasta','Días','Estado','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((v, i) => {
                const [rowHov, setRowHov] = useState(false)
                const es = estadoStyle[v.estado]
                const ts = tipoStyle[v.tipo]
                return (
                  <tr key={v.id} onMouseEnter={()=>setRowHov(true)} onMouseLeave={()=>setRowHov(false)}
                    style={{ background: rowHov?'var(--surface-2)':'transparent', transition:'background .15s', borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{v.empleado}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:grupoColor[v.grupo], borderRadius:3, padding:'2px 8px' }}>{v.grupo}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:ts.color, background:ts.bg, borderRadius:3, padding:'2px 8px' }}>{ts.label}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{v.desde}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{v.hasta}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'var(--text-primary)', textAlign:'center' }}>{v.dias}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:es.color, background:es.bg, borderRadius:3, padding:'2px 8px' }}>{es.label}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        {v.estado === 'pendiente' && (
                          <>
                            <button style={{ fontSize:11, padding:'3px 10px', borderRadius:3, background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', fontWeight:600, cursor:'pointer' }}>✓ Aprobar</button>
                            <button style={{ fontSize:11, padding:'3px 10px', borderRadius:3, background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', fontWeight:600, cursor:'pointer' }}>✗ Rechazar</button>
                          </>
                        )}
                        <button onClick={()=>{ setSelected(v); setShowModal(true) }}
                          style={{ fontSize:11, padding:'3px 10px', borderRadius:3, background:'var(--surface-2)', color:'var(--text-secondary)', border:'1px solid var(--border-strong)', fontWeight:600, cursor:'pointer' }}>Ver</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance anual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card style={{ padding:20 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:16 }}>Balance de días por grupo</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {Object.entries(grupoColor).map(([g, color]) => {
              const usados = Math.floor(Math.random()*15)+5
              const total  = 22
              return (
                <div key={g}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, background:color, borderRadius:2 }} />
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{g}</span>
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{usados}/{total} días</span>
                  </div>
                  <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(usados/total)*100}%`, background:color, borderRadius:3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card style={{ padding:20 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:16 }}>Próximas vacaciones</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {vacaciones.filter(v=>v.estado==='aprobada').slice(0,4).map((v,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'var(--surface-2)', borderRadius:4, border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:grupoColor[v.grupo], flexShrink:0 }} />
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{v.empleado}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)' }}>{v.desde} → {v.hasta}</p>
                  </div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:'#16a34a' }}>{v.dias}d</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal detalle / nueva solicitud */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.5)' }}
          onClick={e => { if(e.target===e.currentTarget){ setShowModal(false); setSelected(null) } }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:480 }}>

            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
                {selected ? 'Detalle de solicitud' : 'Nueva solicitud de vacaciones'}
              </p>
              <button onClick={()=>{ setShowModal(false); setSelected(null) }} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>

            <div style={{ padding:20 }} className="space-y-4">
              {selected ? (
                <>
                  {[
                    { label:'Empleado', value:selected.empleado },
                    { label:'Grupo',    value:selected.grupo    },
                    { label:'Tipo',     value:tipoStyle[selected.tipo].label },
                    { label:'Desde',    value:selected.desde    },
                    { label:'Hasta',    value:selected.hasta    },
                    { label:'Días',     value:String(selected.dias) },
                    { label:'Estado',   value:estadoStyle[selected.estado].label },
                  ].map(f => (
                    <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>{f.label}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{f.value}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label:'Empleado', type:'select', opts:vacaciones.map(v=>v.empleado) },
                    { label:'Tipo',     type:'select', opts:['Verano','Invierno','Libre'] },
                    { label:'Desde',    type:'date'   },
                    { label:'Hasta',    type:'date'   },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>{f.label}</label>
                      {f.type==='select'
                        ? <select className="input-base text-sm"><option>Seleccionar...</option>{f.opts?.map(o=><option key={o}>{o}</option>)}</select>
                        : <input type="date" className="input-base text-sm" />
                      }
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Observaciones</label>
                    <textarea className="input-base text-sm" rows={3} style={{ resize:'none' }} placeholder="Motivo o comentario opcional..." />
                  </div>
                </>
              )}

              <div style={{ display:'flex', gap:8, paddingTop:8 }}>
                <button onClick={()=>{ setShowModal(false); setSelected(null) }} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                {!selected && <button className="btn-primary flex-1 py-2 text-sm">Enviar solicitud</button>}
                {selected?.estado==='pendiente' && (
                  <>
                    <button style={{ flex:1, padding:'8px', fontSize:12, fontWeight:600, background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', borderRadius:4 }}>Aprobar</button>
                    <button style={{ flex:1, padding:'8px', fontSize:12, fontWeight:600, background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', borderRadius:4 }}>Rechazar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
