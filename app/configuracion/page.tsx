"use client"
import { useState, useEffect } from "react"

const ROLES = ["SUPER_ADMIN", "ADMIN_SEDE", "EMPLEADO"]

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [masterPassword, setMasterPassword] = useState("")
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [tempPassword, setTempPassword] = useState("")
  const [form, setForm] = useState({ email: "", name: "", role: "EMPLEADO" })

  const cargar = async () => {
    setLoading(true)
    const res = await fetch("/api/usuarios")
    const data = await res.json()
    setUsuarios(data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000)
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
    <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0284c7", margin: 0 }}>Gestión de Usuarios</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Solo accesible para SUPER_ADMIN</p>
        </div>
        <button onClick={() => abrirModal("crear")} style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 4, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          + Nuevo usuario
        </button>
      </div>

      {mensaje.texto && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", border: `1px solid ${mensaje.tipo === "error" ? "#fca5a5" : "#6ee7b7"}`, borderRadius: 4, fontSize: 14, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46" }}>
          {mensaje.texto}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>Cargando...</div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #b8c4d8", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Nombre", "Email", "Rol", "Creado", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => {
                const rolStyle = getRolColor(u.role)
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>{u.name || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#4b5563" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ ...rolStyle, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString("es-ES")}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => abrirModal("editar", u)} style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Editar</button>
                        <button onClick={() => abrirModal("reset", u)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Reset</button>
                        <button onClick={() => abrirModal(u.role === "PAUSADO" ? "reactivar" : "pausar", u)} style={{ background: u.role === "PAUSADO" ? "#059669" : "#d97706", color: "#fff", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                          {u.role === "PAUSADO" ? "Activar" : "Pausar"}
                        </button>
                        <button onClick={() => abrirModal("borrar", u)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Borrar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 460, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#111827" }}>
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
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Rol</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14 }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            )}

            {tempPassword ? (
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>⚠️ Contraseña temporal (solo visible ahora):</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "monospace", letterSpacing: 2 }}>{tempPassword}</p>
                <p style={{ fontSize: 12, color: "#92400e", marginTop: 8 }}>Cópiala y envíasela al usuario. No se volverá a mostrar.</p>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Contraseña SUPER_ADMIN para confirmar</label>
                <input type="password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)}
                  placeholder="Tu contraseña master"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={cerrarModal} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>
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
                  style={{ background: modal.tipo === "borrar" ? "#dc2626" : "#0369a1", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
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