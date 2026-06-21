"use client"
import { useState, useEffect, useRef } from "react"

type Mensaje = { id: string; autorId: string; autorNombre: string; autorRol: string; contenido: string; tipo: string; creadoEn: string }
type Conversacion = { id: string; nombre: string; tipo: string; ultimoMensaje: string; ultimoMensajeEn: string; estado: string; solicitante_id: string; solicitante_nombre: string; receptor_id: string; receptor_nombre: string }
type Empleado = { id: string; nombre: string; apellidos: string; grupoNombre?: string; userId?: string }

const COLORS = ["#7c3aed","#0891b2","#059669","#d97706","#db2777","#dc2626","#0284c7"]
function getColor(s: string) { return COLORS[(s||"A").charCodeAt(0) % COLORS.length] }

function Avatar({ nombre, size = 40, badge = false, count = 0 }: { nombre: string; size?: number; badge?: boolean; count?: number }) {
  const initials = nombre.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase()
  return (
    <div style={{ position:"relative", flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:getColor(nombre), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.33, fontWeight:600 }}>{initials}</div>
      {badge && count === 0 && <div style={{ position:"absolute", top:-3, right:-3, width:14, height:14, borderRadius:"50%", background:"#ef4444", border:"2px solid #f0f4f8", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:5, height:5, borderRadius:"50%", background:"#fff" }} />
      </div>}
      {count > 0 && <div style={{ position:"absolute", top:-4, right:-4, minWidth:16, height:16, borderRadius:8, background:"#ef4444", border:"2px solid #f0f4f8", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>
        <span style={{ fontSize:9, fontWeight:700, color:"#fff" }}>{count > 9 ? "9+" : count}</span>
      </div>}
    </div>
  )
}

const LogoScheduleo = ({ size = 140 }: { size?: number }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, opacity:0.05 }}>
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="1.5" y="1.5" width="45" height="45" rx="11" fill="#1e1b4b"/>
      <circle cx="24" cy="16" r="5" fill="white"/>
      <path d="M14 34C14 29 18.5 26 24 26C29.5 26 34 29 34 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="14" cy="20" r="3.5" fill="rgba(255,255,255,0.6)"/>
      <circle cx="34" cy="20" r="3.5" fill="rgba(255,255,255,0.6)"/>
    </svg>
    <div style={{ fontSize:38, fontWeight:800, color:"#1e1b4b", letterSpacing:"-1px" }}>Scheduleo</div>
    <div style={{ fontSize:13, color:"#1e1b4b", marginTop:-6 }}>v2.0</div>
  </div>
)

export default function ChatDesktop() {
  const [tab, setTab] = useState<"empleados"|"chats"|"historial">("empleados")
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [solicitudes, setSolicitudes] = useState<Conversacion[]>([])
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [convActiva, setConvActiva] = useState<Conversacion | null>(null)
  const [texto, setTexto] = useState("")
  const [comunicados, setComunicados] = useState<any[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [nuevaCom, setNuevaCom] = useState(false)
  const [formCom, setFormCom] = useState({ titulo:"", contenido:"", urgente:false })
  const [modalCerrar, setModalCerrar] = useState(false)
  const [filtroFecha, setFiltroFecha] = useState("")
  const [noLeidos, setNoLeidos] = useState<Record<string, number>>({})
  const [sidebarWidth, setSidebarWidth] = useState(290)
  const isResizing = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const usuario = { id:"admin-001", nombre:"Administrador", rol:"SUPER_ADMIN" }

  const iniciarResize = (e: React.MouseEvent) => {
    isResizing.current = true
    const startX = e.clientX
    const startW = sidebarWidth
    const onMove = (ev: MouseEvent) => { if (isResizing.current) setSidebarWidth(Math.min(480, Math.max(220, startW + ev.clientX - startX))) }
    const onUp = () => { isResizing.current = false; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp) }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const cargarConvs = async () => {
    const r = await fetch(`/api/conversaciones?userId=${usuario.id}`).catch(()=>null)
    if (r) { const d = await r.json(); if (Array.isArray(d)) setConversaciones(d) }
    const r2 = await fetch(`/api/conversaciones?userId=${usuario.id}&tipo=solicitudes`).catch(()=>null)
    if (r2) { const d2 = await r2.json(); if (Array.isArray(d2)) setSolicitudes(d2) }
    const r3 = await fetch(`/api/mensajes?noLeidos=true&userId=${usuario.id}`).catch(()=>null)
    if (r3) { const d3 = await r3.json(); if (Array.isArray(d3)) {
      const map: Record<string, number> = {}
      d3.forEach((row: any) => { map[row.conversacionId] = row.count })
      setNoLeidos(map)
    }}
  }
  const cargarMsgs = async (id: string) => {
    const r = await fetch(`/api/mensajes?conversacionId=${id}`).catch(()=>null)
    if (r) { const d = await r.json(); if (Array.isArray(d)) setMensajes(d) }
  }
  const cargarComs = async () => {
    const r = await fetch("/api/comunicados").catch(()=>null)
    if (r) { const d = await r.json(); if (Array.isArray(d)) setComunicados(d) }
  }
  const cargarEmpleados = async () => {
    const r = await fetch("/api/empleados").catch(()=>null)
    if (r) { const d = await r.json(); if (Array.isArray(d)) setEmpleados(d) }
  }

  useEffect(() => {
    cargarConvs(); cargarComs(); cargarEmpleados()
    const t = setInterval(cargarConvs, 6000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (!convActiva) return
    cargarMsgs(convActiva.id)
    fetch("/api/mensajes", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ conversacionId:convActiva.id, userId:usuario.id }) })
      .then(() => setNoLeidos(p => ({ ...p, [convActiva.id]: 0 })))
    const t = setInterval(() => cargarMsgs(convActiva.id), 5000)
    return () => clearInterval(t)
  }, [convActiva])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }) }, [mensajes])

  const iniciarChat = async (emp: Empleado) => {
    const convExistente = conversaciones.find(c => c.receptor_id === (emp.userId||emp.id) || c.solicitante_id === (emp.userId||emp.id))
    if (convExistente) { setConvActiva(convExistente); setTab("chats"); return }
    const res = await fetch("/api/conversaciones", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ nombre:`${emp.nombre} ${emp.apellidos}`, tipo:"individual", solicitanteId:usuario.id, solicitanteNombre:usuario.nombre, receptorId:emp.userId||emp.id, receptorNombre:`${emp.nombre} ${emp.apellidos}`, participantes:[usuario.id, emp.userId||emp.id], autoAceptar:true })
    })
    const data = await res.json()
    if (data.ok) {
      await cargarConvs()
      setTab("chats")
      if (data.conv) setConvActiva(data.conv)
    }
  }

  const responderSolicitud = async (convId: string, accion: "aceptar"|"rechazar") => {
    await fetch("/api/conversaciones", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ conversacionId:convId, accion }) })
    await cargarConvs()
  }

  const cerrarConversacion = async () => {
    if (!convActiva) return
    await fetch("/api/conversaciones", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ conversacionId:convActiva.id, accion:"cerrar" }) })
    setConvActiva(null); setMensajes([]); setModalCerrar(false); await cargarConvs()
  }

  const enviar = async () => {
    if (!texto.trim() || !convActiva) return
    const t = texto; setTexto("")
    await fetch("/api/mensajes", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ conversacionId:convActiva.id, autorId:usuario.id, autorNombre:usuario.nombre, autorRol:usuario.rol, contenido:t, tipo:"texto" }) })
    await cargarMsgs(convActiva.id); await cargarConvs()
  }

  const publicarCom = async () => {
    if (!formCom.titulo || !formCom.contenido) return
    await fetch("/api/comunicados", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...formCom, autorId:usuario.id, autorNombre:usuario.nombre }) })
    await cargarComs(); setNuevaCom(false); setFormCom({ titulo:"", contenido:"", urgente:false })
  }

  const getCntEmp = (e: Empleado) => {
    const c = conversaciones.find(c => c.receptor_id===(e.userId||e.id) || c.solicitante_id===(e.userId||e.id))
    return c ? (noLeidos[c.id] || 0) : 0
  }
  const empsFiltrados = empleados
    .filter(e => `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => getCntEmp(b) - getCntEmp(a))
  const convsFiltradas = conversaciones
    .filter(c => c.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => (noLeidos[b.id]||0) - (noLeidos[a.id]||0))
  const totalNoLeidos = Object.values(noLeidos).reduce((s, n) => s + n, 0)
  const comsFiltrados = filtroFecha ? comunicados.filter(c => new Date(c.creadoEn).toISOString().startsWith(filtroFecha)) : comunicados
  const empConSolicitud = (emp: Empleado) => solicitudes.some(s => s.solicitante_id === (emp.userId||emp.id))

  const iStyle = { width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, boxSizing:"border-box" as const, background:"#f8fafc", color:"#111827", outline:"none" }

  return (
    <div style={{ display:"flex", height:"calc(100vh - 57px)", overflow:"hidden", position:"relative" as const }}>

      {/* SIDEBAR */}
      <div style={{ width:sidebarWidth, background:"#f0f4f8", borderRight:"1px solid #dde3ea", display:"flex", flexDirection:"column", flexShrink:0, position:"relative" as const, minWidth:220, maxWidth:480 }}>
        <div style={{ padding:"11px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #dde3ea" }}>
          <span style={{ fontSize:14, fontWeight:600, color:"#111827" }}>Chat</span>
          {solicitudes.length > 0 && <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{solicitudes.length} pendiente{solicitudes.length>1?"s":""}</span>}
        </div>
        <div style={{ margin:"7px 10px", background:"#fff", borderRadius:8, display:"flex", alignItems:"center", gap:7, padding:"6px 10px", border:"1px solid #e2e8f0" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar..." style={{ background:"none", border:"none", outline:"none", color:"#374151", fontSize:12, width:"100%" }} />
        </div>
        <div style={{ display:"flex", borderBottom:"1px solid #dde3ea" }}>
          {[{k:"empleados",l:"Empleados"},{k:"chats",l:"Chats"},{k:"historial",l:"Historial"}].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k as any)} style={{ flex:1, padding:"8px 0", fontSize:11, border:"none", background:"none", cursor:"pointer", color:tab===t.k?"#3b82f6":"#6b7280", borderBottom:tab===t.k?"2px solid #3b82f6":"2px solid transparent", fontWeight:tab===t.k?600:400, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              {t.l}
              {t.k==="chats" && totalNoLeidos>0 && <span style={{ background:"#ef4444", color:"#fff", fontSize:9, fontWeight:700, minWidth:14, height:14, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>{totalNoLeidos>9?"9+":totalNoLeidos}</span>}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:"auto" as const }}>

          {tab === "empleados" && (
            <>
              <div style={{ padding:"5px 12px", fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.07em", background:"#e8edf2", borderBottom:"1px solid #dde3ea" }}>EMPLEADOS ({empsFiltrados.length})</div>
              {empsFiltrados.length === 0 ? (
                <div style={{ padding:20, textAlign:"center", color:"#9ca3af", fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>👥</div>Cargando empleados...</div>
              ) : empsFiltrados.map(emp => {
                const convEmp = conversaciones.find(c => c.receptor_id===(emp.userId||emp.id) || c.solicitante_id===(emp.userId||emp.id))
                const tieneChat = !!convEmp
                const tieneSolicitud = empConSolicitud(emp)
                const cnt = convEmp ? (noLeidos[convEmp.id] || 0) : 0
                return (
                  <div key={emp.id} onClick={()=>{ if (convEmp) { setConvActiva(convEmp); setTab("chats") } else { iniciarChat(emp) } }}
                    style={{ padding:"9px 12px", display:"flex", gap:9, alignItems:"center", borderBottom:"1px solid #eaeff4", cursor:"pointer", background:cnt>0?"#fef9f9":tieneSolicitud?"#fef9f9":"transparent" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#e8edf2"}
                    onMouseLeave={e=>e.currentTarget.style.background=cnt>0||tieneSolicitud?"#fef9f9":"transparent"}>
                    <Avatar nombre={`${emp.nombre} ${emp.apellidos}`} size={36} badge={tieneSolicitud} count={cnt} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:cnt>0?700:500, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{emp.nombre} {emp.apellidos}</div>
                      <div style={{ fontSize:10, color:cnt>0?"#ef4444":tieneChat?"#10b981":tieneSolicitud?"#ef4444":"#9ca3af", fontWeight:cnt>0?600:400, marginTop:1 }}>
                        {cnt>0?`${cnt} mensaje${cnt>1?"s":""} nuevo${cnt>1?"s":""}`:tieneChat?"Chat activo":tieneSolicitud?"Solicitud pendiente":emp.grupoNombre||"Sin grupo"}
                      </div>
                    </div>
                    <span style={{ fontSize:10, background:tieneChat?"#f0fdf4":"#eff6ff", color:tieneChat?"#10b981":"#3b82f6", padding:"2px 8px", borderRadius:10, border:`1px solid ${tieneChat?"#bbf7d0":"#bfdbfe"}`, flexShrink:0 }}>
                      {tieneChat?"Ver":"Iniciar"}
                    </span>
                  </div>
                )
              })}
            </>
          )}

          {tab === "chats" && (
            <>
              {solicitudes.length > 0 && (
                <>
                  <div style={{ padding:"5px 12px", fontSize:10, fontWeight:700, color:"#92400e", letterSpacing:"0.07em", background:"#fef3c7", borderBottom:"1px solid #fde68a" }}>SOLICITUDES PENDIENTES</div>
                  {solicitudes.map(sol => (
                    <div key={sol.id} style={{ padding:"10px 12px", borderBottom:"1px solid #eaeff4", background:"#fffbeb" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <Avatar nombre={sol.solicitante_nombre||"?"} size={30} />
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:"#111827" }}>{sol.solicitante_nombre}</div>
                          <div style={{ fontSize:10, color:"#6b7280" }}>quiere iniciar una conversacion</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>responderSolicitud(sol.id,"aceptar")} style={{ flex:1, padding:"5px 0", background:"#10b981", color:"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer" }}>✓ Aceptar</button>
                        <button onClick={()=>responderSolicitud(sol.id,"rechazar")} style={{ flex:1, padding:"5px 0", background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer" }}>✕ Rechazar</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div style={{ padding:"5px 12px", fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.07em", background:"#e8edf2", borderBottom:"1px solid #dde3ea" }}>CONVERSACIONES ACTIVAS</div>
              {convsFiltradas.length === 0 ? (
                <div style={{ padding:20, textAlign:"center", color:"#9ca3af", fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>💬</div>Ve a Empleados para iniciar un chat</div>
              ) : convsFiltradas.map(conv => {
                const cnt = noLeidos[conv.id] || 0
                return (
                <div key={conv.id} onClick={()=>setConvActiva(conv)}
                  style={{ padding:"9px 12px", display:"flex", gap:9, alignItems:"center", borderBottom:"1px solid #eaeff4", cursor:"pointer", background:convActiva?.id===conv.id?"#e3edf7":cnt>0?"#fef9f9":"transparent" }}>
                  <Avatar nombre={conv.nombre||"?"} size={36} count={cnt} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:cnt>0?700:500, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{conv.nombre}</div>
                    <div style={{ fontSize:11, color:cnt>0?"#374151":"#6b7280", fontWeight:cnt>0?600:400, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:1 }}>{conv.ultimoMensaje||"Sin mensajes"}</div>
                  </div>
                  {conv.ultimoMensajeEn && <div style={{ fontSize:10, color:"#3b82f6", flexShrink:0 }}>{new Date(conv.ultimoMensajeEn).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}</div>}
                </div>
              )})}
            </>
          )}

          {tab === "historial" && (
            <>
              <div style={{ padding:"8px 10px", borderBottom:"1px solid #dde3ea" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <input type="date" value={filtroFecha} onChange={e=>setFiltroFecha(e.target.value)}
                    style={{ flex:1, padding:"5px 8px", border:"1px solid #e2e8f0", borderRadius:6, fontSize:11, background:"#fff", color:"#374151" }} />
                  {filtroFecha && <button onClick={()=>setFiltroFecha("")} style={{ fontSize:11, padding:"4px 8px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:6, cursor:"pointer" }}>✕</button>}
                </div>
                <button onClick={()=>setNuevaCom(true)} style={{ width:"100%", marginTop:6, padding:"6px", background:"#eff6ff", color:"#3b82f6", border:"1px solid #bfdbfe", borderRadius:7, fontSize:11, cursor:"pointer", fontWeight:500 }}>+ Nuevo aviso</button>
              </div>
              <div style={{ padding:"5px 12px", fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.07em", background:"#e8edf2", borderBottom:"1px solid #dde3ea" }}>{comsFiltrados.length} AVISOS {filtroFecha?"EN ESTA FECHA":"EN TOTAL"}</div>
              {comsFiltrados.length === 0 ? (
                <div style={{ padding:20, textAlign:"center", color:"#9ca3af", fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>📢</div>Sin avisos</div>
              ) : comsFiltrados.map(com => (
                <div key={com.id} style={{ padding:"9px 12px", borderBottom:"1px solid #eaeff4" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                    {com.urgente && <span style={{ width:7, height:7, borderRadius:"50%", background:"#ef4444", display:"inline-block", flexShrink:0 }} />}
                    <div style={{ fontSize:12, fontWeight:500, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{com.titulo}</div>
                  </div>
                  <div style={{ fontSize:11, color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2 }}>{com.contenido}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{new Date(com.creadoEn).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Handle resize */}
        <div onMouseDown={iniciarResize}
          style={{ position:"absolute" as const, right:-2, top:0, bottom:0, width:5, cursor:"col-resize", zIndex:10 }}
          onMouseEnter={e=>e.currentTarget.style.background="#93c5fd"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"} />
      </div>

      {/* AREA PRINCIPAL */}
      <div style={{ flex:1, display:"flex", minWidth:0 }}>
        {convActiva ? (
          <>
            {/* Panel mensajes */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#e8eef3", minWidth:0 }}>
              <div style={{ padding:"10px 14px", background:"#fff", borderBottom:"1px solid #dde3ea", display:"flex", alignItems:"center", gap:10 }}>
                <Avatar nombre={convActiva.nombre||"?"} size={32} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{convActiva.nombre}</div>
                  <div style={{ fontSize:10, color:"#10b981", display:"flex", alignItems:"center", gap:3, marginTop:1 }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />En linea
                  </div>
                </div>
                <button onClick={()=>setModalCerrar(true)} style={{ marginLeft:"auto", fontSize:11, padding:"4px 10px", background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5", borderRadius:6, cursor:"pointer", fontWeight:500 }}>Cerrar chat</button>
              </div>
              <div style={{ padding:"6px 14px", background:"#f0fdf4", borderBottom:"1px solid #bbf7d0", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12 }}>🔒</span>
                <span style={{ fontSize:10, color:"#15803d" }}>Chat privado · Solo visible para vosotros dos · Mensajes eliminados a los 30 dias</span>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:6 }}>
                {mensajes.length === 0 ? (
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", fontSize:12, textAlign:"center" }}>
                    <div><div style={{ fontSize:32, marginBottom:6 }}>👋</div>Empieza la conversacion</div>
                  </div>
                ) : mensajes.map(m => {
                  const esMio = m.autorId === usuario.id
                  return (
                    <div key={m.id} style={{ display:"flex", gap:6, maxWidth:"80%", alignSelf:esMio?"flex-end":"flex-start", flexDirection:esMio?"row-reverse":"row" }}>
                      {!esMio && <Avatar nombre={m.autorNombre} size={24} />}
                      <div>
                        <div style={{ padding:"7px 11px", borderRadius:esMio?"12px 4px 12px 12px":"4px 12px 12px 12px", background:esMio?"#3b82f6":"#fff", color:esMio?"#fff":"#111827", fontSize:12, lineHeight:1.5, boxShadow:"0 1px 2px rgba(0,0,0,0.07)" }}>{m.contenido}</div>
                        <div style={{ fontSize:10, color:"#9ca3af", marginTop:2, textAlign:esMio?"right":"left" }}>
                          {new Date(m.creadoEn).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}
                          {esMio && <span style={{ color:"#3b82f6", marginLeft:3 }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding:"8px 12px", background:"#fff", borderTop:"1px solid #dde3ea", display:"flex", gap:8, alignItems:"center" }}>
                <input value={texto} onChange={e=>setTexto(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&enviar()}
                  placeholder="Escribe un mensaje..." autoComplete="off"
                  style={{ flex:1, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:24, padding:"9px 16px", color:"#111827", fontSize:12, outline:"none" }} />
                <button onClick={enviar} disabled={!texto.trim()}
                  style={{ width:36, height:36, borderRadius:"50%", background:texto.trim()?"#3b82f6":"#e2e8f0", border:"none", cursor:texto.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={texto.trim()?"#fff":"#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>

            {/* Panel info lateral */}
            <div style={{ width:220, borderLeft:"1px solid #dde3ea", background:"#fff", display:"flex", flexDirection:"column", flexShrink:0 }}>
              <div style={{ padding:"12px 14px", borderBottom:"1px solid #dde3ea", background:"#f8fafc" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:2 }}>INFO DEL CHAT</div>
                <div style={{ fontSize:10, color:"#6b7280" }}>Como funciona</div>
              </div>
              <div style={{ padding:14, display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  { icon:"🔒", titulo:"Privado", desc:"Solo tu y el empleado veis esta conversacion" },
                  { icon:"⏱️", titulo:"Efimero", desc:"Los mensajes se eliminan a los 30 dias" },
                  { icon:"✅", titulo:"Consentimiento", desc:"El empleado debe aceptar antes de chatear" },
                  { icon:"🚫", titulo:"Cierre", desc:"Cualquiera puede cerrar y eliminar mensajes" },
                  { icon:"📢", titulo:"Avisos", desc:"Usa Historial para enviar avisos oficiales" },
                ].map(item => (
                  <div key={item.titulo} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:2 }}>{item.titulo}</div>
                      <div style={{ fontSize:10, color:"#6b7280", lineHeight:1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Area vacia con logo */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#e8eef3", gap:12 }}>
              <LogoScheduleo size={140} />
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>Selecciona una conversacion o inicia una nueva</div>
            </div>

            {/* Panel info lateral siempre visible */}
            <div style={{ width:220, borderLeft:"1px solid #dde3ea", background:"#fff", display:"flex", flexDirection:"column", flexShrink:0 }}>
              <div style={{ padding:"12px 14px", borderBottom:"1px solid #dde3ea", background:"#f8fafc" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:2 }}>COMO FUNCIONA</div>
                <div style={{ fontSize:10, color:"#6b7280" }}>Chat y notificaciones</div>
              </div>
              <div style={{ padding:14, display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  { icon:"👥", titulo:"Empleados", desc:"Ve a Empleados y pulsa Iniciar para chatear" },
                  { icon:"✅", titulo:"Solicitud", desc:"El empleado recibe solicitud y debe aceptar" },
                  { icon:"🔒", titulo:"Privacidad", desc:"Cada chat es privado entre dos personas" },
                  { icon:"⏱️", titulo:"30 dias", desc:"Los mensajes se eliminan automaticamente" },
                  { icon:"📢", titulo:"Avisos", desc:"Envia avisos oficiales desde Historial" },
                  { icon:"🔔", titulo:"Notificaciones", desc:"Los empleados reciben notificacion push" },
                ].map(item => (
                  <div key={item.titulo} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:2 }}>{item.titulo}</div>
                      <div style={{ fontSize:10, color:"#6b7280", lineHeight:1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL CERRAR */}
      {modalCerrar && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:380, maxWidth:"95vw" }}>
            <div style={{ fontSize:15, fontWeight:600, color:"#111827", marginBottom:8 }}>Cerrar conversacion</div>
            <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:8, padding:"10px 12px", marginBottom:14, fontSize:12, color:"#92400e" }}>
              ⚠️ Todos los mensajes seran eliminados permanentemente.
            </div>
            <div style={{ fontSize:13, color:"#4b5563", marginBottom:16 }}>¿Seguro que quieres cerrar el chat con <strong>{convActiva?.nombre}</strong>?</div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>setModalCerrar(false)} style={{ padding:"8px 16px", background:"#f9fafb", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, cursor:"pointer", color:"#374151" }}>Cancelar</button>
              <button onClick={cerrarConversacion} style={{ padding:"8px 16px", background:"#dc2626", color:"#fff", border:"none", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:500 }}>Cerrar y eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO AVISO */}
      {nuevaCom && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:440, maxWidth:"95vw" }}>
            <div style={{ fontSize:15, fontWeight:600, color:"#111827", marginBottom:16 }}>Nuevo aviso oficial</div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:5 }}>Titulo *</label>
              <input value={formCom.titulo} onChange={e=>setFormCom(p=>({...p,titulo:e.target.value}))} placeholder="Titulo del aviso" style={iStyle} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:5 }}>Mensaje *</label>
              <textarea value={formCom.contenido} onChange={e=>setFormCom(p=>({...p,contenido:e.target.value}))} placeholder="Escribe el aviso..."
                style={{ ...iStyle, height:90, resize:"none" as const }} />
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#374151", marginBottom:16, cursor:"pointer" }}>
              <input type="checkbox" checked={formCom.urgente} onChange={e=>setFormCom(p=>({...p,urgente:e.target.checked}))} />
              Marcar como urgente
            </label>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>setNuevaCom(false)} style={{ padding:"8px 16px", background:"#f9fafb", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, cursor:"pointer", color:"#374151" }}>Cancelar</button>
              <button onClick={publicarCom} style={{ padding:"8px 16px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:500 }}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}