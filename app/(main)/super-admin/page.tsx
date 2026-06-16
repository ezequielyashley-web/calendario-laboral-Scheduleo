"use client"
import { useState, useEffect } from "react"

export default function SuperAdminPage() {
  const [acceso, setAcceso] = useState(false)
  const [pin, setPin] = useState("")
  const [errorPin, setErrorPin] = useState("")
  const [verificando, setVerificando] = useState(false)
  const [tab, setTab] = useState("perfil")
  const [usuario, setUsuario] = useState<any>(null)
  const [superAdmins, setSuperAdmins] = useState<any[]>([])
  const [form, setForm] = useState<any>({})
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [modalNuevo, setModalNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({ name: "", email: "", cargo: "", telefono: "" })
  const [masterPassword, setMasterPassword] = useState("")
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [procesando, setProcesando] = useState<string|null>(null)
  const [modalModificar, setModalModificar] = useState<any>(null)
  const [modalEliminarUsuario, setModalEliminarUsuario] = useState<any>(null)
  const [pinEliminar, setPinEliminar] = useState("")
  const [motivoEliminar, setMotivoEliminar] = useState("")
  const [historial, setHistorial] = useState<any[]>([])
  const [pinLimpiar, setPinLimpiar] = useState("")
  const [showLimpiar, setShowLimpiar] = useState(false)
  const [ultimoCreado, setUltimoCreado] = useState<any>(null)

  const mostrarMensaje = (texto: string, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000)
  }

  useEffect(() => {
    fetch("/api/solicitudes-gerenciales").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setSolicitudes(data)
    }).catch(() => {})
  }, [])


  const verificar = async () => {
    if (!pin) { setErrorPin("Introduce tu contraseña"); return }
    setVerificando(true)
    const res = await fetch("/api/empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword: pin, _test: true })
    })
    const data = await res.json()
    setVerificando(false)
    if (data.error === "Contraseña incorrecta") { setErrorPin("Contrasena incorrecta"); return }
    setAcceso(true)
    setMasterPassword(pin)
    cargar()
  }

  const cargar = async () => {
    const res = await fetch("/api/super-admin")
    const data = await res.json()
    if (data.usuario) {
      setUsuario(data.usuario)
      setForm({
        name: data.usuario.name || "",
        email: data.usuario.email || "",
        telefono: data.usuario.telefono || "",
        telefonoCorp: data.usuario.telefonoCorp || "",
        cargo: data.usuario.cargo || "Super Administrador",
        departamento: data.usuario.departamento || "",
        dni: data.usuario.dni || "",
        fechaNacimiento: data.usuario.fechaNacimiento || "",
        fechaIncorporacion: data.usuario.fechaIncorporacion || "",
        notas: data.usuario.notas || "",
        nuevoEmail: "",
        nuevaPassword: "",
        confirmarPassword: "",
      })
    }
    if (data.superAdmins) setSuperAdmins(data.superAdmins)
    const sol = await fetch("/api/solicitudes-gerenciales").then(r => r.json())
    if (Array.isArray(sol)) setSolicitudes(sol)
  }

  const guardarPerfil = async () => {
    setGuardando(true)
    const res = await fetch("/api/super-admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword, name: form.name })
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Perfil actualizado correctamente")
    cargar()
  }

  const crearSuperAdmin = async () => {
    const res = await fetch("/api/super-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword, ...formNuevo })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje(`Super Admin creado. Contraseña temporal: ${data.tempPassword}`)
    setModalNuevo(false)
    setFormNuevo({ name: "", email: "", cargo: "", telefono: "" })
    cargar()
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, boxSizing: "border-box", color: "#1e293b", outline: "none",
    background: "#fff"
  }
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em"
  }

  if (!acceso) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "40px 36px", width: 380, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", marginBottom: 8 }}>ACCESO RESTRINGIDO</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Panel Super Admin</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 28px", lineHeight: 1.6 }}>Introduce tu contraseña master para acceder al panel de administracion</p>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verificar()}
            placeholder="••••••••••••"
            style={{ ...inputStyle, marginBottom: 12, textAlign: "center", fontSize: 18, letterSpacing: 6, border: "1px solid #e2e8f0" }} />
          {errorPin && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{errorPin}</p>}
          <button onClick={verificar} disabled={verificando || !pin}
            style={{ width: "100%", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: !pin ? 0.5 : 1 }}>
            {verificando ? "Verificando..." : "Acceder al panel"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Hero perfil */}
      <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderRadius: 20, padding: "32px 36px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.1)" }} />
        <div style={{ position: "absolute", bottom: -60, right: 80, width: 150, height: 150, borderRadius: "50%", background: "rgba(99,102,241,0.05)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28, fontWeight: 700, color: "#fff" }}>
            {(form.name || "A")[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>{form.name || "Administrador"}</h1>
              <span style={{ background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)", color: "#a5b4fc", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>SUPER_ADMIN</span>
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{form.cargo || "Super Administrador"} · Acceso total al sistema</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{form.email}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Miembro desde</div>
            <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{usuario?.createdAt ? new Date(usuario.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</div>
          </div>
        </div>
      </div>

      {mensaje.texto && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", borderRadius: 8, fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46", border: `1px solid ${mensaje.tipo === "error" ? "#fca5a5" : "#86efac"}` }}>
          {mensaje.texto}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
        {[
          { key: "perfil", label: "Datos del perfil", icon: "👤" },
          { key: "seguridad", label: "Acceso y seguridad", icon: "🔒" },
          { key: "superadmins", label: "Super Admins", icon: "👑" },
          { key: "solicitudes", label: "Solicitudes", icon: "📋", badge: solicitudes.filter((s:any) => s.estado === "pendiente").length },
          { key: "historial", label: "Historial", icon: "📜" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", fontSize: 13, fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "#0f172a" : "#94a3b8", background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #0f172a" : "2px solid transparent", cursor: "pointer", marginBottom: -1, transition: "all 0.15s" }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            {t.label}
            {"badge" in t && (t as any).badge > 0 && (
              <span style={{ background: "#dc2626", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {(t as any).badge > 9 ? "9+" : (t as any).badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: Perfil */}
      {tab === "perfil" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span>Datos personales</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Nombre completo", key: "name" },
                { label: "DNI / NIF", key: "dni" },
                { label: "Fecha de nacimiento", key: "fechaNacimiento", type: "date" },
                { label: "Telefono personal", key: "telefono" },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type || "text"} value={form[f.key] || ""}
                    onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Datos corporativos</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Cargo oficial", key: "cargo" },
                { label: "Departamento", key: "departamento" },
                { label: "Telefono corporativo", key: "telefonoCorp" },
                { label: "Fecha de incorporacion", key: "fechaIncorporacion", type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type || "text"} value={form[f.key] || ""}
                    onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>Notas privadas</div>
            <textarea value={form.notas || ""} onChange={e => setForm((p: any) => ({ ...p, notas: e.target.value }))}
              placeholder="Notas internas sobre el perfil..."
              style={{ ...inputStyle, height: 90, resize: "none" as const }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={guardarPerfil} disabled={guardando}
              style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {/* TAB: Seguridad */}
      {tab === "seguridad" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Email de acceso</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email actual</label>
              <input value={usuario?.email || ""} disabled style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nuevo email</label>
              <input type="email" value={form.nuevoEmail || ""} onChange={e => setForm((p: any) => ({ ...p, nuevoEmail: e.target.value }))}
                placeholder="nuevo@email.com" style={inputStyle} />
            </div>
            <button onClick={async () => {
              if (!form.nuevoEmail) return
              const res = await fetch(`/api/usuarios/${usuario.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cambiarEmail", nuevoEmail: form.nuevoEmail, masterPassword })
              })
              const data = await res.json()
              if (data.error) { mostrarMensaje(data.error, "error"); return }
              mostrarMensaje("Email actualizado correctamente")
              setForm((p: any) => ({ ...p, nuevoEmail: "" }))
              cargar()
            }} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Actualizar email
            </button>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Cambiar contraseña</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input type="password" value={form.nuevaPassword || ""} onChange={e => setForm((p: any) => ({ ...p, nuevaPassword: e.target.value }))}
                placeholder="Mínimo 12 caracteres" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input type="password" value={form.confirmarPassword || ""} onChange={e => setForm((p: any) => ({ ...p, confirmarPassword: e.target.value }))}
                placeholder="Repite la contraseña" style={inputStyle} />
            </div>
            <button onClick={async () => {
              if (!form.nuevaPassword || form.nuevaPassword !== form.confirmarPassword) { mostrarMensaje("Las contraseñas no coinciden", "error"); return }
              if (form.nuevaPassword.length < 12) { mostrarMensaje("Mínimo 12 caracteres", "error"); return }
              const res = await fetch(`/api/usuarios/${usuario.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset", masterPassword, nuevaPassword: form.nuevaPassword })
              })
              const data = await res.json()
              if (data.error) { mostrarMensaje(data.error, "error"); return }
              mostrarMensaje("Contraseña actualizada correctamente")
              setForm((p: any) => ({ ...p, nuevaPassword: "", confirmarPassword: "" }))
            }} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cambiar contraseña
            </button>
          </div>
        </div>
      )}

      {/* TAB: Super Admins */}
      {tab === "superadmins" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Super Administradores</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{superAdmins.length} en el sistema</div>
            </div>
            <button onClick={() => setModalNuevo(true)}
              style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Nuevo Super Admin
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {superAdmins.map((sa: any) => (
              <div key={sa.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: sa.id === usuario?.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: sa.id === usuario?.id ? "#fff" : "#64748b", flexShrink: 0 }}>
                  {(sa.name || "A")[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{sa.name || "—"}</div>
                    {sa.id === usuario?.id && <span style={{ background: "#ede9fe", color: "#6366f1", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>TU CUENTA</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{sa.email}</div>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Desde {new Date(sa.createdAt).toLocaleDateString("es-ES")}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={async () => {
                    const nuevoEmail = prompt("Nuevo email:")
                    if (!nuevoEmail) return
                    const res = await fetch(`/api/usuarios/${sa.id}`, {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "cambiarEmail", nuevoEmail, masterPassword })
                    })
                    const data = await res.json()
                    if (data.error) { mostrarMensaje(data.error, "error"); return }
                    mostrarMensaje("Email actualizado"); cargar()
                  }} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: "#374151", fontWeight: 500 }}>
                    Cambiar email
                  </button>
                  {sa.id !== usuario?.id && (
                    <button onClick={async () => {
                      if (!confirm("Revocar acceso SUPER_ADMIN?")) return
                      const res = await fetch(`/api/usuarios/${sa.id}`, {
                        method: "PATCH", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "pausar", masterPassword })
                      })
                      const data = await res.json()
                      if (data.error) { mostrarMensaje(data.error, "error"); return }
                      mostrarMensaje("Acceso revocado"); cargar()
                    }} style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: "#dc2626", fontWeight: 500 }}>
                      Revocar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Solicitudes */}
      {tab === "solicitudes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Solicitudes de acceso gerencial</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {solicitudes.filter((s: any) => s.estado === "pendiente").length} pendientes de revision
              </div>
            </div>
          </div>

          {solicitudes.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 40, textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>No hay solicitudes pendientes</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {solicitudes.map((sol: any) => (
                <div key={sol.id} style={{ position: "relative", background: "#fff", border: `1px solid ${sol.estado === "pendiente" ? "#fde68a" : sol.estado === "aprobada" ? "#86efac" : "#fca5a5"}`, borderRadius: 14, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: sol.estado === "pendiente" ? "#fef9c3" : sol.estado === "aprobada" ? "#d1fae5" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {sol.estado === "pendiente" ? "⏳" : sol.estado === "aprobada" ? "✅" : "❌"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{sol.nombre}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: sol.estado === "pendiente" ? "#fef9c3" : sol.estado === "aprobada" ? "#d1fae5" : "#fee2e2", color: sol.estado === "pendiente" ? "#854d0e" : sol.estado === "aprobada" ? "#15803d" : "#991b1b" }}>
                          {sol.estado.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{sol.email} · {sol.cargo}</div>
                      {sol.telefono && <div style={{ fontSize: 12, color: "#94a3b8" }}>{sol.telefono}</div>}
                      {sol.mensaje && <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>{sol.mensaje}</div>}
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Solicitado: {new Date(sol.creadaEn).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    {sol.estado === "pendiente" && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={async () => {
                          setProcesando(sol.id + "_aprobar")
                          const res = await fetch("/api/solicitudes-gerenciales", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: sol.id, accion: "aprobar", masterPassword })
                          })
                          const data = await res.json()
                          setProcesando(null)
                          if (data.error) { mostrarMensaje(data.error, "error"); return }
                          setUltimoCreado({ name: data.nombre, email: data.email, tempPassword: data.tempPassword, tipo: "gerencial" })
                          cargar()
                        }} disabled={procesando === sol.id + "_aprobar"}
                          style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          {procesando === sol.id + "_aprobar" ? "Aprobando..." : "✓ Aprobar"}
                        </button>
                        <button onClick={async () => {
                          if (!confirm("Rechazar esta solicitud?")) return
                          setProcesando(sol.id + "_rechazar")
                          const res = await fetch("/api/solicitudes-gerenciales", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: sol.id, accion: "rechazar", masterPassword })
                          })
                          const data = await res.json()
                          setProcesando(null)
                          if (data.error) { mostrarMensaje(data.error, "error"); return }
                          mostrarMensaje("Solicitud rechazada")
                          cargar()
                        }} disabled={procesando === sol.id + "_rechazar"}
                          style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          ✕ Rechazar
                        </button>
                      </div>
                    )}
                    {sol.estado === "rechazada" && (
                      <button onClick={async () => {
                        await fetch(`/api/solicitudes-gerenciales?id=${sol.id}`, { method: "DELETE" })
                        cargar()
                      }} title="Eliminar solicitud rechazada"
                        style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1, padding: 4 }}
                        onMouseEnter={e=>(e.currentTarget.style.color="#dc2626")}
                        onMouseLeave={e=>(e.currentTarget.style.color="#94a3b8")}>
                        ✕
                      </button>
                    )}
                    {sol.estado === "aprobada" && (
                      <div style={{ display: "flex", gap: 8, position: "absolute", top: 12, right: 12 }}>
                        <button onClick={() => setModalModificar(sol)}
                          title="Modificar permisos"
                          style={{ background: "#ede9fe", color: "#6366f1", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          ✏️ Modificar
                        </button>
                        <button onClick={() => setModalEliminarUsuario(sol)}
                          title="Eliminar usuario"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1, padding: 4 }}
                          onMouseEnter={e=>(e.currentTarget.style.color="#dc2626")}
                          onMouseLeave={e=>(e.currentTarget.style.color="#94a3b8")}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Historial */}
      {tab === "historial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Historial de accesos gerenciales</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{historial.length} registros</div>
            </div>
            <button onClick={() => setShowLimpiar(true)}
              style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              🗑 Limpiar historial
            </button>
          </div>

          {historial.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 40, textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📜</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>No hay registros en el historial</div>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 1fr 140px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em" }}>
                <div>NOMBRE</div>
                <div>EMAIL</div>
                <div>ACCION</div>
                <div>MOTIVO</div>
                <div>FECHA</div>
              </div>
              {historial.map((h: any, i: number) => (
                <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 1fr 140px", padding: "12px 16px", fontSize: 13, borderBottom: i < historial.length - 1 ? "1px solid #f1f5f9" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa", alignItems: "center" }}>
                  <div style={{ fontWeight: 500, color: "#0f172a" }}>{h.nombre}</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{h.email}</div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: h.accion === "aprobada" ? "#d1fae5" : h.accion === "eliminado" ? "#fee2e2" : "#fef9c3", color: h.accion === "aprobada" ? "#15803d" : h.accion === "eliminado" ? "#991b1b" : "#854d0e" }}>
                      {h.accion === "aprobada" ? "✅ Aprobada" : h.accion === "eliminado" ? "🗑 Eliminado" : "❌ Rechazada"}
                    </span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{h.motivo || "—"}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>{new Date(h.creadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
            </div>
          )}

          {/* Modal limpiar historial */}
          {showLimpiar && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Limpiar historial</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Esta accion eliminara todos los registros del historial permanentemente.</div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>CONTRASEÑA MASTER</label>
                  <input type="password" value={pinLimpiar} onChange={e => setPinLimpiar(e.target.value)}
                    placeholder="Contraseña master" autoComplete="off"
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const }} />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => { setShowLimpiar(false); setPinLimpiar("") }}
                    style={{ background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={async () => {
                    const res = await fetch("/api/historial-gerencial", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ masterPassword: pinLimpiar })
                    })
                    const data = await res.json()
                    if (data.error) { mostrarMensaje(data.error, "error"); return }
                    mostrarMensaje("Historial limpiado correctamente")
                    setShowLimpiar(false)
                    setPinLimpiar("")
                    cargar()
                  }} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Limpiar todo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal eliminar usuario aprobado */}
      {modalEliminarUsuario && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxWidth: "95vw" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚠️</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Eliminar usuario gerencial</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Esta accion no se puede deshacer</div>
              </div>
            </div>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#991b1b", lineHeight: 1.6 }}>
              Vas a eliminar el usuario <strong>{modalEliminarUsuario.nombre}</strong> ({modalEliminarUsuario.email}).<br/>
              Este usuario perdera acceso inmediatamente al sistema y no podra iniciar sesion.
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>MOTIVO DE LA ELIMINACION *</label>
              <textarea value={motivoEliminar} onChange={e => setMotivoEliminar(e.target.value)}
                placeholder="Explica el motivo por el que se elimina este usuario..."
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" as const, height: 80, resize: "none" as const }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>CONTRASEÑA MASTER PARA CONFIRMAR</label>
              <input type="password" value={pinEliminar} onChange={e => setPinEliminar(e.target.value)}
                placeholder="Contraseña master" autoComplete="off"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setModalEliminarUsuario(null); setPinEliminar("") }}
                style={{ background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={async () => {
                const res = await fetch("/api/solicitudes-gerenciales", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: modalEliminarUsuario.id, accion: "eliminar_usuario", masterPassword: pinEliminar, motivo: motivoEliminar })
                })
                const data = await res.json()
                if (data.error) { mostrarMensaje(data.error, "error"); return }
                mostrarMensaje("Usuario eliminado correctamente")
                setModalEliminarUsuario(null)
                setPinEliminar("")
                setMotivoEliminar("")
                cargar()
              }} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Eliminar usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo Super Admin */}
      {modalNuevo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Nuevo Super Admin</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Nombre completo", key: "name" },
                { label: "Email de acceso", key: "email", type: "email" },
                { label: "Cargo", key: "cargo" },
                { label: "Telefono", key: "telefono" },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type || "text"} value={formNuevo[f.key as keyof typeof formNuevo]}
                    onChange={e => setFormNuevo(p => ({ ...p, [f.key]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setModalNuevo(false)}
                style={{ background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={crearSuperAdmin}
                style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Crear Super Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
