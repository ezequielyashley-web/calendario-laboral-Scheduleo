"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

function Avatar({ nombre, size = 38, online, dorado = false }: { nombre: string; size?: number; online?: boolean; dorado?: boolean }) {
  const initials = (nombre || "?").split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: size > 50 ? 16 : 10, background: dorado ? "linear-gradient(135deg,#673DE6,#8B5CF6)" : "#E2E8F0", color: dorado ? "#fff" : "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, boxShadow: dorado ? "0 6px 16px rgba(103,61,230,0.3)" : "none" }}>{initials}</div>
      <span style={{ position: "absolute", bottom: -1, right: -1, width: size * 0.24, height: size * 0.24, borderRadius: "50%", background: online ? "#10B981" : "#CBD5E1", border: "2px solid #fff" }} />
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

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "#F9FAFB", border: "1px solid #E2E8F0", color: "#0F172A", boxSizing: "border-box", borderRadius: 9, fontSize: 13, outline: "none" }

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
  const [vista, setVista] = useState<"directorio"|"comunicacion">("directorio")
  const [tabPerfil, setTabPerfil] = useState<"general"|"actividad"|"notas">("general")
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [formPerfil, setFormPerfil] = useState({ name: "", email: "", cargo: "", departamento: "" })
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [errorPerfil, setErrorPerfil] = useState("")
  const [notas, setNotas] = useState<any[]>([])
  const [cargandoNotas, setCargandoNotas] = useState(false)
  const [notaNueva, setNotaNueva] = useState("")
  const [guardandoNota, setGuardandoNota] = useState(false)
  const [notaEditando, setNotaEditando] = useState<string | null>(null)
  const [textoEdicion, setTextoEdicion] = useState("")
  const [tabComs, setTabComs] = useState<"mensajes"|"email"|"actividad">("mensajes")
  const [mensajes, setMensajes] = useState<any[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [emailForm, setEmailForm] = useState({ asunto: "", cuerpo: "" })
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const intervalRef = useRef<any>(null)
  const mensajesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("panelEjecutivoAuth")
    if (stored) {
      try { const u = JSON.parse(stored); setUsuarioActual(u); setAutenticado(true) } catch {}
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
    setTimeout(() => { setAutenticado(true); setMostrarBienvenida(false) }, 1500)
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

  const cargarNotas = async () => {
    setCargandoNotas(true)
    const res = await fetch("/api/notas-personales").catch(() => null)
    if (res?.ok) { const d = await res.json(); setNotas(Array.isArray(d) ? d : []) }
    setCargandoNotas(false)
  }

  useEffect(() => {
    if (tabPerfil === "notas" && usuarioSeleccionado?.id === usuarioActual?.id) cargarNotas()
  }, [tabPerfil, usuarioSeleccionado])

  const crearNota = async () => {
    if (!notaNueva.trim()) return
    setGuardandoNota(true)
    const res = await fetch("/api/notas-personales", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contenido: notaNueva })
    })
    const nota = await res.json()
    setGuardandoNota(false)
    if (!nota.error) { setNotas(prev => [nota, ...prev]); setNotaNueva("") }
  }

  const guardarEdicionNota = async (id: string) => {
    if (!textoEdicion.trim()) return
    const res = await fetch("/api/notas-personales", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, contenido: textoEdicion })
    })
    const actualizada = await res.json()
    if (!actualizada.error) { setNotas(prev => prev.map(n => n.id === id ? actualizada : n)); setNotaEditando(null) }
  }

  const borrarNota = async (id: string) => {
    if (!confirm("Borrar esta nota?")) return
    setNotas(prev => prev.filter(n => n.id !== id))
    await fetch(`/api/notas-personales?id=${id}`, { method: "DELETE" })
  }

  const cargarMensajes = async (userId: string) => {
    const res = await fetch(`/api/panel-ejecutivo/mensajes?yo=${usuarioActual?.id}&con=${userId}`).catch(() => null)
    if (res?.ok) { const d = await res.json(); setMensajes(Array.isArray(d) ? d : []) }
    setTimeout(() => { if (mensajesRef.current) mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight }, 100)
  }

  const seleccionarUsuario = (u: any) => {
    setUsuarioSeleccionado(u)
    setTabPerfil("general")
    setTabComs("mensajes")
    setNuevoMensaje("")
    setEmailEnviado(false)
    cargarMensajes(u.id)
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !usuarioSeleccionado) return
    setEnviando(true)
    const res = await fetch("/api/panel-ejecutivo/mensajes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remitenteId: usuarioActual?.id, paraId: usuarioSeleccionado.id, texto: nuevoMensaje.trim() })
    }).catch(() => null)
    if (res?.ok) { setNuevoMensaje(""); cargarMensajes(usuarioSeleccionado.id) }
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
    <div style={{ minHeight: "calc(100vh - 57px)", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#673DE6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(103,61,230,0.3)" }}>
          <span style={{ fontSize: 28, color: "#fff" }}>✓</span>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>Bienvenido{usuarioActual?.genero === "femenino" ? "a" : ""}, {usuarioActual?.name?.split(" ")[0]}</p>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Accediendo al panel ejecutivo...</p>
      </div>
    </div>
  )

  if (!autenticado) return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: 380, textAlign: "center", background: "#fff", border: "1px solid #E2E4E9", borderRadius: 20, padding: "36px 32px", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#1E293B,#334155)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#673DE6" strokeWidth="2"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" /></svg>
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Panel Ejecutivo</p>
        <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 24px" }}>Acceso restringido a dirección y gerencia.</p>
        {errorLogin && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#B91C1C" }}>{errorLogin}</div>}
        <div style={{ textAlign: "left", marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 6, fontWeight: 600 }}>CORREO</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" style={inputStyle} />
        </div>
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 6, fontWeight: 600 }}>CONTRASENA</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && verificarLogin()} placeholder="••••••••" style={inputStyle} />
        </div>
        <button onClick={verificarLogin} disabled={cargandoLogin} style={{ width: "100%", background: "#0F172A", color: "#fff", border: "none", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: cargandoLogin ? "default" : "pointer", opacity: cargandoLogin ? 0.7 : 1 }}>
          {cargandoLogin ? "Verificando..." : "Acceder al panel"}
        </button>
      </div>
    </div>
  )

  if (loading) return <div style={{ minHeight: "calc(100vh - 57px)", background: "#F4F5F7", padding: 60, textAlign: "center", color: "#64748B" }}>Cargando...</div>

  const superAdmins = data?.superAdmins || []
  const gerenciales = data?.gerenciales || []
  const totalOnline = data?.totalOnline || 0
  const todosUsuarios = [...superAdmins, ...gerenciales]
  const diasEnSistema = usuarioSeleccionado?.createdAt ? Math.floor((Date.now() - new Date(usuarioSeleccionado.createdAt).getTime()) / 86400000) : 0

  return (
    <div className="panel-ejec-responsive-wrap" style={{ minHeight: "calc(100vh - 57px)", background: "#F4F5F7", padding: "20px 24px" }}>
      <style>{`
        @media (max-width: 768px) {
          .panel-ejec-responsive-wrap { padding: 12px !important; }
          .panel-ejec-header-responsive { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .panel-ejec-tabs-responsive { flex-direction: column !important; }
          .panel-ejec-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header ejecutivo */}
      <div className="panel-ejec-header-responsive" style={{ background: "linear-gradient(135deg,#FAFBFC,#F0F1F5)", border: "1px solid #E2E4E9", borderRadius: 16, padding: "18px 22px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#1E293B,#334155)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(30,41,59,0.25)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#673DE6" strokeWidth="1.8"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Panel Ejecutivo</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>Acceso restringido · Direccion y gerencia</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E2E4E9", borderRadius: 20, padding: "6px 14px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>{totalOnline} en linea de {todosUsuarios.length}</span>
          </div>
          <button onClick={() => { sessionStorage.removeItem("panelEjecutivoAuth"); setAutenticado(false); setUsuarioActual(null) }}
            style={{ fontSize: 11, padding: "6px 14px", background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 20, cursor: "pointer", fontWeight: 700 }}>
            Salir
          </button>
        </div>
      </div>

      {/* Pestañas Directorio / Comunicacion */}
      <div className="panel-ejec-tabs-responsive" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div onClick={() => setVista("directorio")} style={{ flex: 1, background: vista === "directorio" ? "#fff" : "#F9FAFB", border: `2px solid ${vista === "directorio" ? "#673DE6" : "#E2E4E9"}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: vista === "directorio" ? "0 4px 16px rgba(103,61,230,0.15)" : "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#673DE6" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: vista === "directorio" ? "#0F172A" : "#334155" }}>Directorio</div>
            <div style={{ fontSize: 9, color: "#64748B" }}>Perfiles y datos de RRHH</div>
          </div>
        </div>
        <div onClick={() => setVista("comunicacion")} style={{ flex: 1, background: vista === "comunicacion" ? "#fff" : "#F9FAFB", border: `2px solid ${vista === "comunicacion" ? "#2563EB" : "#E2E4E9"}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: vista === "comunicacion" ? "0 4px 16px rgba(37,99,235,0.12)" : "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: vista === "comunicacion" ? "#0F172A" : "#334155" }}>Comunicacion</div>
            <div style={{ fontSize: 9, color: "#64748B" }}>Chat y email directo</div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="panel-ejec-grid-responsive" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14, minHeight: 500 }}>

        {/* Lista usuarios */}
        <div style={{ background: "#fff", border: "1px solid #E2E4E9", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #EEF0F3", background: "#FAFBFC" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em" }}>Miembros del equipo</div>
          </div>
          <div style={{ padding: 8 }}>
            {todosUsuarios.map((u: any) => (
              <div key={u.id} onClick={() => seleccionarUsuario(u)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: usuarioSeleccionado?.id === u.id ? "#F5F3FF" : "transparent", border: usuarioSeleccionado?.id === u.id ? "1px solid #DDD6FE" : "1px solid transparent" }}>
                <Avatar nombre={u.name} size={38} online={u.online} dorado={u.esFundador} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                    {u.esFundador && <svg width="11" height="11" viewBox="0 0 24 24" fill="#673DE6"><path d="M12 2l2.4 6.8L21 9l-5.5 4.2L17 21l-5-3.5L7 21l1.5-7.8L3 9l6.6-.2z"/></svg>}
                  </div>
                  <div style={{ fontSize: 10, color: u.online ? "#673DE6" : "#94A3B8", fontWeight: 600 }}>{u.esFundador ? "Fundador · " : ""}{u.online ? "En linea" : tiempoDesde(u.ultimaActividad)}</div>
                </div>
              </div>
            ))}
            {todosUsuarios.length === 0 && <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, padding: 20 }}>Sin usuarios</div>}
          </div>
        </div>

        {/* Panel derecho */}
        {!usuarioSeleccionado ? (
          <div style={{ background: "#fff", border: "1px solid #E2E4E9", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 36 }}>👥</div>
            <div style={{ fontSize: 14, color: "#94A3B8" }}>Selecciona un miembro del equipo</div>
          </div>
        ) : vista === "directorio" ? (
          <div style={{ background: "#fff", border: "1px solid #E2E4E9", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 18, borderBottom: "1px solid #EEF0F3", marginBottom: 18 }}>
              <Avatar nombre={usuarioSeleccionado.name} size={64} online={usuarioSeleccionado.online} dorado={usuarioSeleccionado.esFundador} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{usuarioSeleccionado.name}</span>
                  {usuarioSeleccionado.esFundador && (
                    <span style={{ background: "#F5F3FF", color: "#673DE6", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="#673DE6"><path d="M12 2l2.4 6.8L21 9l-5.5 4.2L17 21l-5-3.5L7 21l1.5-7.8L3 9l6.6-.2z"/></svg>
                      FUNDADOR
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{usuarioSeleccionado.email} · {usuarioSeleccionado.role || "SUPER_ADMIN"}</div>
              </div>
              <button onClick={() => setVista("comunicacion")} style={{ background: "#0F172A", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Contactar
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div style={{ background: "#FAFBFC", border: "1px solid #EEF0F3", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>En el sistema</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{diasEnSistema}d</div>
              </div>
              <div style={{ background: "#FAFBFC", border: "1px solid #EEF0F3", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Estado</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: usuarioSeleccionado.online ? "#10B981" : "#94A3B8", display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: usuarioSeleccionado.online ? "#10B981" : "#CBD5E1" }} />
                  {usuarioSeleccionado.online ? "En linea" : tiempoDesde(usuarioSeleccionado.ultimaActividad)}
                </div>
              </div>
              <div style={{ background: "#FAFBFC", border: "1px solid #EEF0F3", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Rol</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{usuarioSeleccionado.role || "Super Admin"}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, borderBottom: "1px solid #EEF0F3", paddingBottom: 2, marginBottom: 16 }}>
              {(usuarioSeleccionado.id === usuarioActual?.id ? ["general", "actividad", "notas"] as const : ["general", "actividad"] as const).map(t => (
                <span key={t} onClick={() => setTabPerfil(t)} style={{ fontSize: 12, fontWeight: tabPerfil === t ? 700 : 500, color: tabPerfil === t ? "#0F172A" : "#94A3B8", padding: "8px 12px", borderBottom: `2px solid ${tabPerfil === t ? "#673DE6" : "transparent"}`, cursor: "pointer", textTransform: "capitalize" as const }}>{t}</span>
              ))}
            </div>

            {tabPerfil === "general" && (
              usuarioSeleccionado.id === usuarioActual?.id ? (
                editandoPerfil ? (
                  <div>
                    {errorPerfil && <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>{errorPerfil}</div>}
                    {[
                      { campo: "name", label: "Nombre" },
                      { campo: "email", label: "Email" },
                      { campo: "cargo", label: "Cargo" },
                      { campo: "departamento", label: "Departamento" },
                    ].map(f => (
                      <div key={f.campo} style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>{f.label}</label>
                        <input
                          value={(formPerfil as any)[f.campo]}
                          onChange={e => setFormPerfil(p => ({ ...p, [f.campo]: e.target.value }))}
                          style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E4E9", borderRadius: 8, fontSize: 13, boxSizing: "border-box" as const }}
                        />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button onClick={() => setEditandoPerfil(false)} style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                      <button
                        disabled={guardandoPerfil}
                        onClick={async () => {
                          setGuardandoPerfil(true); setErrorPerfil("")
                          const res = await fetch("/api/panel-ejecutivo/actualizar-perfil", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formPerfil) })
                          const data = await res.json()
                          setGuardandoPerfil(false)
                          if (data.error) { setErrorPerfil(data.error); return }
                          const actualizado = { ...usuarioActual, name: data.name, email: data.email, cargo: data.cargo, departamento: data.departamento }
                          setUsuarioActual(actualizado)
                          sessionStorage.setItem("panelEjecutivoAuth", JSON.stringify(actualizado))
                          cargar()
                          setEditandoPerfil(false)
                        }}
                        style={{ background: "#673DE6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {guardandoPerfil ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>Este es tu perfil de Super Admin. Puedes editar tus datos.</div>
                    <button
                      onClick={() => {
                        setFormPerfil({ name: usuarioSeleccionado.name || "", email: usuarioSeleccionado.email || "", cargo: usuarioSeleccionado.cargo || "", departamento: usuarioSeleccionado.departamento || "" })
                        setEditandoPerfil(true)
                      }}
                      style={{ background: "#673DE6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Editar mi perfil
                    </button>
                  </div>
                )
              ) : (
                <div style={{ fontSize: 13, color: "#64748B" }}>Perfil completo disponible en la ficha detallada. Usa la pestana Comunicacion para chatear o enviar un email.</div>
              )
            )}
            {tabPerfil === "actividad" && (
              <div style={{ fontSize: 13, color: "#64748B" }}>Ultima actividad: {tiempoDesde(usuarioSeleccionado.ultimaActividad)}</div>
            )}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E2E4E9", borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>

            <div style={{ padding: "14px 20px", borderBottom: "1px solid #EEF0F3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar nombre={usuarioSeleccionado.name} size={38} online={usuarioSeleccionado.online} dorado={usuarioSeleccionado.esFundador} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{usuarioSeleccionado.name}</div>
                  <div style={{ fontSize: 11, color: usuarioSeleccionado.online ? "#10B981" : "#94A3B8" }}>{usuarioSeleccionado.online ? "En linea ahora" : `Desconectado · ${tiempoDesde(usuarioSeleccionado.ultimaActividad)}`}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #EEF0F3" }}>
              {(["mensajes", "email", "actividad"] as const).map(t => (
                <button key={t} onClick={() => setTabComs(t)}
                  style={{ padding: "10px 20px", fontSize: 12, fontWeight: 600, border: "none", borderBottom: tabComs === t ? "2px solid #2563EB" : "2px solid transparent", background: "transparent", color: tabComs === t ? "#2563EB" : "#94A3B8", cursor: "pointer", textTransform: "capitalize" as const }}>
                  {t === "mensajes" ? "Mensajes" : t === "email" ? "Email" : "Actividad"}
                </button>
              ))}
            </div>

            {tabComs === "mensajes" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div ref={mensajesRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {mensajes.length === 0 && <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, padding: 20 }}>Sin mensajes aun. Inicia la conversacion.</div>}
                  {mensajes.map((m: any, i) => {
                    const esPropio = m.remitenteId === usuarioActual?.id
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: esPropio ? "flex-end" : "flex-start" }}>
                        <div style={{ background: esPropio ? "#2563EB" : "#F1F5F9", borderRadius: esPropio ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "10px 14px", maxWidth: "70%" }}>
                          <div style={{ fontSize: 13, color: esPropio ? "#fff" : "#0F172A" }}>{m.texto}</div>
                          <div style={{ fontSize: 10, color: esPropio ? "rgba(255,255,255,0.6)" : "#94A3B8", marginTop: 4, textAlign: "right" }}>{new Date(m.creadoEn || m.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #EEF0F3", display: "flex", gap: 10 }}>
                  <input value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviarMensaje()}
                    placeholder={`Escribe a ${usuarioSeleccionado.name?.split(" ")[0]}...`}
                    style={{ flex: 1, background: "#F9FAFB", border: "1px solid #E2E8F0", color: "#0F172A", borderRadius: 9, padding: "9px 14px", fontSize: 13, outline: "none" }} />
                  <button onClick={enviarMensaje} disabled={enviando || !nuevoMensaje.trim()} style={{ width: 38, height: 38, background: "#2563EB", border: "none", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: !nuevoMensaje.trim() ? 0.5 : 1, flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            )}

            {tabComs === "email" && (
              <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                {emailEnviado ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#10B981", marginBottom: 6 }}>Email enviado correctamente</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>a {usuarioSeleccionado.email}</div>
                    <button onClick={() => setEmailEnviado(false)} style={{ background: "#0F172A", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>Nuevo email</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#64748B" }}>
                      Para: <span style={{ color: "#0F172A", fontWeight: 600 }}>{usuarioSeleccionado.name} &lt;{usuarioSeleccionado.email}&gt;</span>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 6, fontWeight: 600 }}>ASUNTO</label>
                      <input value={emailForm.asunto} onChange={e => setEmailForm(p => ({ ...p, asunto: e.target.value }))} placeholder="Asunto del mensaje" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 6, fontWeight: 600 }}>MENSAJE</label>
                      <textarea value={emailForm.cuerpo} onChange={e => setEmailForm(p => ({ ...p, cuerpo: e.target.value }))} placeholder="Escribe el contenido del email..." style={{ ...inputStyle, height: 160, resize: "none" as const }} />
                    </div>
                    <button onClick={enviarEmail} disabled={enviandoEmail || !emailForm.asunto || !emailForm.cuerpo}
                      style={{ background: "#0F172A", color: "#fff", border: "none", borderRadius: 9, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !emailForm.asunto || !emailForm.cuerpo ? 0.5 : 1 }}>
                      {enviandoEmail ? "Enviando..." : "Enviar email"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {tabComs === "actividad" && (
              <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                <div style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Ultima actividad de {usuarioSeleccionado.name?.split(" ")[0]}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Ultima conexion", valor: tiempoDesde(usuarioSeleccionado.ultimaActividad) },
                      { label: "Estado", valor: usuarioSeleccionado.online ? "En linea" : "Desconectado" },
                      { label: "Rol", valor: usuarioSeleccionado.role || "—" },
                      { label: "Cargo", valor: usuarioSeleccionado.cargo || "—" },
                    ].map(item => (
                      <div key={item.label} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.valor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}