"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

function Avatar({ nombre, size = 38, online, dorado = false }: { nombre: string; size?: number; online?: boolean; dorado?: boolean }) {
  const initials = (nombre || "?").split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: dorado ? "#c9a14d" : "#2a2f45", color: dorado ? "#0b0e1a" : "#c9ccd9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 500 }}>{initials}</div>
      <span style={{ position: "absolute", bottom: -1, right: -1, width: size * 0.28, height: size * 0.28, borderRadius: "50%", background: online ? "#1D9E75" : "#5a5f78", border: "2px solid #0b0e1a" }} />
    </div>
  )
}

function tiempoDesde(fecha: string | null) {
  if (!fecha) return "Nunca"
  const diff = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Ahora"
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "#161a2c", border: "1px solid #2a2f45", color: "#f1ecdd", boxSizing: "border-box", borderRadius: 8, fontSize: 13, outline: "none" }

export default function PanelEjecutivoPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autenticado, setAutenticado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorLogin, setErrorLogin] = useState("")
  const [cargandoLogin, setCargandoLogin] = useState(false)
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false)
  const [usuarioActual, setUsuarioActual] = useState<any>(null)
  const [empresaNombre, setEmpresaNombre] = useState("")
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null)
  const [filtro, setFiltro] = useState<"todos"|"online"|"offline">("todos")
  const [tab, setTab] = useState<"mensajes"|"email"|"actividad"|"perfil">("mensajes")
  const [mensajes, setMensajes] = useState<any[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [emailForm, setEmailForm] = useState({ asunto: "", cuerpo: "" })
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const intervalRef = useRef<any>(null)
  const mensajesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sesion = sessionStorage.getItem("panelEjecutivoAuth")
    if (sesion) {
      try { const u = JSON.parse(sesion); setUsuarioActual(u); setAutenticado(true) } catch {}
    }
    setVerificando(false)
    fetch("/api/empresa").then(r => r.json()).then(d => setEmpresaNombre(d.nombre || "Mi Empresa")).catch(() => {})
  }, [])

  const verificarLogin = async () => {
    setErrorLogin("")
    if (!email || !password) { setErrorLogin("Introduce email y contrasena"); return }
    setCargandoLogin(true)
    const res = await fetch("/api/panel-ejecutivo-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
    const d = await res.json()
    setCargandoLogin(false)
    if (d.error) { setErrorLogin(d.error); return }
    setUsuarioActual(d.usuario)
    sessionStorage.setItem("panelEjecutivoAuth", JSON.stringify(d.usuario))
    setMostrarBienvenida(true)
    setTimeout(() => { setAutenticado(true); setMostrarBienvenida(false) }, 1800)
  }

  const cargar = async () => {
    const res = await fetch("/api/panel-ejecutivo").catch(() => null)
    if (res) { const d = await res.json(); setData(d) }
    setLoading(false)
  }

  useEffect(() => {
    if (!autenticado || !usuarioActual) return
    cargar()
    const t = setInterval(cargar, 15000)
    fetch("/api/heartbeat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: usuarioActual.id }) })
    intervalRef.current = setInterval(() => {
      fetch("/api/heartbeat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: usuarioActual.id }) })
    }, 30000)
    return () => { clearInterval(t); clearInterval(intervalRef.current) }
  }, [autenticado, usuarioActual])

  const cargarMensajes = async (userId: string) => {
    const res = await fetch(`/api/panel-ejecutivo/mensajes?con=${userId}`).catch(() => null)
    if (res?.ok) { const d = await res.json(); setMensajes(Array.isArray(d) ? d : []) }
    setTimeout(() => { if (mensajesRef.current) mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight }, 100)
  }

  const seleccionarUsuario = (u: any) => {
    setUsuarioSeleccionado(u)
    setTab("mensajes")
    setNuevoMensaje("")
    setEmailEnviado(false)
    cargarMensajes(u.id)
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !usuarioSeleccionado) return
    setEnviando(true)
    const res = await fetch("/api/panel-ejecutivo/mensajes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paraId: usuarioSeleccionado.id, texto: nuevoMensaje.trim() })
    }).catch(() => null)
    if (res?.ok) {
      setNuevoMensaje("")
      cargarMensajes(usuarioSeleccionado.id)
    }
    setEnviando(false)
  }

  const enviarEmail = async () => {
    if (!emailForm.asunto || !emailForm.cuerpo || !usuarioSeleccionado?.email) return
    setEnviandoEmail(true)
    const res = await fetch("/api/panel-ejecutivo/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ para: usuarioSeleccionado.email, nombre: usuarioSeleccionado.name, asunto: emailForm.asunto, cuerpo: emailForm.cuerpo })
    }).catch(() => null)
    setEnviandoEmail(false)
    if (res?.ok) { setEmailEnviado(true); setEmailForm({ asunto: "", cuerpo: "" }) }
  }

  if (verificando) return null

  if (mostrarBienvenida) return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "#0b0e1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(180deg, #c9a14d, #a8843a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <span style={{ fontSize: 30, color: "#0b0e1a" }}>✓</span>
        </div>
        <p style={{ fontSize: 20, fontWeight: 500, color: "#f1ecdd", margin: "0 0 4px" }}>Bienvenido{usuarioActual?.genero === "femenino" ? "a" : ""}, {usuarioActual?.name?.split(" ")[0]}</p>
        <p style={{ fontSize: 13, color: "#8d92ab", margin: 0 }}>Identidad verificada · accediendo al panel ejecutivo...</p>
      </div>
    </div>
  )

  if (!autenticado) return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "#0b0e1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 20, left: 24, display: "flex", alignItems: "center", gap: 8, zIndex: 2 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1e1b4b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff" }}>{empresaNombre.charAt(0).toUpperCase()}</div>
        <span style={{ fontSize: 12, color: "#8d92ab" }}>{empresaNombre}</span>
      </div>
      <div style={{ width: 360, textAlign: "center", position: "relative", zIndex: 1, background: "rgba(255,255,255,0.045)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "32px 28px", boxShadow: "0 8px 40px rgba(255,255,255,0.06), 0 2px 12px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(180deg, #c9a14d, #a8843a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b0e1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" /></svg>
        </div>
        <p style={{ fontSize: 18, fontWeight: 500, color: "#f1ecdd", margin: "0 0 4px" }}>Panel ejecutivo</p>
        <p style={{ fontSize: 13, color: "#8d92ab", margin: "0 0 26px" }}>Verifica tu identidad para continuar.</p>
        {errorLogin && <div style={{ background: "rgba(228,75,74,0.12)", border: "1px solid rgba(228,75,74,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#f09595" }}>{errorLogin}</div>}
        <div style={{ textAlign: "left", marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#8d92ab", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>CORREO</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" style={inputStyle} />
        </div>
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "#8d92ab", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>CONTRASENA</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && verificarLogin()} placeholder="••••••••" style={inputStyle} />
        </div>
        <button onClick={verificarLogin} disabled={cargandoLogin} style={{ width: "100%", background: "linear-gradient(180deg, #c9a14d, #a8843a)", color: "#0b0e1a", border: "none", padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: cargandoLogin ? "default" : "pointer", opacity: cargandoLogin ? 0.7 : 1 }}>
          {cargandoLogin ? "Verificando..." : "Acceder al panel ejecutivo"}
        </button>
        <p style={{ fontSize: 11, color: "#5a5f78", marginTop: 18 }}>🔒 Acceso restringido a usuarios autorizados</p>
      </div>
    </div>
  )

  if (loading) return <div style={{ minHeight: "calc(100vh - 57px)", background: "#0b0e1a", padding: 60, textAlign: "center", color: "#8d92ab" }}>Cargando...</div>

  const superAdmins = data?.superAdmins || []
  const gerenciales = data?.gerenciales || []
  const totalOnline = data?.totalOnline || 0
  const todosUsuarios = [...superAdmins, ...gerenciales]
  const usuariosFiltrados = todosUsuarios.filter(u => {
    if (filtro === "online") return u.online
    if (filtro === "offline") return !u.online
    return true
  })

  return (
    <div style={{ height: "calc(100vh - 57px)", background: "#0b0e1a", display: "grid", gridTemplateColumns: "300px 1fr" }}>

      {/* SIDEBAR IZQUIERDO */}
      <div style={{ borderRight: "1px solid #1e2235", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e2235" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1ecdd" }}>Panel ejecutivo</div>
              <div style={{ fontSize: 11, color: "#8d92ab", marginTop: 2 }}>
                <span style={{ color: "#1D9E75" }}>●</span> {totalOnline} en linea de {todosUsuarios.length}
              </div>
            </div>
            <button onClick={() => { sessionStorage.removeItem("panelEjecutivoAuth"); setAutenticado(false); setUsuarioActual(null) }}
              style={{ fontSize: 10, padding: "4px 10px", background: "rgba(228,75,74,0.1)", color: "#f09595", border: "1px solid rgba(228,75,74,0.2)", borderRadius: 6, cursor: "pointer" }}>
              Salir
            </button>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["todos","online","offline"] as const).map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                style={{ flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6, cursor: "pointer", background: filtro === f ? "#673DE6" : "rgba(255,255,255,0.05)", color: filtro === f ? "#fff" : "#8d92ab" }}>
                {f === "todos" ? "Todos" : f === "online" ? "En linea" : "Offline"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {usuariosFiltrados.map((u: any) => (
            <div key={u.id} onClick={() => seleccionarUsuario(u)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: usuarioSeleccionado?.id === u.id ? "rgba(103,61,230,0.2)" : "rgba(255,255,255,0.03)", border: usuarioSeleccionado?.id === u.id ? "1px solid rgba(103,61,230,0.3)" : "1px solid transparent", opacity: u.online ? 1 : 0.65 }}>
              <Avatar nombre={u.name} size={36} online={u.online} dorado={u.esFundador} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#f1ecdd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                <div style={{ fontSize: 10, color: u.online ? "#1D9E75" : "#8d92ab" }}>{u.online ? "● En linea" : `● ${tiempoDesde(u.ultimaActividad)}`}</div>
              </div>
              <div style={{ fontSize: 10, color: "#5a5f78" }}>{u.esFundador ? "👑" : u.role === "SUPER_ADMIN" ? "SA" : ""}</div>
            </div>
          ))}
          {usuariosFiltrados.length === 0 && (
            <div style={{ textAlign: "center", color: "#5a5f78", fontSize: 12, padding: 20 }}>Sin usuarios</div>
          )}
        </div>
      </div>

      {/* PANEL DERECHO */}
      {!usuarioSeleccionado ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 36 }}>👥</div>
          <div style={{ fontSize: 14, color: "#8d92ab" }}>Selecciona un usuario para comunicarte</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

          {/* Header usuario */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #1e2235", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d1022" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar nombre={usuarioSeleccionado.name} size={38} online={usuarioSeleccionado.online} dorado={usuarioSeleccionado.esFundador} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1ecdd" }}>{usuarioSeleccionado.name}</div>
                <div style={{ fontSize: 11, color: usuarioSeleccionado.online ? "#1D9E75" : "#8d92ab" }}>
                  {usuarioSeleccionado.online ? "● En linea ahora" : `● Desconectado · ${tiempoDesde(usuarioSeleccionado.ultimaActividad)}`}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setTab("email") }}
                style={{ background: "#1e2235", color: "#c9ccd9", border: "1px solid #2a2f45", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email
              </button>
              <button onClick={() => router.push(`/panel-ejecutivo/${usuarioSeleccionado.id}`)}
                style={{ background: "#673DE6", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Ver perfil
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e2235", background: "#0d1022" }}>
            {(["mensajes","email","actividad"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "10px 20px", fontSize: 12, fontWeight: 600, border: "none", borderBottom: tab === t ? "2px solid #673DE6" : "2px solid transparent", background: "transparent", color: tab === t ? "#673DE6" : "#8d92ab", cursor: "pointer", textTransform: "capitalize" as const }}>
                {t === "mensajes" ? "Mensajes" : t === "email" ? "Email" : "Actividad"}
              </button>
            ))}
          </div>

          {/* Contenido tab */}
          {tab === "mensajes" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div ref={mensajesRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {mensajes.length === 0 && (
                  <div style={{ textAlign: "center", color: "#5a5f78", fontSize: 12, padding: 20 }}>Sin mensajes aun. Inicia la conversacion.</div>
                )}
                {mensajes.map((m: any, i) => {
                  const esPropio = m.remitenteId === usuarioActual?.id
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: esPropio ? "flex-end" : "flex-start" }}>
                      <div style={{ background: esPropio ? "#673DE6" : "#161a2c", border: esPropio ? "none" : "1px solid #2a2f45", borderRadius: esPropio ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "10px 14px", maxWidth: "70%" }}>
                        <div style={{ fontSize: 13, color: esPropio ? "#fff" : "#c9ccd9" }}>{m.texto}</div>
                        <div style={{ fontSize: 10, color: esPropio ? "rgba(255,255,255,0.5)" : "#5a5f78", marginTop: 4, textAlign: "right" }}>
                          {new Date(m.creadoEn || m.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #1e2235", display: "flex", gap: 10, alignItems: "center" }}>
                <input value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviarMensaje()}
                  placeholder={`Escribe a ${usuarioSeleccionado.name?.split(" ")[0]}...`}
                  style={{ flex: 1, background: "#161a2c", border: "1px solid #2a2f45", color: "#f1ecdd", borderRadius: 9, padding: "9px 14px", fontSize: 13, outline: "none" }} />
                <button onClick={enviarMensaje} disabled={enviando || !nuevoMensaje.trim()}
                  style={{ width: 38, height: 38, background: "#673DE6", border: "none", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: !nuevoMensaje.trim() ? 0.5 : 1 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          )}

          {tab === "email" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {emailEnviado ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1D9E75", marginBottom: 6 }}>Email enviado correctamente</div>
                  <div style={{ fontSize: 12, color: "#8d92ab", marginBottom: 20 }}>a {usuarioSeleccionado.email}</div>
                  <button onClick={() => setEmailEnviado(false)} style={{ background: "#673DE6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>Nuevo email</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "#161a2c", border: "1px solid #2a2f45", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#8d92ab" }}>
                    Para: <span style={{ color: "#c9ccd9", fontWeight: 600 }}>{usuarioSeleccionado.name} &lt;{usuarioSeleccionado.email}&gt;</span>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#8d92ab", display: "block", marginBottom: 6 }}>ASUNTO</label>
                    <input value={emailForm.asunto} onChange={e => setEmailForm(p => ({ ...p, asunto: e.target.value }))} placeholder="Asunto del mensaje" style={{ ...inputStyle }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#8d92ab", display: "block", marginBottom: 6 }}>MENSAJE</label>
                    <textarea value={emailForm.cuerpo} onChange={e => setEmailForm(p => ({ ...p, cuerpo: e.target.value }))}
                      placeholder="Escribe el contenido del email..."
                      style={{ ...inputStyle, height: 160, resize: "none" as const }} />
                  </div>
                  <button onClick={enviarEmail} disabled={enviandoEmail || !emailForm.asunto || !emailForm.cuerpo}
                    style={{ background: "#673DE6", color: "#fff", border: "none", borderRadius: 9, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !emailForm.asunto || !emailForm.cuerpo ? 0.5 : 1 }}>
                    {enviandoEmail ? "Enviando..." : "Enviar email"}
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "actividad" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div style={{ background: "#161a2c", border: "1px solid #2a2f45", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#8d92ab", marginBottom: 16 }}>Ultima actividad de {usuarioSeleccionado.name?.split(" ")[0]}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Ultima conexion", valor: tiempoDesde(usuarioSeleccionado.ultimaActividad) },
                    { label: "Estado", valor: usuarioSeleccionado.online ? "En linea" : "Desconectado" },
                    { label: "Rol", valor: usuarioSeleccionado.role || "—" },
                    { label: "Cargo", valor: usuarioSeleccionado.cargo || "—" },
                  ].map(item => (
                    <div key={item.label} style={{ background: "#0d1022", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 10, color: "#5a5f78", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#c9ccd9" }}>{item.valor}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => router.push(`/panel-ejecutivo/${usuarioSeleccionado.id}`)}
                  style={{ marginTop: 16, background: "rgba(103,61,230,0.15)", color: "#a78bfa", border: "1px solid rgba(103,61,230,0.3)", borderRadius: 8, padding: "8px 20px", fontSize: 12, cursor: "pointer" }}>
                  Ver perfil completo →
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}