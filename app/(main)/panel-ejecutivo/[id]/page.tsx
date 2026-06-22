'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

const C = {
  bg: '#0b0e1a', bgSec: '#161a2c', border: '#2a2f45', text: '#f1ecdd',
  textSec: '#8d92ab', gold: '#c9a14d', online: '#1D9E75', red: '#ef4444', blue: '#3b82f6',
}

type Tab = 'general' | 'calendario' | 'vacaciones' | 'permisos' | 'actividad' | 'sesiones' | 'notas' | 'seguridad'

const TABS: { id: Tab; label: string; icon: string; soloAdmin?: boolean }[] = [
  { id: 'general',    label: 'General',       icon: '👤' },
  { id: 'calendario', label: 'Calendario',    icon: '📅' },
  { id: 'vacaciones', label: 'Vacaciones',    icon: '🏖️' },
  { id: 'permisos',   label: 'Permisos',      icon: '🔐' },
  { id: 'actividad',  label: 'Actividad',     icon: '📋' },
  { id: 'sesiones',   label: 'Sesiones',      icon: '🖥️' },
  { id: 'notas',      label: 'Notas privadas',icon: '📝', soloAdmin: true },
  { id: 'seguridad',  label: 'Seguridad',     icon: '🛡️' },
]

const MODULOS = [
  { id: 'empleados',     label: 'Empleados' },
  { id: 'vacaciones',    label: 'Vacaciones' },
  { id: 'turnos',        label: 'Turnos' },
  { id: 'bajas',         label: 'Bajas medicas' },
  { id: 'cambios',       label: 'Cambios de turno' },
  { id: 'cobertura',     label: 'Cobertura' },
  { id: 'reportes',      label: 'Reportes' },
  { id: 'fichajes',      label: 'Fichajes' },
  { id: 'chat',          label: 'Chat' },
  { id: 'hacienda',      label: 'Inspeccion Hacienda' },
  { id: 'configuracion', label: 'Configuracion' },
]

interface Usuario {
  id: string; nombre: string; email: string; rol: string
  genero: string | null; telefono: string | null; creadoEn: string
  ultimaActividad: string | null; esFundador: boolean
  ordenSuperAdmin: number | null; asignadoPor: string | null
}

function CalendarioAnual() {
  const anio = new Date().getFullYear()
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const dias  = ['L','M','X','J','V','S','D']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
      {meses.map((mes, mi) => {
        const primero   = new Date(anio, mi, 1)
        const totalDias = new Date(anio, mi + 1, 0).getDate()
        const inicioDia = (primero.getDay() + 6) % 7
        return (
          <div key={mes} style={{ background: '#161a2c', border: '1px solid #2a2f45', borderRadius: '6px', padding: '12px' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '12px', color: '#c9a14d', marginBottom: '8px' }}>{mes}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
              {dias.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: '#8d92ab', paddingBottom: '3px' }}>{d}</div>)}
              {Array.from({ length: inicioDia }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: totalDias }, (_, i) => {
                const dia = i + 1
                const dow = new Date(anio, mi, dia).getDay()
                const col = dow === 0 ? '#f87171' : dow === 6 ? '#fb923c' : '#f1ecdd'
                return (
                  <div key={dia} style={{ textAlign: 'center', fontSize: '11px', color: col, padding: '2px', borderRadius: '2px', cursor: 'pointer' }}>
                    {dia}
                  </div>
                )
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

  const [sessionUser, setSessionUser] = useState<any>(null)
  const [tab, setTab]                 = useState<Tab>('general')
  const [usuario, setUsuario]         = useState<Usuario | null>(null)
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [notas, setNotas]             = useState<any[]>([])
  const [actividad, setActividad]     = useState<any[]>([])
  const [sesiones, setSesiones]       = useState<any[]>([])
  const [vacaciones, setVacaciones]   = useState<any[]>([])
  const [permisos, setPermisos]       = useState<Record<string, { ver: boolean; modificar: boolean }>>({})
  const [editando, setEditando]       = useState(false)
  const [form, setForm]               = useState({ nombre: '', telefono: '', genero: '' })
  const [nuevaNota, setNuevaNota]     = useState('')
  const [nuevaPass, setNuevaPass]     = useState('')
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [msg, setMsg]                 = useState<{ texto: string; tipo: 'ok' | 'err' } | null>(null)

  // Leer sesion desde sessionStorage (igual que panel-ejecutivo padre)
  useEffect(() => {
    const stored = sessionStorage.getItem('panel_ejecutivo_user')
    if (!stored) {
      router.push('/panel-ejecutivo')
      return
    }
    try { setSessionUser(JSON.parse(stored)) }
    catch { router.push('/panel-ejecutivo') }
  }, [router])

  const esSuperAdmin = sessionUser?.rol === 'SUPER_ADMIN'
  const esPropio     = sessionUser?.id === id
  const isOnline     = usuario?.ultimaActividad
    ? (Date.now() - new Date(usuario.ultimaActividad).getTime()) < 60000
    : false

  const showMsg = (texto: string, tipo: 'ok' | 'err' = 'ok') => {
    setMsg({ texto, tipo })
    setTimeout(() => setMsg(null), 3000)
  }

  const fetchUsuario = useCallback(async () => {
    try {
      const res  = await fetch(`/api/panel-ejecutivo/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsuario(data.usuario)
      setForm({ nombre: data.usuario.nombre || '', telefono: data.usuario.telefono || '', genero: data.usuario.genero || '' })
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
        MODULOS.forEach(m => {
          obj[m.id] = { ver: p?.[`${m.id}_ver`] ?? false, modificar: p?.[`${m.id}_modificar`] ?? false }
        })
        setPermisos(obj)
      }
    }
  }, [id, esSuperAdmin])

  useEffect(() => { fetchUsuario() }, [fetchUsuario])
  useEffect(() => { if (sessionUser) fetchTab(tab) }, [tab, fetchTab, sessionUser])

  const guardarGeneral = async () => {
    setGuardando(true)
    const res = await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'actualizar_datos', ...form }),
    })
    setGuardando(false)
    if (res.ok) { setEditando(false); fetchUsuario(); showMsg('Datos actualizados') }
    else showMsg('Error al guardar', 'err')
  }

  const agregarNota = async () => {
    if (!nuevaNota.trim()) return
    const res = await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'agregar_nota', contenido: nuevaNota }),
    })
    if (res.ok) { setNuevaNota(''); fetchTab('notas') }
  }

  const eliminarNota = async (notaId: string) => {
    await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'eliminar_nota', notaId }),
    })
    fetchTab('notas')
  }

  const resetearPassword = async () => {
    if (!nuevaPass.trim()) return
    const res = await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'resetear_password', nuevaPassword: nuevaPass }),
    })
    if (res.ok) { setNuevaPass(''); showMsg('Contrasena actualizada') }
    else showMsg('Error al actualizar', 'err')
  }

  const revocarAcceso = async () => {
    const res = await fetch(`/api/panel-ejecutivo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'revocar_acceso' }),
    })
    if (res.ok) router.push('/panel-ejecutivo')
  }

  const iniciales = usuario?.nombre?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '??'
  const visibleTabs = TABS.filter(t => !t.soloAdmin || esSuperAdmin)

  if (!sessionUser) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: C.textSec, fontSize: '14px' }}>Verificando acceso...</div>
    </div>
  )

  if (cargando) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: C.textSec, fontSize: '14px' }}>Cargando perfil...</div>
    </div>
  )

  if (error || !usuario) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: C.red }}>{error || 'Usuario no encontrado'}</div>
    </div>
  )

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

      {msg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: msg.tipo === 'ok' ? '#14532d' : '#450a0a',
          border: `1px solid ${msg.tipo === 'ok' ? C.online : C.red}`,
          color: msg.tipo === 'ok' ? '#4ade80' : '#f87171',
          padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
          {msg.texto}
        </div>
      )}

      {/* Header */}
      <div style={{ background: C.bgSec, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.push('/panel-ejecutivo')}
          style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textSec, padding: '6px 14px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>
          Volver
        </button>
        <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%',
            background: usuario.esFundador ? `linear-gradient(135deg, ${C.gold}, #8a5c1a)` : '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700,
            color: usuario.esFundador ? '#0b0e1a' : C.text,
            border: `2px solid ${usuario.esFundador ? C.gold : C.border}` }}>
            {iniciales}
          </div>
          {isOnline && (
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: '13px', height: '13px', borderRadius: '50%', background: C.online, border: `2px solid ${C.bgSec}` }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>{usuario.nombre}</span>
            {usuario.esFundador && (
              <span style={{ background: `linear-gradient(135deg, ${C.gold}, #8a5c1a)`, color: '#0b0e1a', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '3px' }}>FUNDADOR</span>
            )}
            {usuario.rol === 'SUPER_ADMIN' && !usuario.esFundador && (
              <span style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px' }}>SUPER ADMIN</span>
            )}
            {usuario.rol === 'GERENCIAL' && (
              <span style={{ background: '#14532d', color: '#4ade80', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px' }}>GERENCIAL</span>
            )}
          </div>
          <div style={{ color: C.textSec, fontSize: '13px', marginTop: '2px' }}>{usuario.email}</div>
        </div>
      </div>

      {/* Tabs nav */}
      <div style={{ background: C.bgSec, borderBottom: `1px solid ${C.border}`, display: 'flex', overflowX: 'auto' }}>
        {visibleTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '13px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? `2px solid ${C.gold}` : '2px solid transparent',
              color: tab === t.id ? C.gold : C.textSec,
              fontWeight: tab === t.id ? 700 : 400,
              fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px' }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 24px', maxWidth: '860px', margin: '0 auto' }}>

        {tab === 'general' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Datos personales</h2>
              {(esSuperAdmin || esPropio) && !editando && (
                <button onClick={() => setEditando(true)}
                  style={{ background: 'transparent', border: `1px solid ${C.gold}`, color: C.gold, padding: '7px 16px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>
                  Editar
                </button>
              )}
              {editando && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={guardarGeneral} disabled={guardando}
                    style={{ background: C.gold, border: 'none', color: '#0b0e1a', padding: '7px 16px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', fontWeight: 700 }}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setEditando(false); setForm({ nombre: usuario.nombre, telefono: usuario.telefono || '', genero: usuario.genero || '' }) }}
                    style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textSec, padding: '7px 14px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Nombre completo', campo: 'nombre' },
                { label: 'Telefono', campo: 'telefono' },
              ].map(({ label, campo }) => (
                <div key={campo} style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px' }}>
                  <div style={{ color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
                  {editando ? (
                    <input value={form[campo as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [campo]: e.target.value }))}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '6px 10px', width: '100%', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' as const }} />
                  ) : (
                    <div style={{ fontSize: '14px', color: (usuario as any)[campo] ? C.text : C.textSec }}>{(usuario as any)[campo] || '—'}</div>
                  )}
                </div>
              ))}
              <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px' }}>
                <div style={{ color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>Genero</div>
                {editando ? (
                  <select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))}
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '6px 10px', width: '100%', borderRadius: '4px', fontSize: '14px' }}>
                    <option value="">no especificado</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                ) : (
                  <div style={{ fontSize: '14px', color: usuario.genero ? C.text : C.textSec }}>{usuario.genero || '—'}</div>
                )}
              </div>
              <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px' }}>
                <div style={{ color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>Email</div>
                <div style={{ fontSize: '14px' }}>{usuario.email}</div>
              </div>
              <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px' }}>
                <div style={{ color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>Rol</div>
                <div style={{ fontSize: '14px' }}>{usuario.rol}</div>
              </div>
              <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px' }}>
                <div style={{ color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>Fecha de ingreso</div>
                <div style={{ fontSize: '14px' }}>{new Date(usuario.creadoEn).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>
              <div style={{ background: C.bgSec, border: `1px solid ${isOnline ? C.online : C.border}`, borderRadius: '6px', padding: '16px' }}>
                <div style={{ color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>Estado</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: isOnline ? C.online : C.textSec, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: isOnline ? C.online : C.textSec }}>
                    {isOnline ? 'En linea ahora' : usuario.ultimaActividad
                      ? `Ultima vez: ${new Date(usuario.ultimaActividad).toLocaleString('es-ES')}`
                      : 'Sin actividad registrada'}
                  </span>
                </div>
              </div>
              {usuario.asignadoPor && (
                <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px' }}>
                  <div style={{ color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>Asignado por</div>
                  <div style={{ fontSize: '14px' }}>{usuario.asignadoPor}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'calendario' && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '22px' }}>Calendario {new Date().getFullYear()}</h2>
            <CalendarioAnual />
          </div>
        )}

        {tab === 'vacaciones' && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '22px' }}>Historial de vacaciones</h2>
            {vacaciones.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textSec, padding: '60px 0', fontSize: '14px' }}>Sin solicitudes registradas</div>
            ) : vacaciones.map((v: any) => (
              <div key={v.id} style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>
                    {new Date(v.fechaInicio).toLocaleDateString('es-ES')} a {new Date(v.fechaFin).toLocaleDateString('es-ES')}
                  </div>
                  {v.motivo && <div style={{ color: C.textSec, fontSize: '13px', marginTop: '3px' }}>{v.motivo}</div>}
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
                  background: v.estado === 'APROBADA' ? '#14532d' : v.estado === 'RECHAZADA' ? '#450a0a' : '#292524',
                  color: v.estado === 'APROBADA' ? '#4ade80' : v.estado === 'RECHAZADA' ? '#f87171' : '#d6d3d1' }}>
                  {v.estado}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'permisos' && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '22px' }}>Permisos por modulo</h2>
            {usuario.rol === 'SUPER_ADMIN' ? (
              <div style={{ background: C.bgSec, border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>👑</div>
                <div style={{ color: C.gold, fontWeight: 700, fontSize: '16px' }}>Acceso total</div>
                <div style={{ color: C.textSec, fontSize: '13px', marginTop: '6px' }}>Super Admin tiene acceso completo a todos los modulos</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', padding: '6px 16px', color: C.textSec, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px' }}>
                  <span>Modulo</span><span style={{ textAlign: 'center' }}>Ver</span><span style={{ textAlign: 'center' }}>Modificar</span>
                </div>
                {MODULOS.map(m => (
                  <div key={m.id} style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '13px 16px', marginBottom: '6px', display: 'grid', gridTemplateColumns: '1fr 90px 90px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>{m.label}</span>
                    {(['ver', 'modificar'] as const).map((key) => {
                      const color = key === 'ver' ? C.online : C.blue
                      const activo = permisos[m.id]?.[key] ?? false
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'center' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '3px', border: `2px solid ${activo ? color : C.border}`, background: activo ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activo && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>v</span>}
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

        {tab === 'actividad' && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '22px' }}>Historial de actividad</h2>
            {actividad.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textSec, padding: '60px 0', fontSize: '14px' }}>Sin actividad registrada</div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '28px' }}>
                <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '2px', background: C.border }} />
                {actividad.map((a: any) => {
                  const col = a.accion?.includes('eliminad') ? C.red : a.accion?.includes('aproba') ? C.online : a.accion?.includes('rechaza') ? '#f59e0b' : C.blue
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: col, flexShrink: 0, border: `2px solid ${C.bg}`, marginTop: '3px', marginLeft: '-20px' }} />
                      <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '12px 16px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: col }}>{a.accion}</span>
                          <span style={{ color: C.textSec, fontSize: '12px', whiteSpace: 'nowrap' as const }}>{new Date(a.creadoEn).toLocaleString('es-ES')}</span>
                        </div>
                        {a.motivo && <div style={{ color: C.textSec, fontSize: '13px', marginTop: '4px' }}>{a.motivo}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'sesiones' && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '22px' }}>Ultimas conexiones</h2>
            <div style={{ background: C.bgSec, border: `1px solid ${isOnline ? C.online : C.border}`, borderRadius: '6px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isOnline ? C.online : C.textSec, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: isOnline ? C.online : C.textSec, fontSize: '14px' }}>{isOnline ? 'En linea ahora' : 'Desconectado'}</div>
                {usuario.ultimaActividad && (
                  <div style={{ color: C.textSec, fontSize: '13px', marginTop: '2px' }}>Ultima actividad: {new Date(usuario.ultimaActividad).toLocaleString('es-ES')}</div>
                )}
              </div>
            </div>
            {sesiones.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textSec, padding: '40px 0', fontSize: '14px' }}>Sin historial detallado de sesiones</div>
            ) : sesiones.map((s: any) => (
              <div key={s.id} style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '13px 16px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px' }}>{s.dispositivo || 'Dispositivo desconocido'}</div>
                  {s.ip && <div style={{ color: C.textSec, fontSize: '12px', marginTop: '2px' }}>IP: {s.ip}</div>}
                </div>
                <div style={{ color: C.textSec, fontSize: '13px' }}>{new Date(s.creadoEn).toLocaleString('es-ES')}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'notas' && esSuperAdmin && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Notas privadas</h2>
            <div style={{ color: C.textSec, fontSize: '12px', marginBottom: '22px' }}>Solo visible para Super Admins</div>
            <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
              <textarea value={nuevaNota} onChange={e => setNuevaNota(e.target.value)}
                placeholder="Escribe una nota privada..." rows={3}
                style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '10px 12px', borderRadius: '4px', fontSize: '14px', resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
              <button onClick={agregarNota} disabled={!nuevaNota.trim()}
                style={{ marginTop: '10px', background: nuevaNota.trim() ? C.gold : C.border, border: 'none', color: nuevaNota.trim() ? '#0b0e1a' : C.textSec, padding: '8px 18px', cursor: nuevaNota.trim() ? 'pointer' : 'default', borderRadius: '4px', fontSize: '13px', fontWeight: 700 }}>
                Añadir nota
              </button>
            </div>
            {notas.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textSec, padding: '32px 0', fontSize: '14px' }}>Sin notas privadas</div>
            ) : notas.map((n: any) => (
              <div key={n.id} style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '16px', marginBottom: '8px', display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' as const }}>{n.contenido}</div>
                  <div style={{ color: C.textSec, fontSize: '12px', marginTop: '8px' }}>Por {n.autorNombre} · {new Date(n.creadoEn).toLocaleString('es-ES')}</div>
                </div>
                <button onClick={() => eliminarNota(n.id)}
                  style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.red, cursor: 'pointer', padding: '4px 9px', borderRadius: '4px', fontSize: '13px', flexShrink: 0, alignSelf: 'flex-start' }}>
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'seguridad' && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '22px' }}>Seguridad</h2>
            {(esSuperAdmin || esPropio) && (
              <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '20px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', marginTop: 0 }}>
                  {esSuperAdmin && !esPropio ? 'Resetear contrasena' : 'Cambiar mi contrasena'}
                </h3>
                <p style={{ color: C.textSec, fontSize: '13px', marginBottom: '14px' }}>
                  {esSuperAdmin && !esPropio ? 'Establece una nueva contrasena para este usuario.' : 'Actualiza tu contrasena de acceso.'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="password" value={nuevaPass} onChange={e => setNuevaPass(e.target.value)}
                    placeholder="Nueva contrasena..."
                    style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '8px 12px', borderRadius: '4px', fontSize: '14px' }} />
                  <button onClick={resetearPassword} disabled={!nuevaPass.trim()}
                    style={{ background: nuevaPass.trim() ? C.gold : C.border, border: 'none', color: nuevaPass.trim() ? '#0b0e1a' : C.textSec, padding: '8px 18px', cursor: nuevaPass.trim() ? 'pointer' : 'default', borderRadius: '4px', fontSize: '13px', fontWeight: 700 }}>
                    Guardar
                  </button>
                </div>
              </div>
            )}
            {esSuperAdmin && !esPropio && (
              <div style={{ background: '#150a0a', border: `1px solid ${C.red}`, borderRadius: '6px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.red, marginBottom: '6px', marginTop: 0 }}>Revocar acceso</h3>
                <p style={{ color: C.textSec, fontSize: '13px', marginBottom: '14px' }}>Desactiva esta cuenta. El usuario no podra iniciar sesion.</p>
                {!confirmRevoke ? (
                  <button onClick={() => setConfirmRevoke(true)}
                    style={{ background: 'transparent', border: `1px solid ${C.red}`, color: C.red, padding: '8px 18px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', fontWeight: 700 }}>
                    Revocar acceso
                  </button>
                ) : (
                  <div>
                    <div style={{ color: '#fbbf24', fontSize: '13px', marginBottom: '10px', fontWeight: 600 }}>Seguro? Esta accion desactivara la cuenta de {usuario.nombre}.</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={revocarAcceso}
                        style={{ background: C.red, border: 'none', color: '#fff', padding: '8px 18px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', fontWeight: 700 }}>
                        Si, revocar
                      </button>
                      <button onClick={() => setConfirmRevoke(false)}
                        style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textSec, padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>
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
  )
}