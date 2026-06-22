'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Tab = 'general' | 'calendario' | 'vacaciones' | 'permisos' | 'actividad' | 'sesiones' | 'notas' | 'seguridad'

const TABS: { id: Tab; label: string; icon: string; soloAdmin?: boolean }[] = [
  { id: 'general',    label: 'General',       icon: 'ti-user' },
  { id: 'calendario', label: 'Calendario',    icon: 'ti-calendar' },
  { id: 'vacaciones', label: 'Vacaciones',    icon: 'ti-beach' },
  { id: 'permisos',   label: 'Permisos',      icon: 'ti-lock' },
  { id: 'actividad',  label: 'Actividad',     icon: 'ti-list' },
  { id: 'sesiones',   label: 'Sesiones',      icon: 'ti-device-desktop' },
  { id: 'notas',      label: 'Notas',         icon: 'ti-notes', soloAdmin: true },
  { id: 'seguridad',  label: 'Seguridad',     icon: 'ti-shield' },
]

const MODULOS = [
  { id: 'empleados',     label: 'Empleados' },
  { id: 'vacaciones',    label: 'Vacaciones' },
  { id: 'turnos',        label: 'Turnos' },
  { id: 'bajas',         label: 'Bajas médicas' },
  { id: 'cambios',       label: 'Cambios de turno' },
  { id: 'cobertura',     label: 'Cobertura' },
  { id: 'reportes',      label: 'Reportes' },
  { id: 'fichajes',      label: 'Fichajes' },
  { id: 'chat',          label: 'Chat' },
  { id: 'hacienda',      label: 'Inspección Hacienda' },
  { id: 'configuracion', label: 'Configuración' },
]

interface Usuario {
  id: string; nombre: string; name: string; email: string; rol: string; role: string
  genero: string | null; createdAt: string
  ultimaActividad: string | null; esFundador: boolean
  ordenSuperAdmin: number | null; asignadoPor: string | null
  cargo: string | null; departamento: string | null
}

function FieldCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>{value || '—'}</p>
      </div>
      <i className={`ti ${icon}`} style={{ fontSize: '18px', color: '#D1D5DB' }} aria-hidden="true" />
    </div>
  )
}

function CalendarioAnual() {
  const anio = new Date().getFullYear()
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const dias = ['L','M','X','J','V','S','D']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {meses.map((mes, mi) => {
        const primero   = new Date(anio, mi, 1)
        const totalDias = new Date(anio, mi + 1, 0).getDate()
        const inicioDia = (primero.getDay() + 6) % 7
        return (
          <div key={mes} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '16px', boxShadow: '0 4px 16px rgba(99,102,241,0.18), 0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', fontWeight: 500, fontSize: '13px', color: '#6366F1', marginBottom: '10px' }}>{mes}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {dias.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: '#6366F1', fontWeight: 500, padding: '4px 0', background: '#EDE9FE', borderRadius: '4px', marginBottom: '2px' }}>{d}</div>)}
              {Array.from({ length: inicioDia }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: totalDias }, (_, i) => {
                const dia = i + 1
                const dow = new Date(anio, mi, dia).getDay()
                const col = dow === 0 ? '#EF4444' : dow === 6 ? '#F97316' : '#374151'
                return <div key={dia} style={{ textAlign: 'center', fontSize: '12px', color: col, padding: '4px 2px', borderRadius: '4px', cursor: 'pointer' }}>{dia}</div>
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function FichaEjecutivoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [sessionUser, setSessionUser]   = useState<any>(null)
  const [tab, setTab]                   = useState<Tab>('general')
  const [usuario, setUsuario]           = useState<Usuario | null>(null)
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [notas, setNotas]               = useState<any[]>([])
  const [actividad, setActividad]       = useState<any[]>([])
  const [sesiones, setSesiones]         = useState<any[]>([])
  const [vacaciones, setVacaciones]     = useState<any[]>([])
  const [permisos, setPermisos]         = useState<Record<string, { ver: boolean; modificar: boolean }>>({})
  const [editando, setEditando]         = useState(false)
  const [form, setForm]                 = useState({ nombre: '', genero: '' })
  const [nuevaNota, setNuevaNota]       = useState('')
  const [nuevaPass, setNuevaPass]       = useState('')
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [guardando, setGuardando]       = useState(false)
  const [msg, setMsg]                   = useState<{ texto: string; tipo: 'ok' | 'err' } | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('panelEjecutivoAuth')
    if (!stored) { router.push('/panel-ejecutivo'); return }
    try { setSessionUser(JSON.parse(stored)) } catch { router.push('/panel-ejecutivo') }
  }, [router])

  const esSuperAdmin = sessionUser?.role === 'SUPER_ADMIN'
  const esPropio     = sessionUser?.id === id
  const isOnline     = usuario?.ultimaActividad
    ? (Date.now() - new Date(usuario.ultimaActividad).getTime()) < 60000 : false

  const showMsg = (texto: string, tipo: 'ok' | 'err' = 'ok') => {
    setMsg({ texto, tipo }); setTimeout(() => setMsg(null), 3000)
  }

  const fetchUsuario = useCallback(async () => {
    try {
      const res  = await fetch(`/api/panel-ejecutivo/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsuario(data.usuario)
      setForm({ nombre: data.usuario.nombre || data.usuario.name || '', genero: data.usuario.genero || '' })
    } catch { setError('No se pudo cargar el perfil') }
    finally  { setCargando(false) }
  }, [id])

  const fetchTab = useCallback(async (t: Tab) => {
    if (t === 'notas' && esSuperAdmin) {
      const res = await fetch(`/api/panel-ejecutivo/${id}?accion=notas`)
      if (res.ok) setNotas((await res.json()).notas || [])
    } else if (t === 'actividad') {
      const res = await fetch(`/api/panel-ejecutivo/${id}?accion=actividad`)
      if (res.ok) setActividad((await res.json()).actividad || [])
    } else if (t === 'sesiones') {
      const res = await fetch(`/api/panel-ejecutivo/${id}?accion=sesiones`)
      if (res.ok) setSesiones((await res.json()).sesiones || [])
    } else if (t === 'vacaciones') {
      const res = await fetch(`/api/panel-ejecutivo/${id}?accion=vacaciones`)
      if (res.ok) setVacaciones((await res.json()).vacaciones || [])
    } else if (t === 'permisos') {
      const res = await fetch(`/api/panel-ejecutivo/${id}?accion=permisos`)
      if (res.ok) {
        const { permisos: p } = await res.json()
        const obj: Record<string, { ver: boolean; modificar: boolean }> = {}
        MODULOS.forEach(m => { obj[m.id] = { ver: p?.[`${m.id}_ver`] ?? false, modificar: p?.[`${m.id}_modificar`] ?? false } })
        setPermisos(obj)
      }
    }
  }, [id, esSuperAdmin])

  useEffect(() => { fetchUsuario() }, [fetchUsuario])
  useEffect(() => { if (sessionUser) fetchTab(tab) }, [tab, fetchTab, sessionUser])

  const guardarGeneral = async () => {
    setGuardando(true)
    const res = await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'actualizar_datos', nombre: form.nombre, genero: form.genero }),
    })
    setGuardando(false)
    if (res.ok) { setEditando(false); fetchUsuario(); showMsg('Datos actualizados') }
    else showMsg('Error al guardar', 'err')
  }

  const agregarNota = async () => {
    if (!nuevaNota.trim()) return
    await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'agregar_nota', contenido: nuevaNota, autorId: sessionUser?.id }),
    })
    setNuevaNota(''); fetchTab('notas')
  }

  const eliminarNota = async (notaId: string) => {
    await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'eliminar_nota', notaId }),
    })
    fetchTab('notas')
  }

  const resetearPassword = async () => {
    if (!nuevaPass.trim()) return
    const res = await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'resetear_password', nuevaPassword: nuevaPass }),
    })
    if (res.ok) { setNuevaPass(''); showMsg('Contrasena actualizada') }
    else showMsg('Error al actualizar', 'err')
  }

  const revocarAcceso = async () => {
    const res = await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'revocar_acceso' }),
    })
    if (res.ok) router.push('/panel-ejecutivo')
  }

  const nombre    = usuario?.name || usuario?.nombre || '?'
  const iniciales = nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const rol       = usuario?.role || usuario?.rol || ''
  const visibleTabs = TABS.filter(t => !t.soloAdmin || esSuperAdmin)

  const diasEnSistema = usuario?.createdAt
    ? Math.floor((Date.now() - new Date(usuario.createdAt).getTime()) / 86400000) : 0

  if (!sessionUser) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECEAF8' }}>
      <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Verificando acceso...</span>
    </div>
  )
  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECEAF8' }}>
      <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Cargando perfil...</span>
    </div>
  )
  if (error || !usuario) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECEAF8' }}>
      <span style={{ color: '#EF4444' }}>{error || 'Usuario no encontrado'}</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#ECEAF8', fontFamily: 'var(--font-sans)' }}>

      {/* Toast */}
      {msg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: msg.tipo === 'ok' ? '#F0FDF4' : '#FEF2F2',
          border: `0.5px solid ${msg.tipo === 'ok' ? '#BBF7D0' : '#FECACA'}`,
          color: msg.tipo === 'ok' ? '#15803D' : '#B91C1C',
          padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          {msg.texto}
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E7EB', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/panel-ejecutivo')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '0.5px solid #E5E7EB', color: '#6B7280', padding: '6px 14px', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}>
          <i className="ti ti-arrow-left" style={{ fontSize: '14px' }} aria-hidden="true" />
          Volver
        </button>
        <span style={{ color: '#D1D5DB', fontSize: '16px' }}>/</span>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>Panel ejecutivo</span>
        <span style={{ color: '#D1D5DB', fontSize: '16px' }}>/</span>
        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{nombre}</span>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 57px)' }}>

        {/* SIDEBAR */}
        <div style={{ background: '#fff', borderRight: '0.5px solid #E5E7EB', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%',
            background: usuario.esFundador ? 'linear-gradient(135deg, #FCD34D, #F59E0B)' : 'linear-gradient(135deg, #A5B4FC, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 500, color: '#fff', marginBottom: '12px', flexShrink: 0 }}>
            {iniciales}
          </div>

          <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', textAlign: 'center' }}>{nombre}</div>
          <div style={{ fontSize: '11px', color: '#6366F1', marginTop: '3px', textAlign: 'center' }}>{rol}</div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            {usuario.esFundador && (
              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px' }}>👑 Fundador</span>
            )}
            <span style={{ background: isOnline ? '#D1FAE5' : '#F3F4F6', color: isOnline ? '#065F46' : '#6B7280', fontSize: '10px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px' }}>
              {isOnline ? '● En línea' : '○ Desconectado'}
            </span>
          </div>

          <div style={{ width: '100%', height: '0.5px', background: '#E5E7EB', margin: '18px 0' }} />

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <i className="ti ti-mail" style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '1px', flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: '11px', color: '#6B7280', lineHeight: '1.4', wordBreak: 'break-all' }}>{usuario.email}</span>
            </div>
            {usuario.createdAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-calendar" style={{ fontSize: '14px', color: '#9CA3AF' }} aria-hidden="true" />
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{new Date(usuario.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
            {usuario.cargo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-briefcase" style={{ fontSize: '14px', color: '#9CA3AF' }} aria-hidden="true" />
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{usuario.cargo}</span>
              </div>
            )}
          </div>

          <div style={{ width: '100%', height: '0.5px', background: '#E5E7EB', margin: '18px 0' }} />

          <div style={{ width: '100%', background: '#F5F3FF', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 500, color: '#6366F1' }}>{diasEnSistema}d</div>
            <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>en el sistema</div>
          </div>

          {(esSuperAdmin || esPropio) && !editando && tab === 'general' && (
            <button onClick={() => setEditando(true)}
              style={{ marginTop: '16px', width: '100%', padding: '8px', border: '0.5px solid #E5E7EB', borderRadius: '8px', background: 'transparent', fontSize: '12px', color: '#6366F1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <i className="ti ti-edit" style={{ fontSize: '14px' }} aria-hidden="true" /> Editar datos
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Tabs */}
          <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E7EB', display: 'flex', overflowX: 'auto', padding: '0 8px' }}>
            {visibleTabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '11px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: tab === t.id ? '2px solid #6366F1' : '2px solid transparent',
                  color: tab === t.id ? '#6366F1' : '#6B7280',
                  fontWeight: tab === t.id ? 500 : 400, fontSize: '13px', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className={`ti ${t.icon}`} style={{ fontSize: '14px' }} aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '24px', flex: 1 }}>

            {/* ── GENERAL ── */}
            {tab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Datos personales</span>
                  {editando && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={guardarGeneral} disabled={guardando}
                        style={{ background: '#6366F1', border: 'none', color: '#fff', padding: '7px 16px', cursor: 'pointer', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button onClick={() => { setEditando(false); setForm({ nombre: nombre, genero: usuario.genero || '' }) }}
                        style={{ background: 'transparent', border: '0.5px solid #E5E7EB', color: '#6B7280', padding: '7px 14px', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}>
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {editando ? (
                    <>
                      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '14px 16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Nombre completo</p>
                        <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                          style={{ width: '100%', background: '#F9FAFB', border: '0.5px solid #E5E7EB', color: '#111827', padding: '7px 10px', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '14px 16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Género</p>
                        <select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))}
                          style={{ width: '100%', background: '#F9FAFB', border: '0.5px solid #E5E7EB', color: '#111827', padding: '7px 10px', borderRadius: '6px', fontSize: '13px' }}>
                          <option value="">no especificado</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <FieldCard label="Nombre completo" value={nombre} icon="ti-user" />
                      <FieldCard label="Género" value={usuario.genero || '—'} icon="ti-gender-male" />
                    </>
                  )}
                  <FieldCard label="Email" value={usuario.email} icon="ti-mail" />
                  <FieldCard label="Rol" value={rol} icon="ti-shield" />
                  {usuario.createdAt && <FieldCard label="Fecha de ingreso" value={new Date(usuario.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} icon="ti-calendar" />}
                  {usuario.asignadoPor && <FieldCard label="Asignado por" value={usuario.asignadoPor} icon="ti-user-check" />}
                </div>

                <div style={{ background: isOnline ? '#F0FDF4' : '#F9FAFB', border: `0.5px solid ${isOnline ? '#BBF7D0' : '#E5E7EB'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOnline ? '#22C55E' : '#D1D5DB', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: isOnline ? '#15803D' : '#6B7280' }}>
                      {isOnline ? 'En línea ahora mismo' : 'Desconectado'}
                    </div>
                    {usuario.ultimaActividad && (
                      <div style={{ fontSize: '11px', color: isOnline ? '#16A34A' : '#9CA3AF', marginTop: '2px' }}>
                        Última actividad: {new Date(usuario.ultimaActividad).toLocaleString('es-ES')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── CALENDARIO ── */}
            {tab === 'calendario' && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>Calendario {new Date().getFullYear()}</div>
                <CalendarioAnual />
              </div>
            )}

            {/* ── VACACIONES ── */}
            {tab === 'vacaciones' && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>Historial de vacaciones</div>
                {vacaciones.length === 0 ? (
                  <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Sin solicitudes registradas</div>
                ) : vacaciones.map((v: any) => (
                  <div key={v.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '13px', color: '#111827' }}>{new Date(v.fechaInicio).toLocaleDateString('es-ES')} → {new Date(v.fechaFin).toLocaleDateString('es-ES')}</div>
                      {v.motivo && <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '3px' }}>{v.motivo}</div>}
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                      background: v.estado === 'APROBADA' ? '#D1FAE5' : v.estado === 'RECHAZADA' ? '#FEE2E2' : '#F3F4F6',
                      color: v.estado === 'APROBADA' ? '#065F46' : v.estado === 'RECHAZADA' ? '#B91C1C' : '#6B7280' }}>
                      {v.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── PERMISOS ── */}
            {tab === 'permisos' && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>Permisos por módulo</div>
                {rol === 'SUPER_ADMIN' ? (
                  <div style={{ background: '#F5F3FF', border: '0.5px solid #DDD6FE', borderRadius: '10px', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
                    <div style={{ color: '#6366F1', fontWeight: 500, fontSize: '15px' }}>Acceso total al sistema</div>
                    <div style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px' }}>Super Admin tiene acceso completo a todos los módulos</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '6px 16px', color: '#9CA3AF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
                      <span>Módulo</span><span style={{ textAlign: 'center' }}>Ver</span><span style={{ textAlign: 'center' }}>Modificar</span>
                    </div>
                    {MODULOS.map(m => (
                      <div key={m.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '12px 16px', marginBottom: '6px', display: 'grid', gridTemplateColumns: '1fr 80px 80px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>{m.label}</span>
                        {(['ver', 'modificar'] as const).map(key => {
                          const activo = permisos[m.id]?.[key] ?? false
                          const color = key === 'ver' ? '#059669' : '#6366F1'
                          return (
                            <div key={key} style={{ display: 'flex', justifyContent: 'center' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1.5px solid ${activo ? color : '#E5E7EB'}`, background: activo ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {activo && <i className="ti ti-check" style={{ fontSize: '11px', color: '#fff' }} aria-hidden="true" />}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── ACTIVIDAD ── */}
            {tab === 'actividad' && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>Historial de actividad</div>
                {actividad.length === 0 ? (
                  <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Sin actividad registrada</div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    <div style={{ position: 'absolute', left: '6px', top: 0, bottom: 0, width: '1px', background: '#E5E7EB' }} />
                    {actividad.map((a: any) => {
                      const col = a.accion?.includes('eliminad') ? '#EF4444' : a.accion?.includes('aproba') ? '#059669' : a.accion?.includes('rechaza') ? '#F59E0B' : '#6366F1'
                      return (
                        <div key={a.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col, flexShrink: 0, marginTop: '4px', marginLeft: '-18px', border: '2px solid #fff' }} />
                          <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '12px 16px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                              <span style={{ fontWeight: 500, fontSize: '13px', color: col }}>{a.accion}</span>
                              <span style={{ color: '#9CA3AF', fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(a.creadoEn).toLocaleString('es-ES')}</span>
                            </div>
                            {a.motivo && <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>{a.motivo}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SESIONES ── */}
            {tab === 'sesiones' && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>Últimas conexiones</div>
                <div style={{ background: isOnline ? '#F0FDF4' : '#F9FAFB', border: `0.5px solid ${isOnline ? '#BBF7D0' : '#E5E7EB'}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOnline ? '#22C55E' : '#D1D5DB' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: isOnline ? '#15803D' : '#6B7280' }}>{isOnline ? 'En línea ahora' : 'Desconectado'}</span>
                  {usuario.ultimaActividad && <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: 'auto' }}>Última actividad: {new Date(usuario.ultimaActividad).toLocaleString('es-ES')}</span>}
                </div>
                {sesiones.length === 0 ? (
                  <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Sin historial detallado de sesiones</div>
                ) : sesiones.map((s: any) => (
                  <div key={s.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '12px 16px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#374151' }}>{s.dispositivo || 'Dispositivo desconocido'}</div>
                      {s.ip && <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>IP: {s.ip}</div>}
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{new Date(s.creadoEn).toLocaleString('es-ES')}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── NOTAS ── */}
            {tab === 'notas' && esSuperAdmin && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Notas privadas</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>Solo visible para Super Admins</div>
                <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '16px', boxShadow: '0 4px 16px rgba(99,102,241,0.18), 0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
                  <textarea value={nuevaNota} onChange={e => setNuevaNota(e.target.value)}
                    placeholder="Escribe una nota privada..." rows={3}
                    style={{ width: '100%', background: '#F9FAFB', border: '0.5px solid #E5E7EB', color: '#111827', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  <button onClick={agregarNota} disabled={!nuevaNota.trim()}
                    style={{ marginTop: '10px', background: nuevaNota.trim() ? '#6366F1' : '#F3F4F6', border: 'none', color: nuevaNota.trim() ? '#fff' : '#9CA3AF', padding: '8px 18px', cursor: nuevaNota.trim() ? 'pointer' : 'default', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                    Añadir nota
                  </button>
                </div>
                {notas.length === 0 ? (
                  <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Sin notas privadas</div>
                ) : notas.map((n: any) => (
                  <div key={n.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#374151', whiteSpace: 'pre-wrap' }}>{n.contenido}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '8px' }}>Por {n.autorNombre} · {new Date(n.creadoEn).toLocaleString('es-ES')}</div>
                    </div>
                    <button onClick={() => eliminarNota(n.id)}
                      style={{ background: 'transparent', border: '0.5px solid #FECACA', color: '#EF4444', cursor: 'pointer', padding: '4px 9px', borderRadius: '6px', fontSize: '12px', flexShrink: 0, alignSelf: 'flex-start' }}>
                      <i className="ti ti-x" style={{ fontSize: '12px' }} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── SEGURIDAD ── */}
            {tab === 'seguridad' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Seguridad</div>
                {(esSuperAdmin || esPropio) && (
                  <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: '10px', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                      {esSuperAdmin && !esPropio ? 'Resetear contraseña' : 'Cambiar mi contraseña'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '14px' }}>
                      {esSuperAdmin && !esPropio ? 'Establece una nueva contraseña para este usuario.' : 'Actualiza tu contraseña de acceso.'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="password" value={nuevaPass} onChange={e => setNuevaPass(e.target.value)} placeholder="Nueva contraseña..."
                        style={{ flex: 1, background: '#F9FAFB', border: '0.5px solid #E5E7EB', color: '#111827', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }} />
                      <button onClick={resetearPassword} disabled={!nuevaPass.trim()}
                        style={{ background: nuevaPass.trim() ? '#6366F1' : '#F3F4F6', border: 'none', color: nuevaPass.trim() ? '#fff' : '#9CA3AF', padding: '8px 18px', cursor: nuevaPass.trim() ? 'pointer' : 'default', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
                {esSuperAdmin && !esPropio && (
                  <div style={{ background: '#FFF5F5', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#B91C1C', marginBottom: '4px' }}>Revocar acceso</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '14px' }}>Desactiva esta cuenta. El usuario no podrá iniciar sesión.</div>
                    {!confirmRevoke ? (
                      <button onClick={() => setConfirmRevoke(true)}
                        style={{ background: 'transparent', border: '0.5px solid #FECACA', color: '#EF4444', padding: '8px 18px', cursor: 'pointer', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                        Revocar acceso
                      </button>
                    ) : (
                      <div>
                        <div style={{ fontSize: '13px', color: '#92400E', marginBottom: '10px', fontWeight: 500 }}>¿Seguro? Desactivará la cuenta de {nombre}.</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={revocarAcceso}
                            style={{ background: '#EF4444', border: 'none', color: '#fff', padding: '8px 18px', cursor: 'pointer', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                            Sí, revocar
                          </button>
                          <button onClick={() => setConfirmRevoke(false)}
                            style={{ background: 'transparent', border: '0.5px solid #E5E7EB', color: '#6B7280', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}