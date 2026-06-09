"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import InfoPanel from "@/components/InfoPanel"

type TipoBaja = 'it_comun' | 'it_profesional' | 'at' | 'maternidad' | 'paternidad' | 'menstruacion' | 'semana39' | 'interrupcion_embarazo'

type Baja = {
  id: string
  empleadoId: string
  empleado: {
    id: string
    nombre: string
    apellidos: string
    numeroEmpleado: string
    sueldoBase?: number
    grupoTrabajo?: { nombre: string; color: string }
  }
  tipo: TipoBaja
  estado: string
  numeroParteINSS?: string
  fechaInicio: string
  fechaFin?: string
  diasDuracion?: number
  diasTranscurridos: number
  diagnostico?: string
  medico?: string
  baseReguladora?: number
  porcentajePrestacion: number
  porcentajeActual: number
  quienPaga: string
  convenioCubre100: boolean
  confirmadaDatosEconomicos: boolean
  fechaConfirmacion?: string
  fechaRecepcionINSS?: string
  creadoAutomaticamente: boolean
  alertas: { tipo: string; msg: string }[]
  createdAt: string
}

const tipoStyle: Record<string, { label: string; bg: string; color: string; info: string; emoji: string }> = {
  it_comun:              { label: 'IT Enfermedad común',       bg: '#fef9c3', color: '#854d0e', emoji: '🤒', info: 'Días 1-3 sin subsidio (empresa). Días 4-20: 60% BR (SS). Desde día 21: 75% BR (SS). RD-Ley 2/2023.' },
  it_profesional:        { label: 'IT Enfermedad profesional', bg: '#fed7aa', color: '#c2410c', emoji: '⚠️', info: 'Desde día 1: 75% BR a cargo de la Mutua. Art. 156 LGSS.' },
  at:                    { label: 'Accidente de trabajo',      bg: '#fee2e2', color: '#b91c1c', emoji: '🚨', info: 'Desde día 1: 75% BR a cargo de la Mutua. Notificación 24h a ITSS. Art. 156 LGSS.' },
  maternidad:            { label: 'Maternidad / Nacimiento',   bg: '#f5f3ff', color: '#6d28d9', emoji: '👶', info: '16 semanas. 100% BR a cargo de la SS desde el primer día. Art. 177 LGSS.' },
  paternidad:            { label: 'Paternidad / Nacimiento',   bg: '#dbeafe', color: '#1d4ed8', emoji: '👨‍👶', info: '16 semanas. 100% BR a cargo de la SS desde el primer día. Art. 185 LGSS.' },
  menstruacion:          { label: 'Menstruación incapacitante',bg: '#fce7f3', color: '#9d174d', emoji: '🩺', info: 'Sin carencia. 60% BR días 1-20, 75% desde día 21. SS paga desde inicio. Ley 1/2023.' },
  semana39:              { label: 'Semana 39 de gestación',    bg: '#ecfdf5', color: '#065f46', emoji: '🤰', info: 'SS paga desde inicio semana 39 hasta el parto. 100% BR. Ley 1/2023.' },
  interrupcion_embarazo: { label: 'Interrupción de embarazo',  bg: '#fff7ed', color: '#c2410c', emoji: '🏥', info: 'Día 1: empresa. Desde día 2: SS. 75% BR. Ley 1/2023.' },
}
const estadoStyle: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVA:                      { label: 'Activa',                    bg: '#fee2e2', color: '#b91c1c' },
  CERRADA:                     { label: 'Alta médica',               bg: '#dcfce7', color: '#15803d' },
  pendiente_confirmacion_inss: { label: 'Pend. confirmacion INSS',   bg: '#fef9c3', color: '#854d0e' },
}


function Avatar({ nombre, size = 32 }: { nombre: string; size?: number }) {
  const initials = nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
  const colors = ['#7c3aed', '#6d28d9', '#0891b2', '#d97706', '#16a34a', '#db2777']
  const color = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: size * 0.36, fontWeight: 700 }}>
      {initials}
    </div>
  )
}

export default function BajasMedicasDesktop() {
  const router = useRouter()
  const [bajas, setBajas] = useState<Baja[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [selected, setSelected] = useState<Baja | null>(null)
  const [showNueva, setShowNueva] = useState(false)
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'error' } | null>(null)
  const [empleados, setEmpleados] = useState<any[]>([])
  const [form, setForm] = useState({ empleadoId: '', tipo: 'it_comun', fechaInicio: '', numeroParteINSS: '', medico: '', diagnostico: '', baseReguladora: '' })
  const [loadingForm, setLoadingForm] = useState(false)
  const [formConfirmar, setFormConfirmar] = useState({ baseReguladora: '', convenioCubre100: false })
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [showAlta, setShowAlta] = useState(false)
  const [fechaAlta, setFechaAlta] = useState('')

  const mostrarToast = (msg: string, tipo: 'ok' | 'error') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== 'todas') params.set('estado', filtroEstado)
      if (filtroTipo !== 'todos') params.set('tipo', filtroTipo)
      const res = await fetch(`/api/bajas?${params}`)
      const data = await res.json()
      setBajas(Array.isArray(data.bajas) ? data.bajas : [])
    } catch {
      mostrarToast('Error al cargar bajas', 'error')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, filtroTipo])

  useEffect(() => { cargar() }, [cargar])
  useEffect(() => {
    fetch('/api/empleados').then(r => r.json()).then(d => setEmpleados(Array.isArray(d) ? d : []))
  }, [])

  const crearBaja = async () => {
    if (!form.empleadoId || !form.fechaInicio) { mostrarToast('Empleado y fecha inicio son obligatorios', 'error'); return }
    setLoadingForm(true)
    const res = await fetch('/api/bajas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoadingForm(false)
    if (res.ok) {
      setShowNueva(false)
      setForm({ empleadoId: '', tipo: 'it_comun', fechaInicio: '', numeroParteINSS: '', medico: '', diagnostico: '', baseReguladora: '' })
      mostrarToast('Baja registrada correctamente ✅', 'ok')
      cargar()
    } else {
      mostrarToast(data.error || 'Error al crear', 'error')
    }
  }

  const confirmarINSS = async () => {
    if (!selected) return
    const res = await fetch(`/api/bajas/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'CONFIRMAR_INSS', ...formConfirmar }),
    })
    if (res.ok) {
      mostrarToast('Datos confirmados al INSS ✅', 'ok')
      setShowConfirmar(false)
      setSelected(null)
      cargar()
    } else mostrarToast('Error al confirmar', 'error')
  }

  const darAlta = async () => {
    if (!selected) return
    const res = await fetch(`/api/bajas/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'ALTA_MEDICA', fechaFin: fechaAlta || new Date().toISOString() }),
    })
    if (res.ok) {
      mostrarToast('Alta médica registrada ✅', 'ok')
      setShowAlta(false)
      setSelected(null)
      cargar()
    } else mostrarToast('Error al dar alta', 'error')
  }

  const lista = bajas.filter(b => {
    const texto = `${b.empleado.nombre} ${b.empleado.apellidos}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const stats = {
    total: bajas.length,
    activas: bajas.filter(b => b.estado === 'ACTIVA').length,
    pendientesINSS: bajas.filter(b => !b.confirmadaDatosEconomicos && b.estado !== 'CERRADA').length,
    urgentes: bajas.filter(b => b.alertas?.some(a => a.tipo === 'URGENTE' || a.tipo === 'CRITICO')).length,
  }

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, padding: '10px 20px', borderRadius: 8, background: toast.tipo === 'ok' ? '#16a34a' : '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total bajas', value: stats.total, color: '#6366f1' },
          { label: 'Activas', value: stats.activas, color: '#dc2626' },
          { label: 'Pend. confirmación INSS', value: stats.pendientesINSS, color: '#d97706' },
          { label: 'Alertas urgentes', value: stats.urgentes, color: '#b91c1c' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 20, borderLeft: `3px solid ${k.color}`, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{k.label}</p>
            <p style={{ fontSize: 30, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Buscar empleado..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="input-base text-xs py-1.5 px-3 w-48" />
        <div style={{ display: 'flex', gap: 4 }}>
          {[['todas', 'Todas'], ['ACTIVA', 'Activas'], ['CERRADA', 'Altas'], ['pendiente_confirmacion_inss', 'Pend. INSS']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFiltroEstado(val)}
              style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: 'pointer', transition: 'all .15s', background: filtroEstado === val ? 'var(--accent)' : 'var(--surface-2)', color: filtroEstado === val ? '#fff' : 'var(--text-secondary)', border: `1px solid ${filtroEstado === val ? 'var(--accent)' : 'var(--border-strong)'}` }}>
              {lbl}
            </button>
          ))}
        </div>
        <select className="input-base text-xs py-1.5 px-2 w-auto" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {Object.entries(tipoStyle).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
        </select>
        <button onClick={cargar} className="btn-secondary text-xs px-3 py-1.5">🔄</button>
        <InfoPanel color="#0891b2" bg="#f0f9ff" border="#bae6fd" items={[
          { icon: "🏥", titulo: "Registrar baja", desc: "Pulsa + Nueva baja para registrar un parte de baja médica. Introduce el tipo, fecha de inicio y datos del parte." },
          { icon: "✅", titulo: "Confirmar INSS", desc: "Tienes 3 días hábiles para confirmar los datos económicos al INSS (Art. 169 LGSS). Las bajas pendientes se marcan en amarillo." },
          { icon: "🔝", titulo: "Dar alta médica", desc: "Cuando el médico emita el alta, regístrala aquí para cerrar la baja y actualizar el calendario del empleado." },
          { icon: "⚠️", titulo: "Alertas urgentes", desc: "El sistema avisa automáticamente cuando una baja supera los 545 días (riesgo de incapacidad permanente) o cuando se acerca el plazo INSS." },
          { icon: "👤", titulo: "Ver perfil", desc: "Haz doble click en cualquier fila para ir directamente al perfil del empleado." },
        ]} />
        <button onClick={() => setShowNueva(true)} className="btn-primary text-xs px-4 py-2 ml-auto">+ Nueva baja</button>
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Bajas médicas</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lista.length} resultado{lista.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
          ) : lista.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>🏥 No hay bajas registradas</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Empleado', 'Tipo', 'Inicio', 'Días', 'Prestación', 'Estado', 'Alertas', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map(b => {
                  const ts = tipoStyle[b.tipo] || tipoStyle.it_comun
                  const es = estadoStyle[b.estado] || estadoStyle.ACTIVA
                  return (
                    <tr key={b.id} onDoubleClick={() => router.push(`/empleados/${b.empleadoId}`)} style={{ cursor: "pointer", borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar nombre={`${b.empleado.nombre} ${b.empleado.apellidos}`} size={32} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{b.empleado.nombre} {b.empleado.apellidos}</p>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Nº {b.empleado.numeroEmpleado}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: ts.color, background: ts.bg, borderRadius: 3, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                          {ts.emoji} {ts.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(b.fechaInicio).toLocaleDateString('es-ES')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
                        {b.diasTranscurridos}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: b.porcentajeActual > 0 ? '#16a34a' : '#dc2626' }}>
                          {b.porcentajeActual}% BR
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.quienPaga}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: es.color, background: es.bg, borderRadius: 3, padding: '2px 8px' }}>
                          {es.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {b.alertas?.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {b.alertas.map((a, i) => (
                              <span key={i} style={{ fontSize: 10, fontWeight: 600, color: a.tipo === 'CRITICO' ? '#b91c1c' : a.tipo === 'URGENTE' ? '#854d0e' : '#1d4ed8', background: a.tipo === 'CRITICO' ? '#fee2e2' : a.tipo === 'URGENTE' ? '#fef9c3' : '#dbeafe', borderRadius: 3, padding: '2px 6px', whiteSpace: 'nowrap' }}>
                                {a.msg.substring(0, 40)}...
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => setSelected(b)}
                            style={{ fontSize: 11, padding: '3px 10px', borderRadius: 3, background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', fontWeight: 600, cursor: 'pointer' }}>
                            Ver
                          </button>
                          {!b.confirmadaDatosEconomicos && b.estado !== 'CERRADA' && (
                            <button onClick={() => { setSelected(b); setShowConfirmar(true) }}
                              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 3, background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Confirmar INSS
                            </button>
                          )}
                          {b.estado === 'ACTIVA' && (
                            <button onClick={() => { setSelected(b); setShowAlta(true) }}
                              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 3, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 600, cursor: 'pointer' }}>
                              Alta
                            </button>
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

      {/* Modal detalle */}
      {selected && !showConfirmar && !showAlta && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar nombre={`${selected.empleado.nombre} ${selected.empleado.apellidos}`} size={36} />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selected.empleado.nombre} {selected.empleado.apellidos}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{tipoStyle[selected.tipo]?.emoji} {tipoStyle[selected.tipo]?.label}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              {/* Alertas */}
              {selected.alertas?.map((a, i) => (
                <div key={i} style={{ background: a.tipo === 'CRITICO' ? '#fee2e2' : a.tipo === 'URGENTE' ? '#fef9c3' : '#dbeafe', border: `1px solid ${a.tipo === 'CRITICO' ? '#fca5a5' : a.tipo === 'URGENTE' ? '#fde68a' : '#93c5fd'}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 600, color: a.tipo === 'CRITICO' ? '#b91c1c' : a.tipo === 'URGENTE' ? '#854d0e' : '#1d4ed8' }}>
                  {a.msg}
                </div>
              ))}
              {/* Info normativa */}
              <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#4338ca' }}>
                📋 {tipoStyle[selected.tipo]?.info}
              </div>
              {/* Datos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Fecha inicio', valor: new Date(selected.fechaInicio).toLocaleDateString('es-ES') },
                  { label: 'Fecha fin', valor: selected.fechaFin ? new Date(selected.fechaFin).toLocaleDateString('es-ES') : 'En curso' },
                  { label: 'Días transcurridos', valor: `${selected.diasTranscurridos} días` },
                  { label: 'Prestación actual', valor: `${selected.porcentajeActual}% BR (${selected.quienPaga})` },
                  { label: 'Base reguladora', valor: selected.baseReguladora ? `${Number(selected.baseReguladora).toFixed(2)}€/mes` : 'No confirmada' },
                  { label: 'Nº parte INSS', valor: selected.numeroParteINSS || '—' },
                  { label: 'Médico', valor: selected.medico || '—' },
                  { label: 'Diagnóstico', valor: selected.diagnostico || '—' },
                  { label: 'Confirmar INSS', valor: selected.confirmadaDatosEconomicos ? `✅ ${selected.fechaConfirmacion ? new Date(selected.fechaConfirmacion).toLocaleDateString('es-ES') : ''}` : '❌ Pendiente (3 días hábiles)' },
                  { label: 'Convenio cubre 100%', valor: selected.convenioCubre100 ? 'Sí' : 'No' },
                ].map(f => (
                  <div key={f.label} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{f.valor}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
                {!selected.confirmadaDatosEconomicos && selected.estado !== 'CERRADA' && (
                  <button onClick={() => setShowConfirmar(true)}
                    style={{ flex: 1, padding: '8px', fontSize: 12, fontWeight: 600, background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', borderRadius: 6, cursor: 'pointer' }}>
                    Confirmar datos INSS
                  </button>
                )}
                {selected.estado === 'ACTIVA' && (
                  <button onClick={() => setShowAlta(true)}
                    style={{ flex: 1, padding: '8px', fontSize: 12, fontWeight: 600, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 6, cursor: 'pointer' }}>
                    Dar alta médica
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar INSS */}
      {showConfirmar && selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 440 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>⚠️ Confirmar datos económicos al INSS</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Plazo máximo: 3 días hábiles desde recepción del parte. Sistema RED.</p>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Base reguladora mensual (€) *</label>
                <input type="number" className="input-base text-sm" placeholder="Ej: 1800.00"
                  value={formConfirmar.baseReguladora} onChange={e => setFormConfirmar(p => ({ ...p, baseReguladora: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="convenio" checked={formConfirmar.convenioCubre100}
                  onChange={e => setFormConfirmar(p => ({ ...p, convenioCubre100: e.target.checked }))} />
                <label htmlFor="convenio" style={{ fontSize: 12, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  El convenio colectivo cubre el 100% del salario durante la baja
                </label>
              </div>
              <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#854d0e' }}>
                ⚠️ Art. 169 LGSS — La empresa debe transmitir los datos económicos al INSS vía Sistema RED en un máximo de 3 días hábiles desde la recepción del parte de baja.
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button onClick={() => setShowConfirmar(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={confirmarINSS} className="btn-primary flex-1 py-2 text-sm">Confirmar al INSS</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal alta médica */}
      {showAlta && selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 400 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>✅ Dar alta médica</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Empleado: {selected.empleado.nombre} {selected.empleado.apellidos}</p>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Fecha de alta *</label>
                <input type="date" className="input-base text-sm" value={fechaAlta} onChange={e => setFechaAlta(e.target.value)} />
              </div>
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#15803d' }}>
                ✅ El alta médica será comunicada al trabajador. El contrato se reactiva automáticamente.
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAlta(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={darAlta} className="btn-primary flex-1 py-2 text-sm">Confirmar alta</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva baja */}
      {showNueva && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNueva(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🏥 Nueva baja médica</p>
              <button onClick={() => setShowNueva(false)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Empleado *</label>
                <select className="input-base text-sm" value={form.empleadoId} onChange={e => setForm(p => ({ ...p, empleadoId: e.target.value }))}>
                  <option value="">Seleccionar empleado...</option>
                  {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos} — Nº {e.numeroEmpleado}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Tipo de baja *</label>
                <select className="input-base text-sm" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                  {Object.entries(tipoStyle).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
                <p style={{ fontSize: 11, color: '#4338ca', background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 4, padding: '6px 10px', marginTop: 6 }}>
                  📋 {tipoStyle[form.tipo as TipoBaja]?.info}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Fecha inicio *</label>
                  <input type="date" className="input-base text-sm" value={form.fechaInicio} onChange={e => setForm(p => ({ ...p, fechaInicio: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Nº Parte INSS</label>
                  <input type="text" className="input-base text-sm" placeholder="Opcional" value={form.numeroParteINSS} onChange={e => setForm(p => ({ ...p, numeroParteINSS: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Médico</label>
                  <input type="text" className="input-base text-sm" placeholder="Nombre del médico" value={form.medico} onChange={e => setForm(p => ({ ...p, medico: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Base reguladora (€)</label>
                  <input type="number" className="input-base text-sm" placeholder="Ej: 1800" value={form.baseReguladora} onChange={e => setForm(p => ({ ...p, baseReguladora: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Diagnóstico</label>
                <textarea className="input-base text-sm" rows={2} style={{ resize: 'none' }} placeholder="Descripción del diagnóstico..." value={form.diagnostico} onChange={e => setForm(p => ({ ...p, diagnostico: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowNueva(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button onClick={crearBaja} disabled={loadingForm} className="btn-primary flex-1 py-2 text-sm">
                  {loadingForm ? 'Registrando...' : 'Registrar baja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





