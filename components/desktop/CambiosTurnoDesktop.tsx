"use client"

import { useState } from "react"

type CambioTurno = {
  id: number
  solicitante: string
  grupoSolicitante: string
  receptor: string
  grupoReceptor: string
  fechaOrigen: string
  turnoOrigen: string
  fechaDestino: string
  turnoDestino: string
  motivo: string
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'pendiente_receptor'
  fechaSolicitud: string
}

const grupoColor: Record<string,string> = {
  G1A:'#6366f1', G1B:'#4f46e5', G2A:'#0891b2',
  G2B:'#0e7490', G3A:'#6366f1', G3B:'#4f46e5',
}

const estadoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  pendiente:          { bg:'#fef9c3', color:'#854d0e', label:'Pendiente admin'   },
  pendiente_receptor: { bg:'#fed7aa', color:'#c2410c', label:'Pendiente receptor'},
  aprobado:           { bg:'#dcfce7', color:'#15803d', label:'Aprobado'          },
  rechazado:          { bg:'#fee2e2', color:'#b91c1c', label:'Rechazado'         },
}

const cambios: CambioTurno[] = [
  { id:1, solicitante:'Juan Pérez García',   grupoSolicitante:'G1A', receptor:'María García López',  grupoReceptor:'G2A', fechaOrigen:'12/05/2026', turnoOrigen:'Mañana',  fechaDestino:'14/05/2026', turnoDestino:'Tarde',  motivo:'Cita médica',        estado:'pendiente',          fechaSolicitud:'01/05/2026' },
  { id:2, solicitante:'Carlos López Martín', grupoSolicitante:'G1B', receptor:'Ana Martínez Sanz',   grupoReceptor:'G2B', fechaOrigen:'15/05/2026', turnoOrigen:'Tarde',   fechaDestino:'16/05/2026', turnoDestino:'Mañana', motivo:'Asunto familiar',    estado:'pendiente_receptor', fechaSolicitud:'30/04/2026' },
  { id:3, solicitante:'Pedro Sánchez Ruiz',  grupoSolicitante:'G3A', receptor:'Laura Torres Vega',   grupoReceptor:'G3B', fechaOrigen:'10/05/2026', turnoOrigen:'Noche',   fechaDestino:'11/05/2026', turnoDestino:'Mañana', motivo:'Compromiso personal',estado:'aprobado',           fechaSolicitud:'28/04/2026' },
  { id:4, solicitante:'Laura Torres Vega',   grupoSolicitante:'G3B', receptor:'Juan Pérez García',   grupoReceptor:'G1A', fechaOrigen:'20/05/2026', turnoOrigen:'Mañana',  fechaDestino:'21/05/2026', turnoDestino:'Tarde',  motivo:'Viaje',              estado:'rechazado',          fechaSolicitud:'25/04/2026' },
  { id:5, solicitante:'Ana Martínez Sanz',   grupoSolicitante:'G2B', receptor:'Carlos López Martín', grupoReceptor:'G1B', fechaOrigen:'18/05/2026', turnoOrigen:'Tarde',   fechaDestino:'19/05/2026', turnoDestino:'Noche',  motivo:'Formación externa',  estado:'pendiente',          fechaSolicitud:'29/04/2026' },
]

function Avatar({ nombre, size=28 }: { nombre:string, size?:number }) {
  const initials = nombre.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
  const colors   = ['#6366f1','#4f46e5','#6366f1','#0891b2','#d97706','#16a34a']
  const color    = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:4, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontSize:size*0.36, fontWeight:700 }}>
      {initials}
    </div>
  )
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

export default function CambiosTurnoDesktop() {
  const [filtroEstado, setFiltroEstado] = useState<'todos'|'pendiente'|'pendiente_receptor'|'aprobado'|'rechazado'>('todos')
  const [selectedCambio, setSelectedCambio] = useState<CambioTurno|null>(null)
  const [showNuevo, setShowNuevo] = useState(false)

  const lista = cambios.filter(c => filtroEstado === 'todos' || c.estado === filtroEstado)

  const stats = {
    total:     cambios.length,
    pendientes: cambios.filter(c=>c.estado==='pendiente'||c.estado==='pendiente_receptor').length,
    aprobados: cambios.filter(c=>c.estado==='aprobado').length,
    rechazados:cambios.filter(c=>c.estado==='rechazado').length,
  }

  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total solicitudes', value:stats.total,      color:'#6366f1' },
          { label:'Pendientes',        value:stats.pendientes, color:'#d97706' },
          { label:'Aprobados',         value:stats.aprobados,  color:'#16a34a' },
          { label:'Rechazados',        value:stats.rechazados, color:'#b91c1c' },
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

      {/* Filtros */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'12px 16px', boxShadow:'var(--shadow-sm)', display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
        {([
          { key:'todos',              label:'Todos'             },
          { key:'pendiente',          label:'Pend. admin'       },
          { key:'pendiente_receptor', label:'Pend. receptor'    },
          { key:'aprobado',           label:'Aprobados'         },
          { key:'rechazado',          label:'Rechazados'        },
        ] as const).map(f => (
          <button key={f.key} onClick={()=>setFiltroEstado(f.key)}
            style={{ padding:'5px 12px', fontSize:11, fontWeight:600, borderRadius:4, transition:'all .15s',
              background: filtroEstado===f.key ? 'var(--accent)' : 'var(--surface-2)',
              color:      filtroEstado===f.key ? '#fff'          : 'var(--text-secondary)',
              border:     `1px solid ${filtroEstado===f.key ? 'var(--accent)' : 'var(--border-strong)'}` }}>
            {f.label}
          </button>
        ))}
        <button onClick={()=>setShowNuevo(true)} className="btn-primary text-sm px-4 py-2 ml-auto whitespace-nowrap">
          + Nueva solicitud
        </button>
      </div>

      {/* Lista de cambios */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {lista.map(c => {
          const [hov, setHov] = useState(false)
          const es = estadoStyle[c.estado]
          return (
            <div key={c.id}
              onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
              onClick={()=>setSelectedCambio(c)}
              style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'14px 16px', cursor:'pointer',
                boxShadow:hov?'var(--shadow-md)':'var(--shadow-sm)', transform:hov?'translateY(-1px)':'translateY(0)', transition:'transform .15s ease, box-shadow .15s ease',
                borderLeft:`3px solid ${es.color}` }}>

              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>

                {/* Solicitante */}
                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:180 }}>
                  <Avatar nombre={c.solicitante} size={32} />
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{c.solicitante}</p>
                    <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:grupoColor[c.grupoSolicitante], borderRadius:2, padding:'1px 6px' }}>{c.grupoSolicitante}</span>
                  </div>
                </div>

                {/* Turno origen */}
                <div style={{ textAlign:'center', minWidth:100 }}>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:2 }}>{c.fechaOrigen}</p>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:3, padding:'2px 8px' }}>{c.turnoOrigen}</span>
                </div>

                {/* Flecha */}
                <div style={{ color:'var(--text-muted)', display:'flex', alignItems:'center' }}>
                  <ArrowIcon/>
                </div>

                {/* Turno destino */}
                <div style={{ textAlign:'center', minWidth:100 }}>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:2 }}>{c.fechaDestino}</p>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:3, padding:'2px 8px' }}>{c.turnoDestino}</span>
                </div>

                {/* Flecha */}
                <div style={{ color:'var(--text-muted)', display:'flex', alignItems:'center' }}>
                  <ArrowIcon/>
                </div>

                {/* Receptor */}
                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:180 }}>
                  <Avatar nombre={c.receptor} size={32} />
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{c.receptor}</p>
                    <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:grupoColor[c.grupoReceptor], borderRadius:2, padding:'1px 6px' }}>{c.grupoReceptor}</span>
                  </div>
                </div>

                {/* Separador */}
                <div style={{ flex:1 }} />

                {/* Estado + fecha */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:es.color, background:es.bg, borderRadius:3, padding:'2px 8px', display:'inline-block', marginBottom:4 }}>{es.label}</span>
                  <p style={{ fontSize:10, color:'var(--text-muted)' }}>Solicitado {c.fechaSolicitud}</p>
                </div>

                {/* Acciones rápidas pendientes */}
                {(c.estado==='pendiente'||c.estado==='pendiente_receptor') && (
                  <div style={{ display:'flex', gap:4, flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                    <button style={{ padding:'4px 10px', fontSize:11, fontWeight:600, borderRadius:3, background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', cursor:'pointer' }}>✓</button>
                    <button style={{ padding:'4px 10px', fontSize:11, fontWeight:600, borderRadius:3, background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', cursor:'pointer' }}>✗</button>
                  </div>
                )}
              </div>

              {/* Motivo */}
              <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                  <span style={{ fontWeight:600 }}>Motivo:</span> {c.motivo}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal detalle */}
      {selectedCambio && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e=>{ if(e.target===e.currentTarget) setSelectedCambio(null) }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:520 }}>

            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Detalle del cambio de turno</p>
              <button onClick={()=>setSelectedCambio(null)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>

            <div style={{ padding:20 }} className="space-y-4">
              {/* Participantes */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'center' }}>
                <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4, padding:'12px 14px', textAlign:'center' }}>
                  <Avatar nombre={selectedCambio.solicitante} size={40} />
                  <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', marginTop:8 }}>{selectedCambio.solicitante}</p>
                  <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:grupoColor[selectedCambio.grupoSolicitante], borderRadius:2, padding:'1px 8px' }}>{selectedCambio.grupoSolicitante}</span>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>{selectedCambio.fechaOrigen}</p>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{selectedCambio.turnoOrigen}</span>
                </div>

                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, color:'var(--text-muted)' }}>
                  <ArrowIcon/>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>cambia con</span>
                  <div style={{ transform:'rotate(180deg)' }}><ArrowIcon/></div>
                </div>

                <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4, padding:'12px 14px', textAlign:'center' }}>
                  <Avatar nombre={selectedCambio.receptor} size={40} />
                  <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', marginTop:8 }}>{selectedCambio.receptor}</p>
                  <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:grupoColor[selectedCambio.grupoReceptor], borderRadius:2, padding:'1px 8px' }}>{selectedCambio.grupoReceptor}</span>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>{selectedCambio.fechaDestino}</p>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{selectedCambio.turnoDestino}</span>
                </div>
              </div>

              {/* Detalles */}
              {[
                { label:'Motivo',            value:selectedCambio.motivo          },
                { label:'Estado',            value:estadoStyle[selectedCambio.estado].label },
                { label:'Fecha solicitud',   value:selectedCambio.fechaSolicitud  },
              ].map(d=>(
                <div key={d.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{d.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{d.value}</span>
                </div>
              ))}

              {/* Acciones */}
              <div style={{ display:'flex', gap:8, paddingTop:4 }}>
                <button onClick={()=>setSelectedCambio(null)} className="btn-secondary flex-1 py-2 text-sm">Cerrar</button>
                {(selectedCambio.estado==='pendiente'||selectedCambio.estado==='pendiente_receptor') && (
                  <>
                    <button style={{ flex:1, padding:'8px', fontSize:12, fontWeight:600, background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', borderRadius:4, cursor:'pointer' }}>Aprobar</button>
                    <button style={{ flex:1, padding:'8px', fontSize:12, fontWeight:600, background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', borderRadius:4, cursor:'pointer' }}>Rechazar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva solicitud */}
      {showNuevo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowNuevo(false) }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:480 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Nueva solicitud de cambio</p>
              <button onClick={()=>setShowNuevo(false)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding:20 }} className="space-y-4">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Solicitante</label>
                  <select className="input-base text-sm">
                    <option>Seleccionar...</option>
                    {cambios.map(c=>c.solicitante).filter((v,i,a)=>a.indexOf(v)===i).map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Receptor</label>
                  <select className="input-base text-sm">
                    <option>Seleccionar...</option>
                    {cambios.map(c=>c.receptor).filter((v,i,a)=>a.indexOf(v)===i).map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Fecha origen</label>
                  <input type="date" className="input-base text-sm" />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Turno origen</label>
                  <select className="input-base text-sm">
                    <option>Mañana</option><option>Tarde</option><option>Noche</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Fecha destino</label>
                  <input type="date" className="input-base text-sm" />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Turno destino</label>
                  <select className="input-base text-sm">
                    <option>Mañana</option><option>Tarde</option><option>Noche</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Motivo</label>
                <textarea className="input-base text-sm" rows={3} style={{ resize:'none' }} placeholder="Describe el motivo del cambio..." />
              </div>
              <div style={{ display:'flex', gap:8, paddingTop:4 }}>
                <button onClick={()=>setShowNuevo(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button className="btn-primary flex-1 py-2 text-sm">Enviar solicitud</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

