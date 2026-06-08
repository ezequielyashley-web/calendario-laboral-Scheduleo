"use client"
import CalendarioAsuntosPropios from "@/components/vacaciones/CalendarioAsuntosPropios"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

function Avatar({ nombre, size = 36 }: { nombre: string, size?: number }) {
  const initials = nombre.split(' ').slice(0,2).map((n:string)=>n[0]).join('').toUpperCase()
  const colors   = ['\#7c3aed','\#6d28d9','\#5b21b6','\#4c1d95','\#7c3aed','\#6d28d9']
  const color    = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontSize:size*0.36, fontWeight:700, letterSpacing:0.5 }}>
      {initials}
    </div>
  )
}

type Vacacion = {
  id: string
  empleadoId: string
  empleado: {
    id: string
    nombre: string
    apellidos: string
    numeroEmpleado: string
    diasVacaciones: number
    diasAsuntosPropios: number
    grupoTrabajo?: { nombre: string; color: string }
  }
  fechaInicio: string
  fechaFin: string
  diasTotales: number
  estado: string
  tipo: string
  observaciones?: string
  createdAt: string
}

const estadoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  PENDIENTE: { bg:'#fef9c3', color:'#854d0e', label:'Pendiente' },
  APROBADA:  { bg:'#dcfce7', color:'#15803d', label:'Aprobada'  },
  RECHAZADA: { bg:'#fee2e2', color:'#b91c1c', label:'Rechazada' },
  CANCELADA: { bg:'#f3f4f6', color:'#6b7280', label:'Cancelada' },
}

const tipoStyle: Record<string,{ bg:string, color:string, label:string, emoji:string }> = {
  VERANO:          { bg:'#fed7aa', color:'#c2410c', label:'Verano',          emoji:'☀️' },
  INVIERNO:        { bg:'#bfdbfe', color:'#1e40af', label:'Invierno',        emoji:'❄️' },
  MES_COMPLETO:    { bg:'#e9d5ff', color:'#6d28d9', label:'Mes completo',    emoji:'📅' },
  LIBRE_ELECCION:  { bg:'#d1fae5', color:'#065f46', label:'Libre elección',  emoji:'🗓️' },
  ASUNTOS_PROPIOS: { bg:'#fce7f3', color:'#9d174d', label:'Asuntos propios', emoji:'📋' },
}

export default function VacacionesDesktop() {
  const router = useRouter()
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('TODAS')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroAño, setFiltroAño] = useState(new Date().getFullYear().toString())
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast] = useState<{ msg:string; tipo:'ok'|'error' } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCalendarioAP, setShowCalendarioAP] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<any>(null)
  const [empleados, setEmpleados] = useState<any[]>([])
  const [form, setForm] = useState({ empleadoId:'', fechaInicio:'', fechaFin:'', tipo:'LIBRE_ELECCION', observaciones:'' })
  const [loadingForm, setLoadingForm] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const mostrarToast = (msg:string, tipo:'ok'|'error') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const cargar = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== 'TODAS') params.set('estado', filtroEstado)
      if (filtroTipo !== 'TODOS') params.set('tipo', filtroTipo)
      params.set('año', filtroAño)
      const res = await fetch(`/api/vacaciones?${params}`)
      const data = await res.json()
      setVacaciones(Array.isArray(data) ? data : [])
    } catch {
      mostrarToast('Error al cargar', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [filtroEstado, filtroTipo, filtroAño])

  useEffect(() => {
    fetch('/api/empleados').then(r=>r.json()).then(d=>setEmpleados(Array.isArray(d)?d:[]))
  }, [])

  const confirmarAsuntosPropios = async (dias: string[], observaciones: string) => {
    setShowCalendarioAP(false)
    const res = await fetch("/api/vacaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: form.empleadoId, tipo: "ASUNTOS_PROPIOS", diasSueltos: dias, observaciones }),
    })
    const data = await res.json()
    if (res.ok) {
      setForm({ empleadoId:"", fechaInicio:"", fechaFin:"", tipo:"LIBRE_ELECCION", observaciones:"" })
      mostrarToast(`${dias.length} día(s) de asuntos propios solicitados ✅`, "ok")
      cargar()
    } else {
      mostrarToast(data.error || "Error al crear", "error")
    }
  }

  const gestionar = async (id:string, estado:string) => {
    if (!confirm(`¿${estado==='APROBADA'?'Aprobar':'Rechazar'} esta solicitud?`)) return
    const res = await fetch(`/api/vacaciones/${id}`, {
      method:'PATCH',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ estado }),
    })
    if (res.ok) { mostrarToast(estado==='APROBADA'?'Aprobada ✅':'Rechazada ❌','ok'); cargar() }
    else mostrarToast('Error al actualizar','error')
  }

  const crearSolicitud = async () => {
    if (form.tipo === "ASUNTOS_PROPIOS") {
      const emp = empleados.find(e => e.id === form.empleadoId)
      setEmpleadoSeleccionado(emp || null)
      setShowModal(false)
      setShowCalendarioAP(true)
      return
    }
    setErrorForm('')
    if (!form.empleadoId || !form.fechaInicio || !form.fechaFin) {
      setErrorForm('Completa todos los campos obligatorios'); return
    }
    setLoadingForm(true)
    const res = await fetch('/api/vacaciones', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoadingForm(false)
    if (res.ok) {
      setShowModal(false)
      setForm({ empleadoId:'', fechaInicio:'', fechaFin:'', tipo:'LIBRE_ELECCION', observaciones:'' })
      mostrarToast('Solicitud creada ✅','ok')
      cargar()
    } else {
      setErrorForm(data.error || 'Error al crear')
    }
  }

  const lista = vacaciones.filter(v => {
    const texto = `${v.empleado.nombre} ${v.empleado.apellidos}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const stats = {
    total:      vacaciones.length,
    aprobadas:  vacaciones.filter(v=>v.estado==='APROBADA').length,
    pendientes: vacaciones.filter(v=>v.estado==='PENDIENTE').length,
    diasTotal:  vacaciones.filter(v=>v.estado==='APROBADA' && v.tipo!=='ASUNTOS_PROPIOS').reduce((s,v)=>s+v.diasTotales,0),
  }

  const años = Array.from({ length:5 }, (_,i) => (new Date().getFullYear()-2+i).toString())

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, padding:'10px 20px', borderRadius:8,
          background: toast.tipo==='ok'?'#16a34a':'#dc2626', color:'#fff', fontSize:13, fontWeight:600, boxShadow:'0 4px 12px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total solicitudes', value:stats.total,      color:'#6366f1' },
          { label:'Aprobadas',         value:stats.aprobadas,  color:'#16a34a' },
          { label:'Pendientes',        value:stats.pendientes, color:'#d97706' },
          { label:'Días aprobados',    value:stats.diasTotal,  color:'#6d28d9' },
        ].map((k,i) => (
          <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6,
            padding:20, borderLeft:`3px solid ${k.color}`, boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>{k.label}</p>
            <p style={{ fontSize:30, fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        <input type="text" placeholder="Buscar empleado..." value={busqueda}
          onChange={e=>setBusqueda(e.target.value)} className="input-base text-xs py-1.5 px-3 w-48" />
        <div style={{ display:'flex', gap:4 }}>
          {['TODAS','PENDIENTE','APROBADA','RECHAZADA'].map(e => (
            <button key={e} onClick={()=>setFiltroEstado(e)}
              style={{ padding:'5px 12px', fontSize:11, fontWeight:600, borderRadius:4, cursor:'pointer', transition:'all .15s',
                background: filtroEstado===e?'var(--accent)':'var(--surface-2)',
                color:      filtroEstado===e?'#fff':'var(--text-secondary)',
                border:`1px solid ${filtroEstado===e?'var(--accent)':'var(--border-strong)'}` }}>
              {e==='TODAS'?'Todos':estadoStyle[e]?.label}
            </button>
          ))}
        </div>
        <select className="input-base text-xs py-1.5 px-2 w-auto" value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}>
          <option value="TODOS">Todos los tipos</option>
          {Object.entries(tipoStyle).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
        </select>
        <select className="input-base text-xs py-1.5 px-2 w-auto" value={filtroAño} onChange={e=>setFiltroAño(e.target.value)}>
          {años.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={cargar} className="btn-secondary text-xs px-3 py-1.5">🔄</button>
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
        </div>
        <div style={{ overflowX:'auto' }}>
          {loading ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Cargando...</div>
          ) : lista.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>🏖️ No hay solicitudes</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--surface-2)' }}>
                  {['Empleado','Grupo','Tipo','Desde','Hasta','Días','Estado','Acciones'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600,
                      color:'var(--text-muted)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map(v => {
                  const es = estadoStyle[v.estado] || estadoStyle.CANCELADA
                  const ts = tipoStyle[v.tipo] || tipoStyle.LIBRE_ELECCION
                  const nombreCompleto = `${v.empleado.nombre} ${v.empleado.apellidos}`
                  return (
                    <tr key={v.id} style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background .15s' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--surface-2)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                      onClick={() => router.push(`/empleados/${v.empleado.id}?tab=vacaciones`)}>
                      <td style={{ padding:'10px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Avatar nombre={nombreCompleto} size={34} />
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', lineHeight:1.3 }}>
                              {v.empleado.nombre} {v.empleado.apellidos}
                            </p>
                            <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Nº {v.empleado.numeroEmpleado}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'10px 16px' }}>
                        {v.empleado.grupoTrabajo ? (
                          <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:v.empleado.grupoTrabajo.color, borderRadius:3, padding:'2px 8px' }}>
                            {v.empleado.grupoTrabajo.nombre}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding:'10px 16px' }} onClick={e=>e.stopPropagation()}>
                        <div>
                          <span style={{ fontSize:11, fontWeight:600, color:ts.color, background:ts.bg, borderRadius:3, padding:'2px 8px' }}>
                            {ts.emoji} {ts.label}
                          </span>
                          {v.tipo === 'ASUNTOS_PROPIOS' && (
                            <p style={{ fontSize:9, color:'#9d174d', marginTop:3 }}>Art. 37.3 ET · 6 días/año · no acumulables</p>
                          )}
                        </div>
                      </td>

                      <td style={{ padding:'10px 16px', fontSize:13, fontWeight:600, color:'var(--text-primary)', textAlign:'center' }}>
                        {v.diasTotales}
                      </td>
                      <td style={{ padding:'10px 16px' }}>
                        <span style={{ fontSize:11, fontWeight:600, color:es.color, background:es.bg, borderRadius:3, padding:'2px 8px' }}>
                          {es.label}
                        </span>
                      </td>
                      <td style={{ padding:'10px 16px' }} onClick={e=>e.stopPropagation()}>
                        <div style={{ display:'flex', gap:6 }}>
                          {v.estado==='PENDIENTE' && (
                            <>
                              <button onClick={()=>gestionar(v.id,'APROBADA')}
                                style={{ fontSize:11, padding:'3px 10px', borderRadius:3, background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', fontWeight:600, cursor:'pointer' }}>
                                ✓ Aprobar
                              </button>
                              <button onClick={()=>gestionar(v.id,'RECHAZADA')}
                                style={{ fontSize:11, padding:'3px 10px', borderRadius:3, background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', fontWeight:600, cursor:'pointer' }}>
                                ✗ Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal nueva solicitud */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.5)' }}
          onClick={e=>{ if(e.target===e.currentTarget){ setShowModal(false); setErrorForm('') } }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:500 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Nueva solicitud de vacaciones</p>
              <button onClick={()=>{ setShowModal(false); setErrorForm('') }} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding:20 }} className="space-y-4">
              {errorForm && (
                <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:6, padding:'10px 14px', fontSize:13, color:'#b91c1c' }}>
                  {errorForm}
                </div>
              )}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Empleado *</label>
                <select className="input-base text-sm" value={form.empleadoId} onChange={e=>setForm(p=>({...p,empleadoId:e.target.value}))}>
                  <option value="">Seleccionar empleado...</option>
                  {empleados.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} {e.apellidos} — Nº {e.numeroEmpleado}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Tipo de vacación *</label>
                <select className="input-base text-sm" value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}>
                  {Object.entries(tipoStyle).map(([k,v]) => (
                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                  ))}
                </select>
                {form.tipo === 'ASUNTOS_PROPIOS' && (
                  <p style={{ fontSize:11, color:'#9d174d', marginTop:4, background:'#fce7f3', padding:'6px 10px', borderRadius:4 }}>
                    📋 Art. 37 ET — Los trabajadores tienen derecho a 6 días de asuntos propios al año (no acumulables).
                  </p>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Fecha inicio *</label>
                  <input type="date" className="input-base text-sm" value={form.fechaInicio}
                    onChange={e=>setForm(p=>({...p,fechaInicio:e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Fecha fin *</label>
                  <input type="date" className="input-base text-sm" value={form.fechaFin}
                    onChange={e=>setForm(p=>({...p,fechaFin:e.target.value}))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Observaciones</label>
                <textarea className="input-base text-sm" rows={3} style={{ resize:'none' }}
                  placeholder="Motivo o comentario opcional..."
                  value={form.observaciones} onChange={e=>setForm(p=>({...p,observaciones:e.target.value}))} />
              </div>
              <div style={{ display:'flex', gap:8, paddingTop:8 }}>
                <button onClick={()=>{ setShowModal(false); setErrorForm('') }} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button onClick={crearSolicitud} disabled={loadingForm} className="btn-primary flex-1 py-2 text-sm">
                  {loadingForm ? 'Creando...' : 'Crear solicitud'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}





      {showCalendarioAP && empleadoSeleccionado && (
        <CalendarioAsuntosPropios
          empleadoId={empleadoSeleccionado.id}
          grupoTrabajoId={empleadoSeleccionado.grupoTrabajoId}
          fechaNacimiento={empleadoSeleccionado.fechaNacimiento}
          diasDisponibles={empleadoSeleccionado.diasAsuntosPropios ?? 6}
          onConfirmar={confirmarAsuntosPropios}
          onCancelar={() => { setShowCalendarioAP(false); setShowModal(true) }}
        />
      )}
    </div>
  )
}
