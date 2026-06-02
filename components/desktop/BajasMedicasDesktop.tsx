"use client"

import { useState, useEffect } from "react"

// ── Tipos ─────────────────────────────────────────────────────
type EstadoBaja = 'activa' | 'alta' | 'pendiente_confirmacion_inss'
type TipoBaja   = 'it_comun' | 'it_profesional' | 'at' | 'maternidad' | 'paternidad' | 'menstruacion' | 'semana39' | 'interrupcion_embarazo'

type Baja = {
  id: number
  empleado: string
  grupo: string
  tipo: TipoBaja
  fechaInicio: string
  fechaFin?: string
  diasDuracion: number
  estado: EstadoBaja
  diagnostico?: string
  numeroParteINSS?: string
  medico?: string
  fechaRecepcionINSS: string        // Fecha en que el INSS lo comunicó vía RED
  confirmadaDatosEconomicos: boolean // Empresa debe confirmar datos econ. al INSS en 3 días hábiles
  fechaConfirmacion?: string
  documentos: string[]
  diasSinSubsidio: number            // Días 1-3 sin cobro (salvo convenio)
  porcentajeActual: number           // 60% días 4-20 / 75% desde día 21
  convenioCubre100: boolean
}

// ── Estilos ────────────────────────────────────────────────────
const grupoColor: Record<string,string> = {
  G1A:'#0284c7', G1B:'#0369a1', G2A:'#0891b2',
  G2B:'#0e7490', G3A:'#6366f1', G3B:'#4f46e5',
}

const tipoStyle: Record<TipoBaja,{ label:string, bg:string, color:string, border:string, info:string }> = {
  it_comun:             { label:'IT Enfermedad común',      bg:'#fef9c3', color:'#854d0e', border:'#fde68a', info:'Días 1-3 sin subsidio. Días 4-20: 60% BR. Desde día 21: 75% BR.' },
  it_profesional:       { label:'IT Enfermedad profesional',bg:'#fed7aa', color:'#c2410c', border:'#fdba74', info:'Desde el día 1: 75% BR a cargo de la mutua.' },
  at:                   { label:'Accidente de trabajo',     bg:'#fee2e2', color:'#b91c1c', border:'#fca5a5', info:'Desde el día 1: 75% BR a cargo de la mutua. Notificación 24h a ITSS.' },
  maternidad:           { label:'Maternidad / Nacimiento',  bg:'#f5f3ff', color:'#6d28d9', border:'#c4b5fd', info:'16 semanas. 100% BR a cargo de la SS desde el primer día.' },
  paternidad:           { label:'Paternidad / Nacimiento',  bg:'#dbeafe', color:'#1d4ed8', border:'#93c5fd', info:'16 semanas. 100% BR a cargo de la SS desde el primer día.' },
  menstruacion:         { label:'Menstruación incapacitante',bg:'#fce7f3', color:'#9d174d', border:'#f9a8d4', info:'Desde el primer día. Sin periodo de carencia. 60% BR días 1-20, 75% desde día 21. SS paga desde el inicio.' },
  semana39:             { label:'Semana 39 de gestación',   bg:'#ecfdf5', color:'#065f46', border:'#6ee7b7', info:'SS paga desde el inicio de la semana 39 hasta el parto.' },
  interrupcion_embarazo:{ label:'Interrupción de embarazo', bg:'#fff7ed', color:'#c2410c', border:'#fed7aa', info:'Día 1 a cargo de la empresa. Desde el día 2 a cargo de la SS.' },
}

const estadoStyle: Record<EstadoBaja,{ label:string, bg:string, color:string, border:string }> = {
  activa:                        { label:'Activa',                      bg:'#fee2e2', color:'#b91c1c', border:'#fca5a5' },
  alta:                          { label:'Alta médica',                 bg:'#dcfce7', color:'#15803d', border:'#86efac' },
  pendiente_confirmacion_inss:   { label:'⚠ Pend. confirmación INSS',  bg:'#fef9c3', color:'#854d0e', border:'#fde68a' },
}

// ── Cálculo porcentaje prestación ─────────────────────────────
function getPorcentaje(dias: number, tipo: TipoBaja): number {
  if (['at','it_profesional','maternidad','paternidad','menstruacion','semana39','interrupcion_embarazo'].includes(tipo)) return 75
  if (dias <= 3)  return 0
  if (dias <= 20) return 60
  return 75
}

// ── Datos demo ─────────────────────────────────────────────────
const bajas: Baja[] = [
  { id:1, empleado:'Juan Pérez García',   grupo:'G1A', tipo:'it_comun',   fechaInicio:'15/04/2026', diasDuracion:18, estado:'activa',                     diagnostico:'Lumbalgia aguda',       numeroParteINSS:'2026-INSS-00123', medico:'Dr. García López',  fechaRecepcionINSS:'16/04/2026', confirmadaDatosEconomicos:true,  fechaConfirmacion:'17/04/2026', documentos:['parte_inss_inicial.pdf'], diasSinSubsidio:3, porcentajeActual:75, convenioCubre100:false },
  { id:2, empleado:'Ana Martínez Sanz',   grupo:'G2B', tipo:'at',         fechaInicio:'02/05/2026', diasDuracion:5,  estado:'activa',                     diagnostico:'Esguince tobillo',      numeroParteINSS:'2026-INSS-00156', medico:'Mutua FREMAP',      fechaRecepcionINSS:'02/05/2026', confirmadaDatosEconomicos:true,  fechaConfirmacion:'02/05/2026', documentos:['parte_at_mutua.pdf','delta_at.pdf'], diasSinSubsidio:0, porcentajeActual:75, convenioCubre100:false },
  { id:3, empleado:'Laura Torres Vega',   grupo:'G3B', tipo:'maternidad', fechaInicio:'01/03/2026', fechaFin:'29/06/2026', diasDuracion:120, estado:'activa', diagnostico:'',                 numeroParteINSS:'2026-INSS-00089', medico:'Dra. López Sanz',   fechaRecepcionINSS:'28/02/2026', confirmadaDatosEconomicos:true,  fechaConfirmacion:'28/02/2026', documentos:['prestacion_nacimiento.pdf'], diasSinSubsidio:0, porcentajeActual:100, convenioCubre100:true },
  { id:4, empleado:'Carlos López Martín', grupo:'G1B', tipo:'it_comun',   fechaInicio:'20/04/2026', fechaFin:'04/05/2026', diasDuracion:14,  estado:'alta',  diagnostico:'Gripe complicada',  numeroParteINSS:'2026-INSS-00134', medico:'Dr. Pérez Vega',    fechaRecepcionINSS:'21/04/2026', confirmadaDatosEconomicos:true,  fechaConfirmacion:'22/04/2026', documentos:['parte_alta_inss.pdf'], diasSinSubsidio:3, porcentajeActual:60, convenioCubre100:false },
  { id:5, empleado:'Pedro Sánchez Ruiz',  grupo:'G3A', tipo:'it_comun',   fechaInicio:'28/04/2026', diasDuracion:4,  estado:'pendiente_confirmacion_inss', diagnostico:'Gastroenteritis',      numeroParteINSS:'2026-INSS-00167', medico:'',                  fechaRecepcionINSS:'29/04/2026', confirmadaDatosEconomicos:false, documentos:[], diasSinSubsidio:3, porcentajeActual:60, convenioCubre100:false },
  { id:6, empleado:'María García López',  grupo:'G2A', tipo:'menstruacion',fechaInicio:'30/04/2026', diasDuracion:3,  estado:'activa',                     diagnostico:'Menstruación incapacitante secundaria', numeroParteINSS:'2026-INSS-00171', medico:'Dra. Sanz Ruiz', fechaRecepcionINSS:'30/04/2026', confirmadaDatosEconomicos:true, fechaConfirmacion:'30/04/2026', documentos:['parte_inss_menstr.pdf'], diasSinSubsidio:0, porcentajeActual:60, convenioCubre100:false },
]

function Avatar({ nombre, size=28 }: { nombre:string, size?:number }) {
  const initials = nombre.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
  const colors   = ['#0284c7','#0369a1','#6366f1','#0891b2','#d97706','#16a34a']
  return (
    <div style={{ width:size, height:size, borderRadius:4, background:colors[nombre.charCodeAt(0)%colors.length], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontSize:size*0.34, fontWeight:600 }}>
      {initials}
    </div>
  )
}

// ── Componente principal ────────────────────────────────────────
export default function BajasMedicasDesktop() {
  const [normativa, setNormativa] = useState<Record<string, { descripcion:string, version:string, fechaActualizacion:string }>>({})
  const [cargandoNorm, setCargandoNorm] = useState(true)

  useEffect(() => {
    fetch('/api/normativa')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, any> = {}
        if (data.normativa) data.normativa.forEach((n: any) => { map[n.clave] = n })
        setNormativa(map)
      })
      .catch(() => {})
      .finally(() => setCargandoNorm(false))
  }, [])

  const [filtroEstado, setFiltroEstado]   = useState<'todos'|EstadoBaja>('todos')
  const [filtroTipo, setFiltroTipo]       = useState<'todos'|TipoBaja>('todos')
  const [selected, setSelected]           = useState<Baja|null>(null)
  const [showNueva, setShowNueva]         = useState(false)
  const [showNormativa, setShowNormativa] = useState(false)
  const [editandoCorreo, setEditandoCorreo] = useState(false)
  const [correoActual, setCorreoActual]   = useState('bajas@empresa.com')
  const [correoNuevo, setCorreoNuevo]     = useState('')
  const [guardandoCorreo, setGuardandoCorreo] = useState(false)
  const [correoGuardado, setCorreoGuardado] = useState(false)

  const guardarCorreo = async () => {
    if (!correoNuevo || !correoNuevo.includes('@')) return
    setGuardandoCorreo(true)
    await new Promise(r => setTimeout(r, 800))
    setCorreoActual(correoNuevo)
    setCorreoNuevo('')
    setEditandoCorreo(false)
    setGuardandoCorreo(false)
    setCorreoGuardado(true)
    setTimeout(() => setCorreoGuardado(false), 3000)
  }

  const lista = bajas.filter(b =>
    (filtroEstado === 'todos' || b.estado === filtroEstado) &&
    (filtroTipo   === 'todos' || b.tipo   === filtroTipo)
  )

  const stats = {
    activas:     bajas.filter(b=>b.estado==='activa').length,
    altas:       bajas.filter(b=>b.estado==='alta').length,
    pendientesINSS: bajas.filter(b=>!b.confirmadaDatosEconomicos).length,
    diasTotal:   bajas.filter(b=>b.estado==='activa').reduce((s,b)=>s+b.diasDuracion,0),
  }

  return (
    <div className="space-y-4">

      {/* Banner normativa vigente RD 1060/2022 */}
      <div style={{ display:'flex', gap:10, alignItems:'flex-start', background:'var(--surface)', borderLeft:'3px solid #0284c7', borderRadius:'0 4px 4px 0', padding:'10px 14px', border:'0.5px solid var(--border)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:12, fontWeight:600, color:'#1e40af' }}>RD 1060/2022 y Orden ISM/2/2023 — Gestión 100% telemática desde abril 2023</p>
          <p style={{ fontSize:11, color:'#3b82f6', marginTop:1 }}>El INSS comunica automáticamente los partes a la empresa vía sistema RED. El trabajador NO entrega el parte físicamente. La empresa debe confirmar los datos económicos al INSS en un máximo de <strong>3 días hábiles</strong>.</p>
        </div>
        <button onClick={()=>setShowNormativa(!showNormativa)}
          style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, background:'#dbeafe', color:'#1d4ed8', border:'0.5px solid #93c5fd', flexShrink:0, cursor:'pointer' }}>
          {showNormativa ? 'Ocultar' : 'Ver normativa'}
        </button>
      </div>

      {/* Panel normativa — cargado dinámicamente desde BD */}
      {showNormativa && (
        <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ padding:'10px 14px', borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface-2)' }}>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>Normativa vigente — Bajas médicas</p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {cargandoNorm && <span style={{ fontSize:10, color:'var(--text-muted)' }}>Actualizando...</span>}
              {!cargandoNorm && normativa['bajas_it_comun'] && (
                <span style={{ fontSize:10, color:'var(--text-muted)' }}>
                  Última comprobación: {new Date(normativa['bajas_it_comun'].fechaActualizacion).toLocaleDateString('es-ES')}
                </span>
              )}
              <span style={{ fontSize:10, fontWeight:500, padding:'1px 7px', borderRadius:20, background:'#dcfce7', color:'#15803d', border:'0.5px solid #86efac' }}>
                ✓ Auto-actualizada
              </span>
            </div>
          </div>
          <div style={{ padding:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {cargandoNorm
              ? [1,2,3,4,5,6].map(i => (
                <div key={i} style={{ padding:'10px', background:'var(--surface-2)', borderRadius:4, border:'0.5px solid var(--border)', height:70, opacity:0.5 }} />
              ))
              : [
                  { clave:'bajas_it_comun',      titulo:'IT Enfermedad común'           },
                  { clave:'bajas_at',            titulo:'Accidente de trabajo / IT Prof.'},
                  { clave:'bajas_menstruacion',  titulo:'Menstruación incapacitante'     },
                  { clave:'bajas_semana39',      titulo:'Semana 39 de gestación'         },
                  { clave:'bajas_interrupcion_embarazo', titulo:'Interrupción de embarazo'},
                  { clave:'bajas_maternidad',    titulo:'Maternidad / Paternidad'        },
                  { clave:'bajas_flujo_inss',    titulo:'Recepción telemática INSS'      },
                ].map(n => (
                  <div key={n.clave} style={{ padding:'8px 10px', background:'var(--surface-2)', borderRadius:4, border:'0.5px solid var(--border)' }}>
                    <p style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>{normativa[n.clave]?.titulo || n.titulo}</p>
                    <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.5 }}>
                      {normativa[n.clave]?.descripcion || 'Cargando...'}
                    </p>
                    {normativa[n.clave]?.version && (
                      <p style={{ fontSize:9, color:'var(--text-muted)', marginTop:4 }}>{normativa[n.clave].version}</p>
                    )}
                  </div>
                ))
            }
          </div>
          {/* Alertas de cambios detectados por el cron */}
          {Object.keys(normativa).filter(k => k.startsWith('alerta_')).length > 0 && (
            <div style={{ margin:'0 14px 14px', padding:'10px 12px', background:'#fff7ed', border:'0.5px solid #fed7aa', borderRadius:4 }}>
              <p style={{ fontSize:11, fontWeight:600, color:'#c2410c', marginBottom:4 }}>⚠ Posibles cambios normativos detectados</p>
              {Object.keys(normativa).filter(k => k.startsWith('alerta_')).map(k => (
                <p key={k} style={{ fontSize:11, color:'#92400e', lineHeight:1.5 }}>{normativa[k].descripcion}</p>
              ))}
              <p style={{ fontSize:10, color:'#b45309', marginTop:6 }}>Revisa y confirma estos cambios manualmente antes de actualizar el sistema.</p>
            </div>
          )}
          <div style={{ padding:'8px 14px', borderTop:'0.5px solid var(--border)', background:'var(--surface-2)' }}>
            <p style={{ fontSize:10, color:'var(--text-muted)' }}>
              Actualización automática diaria a las 06:00 UTC · Sistema consulta BOE y seg-social.es · Si se detecta un cambio aparece una alerta naranja
            </p>
          </div>
        </div>
      )}

      {/* Panel de instrucciones — siempre visible */}
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ padding:'10px 14px', borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', gap:8, background:'var(--surface-2)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
          <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>¿Para qué sirve esta sección?</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0 }}>
          {[
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
              titulo: 'Recepción automática',
              texto: 'El sistema monitorea bajas@empresa.com cada 5 minutos. Cuando el INSS envía un parte vía sistema RED, se crea la baja automáticamente sin que tengas que hacer nada.',
              color: '#0284c7',
            },
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              titulo: 'Confirmar en 3 días hábiles',
              texto: 'Cuando llegue una baja verás una alerta naranja. Debes confirmar los datos económicos del trabajador al INSS en un máximo de 3 días hábiles usando tu PIN de administrador.',
              color: '#d97706',
            },
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
              titulo: 'Registro y auditoría',
              texto: 'Cada acción queda registrada con fecha, hora y administrador responsable. Este historial es obligatorio para inspecciones de la AEAT y la Seguridad Social (RD 1060/2022).',
              color: '#16a34a',
            },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 14px', borderRight: i < 2 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                {item.icon}
                <p style={{ fontSize:11, fontWeight:600, color:item.color }}>{item.titulo}</p>
              </div>
              <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.6 }}>{item.texto}</p>
            </div>
          ))}
        </div>
        {/* Configuración correo IMAP */}
        <div style={{ borderTop:'0.5px solid var(--border)', padding:'10px 14px', background:'var(--surface-2)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <p style={{ fontSize:11, color:'var(--text-secondary)' }}>
                Correo de recepción INSS: <strong style={{ color:'var(--text-primary)' }}>{correoActual}</strong>
              </p>
              {correoGuardado && (
                <span style={{ fontSize:10, fontWeight:600, color:'#15803d', background:'#dcfce7', border:'0.5px solid #86efac', borderRadius:20, padding:'1px 8px' }}>✓ Guardado</span>
              )}
            </div>
            <button
              onClick={() => setEditandoCorreo(!editandoCorreo)}
              style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:4, cursor:'pointer', transition:'all .15s',
                background: editandoCorreo ? 'var(--surface-2)' : 'var(--surface)',
                color: 'var(--text-secondary)',
                border:'0.5px solid var(--border-strong)' }}>
              {editandoCorreo ? 'Cancelar' : 'Cambiar correo'}
            </button>
          </div>

          {editandoCorreo && (
            <div style={{ marginTop:10, padding:'10px 12px', background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:4 }}>
              <p style={{ fontSize:11, color:'var(--text-secondary)', marginBottom:8, lineHeight:1.5 }}>
                Introduce el nuevo correo donde el INSS enviará los partes de baja. Debe ser una cuenta con <strong>acceso IMAP activado</strong>. Tras guardar, el sistema comenzará a monitorearlo en el próximo ciclo (5 minutos). El cambio también deberá actualizarse en <code style={{ background:'var(--border)', padding:'1px 4px', borderRadius:2, fontSize:10 }}>.env.local → IMAP_USER</code> para que persista tras un reinicio del servidor.
              </p>
              <div style={{ display:'flex', gap:6 }}>
                <input
                  type="email"
                  placeholder="nuevo@empresa.com"
                  value={correoNuevo}
                  onChange={e => setCorreoNuevo(e.target.value)}
                  className="input-base text-sm"
                  style={{ flex:1 }}
                />
                <button
                  onClick={guardarCorreo}
                  disabled={guardandoCorreo || !correoNuevo}
                  className="btn-primary text-sm px-4"
                  style={{ opacity: (!correoNuevo || guardandoCorreo) ? 0.5 : 1 }}>
                  {guardandoCorreo ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
              <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:6 }}>
                Normativa: RD 1060/2022 · Orden ISM/2/2023 — Recepción telemática obligatoria desde abril 2023
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alerta pendientes confirmación INSS */}
      {stats.pendientesINSS > 0 && (
        <div style={{ display:'flex', gap:10, alignItems:'center', background:'#fff7ed', borderLeft:'3px solid #d97706', borderRadius:'0 4px 4px 0', padding:'10px 14px', border:'0.5px solid #fed7aa' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p style={{ fontSize:12, color:'#92400e', fontWeight:500 }}>
            <strong>{stats.pendientesINSS} baja{stats.pendientesINSS>1?'s':''}</strong> pendiente{stats.pendientesINSS>1?'s':''} de confirmación de datos económicos al INSS — plazo máximo 3 días hábiles desde la recepción
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Bajas activas',         value:stats.activas,       color:'#b91c1c' },
          { label:'Altas médicas',          value:stats.altas,         color:'#16a34a' },
          { label:'Pend. confirm. INSS',    value:stats.pendientesINSS,color:'#d97706' },
          { label:'Días totales de baja',   value:stats.diasTotal,     color:'#0284c7' },
        ].map((k,i) => {
          const [hov, setHov] = useState(false)
          return (
            <div key={i} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
              style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, padding:'16px 18px', borderLeft:`3px solid ${k.color}`,
                boxShadow:hov?'var(--shadow-lg)':'var(--shadow-sm)', transform:hov?'scale(1.03) translateY(-2px)':'scale(1)', transition:'all .2s cubic-bezier(.34,1.56,.64,1)' }}>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:5 }}>{k.label}</p>
              <p style={{ fontSize:26, fontWeight:600, color:k.color, lineHeight:1 }}>{k.value}</p>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, padding:'11px 14px', boxShadow:'var(--shadow-sm)', display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {(['todos','activa','alta','pendiente_confirmacion_inss'] as const).map(e=>{
            const es = e==='todos' ? null : estadoStyle[e as EstadoBaja]
            return (
              <button key={e} onClick={()=>setFiltroEstado(e)}
                style={{ padding:'4px 10px', fontSize:11, fontWeight:500, borderRadius:20, cursor:'pointer', transition:'all .15s',
                  background: filtroEstado===e ? (es?es.bg:'var(--accent)') : 'var(--surface-2)',
                  color:      filtroEstado===e ? (es?es.color:'#fff')       : 'var(--text-secondary)',
                  border:`0.5px solid ${filtroEstado===e ? (es?es.border:'var(--accent)') : 'var(--border-strong)'}` }}>
                {e==='todos' ? 'Todas' : estadoStyle[e as EstadoBaja].label}
              </button>
            )
          })}
        </div>

        <div style={{ width:1, height:20, background:'var(--border)', flexShrink:0 }} />

        <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value as any)}>
          <option value="todos">Todos los tipos</option>
          {(Object.entries(tipoStyle) as [TipoBaja, typeof tipoStyle[TipoBaja]][]).map(([key,val])=>(
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        <button onClick={()=>setShowNueva(true)} className="btn-primary text-sm px-4 py-2 ml-auto whitespace-nowrap">
          + Registrar baja
        </button>
      </div>

      {/* Lista */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {lista.map(b => {
          const [hov, setHov] = useState(false)
          const es = estadoStyle[b.estado]
          const ts = tipoStyle[b.tipo]
          const diasRestantesConfirm = !b.confirmadaDatosEconomicos ? 3 : 0

          return (
            <div key={b.id}
              onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
              onClick={()=>setSelected(b)}
              style={{ background:'var(--surface)', border:`0.5px solid ${!b.confirmadaDatosEconomicos?'#fde68a':'var(--border)'}`, borderRadius:6,
                boxShadow:hov?'var(--shadow-md)':'var(--shadow-sm)', transform:hov?'translateY(-1px)':'translateY(0)', transition:'all .15s ease',
                cursor:'pointer', overflow:'hidden', borderLeft:`3px solid ${es.color}` }}>

              {/* Alerta INSS pendiente */}
              {!b.confirmadaDatosEconomicos && (
                <div style={{ background:'#fff7ed', borderBottom:'0.5px solid #fed7aa', padding:'5px 14px', fontSize:11, fontWeight:500, color:'#c2410c', display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                  Confirmar datos económicos al INSS — plazo máximo 3 días hábiles desde {b.fechaRecepcionINSS}
                </div>
              )}

              {/* Cabecera */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderBottom:'0.5px solid var(--border)' }}>
                <Avatar nombre={b.empleado} size={30} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.empleado}</p>
                  <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:grupoColor[b.grupo], borderRadius:3, padding:'1px 6px' }}>{b.grupo}</span>
                </div>
                <span style={{ fontSize:10, fontWeight:500, color:ts.color, background:ts.bg, border:`0.5px solid ${ts.border}`, borderRadius:20, padding:'2px 9px', flexShrink:0 }}>{ts.label}</span>
                <span style={{ fontSize:10, fontWeight:500, color:es.color, background:es.bg, border:`0.5px solid ${es.border}`, borderRadius:20, padding:'2px 9px', flexShrink:0 }}>{es.label}</span>
              </div>

              {/* Datos */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', padding:'10px 0' }}>
                {[
                  { label:'Inicio',            value:b.fechaInicio },
                  { label:'Fin / Alta',         value:b.fechaFin||'En curso' },
                  { label:'Días',              value:String(b.diasDuracion) },
                  { label:'Prestación',         value: b.porcentajeActual===0 ? 'Sin subsidio' : `${b.porcentajeActual}% BR${b.convenioCubre100?' (conv.→100%)':''}` },
                  { label:'N.º parte INSS',     value:b.numeroParteINSS||'—' },
                ].map(d=>(
                  <div key={d.label} style={{ padding:'0 10px', borderRight:'0.5px solid var(--border)' }}>
                    <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>{d.label}</p>
                    <p style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)' }}>{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Pie */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 14px', borderTop:'0.5px solid var(--border)', background:'var(--surface-2)' }}>
                <p style={{ fontSize:11, color:'var(--text-secondary)' }}>
                  {b.diagnostico
                    ? <><span style={{ fontWeight:500 }}>Dx:</span> {b.diagnostico}</>
                    : <span style={{ fontStyle:'italic', color:'var(--text-muted)' }}>Sin diagnóstico registrado</span>}
                </p>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:10, fontWeight:500, padding:'1px 7px', borderRadius:20, border:'0.5px solid',
                    background: b.confirmadaDatosEconomicos?'#dcfce7':'#fef9c3',
                    color:      b.confirmadaDatosEconomicos?'#15803d':'#854d0e',
                    borderColor:b.confirmadaDatosEconomicos?'#86efac':'#fde68a' }}>
                    {b.confirmadaDatosEconomicos ? '✓ Datos confirmados INSS' : '⏳ Sin confirmar INSS'}
                  </span>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>INSS notificó {b.fechaRecepcionINSS}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e=>{ if(e.target===e.currentTarget) setSelected(null) }}>
          <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>

            <div style={{ padding:'14px 18px', borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
              <Avatar nombre={selected.empleado} size={36} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{selected.empleado}</p>
                <div style={{ display:'flex', gap:5, marginTop:3, flexWrap:'wrap' }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:grupoColor[selected.grupo], borderRadius:3, padding:'1px 6px' }}>{selected.grupo}</span>
                  <span style={{ fontSize:10, color:tipoStyle[selected.tipo].color, background:tipoStyle[selected.tipo].bg, border:`0.5px solid ${tipoStyle[selected.tipo].border}`, borderRadius:20, padding:'1px 8px' }}>{tipoStyle[selected.tipo].label}</span>
                  <span style={{ fontSize:10, color:estadoStyle[selected.estado].color, background:estadoStyle[selected.estado].bg, border:`0.5px solid ${estadoStyle[selected.estado].border}`, borderRadius:20, padding:'1px 8px' }}>{estadoStyle[selected.estado].label}</span>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="btn-secondary w-7 h-7 flex items-center justify-center text-sm">✕</button>
            </div>

            <div style={{ padding:18 }} className="space-y-4">

              {/* Info normativa del tipo */}
              <div style={{ background:'#eff6ff', border:'0.5px solid #bfdbfe', borderRadius:4, padding:'10px 12px' }}>
                <p style={{ fontSize:11, fontWeight:600, color:'#1e40af', marginBottom:2 }}>Normativa aplicable</p>
                <p style={{ fontSize:11, color:'#3b82f6' }}>{tipoStyle[selected.tipo].info}</p>
              </div>

              {/* Datos del parte */}
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:8 }}>Datos del parte INSS</p>
                {[
                  { label:'Fecha inicio',                value:selected.fechaInicio },
                  { label:'Fecha fin / alta',            value:selected.fechaFin||'En curso' },
                  { label:'Días de baja',                value:String(selected.diasDuracion) },
                  { label:'N.º parte INSS',              value:selected.numeroParteINSS||'—' },
                  { label:'Médico',                      value:selected.medico||'—' },
                  { label:'Diagnóstico',                 value:selected.diagnostico||'—' },
                  { label:'INSS notificó vía RED',       value:selected.fechaRecepcionINSS },
                  { label:'Datos econ. confirmados INSS',value:selected.confirmadaDatosEconomicos ? `Sí — ${selected.fechaConfirmacion}` : '⚠ Pendiente (plazo 3 días hábiles)' },
                  { label:'Prestación actual',           value: selected.porcentajeActual===0 ? 'Sin subsidio (días 1-3)' : `${selected.porcentajeActual}% Base Reguladora` },
                  { label:'Convenio complementa al 100%',value:selected.convenioCubre100 ? 'Sí' : 'No' },
                ].map(d=>(
                  <div key={d.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'0.5px solid var(--border)' }}>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{d.label}</span>
                    <span style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)', textAlign:'right', maxWidth:'55%' }}>{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Documentos */}
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:8 }}>Documentos</p>
                {selected.documentos.length > 0
                  ? selected.documentos.map((doc,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'var(--surface-2)', borderRadius:4, border:'0.5px solid var(--border)', marginBottom:4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span style={{ fontSize:12, color:'var(--text-primary)', flex:1 }}>{doc}</span>
                      <button style={{ fontSize:11, color:'var(--accent)', fontWeight:500, background:'none', border:'none', cursor:'pointer' }}>Ver</button>
                    </div>
                  ))
                  : <p style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic', marginBottom:8 }}>Sin documentos adjuntos</p>
                }
                <div style={{ border:'1.5px dashed var(--border-strong)', borderRadius:4, padding:'10px', textAlign:'center', cursor:'pointer', marginTop:6 }}>
                  <p style={{ fontSize:11, color:'var(--text-secondary)' }}>Adjuntar documento · PDF, JPG o PNG · Máx. 10MB</p>
                </div>
              </div>

              {/* Confirmar datos INSS */}
              {!selected.confirmadaDatosEconomicos && (
                <div style={{ background:'#fff7ed', border:'0.5px solid #fed7aa', borderRadius:4, padding:'12px 14px' }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#92400e', marginBottom:4 }}>Confirmación datos económicos al INSS</p>
                  <p style={{ fontSize:11, color:'#b45309', marginBottom:10 }}>Según RD 1060/2022, la empresa debe comunicar los datos económicos del trabajador al INSS en un máximo de 3 días hábiles desde la recepción del parte. Confirma con tu PIN de administrador.</p>
                  <div style={{ display:'flex', gap:6 }}>
                    <input type="password" placeholder="PIN admin" className="input-base text-sm" style={{ maxWidth:120 }} />
                    <button className="btn-primary text-sm px-4 py-1.5">Confirmar al INSS</button>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div style={{ display:'flex', gap:8, paddingTop:4 }}>
                <button onClick={()=>setSelected(null)} className="btn-secondary flex-1 py-2 text-sm">Cerrar</button>
                {selected.estado === 'activa' && (
                  <button className="btn-primary flex-1 py-2 text-sm">Registrar alta médica</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva baja */}
      {showNueva && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowNueva(false) }}>
          <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:'14px 18px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Registrar nueva baja</p>
              <button onClick={()=>setShowNueva(false)} className="btn-secondary w-7 h-7 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding:18 }} className="space-y-4">

              <div style={{ background:'#eff6ff', border:'0.5px solid #bfdbfe', borderRadius:4, padding:'9px 12px' }}>
                <p style={{ fontSize:11, color:'#1e40af' }}>El parte llega automáticamente del INSS vía sistema RED. Registra aquí la recepción y confirma los datos económicos en un máximo de <strong>3 días hábiles</strong>.</p>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Empleado</label>
                <select className="w-full">
                  <option>Seleccionar empleado...</option>
                  {bajas.map(b=><option key={b.id}>{b.empleado}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Tipo de baja</label>
                <select className="w-full">
                  {(Object.entries(tipoStyle) as [TipoBaja, typeof tipoStyle[TipoBaja]][]).map(([key,val])=>(
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Fecha inicio baja</label>
                  <input type="date" className="input-base text-sm" />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Fecha recepción vía INSS RED</label>
                  <input type="date" className="input-base text-sm" />
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>N.º parte INSS</label>
                <input type="text" placeholder="2026-INSS-00000" className="input-base text-sm" />
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Médico / Mutua</label>
                <input type="text" placeholder="Nombre del médico o mutua" className="input-base text-sm" />
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Diagnóstico (opcional)</label>
                <input type="text" placeholder="Diagnóstico CIE-10" className="input-base text-sm" />
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Adjuntar copia del parte (opcional)</label>
                <div style={{ border:'1.5px dashed var(--border-strong)', borderRadius:4, padding:'12px', textAlign:'center', cursor:'pointer' }}>
                  <p style={{ fontSize:11, color:'var(--text-secondary)' }}>El parte llega vía RED — adjunta copia para tu archivo interno</p>
                </div>
              </div>

              <div style={{ background:'#fff7ed', border:'0.5px solid #fed7aa', borderRadius:4, padding:'9px 12px' }}>
                <p style={{ fontSize:11, color:'#c2410c', fontWeight:500 }}>⚠ Tras registrar la baja deberás confirmar los datos económicos al INSS en 3 días hábiles con tu PIN de administrador.</p>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>setShowNueva(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button className="btn-primary flex-1 py-2 text-sm">Registrar y confirmar al INSS</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
