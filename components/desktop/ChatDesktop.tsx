"use client"

import { useState, useRef, useEffect } from "react"

// ── Tipos ─────────────────────────────────────────────────────
type TipoChat = 'individual' | 'grupo'
type TabSede  = 'mi_sede' | 'todas' | 'grupos'

type Mensaje = {
  id: number
  texto: string
  hora: string
  mio: boolean
  leido: boolean
  autor?: string
}

type Conversacion = {
  id: number
  nombre: string
  tipo: TipoChat
  sede: string
  grupo?: string
  ultimoMensaje: string
  hora: string
  noLeidos: number
  online: boolean
  mensajes: Mensaje[]
  guardandoMensajes: boolean
}

// ── Datos demo ─────────────────────────────────────────────────
const conversacionesData: Conversacion[] = [
  {
    id:1, nombre:'María García López', tipo:'individual', sede:'Madrid Centro', grupo:'G2A',
    ultimoMensaje:'Vale, te veo mañana 👍', hora:'09:42', noLeidos:0, online:true,
    guardandoMensajes:true,
    mensajes:[
      { id:1, texto:'Hola, ¿puedes cubrir mi turno del jueves?', hora:'09:38', mio:false, leido:true },
      { id:2, texto:'Sí, no hay problema. ¿Mañana o turno de tarde?', hora:'09:40', mio:true, leido:true },
      { id:3, texto:'Tarde, de 14 a 22h. Te lo agradezco mucho 🙏', hora:'09:41', mio:false, leido:true },
      { id:4, texto:'Vale, te veo mañana 👍', hora:'09:42', mio:true, leido:true },
    ]
  },
  {
    id:2, nombre:'Grupo G1A', tipo:'grupo', sede:'Madrid Centro', grupo:'G1A',
    ultimoMensaje:'Carlos: Turno cambiado al viernes', hora:'09:15', noLeidos:3, online:false,
    guardandoMensajes:true,
    mensajes:[
      { id:1, texto:'Buenos días a todos 👋', hora:'08:00', mio:false, leido:true, autor:'Juan Pérez' },
      { id:2, texto:'He cambiado el turno al viernes', hora:'09:10', mio:false, leido:true, autor:'Carlos López' },
      { id:3, texto:'Perfecto, anotado', hora:'09:12', mio:true, leido:true },
      { id:4, texto:'¿Alguien puede hacer la apertura?', hora:'09:14', mio:false, leido:false, autor:'Carlos López' },
      { id:5, texto:'Turno cambiado al viernes confirmado', hora:'09:15', mio:false, leido:false, autor:'Carlos López' },
    ]
  },
  {
    id:3, nombre:'Juan Pérez García', tipo:'individual', sede:'Madrid Centro', grupo:'G1A',
    ultimoMensaje:'¿A qué hora empieza el turno?', hora:'Ayer', noLeidos:1, online:false,
    guardandoMensajes:false,
    mensajes:[
      { id:1, texto:'¿A qué hora empieza el turno mañana?', hora:'18:30', mio:false, leido:false },
    ]
  },
  {
    id:4, nombre:'General Empresa', tipo:'grupo', sede:'todas', grupo:'',
    ultimoMensaje:'Admin: Reunión el viernes a las 10h', hora:'Lun', noLeidos:0, online:false,
    guardandoMensajes:true,
    mensajes:[
      { id:1, texto:'Reunión de equipo el viernes a las 10h en sala principal', hora:'10:00', mio:false, leido:true, autor:'Administrador' },
      { id:2, texto:'Anotado, gracias', hora:'10:05', mio:true, leido:true },
    ]
  },
  {
    id:5, nombre:'Ana Martínez Sanz', tipo:'individual', sede:'Vallecas', grupo:'G2B',
    ultimoMensaje:'Gracias por el cambio', hora:'Dom', noLeidos:0, online:false,
    guardandoMensajes:false,
    mensajes:[
      { id:1, texto:'Muchas gracias por el cambio de turno', hora:'16:20', mio:false, leido:true },
      { id:2, texto:'De nada, para eso estamos 😊', hora:'16:25', mio:true, leido:true },
    ]
  },
  {
    id:6, nombre:'Grupo Vallecas', tipo:'grupo', sede:'Vallecas', grupo:'',
    ultimoMensaje:'Pedro: Mañana hay inventario', hora:'Dom', noLeidos:2, online:false,
    guardandoMensajes:true,
    mensajes:[
      { id:1, texto:'Recordad que mañana hay inventario a las 7h', hora:'19:00', mio:false, leido:false, autor:'Pedro Sánchez' },
      { id:2, texto:'Ok, estaremos', hora:'19:05', mio:false, leido:false, autor:'Laura Torres' },
    ]
  },
]

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({ nombre, size=38, online=false }: { nombre:string, size?:number, online?:boolean }) {
  const initials = nombre.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
  const colors   = ['#0284c7','#0369a1','#6366f1','#0891b2','#d97706','#16a34a','#7c3aed','#dc2626']
  const color    = colors[nombre.charCodeAt(0)%colors.length]
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:size*0.34, fontWeight:600 }}>
        {initials}
      </div>
      {online && (
        <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'2px solid var(--surface)' }} />
      )}
    </div>
  )
}

// ── Modal configuración almacenamiento ─────────────────────────
function ModalStorage({ conv, onClose, onGuardar }: { conv:Conversacion, onClose:()=>void, onGuardar:(guardar:boolean, pin:string)=>void }) {
  const [guardar, setGuardar] = useState(conv.guardandoMensajes)
  const [pin, setPin]         = useState('')
  const [error, setError]     = useState('')

  const confirmar = () => {
    if (!pin || pin.length < 4) { setError('Introduce el PIN del encargado'); return }
    onGuardar(guardar, pin)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:380 }}>
        <div style={{ padding:'14px 18px', borderBottom:'0.5px solid var(--border)' }}>
          <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Almacenamiento de mensajes</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{conv.nombre}</p>
        </div>
        <div style={{ padding:18 }} className="space-y-4">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <button onClick={()=>setGuardar(true)}
              style={{ padding:'12px', borderRadius:6, cursor:'pointer', textAlign:'left', transition:'all .15s',
                background: guardar?'#dcfce7':'var(--surface-2)',
                border:`0.5px solid ${guardar?'#86efac':'var(--border-strong)'}`,
                color: guardar?'#15803d':'var(--text-secondary)' }}>
              <p style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>💾 Guardar</p>
              <p style={{ fontSize:11, lineHeight:1.5 }}>Los mensajes se almacenan en la base de datos y quedan registrados.</p>
            </button>
            <button onClick={()=>setGuardar(false)}
              style={{ padding:'12px', borderRadius:6, cursor:'pointer', textAlign:'left', transition:'all .15s',
                background: !guardar?'#fee2e2':'var(--surface-2)',
                border:`0.5px solid ${!guardar?'#fca5a5':'var(--border-strong)'}`,
                color: !guardar?'#b91c1c':'var(--text-secondary)' }}>
              <p style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>🗑 Borrar siempre</p>
              <p style={{ fontSize:11, lineHeight:1.5 }}>Los mensajes se eliminan automáticamente al cerrar la sesión.</p>
            </button>
          </div>
          <div style={{ background:'#fff7ed', border:'0.5px solid #fed7aa', borderRadius:4, padding:'9px 12px' }}>
            <p style={{ fontSize:11, color:'#c2410c' }}>Este cambio requiere el PIN del encargado de sesión para aplicarse.</p>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>PIN del encargado de sesión</label>
            <input type="password" placeholder="••••" maxLength={6} value={pin} onChange={e=>{ setPin(e.target.value); setError('') }}
              className="input-base text-sm" style={{ letterSpacing:4 }} />
            {error && <p style={{ fontSize:11, color:'#b91c1c', marginTop:4 }}>{error}</p>}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
            <button onClick={confirmar} className="btn-primary flex-1 py-2 text-sm">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal nueva conversación ───────────────────────────────────
function ModalNueva({ onClose }: { onClose:()=>void }) {
  const [tipo, setTipo] = useState<TipoChat>('individual')
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:400 }}>
        <div style={{ padding:'14px 18px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
          <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Nueva conversación</p>
          <button onClick={onClose} className="btn-secondary w-7 h-7 flex items-center justify-center text-sm">✕</button>
        </div>
        <div style={{ padding:18 }} className="space-y-4">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {(['individual','grupo'] as TipoChat[]).map(t => (
              <button key={t} onClick={()=>setTipo(t)}
                style={{ padding:'10px', borderRadius:6, cursor:'pointer', transition:'all .15s', textAlign:'center',
                  background: tipo===t?'#dbeafe':'var(--surface-2)',
                  border:`0.5px solid ${tipo===t?'#93c5fd':'var(--border-strong)'}`,
                  color: tipo===t?'#1d4ed8':'var(--text-secondary)' }}>
                <p style={{ fontSize:18, marginBottom:4 }}>{t==='individual'?'👤':'👥'}</p>
                <p style={{ fontSize:12, fontWeight:600 }}>{t==='individual'?'Individual':'Grupo'}</p>
              </button>
            ))}
          </div>
          {tipo==='individual' && (
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Empleado</label>
              <select className="w-full">
                <option>Seleccionar empleado...</option>
                <option>Juan Pérez García — G1A</option>
                <option>María García López — G2A</option>
                <option>Carlos López Martín — G1B</option>
                <option>Ana Martínez Sanz — G2B</option>
              </select>
            </div>
          )}
          {tipo==='grupo' && (
            <>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Nombre del grupo</label>
                <input type="text" placeholder="Ej: Equipo mañana" className="input-base text-sm" />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Sede</label>
                <select className="w-full">
                  <option>Mi sede (Madrid Centro)</option>
                  <option>Vallecas</option>
                  <option>Todas las sedes</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Almacenamiento inicial</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[{ v:true, label:'💾 Guardar mensajes' },{ v:false, label:'🗑 Borrar al cerrar' }].map(o=>(
                <button key={String(o.v)} style={{ padding:'7px', borderRadius:4, fontSize:11, fontWeight:500, cursor:'pointer',
                  background:'var(--surface-2)', border:'0.5px solid var(--border-strong)', color:'var(--text-secondary)' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
            <button className="btn-primary flex-1 py-2 text-sm">Crear conversación</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────
export default function ChatDesktop() {
  const [tab, setTab]           = useState<TabSede>('mi_sede')
  const [search, setSearch]     = useState('')
  const [convActiva, setConvActiva] = useState<Conversacion>(conversacionesData[0])
  const [convs, setConvs]       = useState<Conversacion[]>(conversacionesData)
  const [texto, setTexto]       = useState('')
  const [showStorage, setShowStorage] = useState(false)
  const [showNueva, setShowNueva]     = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [convActiva])

  const enviarMensaje = () => {
    if (!texto.trim()) return
    const nuevoMsg: Mensaje = {
      id: Date.now(), texto: texto.trim(),
      hora: new Date().toLocaleTimeString('es-ES',{ hour:'2-digit', minute:'2-digit' }),
      mio: true, leido: false,
    }
    const updated = convs.map(c => c.id===convActiva.id
      ? { ...c, mensajes:[...c.mensajes, nuevoMsg], ultimoMensaje:texto.trim(), hora:'Ahora' }
      : c
    )
    setConvs(updated)
    setConvActiva(updated.find(c=>c.id===convActiva.id)!)
    setTexto('')
  }

  const handleStorage = (guardar:boolean, pin:string) => {
    // En producción verifica el PIN contra la BD
    if (pin !== '1234') { alert('PIN incorrecto'); return }
    const updated = convs.map(c => c.id===convActiva.id ? { ...c, guardandoMensajes:guardar } : c)
    setConvs(updated)
    setConvActiva(updated.find(c=>c.id===convActiva.id)!)
    setShowStorage(false)
  }

  const convsFiltradas = convs.filter(c => {
    const matchSearch = !search || c.nombre.toLowerCase().includes(search.toLowerCase())
    if (tab==='mi_sede')  return matchSearch && c.tipo==='individual' && c.sede==='Madrid Centro'
    if (tab==='todas')    return matchSearch && c.tipo==='individual'
    if (tab==='grupos')   return matchSearch && c.tipo==='grupo'
    return matchSearch
  })

  return (
    <div style={{ display:'flex', height:'calc(100vh - 120px)', background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:6, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div style={{ width:300, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'0.5px solid var(--border)' }}>

        {/* Header sidebar */}
        <div style={{ padding:'12px 14px', borderBottom:'0.5px solid var(--border)', background:'var(--surface-2)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Mensajes</p>
            <button onClick={()=>setShowNueva(true)}
              style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:18, lineHeight:1 }}>+</button>
          </div>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4 }}>
            {([
              { key:'mi_sede', label:'Mi sede'    },
              { key:'todas',   label:'Todas'      },
              { key:'grupos',  label:'Grupos'     },
            ] as {key:TabSede, label:string}[]).map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)}
                style={{ flex:1, padding:'5px 0', fontSize:11, fontWeight:500, textAlign:'center', borderRadius:20, cursor:'pointer', transition:'all .15s',
                  background: tab===t.key?'#dcfce7':'var(--surface)',
                  color:      tab===t.key?'#15803d':'var(--text-secondary)',
                  border:`0.5px solid ${tab===t.key?'#86efac':'var(--border-strong)'}` }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Búsqueda */}
        <div style={{ padding:'8px 12px', borderBottom:'0.5px solid var(--border)' }}>
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar conversación..."
              style={{ width:'100%', padding:'6px 10px 6px 30px', fontSize:12, border:'0.5px solid var(--border-strong)', borderRadius:20, background:'var(--surface-2)', color:'var(--text-primary)', outline:'none' }} />
          </div>
        </div>

        {/* Lista conversaciones */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {convsFiltradas.length === 0
            ? <p style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center', padding:'24px 14px', fontStyle:'italic' }}>Sin conversaciones</p>
            : convsFiltradas.map(c => (
              <div key={c.id} onClick={()=>setConvActiva(c)}
                style={{ display:'flex', gap:10, padding:'10px 14px', cursor:'pointer', borderBottom:'0.5px solid var(--border)', transition:'background .1s', alignItems:'center',
                  background: convActiva.id===c.id?'var(--surface-2)':'transparent' }}>
                <Avatar nombre={c.nombre} size={38} online={c.online} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.nombre}</p>
                  <p style={{ fontSize:11, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:1 }}>{c.ultimoMensaje}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>{c.hora}</span>
                  {c.noLeidos>0
                    ? <span style={{ background:'#22c55e', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 5px', borderRadius:10, minWidth:16, textAlign:'center' }}>{c.noLeidos}</span>
                    : <span style={{ fontSize:9, fontWeight:500, padding:'1px 5px', borderRadius:10, background: c.tipo==='grupo'?'#f3e8ff':'#dbeafe', color: c.tipo==='grupo'?'#7e22ce':'#1d4ed8' }}>
                        {c.tipo==='grupo'?'Grupo':'Chat'}
                      </span>
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Panel chat ──────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Header chat */}
        <div style={{ padding:'10px 16px', borderBottom:'0.5px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:10 }}>
          <Avatar nombre={convActiva.nombre} size={36} online={convActiva.online} />
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>
              {convActiva.nombre}
              {convActiva.grupo && <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:'#0284c7', borderRadius:3, padding:'1px 6px', marginLeft:6 }}>{convActiva.grupo}</span>}
            </p>
            <p style={{ fontSize:11, color: convActiva.online?'#22c55e':'var(--text-muted)', marginTop:1 }}>
              {convActiva.online ? 'En línea' : `${convActiva.sede}`}
            </p>
          </div>

          {/* Indicador almacenamiento */}
          <button onClick={()=>setShowStorage(true)}
            style={{ fontSize:10, fontWeight:500, padding:'3px 10px', borderRadius:20, cursor:'pointer', transition:'all .15s', border:'0.5px solid',
              background: convActiva.guardandoMensajes?'#dcfce7':'#fee2e2',
              color:      convActiva.guardandoMensajes?'#15803d':'#b91c1c',
              borderColor:convActiva.guardandoMensajes?'#86efac':'#fca5a5' }}>
            {convActiva.guardandoMensajes ? '💾 Guardando' : '🗑 Sin guardar'}
          </button>
        </div>

        {/* Mensajes */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:4, background:'#f0f2f5' }}>
          <div style={{ alignSelf:'center', fontSize:10, color:'#94a3b8', background:'#e2e8f0', borderRadius:10, padding:'2px 10px', marginBottom:6 }}>Hoy</div>

          {convActiva.mensajes.map((msg, i) => {
            const prevMio = i>0 ? convActiva.mensajes[i-1].mio : null
            const showAuthor = !msg.mio && convActiva.tipo==='grupo' && msg.autor && msg.autor !== convActiva.mensajes[i-1]?.autor
            return (
              <div key={msg.id} style={{ display:'flex', flexDirection:'column', alignItems: msg.mio?'flex-end':'flex-start', marginTop: prevMio===msg.mio?2:8 }}>
                {showAuthor && (
                  <p style={{ fontSize:10, fontWeight:600, color:'#0284c7', marginBottom:2, paddingLeft:12 }}>{msg.autor}</p>
                )}
                <div style={{
                  maxWidth:'65%', padding:'7px 11px', fontSize:13, lineHeight:1.5, wordBreak:'break-word',
                  background:  msg.mio?'#dcfce7':'#ffffff',
                  borderRadius: msg.mio?'12px 12px 2px 12px':'12px 12px 12px 2px',
                  border: msg.mio?'none':'0.5px solid #e2e8f0',
                  color:'#0f172a',
                }}>
                  {msg.texto}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:3, marginTop:2, paddingLeft:4, paddingRight:4 }}>
                  <span style={{ fontSize:10, color:'#94a3b8' }}>{msg.hora}</span>
                  {msg.mio && <span style={{ fontSize:10, color: msg.leido?'#3b82f6':'#94a3b8' }}>{msg.leido?'✓✓':'✓'}</span>}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input mensaje */}
        <div style={{ padding:'10px 16px', borderTop:'0.5px solid var(--border)', display:'flex', gap:8, alignItems:'center', background:'var(--surface-2)' }}>
          <input
            value={texto}
            onChange={e=>setTexto(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); enviarMensaje() } }}
            placeholder="Escribe un mensaje..."
            style={{ flex:1, padding:'8px 14px', fontSize:13, border:'0.5px solid var(--border-strong)', borderRadius:22, background:'var(--surface)', color:'var(--text-primary)', outline:'none' }}
          />
          <button onClick={enviarMensaje}
            style={{ width:38, height:38, borderRadius:'50%', background:'var(--accent)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: texto.trim()?1:0.5, transition:'opacity .15s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

      {/* Modales */}
      {showStorage && <ModalStorage conv={convActiva} onClose={()=>setShowStorage(false)} onGuardar={handleStorage} />}
      {showNueva   && <ModalNueva onClose={()=>setShowNueva(false)} />}
    </div>
  )
}
