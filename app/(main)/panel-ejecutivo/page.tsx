"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

function Avatar({ nombre, size = 38, online, dorado = false }: { nombre: string; size?: number; online?: boolean; dorado?: boolean }) {
  const initials = (nombre || "?").split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: dorado ? "#c9a14d" : "#2a2f45",
        color: dorado ? "#0b0e1a" : "#c9ccd9",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.34, fontWeight: 500
      }}>{initials}</div>
      <span style={{
        position: "absolute", bottom: -1, right: -1, width: size * 0.28, height: size * 0.28,
        borderRadius: "50%", background: online ? "#1D9E75" : "#5a5f78",
        border: "2px solid #0b0e1a"
      }} />
    </div>
  )
}

function tiempoDesde(fecha: string | null) {
  if (!fecha) return "Nunca conectado"
  const diff = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Ahora mismo"
  if (min < 60) return `hace ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias}d`
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

  const intervalRef = useRef<any>(null)

  useEffect(() => {
    const sesion = sessionStorage.getItem("panelEjecutivoAuth")
    if (sesion) {
      try {
        const u = JSON.parse(sesion)
        setUsuarioActual(u)
        setAutenticado(true)
      } catch {}
    }
    setVerificando(false)
    fetch("/api/empresa").then(r => r.json()).then(d => setEmpresaNombre(d.nombre || "Mi Empresa")).catch(() => {})
  }, [])

  const verificarLogin = async () => {
    setErrorLogin("")
    if (!email || !password) { setErrorLogin("Introduce email y contraseña"); return }
    setCargandoLogin(true)
    const res = await fetch("/api/panel-ejecutivo-login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    setCargandoLogin(false)
    if (data.error) { setErrorLogin(data.error); return }
    setUsuarioActual(data.usuario)
    sessionStorage.setItem("panelEjecutivoAuth", JSON.stringify(data.usuario))
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

  // PANTALLA DE VERIFICACION INICIAL (silenciosa)
  if (verificando) return null

  // PANTALLA DE BIENVENIDA
  if (mostrarBienvenida) {
    return (
      <div style={{ minHeight: "calc(100vh - 57px)", background: "#0b0e1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(180deg, #c9a14d, #a8843a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ fontSize: 30, color: "#0b0e1a" }}>✓</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 500, color: "#f1ecdd", margin: "0 0 4px", fontFamily: "var(--font-serif)" }}>
            Bienvenido{usuarioActual?.genero === "femenino" ? "a" : ""}, {usuarioActual?.name?.split(" ")[0]}
          </p>
          <p style={{ fontSize: 13, color: "#8d92ab", margin: 0 }}>Identidad verificada · accediendo al panel ejecutivo...</p>
        </div>
      </div>
    )
  }

  // PANTALLA DE LOGIN
  if (!autenticado) {
    return (
      <div style={{ minHeight: "calc(100vh - 57px)", background: "#0b0e1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>

        <div style={{ position: "absolute", top: 20, left: 24, display: "flex", alignItems: "center", gap: 8, zIndex: 2 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1e1b4b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff" }}>
            {empresaNombre.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: "#8d92ab" }}>{empresaNombre}</span>
        </div>

        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.05, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <svg width="180" height="180" viewBox="0 0 48 48" fill="none">
            <rect x="1.5" y="1.5" width="45" height="45" rx="11" fill="#c9a14d"/>
            <circle cx="24" cy="16" r="5" fill="#0b0e1a"/>
            <path d="M14 34C14 29 18.5 26 24 26C29.5 26 34 29 34 34" stroke="#0b0e1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="14" cy="20" r="3.5" fill="rgba(11,14,26,0.6)"/>
            <circle cx="34" cy="20" r="3.5" fill="rgba(11,14,26,0.6)"/>
          </svg>
          <span style={{ fontSize: 42, fontWeight: 600, color: "#c9a14d", letterSpacing: "-1px" }}>Scheduleo</span>
        </div>

        <div style={{
          width: 360, textAlign: "center", position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.045)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "32px 28px",
          boxShadow: "0 8px 40px rgba(255,255,255,0.06), 0 2px 12px rgba(0,0,0,0.4)"
        }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(180deg, #c9a14d, #a8843a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b0e1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
            </svg>
          </div>

          <p style={{ fontSize: 18, fontWeight: 500, color: "#f1ecdd", margin: "0 0 4px", fontFamily: "var(--font-serif)" }}>Panel ejecutivo</p>
          <p style={{ fontSize: 13, color: "#8d92ab", margin: "0 0 26px" }}>Bienvenido. Verifica tu identidad para continuar.</p>

          {errorLogin && (
            <div style={{ background: "rgba(228,75,74,0.12)", border: "1px solid rgba(228,75,74,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#f09595" }}>
              {errorLogin}
            </div>
          )}

          <div style={{ textAlign: "left", marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#8d92ab", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>CORREO ELECTRÓNICO</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" style={inputStyle} />
          </div>

          <div style={{ textAlign: "left", marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: "#8d92ab", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>CONTRASEÑA</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && verificarLogin()} placeholder="••••••••" style={inputStyle} />
          </div>

          <button onClick={verificarLogin} disabled={cargandoLogin} style={{
            width: "100%", background: "linear-gradient(180deg, #c9a14d, #a8843a)", color: "#0b0e1a", border: "none",
            padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: cargandoLogin ? "default" : "pointer",
            opacity: cargandoLogin ? 0.7 : 1
          }}>
            {cargandoLogin ? "Verificando..." : "Acceder al panel ejecutivo"}
          </button>

          <p style={{ fontSize: 11, color: "#5a5f78", marginTop: 18, lineHeight: 1.5 }}>
            🔒 Acceso restringido a Super Administradores y usuarios gerenciales autorizados
          </p>
        </div>
      </div>
    )
  }

  // PANEL PRINCIPAL (ya autenticado)
  if (loading) return <div style={{ minHeight: "calc(100vh - 57px)", background: "#0b0e1a", padding: 60, textAlign: "center", color: "#8d92ab" }}>Cargando panel ejecutivo...</div>

  const superAdmins = data?.superAdmins || []
  const gerenciales = data?.gerenciales || []
  const totalOnline = data?.totalOnline || 0

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "#0b0e1a", borderRadius: 0, padding: "1.5rem 2rem", border: "none" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#f1ecdd", letterSpacing: "0.01em" }}>Panel ejecutivo</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#161a2c", border: "1px solid #2a2f45", padding: "5px 12px", borderRadius: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#c9ccd9" }}>{totalOnline} conectado{totalOnline !== 1 ? "s" : ""} ahora</span>
          </div>
          <button onClick={() => { sessionStorage.removeItem("panelEjecutivoAuth"); setAutenticado(false); setUsuarioActual(null) }}
            style={{ fontSize: 11, padding: "5px 12px", background: "rgba(228,75,74,0.1)", color: "#f09595", border: "1px solid rgba(228,75,74,0.25)", borderRadius: 8, cursor: "pointer" }}>
            Salir del panel
          </button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#8d92ab", marginBottom: 24, marginLeft: 30 }}>Usuarios y accesos del sistema</div>

      <div style={{ fontSize: 11, color: "#8d92ab", letterSpacing: "0.06em", marginBottom: 8, marginLeft: 4 }}>SUPER ADMINISTRADORES ({superAdmins.length})</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {superAdmins.map((u: any) => (
          <div key={u.id} onClick={() => router.push(`/panel-ejecutivo/${u.id}`)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
            background: u.esFundador ? "linear-gradient(180deg, #1a1f33, #15192a)" : "#161a2c",
            border: u.esFundador ? "1px solid #c9a14d" : "1px solid #2a2f45"
          }}>
            <Avatar nombre={u.name} size={38} online={u.online} dorado={u.esFundador} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#f1ecdd" }}>{u.name}</span>
                {u.esFundador ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#c9a14d", color: "#0b0e1a", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>👑 Fundador</span>
                ) : (
                  <span style={{ background: "#2a2f45", color: "#c9ccd9", fontSize: 10, padding: "2px 8px", borderRadius: 6 }}>Super Admin #{u.ordenSuperAdmin || "—"}</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: u.online ? "#1D9E75" : "#8d92ab", marginTop: 2 }}>
                {u.online ? "En línea ahora" : `Desconectado · ${tiempoDesde(u.ultimaActividad)}`}
                {u.id === usuarioActual?.id && " · eres tú"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#8d92ab", letterSpacing: "0.06em", marginBottom: 8, marginLeft: 4 }}>USUARIOS GERENCIALES ({gerenciales.length})</div>
      {gerenciales.length === 0 ? (
        <div style={{ background: "#161a2c", border: "1px solid #2a2f45", borderRadius: 10, padding: 30, textAlign: "center", color: "#8d92ab", fontSize: 13 }}>
          Sin usuarios gerenciales todavía
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gerenciales.map((u: any) => (
            <div key={u.id} onClick={() => router.push(`/panel-ejecutivo/${u.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "#161a2c", border: "1px solid #2a2f45", cursor: "pointer" }}>
              <Avatar nombre={u.name} size={34} online={u.online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#f1ecdd" }}>{u.name}</div>
                <div style={{ fontSize: 11, color: u.online ? "#1D9E75" : "#8d92ab", marginTop: 2 }}>
                  {u.online ? "En línea ahora" : `Desconectado · ${tiempoDesde(u.ultimaActividad)}`}
                  {u.cargo && ` · ${u.cargo}`}
                </div>
              </div>
              <span style={{ color: "#5a5f78", fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}