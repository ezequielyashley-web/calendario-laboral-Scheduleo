"use client"

import { useState, useEffect } from "react"

const ROLES = ["SUPER_ADMIN", "ADMIN_SEDE", "EMPLEADO"]

export default function ConfiguracionPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [masterPassword, setMasterPassword] = useState("")
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [tempPassword, setTempPassword] = useState("")
  const [form, setForm] = useState({ email: "", name: "", role: "EMPLEADO" })
  const [empresa, setEmpresa] = useState({ nombre: "", logo: "", colorSidebar: "#2d2b55", colorAccent: "#6366f1" })
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false)
  const [seccion, setSeccion] = useState("empresa")

  const cargar = async () => {
    setLoading(true)
    const [u, e] = await Promise.all([
      fetch("/api/usuarios").then(r => r.json()),
      fetch("/api/empresa").then(r => r.json()),
    ])
    setUsuarios(u)
    setEmpresa({ nombre: e.nombre || "", logo: e.logo || "", colorSidebar: e.colorSidebar || "#2d2b55", colorAccent: e.colorAccent || "#6366f1" })
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000)
  }

  const guardarEmpresa = async () => {
    setGuardandoEmpresa(true)
    const res = await fetch("/api/empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empresa)
    })
    const data = await res.json()
    setGuardandoEmpresa(false)
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Configuración de empresa guardada")
    window.location.reload()
  }

  const abrirModal = (tipo, usuario = null) => {
    setModal({ tipo, usuario })
    setMasterPassword("")
    setTempPassword("")
    setForm(usuario ? { email: usuario.email, name: usuario.name || "", role: usuario.role } : { email: "", name: "", role: "EMPLEADO" })
  }

  const cerrarModal = () => { setModal(null); setMasterPassword(""); setTempPassword("") }

  const crearUsuario = async () => {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, masterPassword, empresaId: "empresa-001" })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    setTempPassword(data.tempPassword)
    cargar()
  }

  const editarUsuario = async () => {
    const res = await fetch(`/api/usuarios/${modal.usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "editar", masterPassword, ...form })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Usuario actualizado correctamente")
    cargar()
    cerrarModal()
  }

  const accionUsuario = async (action, usuario) => {
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, masterPassword })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    if (data.tempPassword) { setTempPassword(data.tempPassword); return }
    mostrarMensaje(data.message)
    cargar()
    cerrarModal()
  }

  const borrarUsuario = async () => {
    const res = await fetch(`/api/usuarios/${modal.usuario.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Usuario eliminado")
    cargar()
    cerrarModal()
  }

  const getRolColor = (role) => {
    if (role === "SUPER_ADMIN") return { bg: "#fef3c7", color: "#92400e" }
    if (role === "ADMIN_SEDE") return { bg: "#dbeafe", color: "#1e40af" }
    if (role === "PAUSADO") return { bg: "#fee2e2", color: "#991b1b" }
    return { bg: "#d1fae5", color: "#065f46" }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Configuración</h1>

      {mensaje.texto && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", borderRadius: 8, fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46" }}>
          {mensaje.texto}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e8eaf0" }}>
        {[
          { key: "empresa", label: "Empresa" },
          { key: "usuarios", label: "Gestión de usuarios" },
        ].map(t => (
          <button key={t.key} onClick={() => setSeccion(t.key)}
            style={{ padding: "10px 20px", border: "none", background: "none", fontSize: 13, fontWeight: seccion === t.key ? 600 : 400, color: seccion === t.key ? "#6366f1" : "#718096", borderBottom: seccion === t.key ? "2px solid #6366f1" : "2px solid transparent", marginBottom: -2, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Seccion empresa */}
      {seccion === "empresa" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Datos de la empresa</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Nombre de la empresa</label>
              <input value={empresa.nombre} onChange={e => setEmpresa(p => ({ ...p, nombre: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", color: "#1e1b4b" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>URL del logo</label>
              <input value={empresa.logo} onChange={e => setEmpresa(p => ({ ...p, logo: e.target.value }))}
                placeholder="https://..."
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", color: "#1e1b4b" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Color barra lateral</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={empresa.colorSidebar} onChange={e => setEmpresa(p => ({ ...p, colorSidebar: e.target.value }))}
                  style={{ width: 44, height: 36, padding: 2, border: "1px solid #e8eaf0", borderRadius: 8, cursor: "pointer" }} />
                <input value={empresa.colorSidebar} onChange={e => setEmpresa(p => ({ ...p, colorSidebar: e.target.value }))}
                  style={{ flex: 1, padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", color: "#1e1b4b" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Color de acento</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={empresa.colorAccent} onChange={e => setEmpresa(p => ({ ...p, colorAccent: e.target.value }))}
                  style={{ width: 44, height: 36, padding: 2, border: "1px solid #e8eaf0", borderRadius: 8, cursor: "pointer" }} />
                <input value={empresa.colorAccent} onChange={e => setEmpresa(p => ({ ...p, colorAccent: e.target.value }))}
                  style={{ flex: 1, padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", color: "#1e1b4b" }} />
              </div>
            </div>
          </div>

          {/* Preview sidebar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 8 }}>Vista previa barra lateral</div>
            <div style={{ width: 180, background: empresa.colorSidebar, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                {empresa.logo ? (
                  <img src={empresa.logo} alt="logo" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: 4, background: empresa.colorAccent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                    {empresa.nombre[0]?.toUpperCase() || "E"}
                  </div>
                )}
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{empresa.nombre || "Empresa"}</span>
              </div>
              {["Dashboard", "Empleados", "Calendario"].map(item => (
                <div key={item} style={{ padding: "6px 8px", borderRadius: 6, color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 2 }}>{item}</div>
              ))}
              <div style={{ padding: "6px 8px", borderRadius: 6, background: empresa.colorAccent, color: "#fff", fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Deudas</div>
            </div>
          </div>

          <button onClick={guardarEmpresa} disabled={guardandoEmpresa}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            {guardandoEmpresa ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}

      {/* Seccion usuarios */}
      {seccion === "usuarios" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#a0aec0", margin: 0 }}>Solo accesible para SUPER_ADMIN</p>
            <button onClick={() => abrirModal("crear")} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              + Nuevo usuario
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#a0aec0" }}>Cargando...</div>
          ) : (
            <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9ff" }}>
                    {["Nombre", "Email", "Rol", "Creado", "Acciones"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u, i) => {
                    const rolStyle = getRolColor(u.role)
                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                        <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500 }}>{u.name || "—"}</td>
                        <td style={{ padding: "10px 16px", fontSize: 14, color: "#4b5563" }}>{u.email}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ background: rolStyle.bg, color: rolStyle.color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{u.role}</span>
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString("es-ES")}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => abrirModal("editar", u)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Editar</button>
                            <button onClick={() => abrirModal("reset", u)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Reset</button>
                            <button onClick={() => abrirModal(u.role === "PAUSADO" ? "reactivar" : "pausar", u)} style={{ background: u.role === "PAUSADO" ? "#059669" : "#d97706", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                              {u.role === "PAUSADO" ? "Activar" : "Pausar"}
                            </button>
                            <button onClick={() => abrirModal("borrar", u)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Borrar</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: "#1e1b4b" }}>
              {modal.tipo === "crear" && "Crear nuevo usuario"}
              {modal.tipo === "editar" && `Editar: ${modal.usuario.email}`}
              {modal.tipo === "borrar" && `Borrar: ${modal.usuario.email}`}
              {modal.tipo === "pausar" && `Pausar: ${modal.usuario.email}`}
              {modal.tipo === "reactivar" && `Activar: ${modal.usuario.email}`}
              {modal.tipo === "reset" && `Reset contraseña: ${modal.usuario.email}`}
            </h2>

            {(modal.tipo === "crear" || modal.tipo === "editar") && (
              <div style={{ marginBottom: 16 }}>
                {[{ label: "Nombre", key: "name", type: "text" }, { label: "Email", key: "email", type: "email" }].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Rol</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14 }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            )}

            {tempPassword ? (
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>⚠️ Contraseña temporal (solo visible ahora):</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "monospace", letterSpacing: 2 }}>{tempPassword}</p>
                <p style={{ fontSize: 12, color: "#92400e", marginTop: 8 }}>Cópiala y envíasela al usuario. No se volverá a mostrar.</p>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Contraseña SUPER_ADMIN para confirmar</label>
                <input type="password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)}
                  placeholder="Tu contraseña master"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={cerrarModal} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>
                {tempPassword ? "Cerrar" : "Cancelar"}
              </button>
              {!tempPassword && (
                <button
                  onClick={() => {
                    if (modal.tipo === "crear") crearUsuario()
                    else if (modal.tipo === "editar") editarUsuario()
                    else if (modal.tipo === "borrar") borrarUsuario()
                    else accionUsuario(modal.tipo, modal.usuario)
                  }}
                  style={{ background: modal.tipo === "borrar" ? "#dc2626" : "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}