"use client"

import { useState, useEffect } from "react"

const ROLES = ["SUPER_ADMIN", "ADMIN_SEDE", "EMPLEADO"]

const SECCIONES = [
  { key: "identidad", label: "Identidad legal" },
  { key: "contacto", label: "Contacto" },
  { key: "laboral", label: "Datos laborales" },
  { key: "apariencia", label: "Apariencia" },
  { key: "licencia", label: "Licencia" },
  { key: "usuarios", label: "Usuarios" },
]

export default function ConfiguracionPage() {
  const [acceso, setAcceso] = useState(false)
  const [pinAcceso, setPinAcceso] = useState("")
  const [errorAcceso, setErrorAcceso] = useState("")
  const [verificando, setVerificando] = useState(false)
  const [seccion, setSeccion] = useState("identidad")
  const [empresa, setEmpresa] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [masterPassword, setMasterPassword] = useState("")
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal] = useState<any>(null)
  const [tempPassword, setTempPassword] = useState("")
  const [form, setForm] = useState({ email: "", name: "", role: "EMPLEADO" })
  const [modalPin, setModalPin] = useState("")

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000)
  }

  const verificarAcceso = async () => {
    setVerificando(true)
    setErrorAcceso("")
    const res = await fetch("/api/empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword: pinAcceso, _test: true })
    })
    const data = await res.json()
    setVerificando(false)
    if (data.error && data.error === "Contraseña incorrecta") {
      setErrorAcceso("Contraseña incorrecta")
      return
    }
    setAcceso(true)
    setMasterPassword(pinAcceso)
    cargar()
  }

  const cargar = async () => {
    setLoading(true)
    const [e, u] = await Promise.all([
      fetch("/api/empresa").then(r => r.json()),
      fetch("/api/usuarios").then(r => r.json()),
    ])
    setEmpresa(e || {})
    setUsuarios(Array.isArray(u) ? u : [])
    setLoading(false)
  }

  const guardar = async () => {
    setGuardando(true)
    const res = await fetch("/api/empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...empresa, masterPassword })
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Configuración guardada correctamente")
    setTimeout(() => window.location.reload(), 1500)
  }

  const set = (key, val) => setEmpresa(p => ({ ...p, [key]: val }))

  const abrirModal = (tipo, usuario = null) => {
    setModal({ tipo, usuario })
    setModalPin("")
    setTempPassword("")
    setForm(usuario ? { email: usuario.email, name: usuario.name || "", role: usuario.role } : { email: "", name: "", role: "EMPLEADO" })
  }

  const cerrarModal = () => { setModal(null); setModalPin(""); setTempPassword("") }

  const crearUsuario = async () => {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, masterPassword: modalPin, empresaId: "empresa-001" })
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
      body: JSON.stringify({ action: "editar", masterPassword: modalPin, ...form })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Usuario actualizado")
    cargar(); cerrarModal()
  }

  const accionUsuario = async (action, usuario) => {
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, masterPassword: modalPin })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    if (data.tempPassword) { setTempPassword(data.tempPassword); return }
    mostrarMensaje(data.message)
    cargar(); cerrarModal()
  }

  const borrarUsuario = async () => {
    const res = await fetch(`/api/usuarios/${modal.usuario.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword: modalPin })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Usuario eliminado")
    cargar(); cerrarModal()
  }

  const getRolColor = (role) => {
    if (role === "SUPER_ADMIN") return { background: "#fef3c7", color: "#92400e" }
    if (role === "ADMIN_SEDE") return { background: "#dbeafe", color: "#1e40af" }
    if (role === "PAUSADO") return { background: "#fee2e2", color: "#991b1b" }
    return { background: "#d1fae5", color: "#065f46" }
  }

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const, color: "#1e1b4b", outline: "none" }
  const labelStyle = { display: "block" as const, fontSize: 12, color: "#a0aec0", marginBottom: 4, fontWeight: 500 as const }

  if (!acceso) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 20, padding: 40, width: 380, textAlign: "center", boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>
            🔒
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1e1b4b", margin: "0 0 6px" }}>Acceso restringido</h2>
          <p style={{ fontSize: 13, color: "#a0aec0", margin: "0 0 24px" }}>Esta sección requiere contraseña SUPER_ADMIN</p>
          <input
            type="password"
            value={pinAcceso}
            onChange={e => setPinAcceso(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verificarAcceso()}
            placeholder="Contraseña master"
            style={{ ...inputStyle, marginBottom: 12, textAlign: "center", fontSize: 16, letterSpacing: 4 }}
          />
          {errorAcceso && (
            <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{errorAcceso}</div>
          )}
          <button onClick={verificarAcceso} disabled={verificando || !pinAcceso}
            style={{ width: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: !pinAcceso ? 0.6 : 1 }}>
            {verificando ? "Verificando..." : "Acceder"}
          </button>
        </div>
      </div>
    )
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando configuración...</div>

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Configuración del sistema</h1>
          <p style={{ fontSize: 13, color: "#a0aec0", margin: "4px 0 0" }}>Gestión completa de la empresa y accesos</p>
        </div>
        {seccion !== "usuarios" && (
          <button onClick={guardar} disabled={guardando}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </div>

      {mensaje.texto && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", borderRadius: 8, fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46" }}>
          {mensaje.texto}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>

        {/* Sidebar navegacion */}
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 12, height: "fit-content" }}>
          {SECCIONES.map(s => (
            <button key={s.key} onClick={() => setSeccion(s.key)}
              style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: seccion === s.key ? 600 : 400, color: seccion === s.key ? "#6366f1" : "#718096", background: seccion === s.key ? "#ede9fe" : "transparent", cursor: "pointer", marginBottom: 2 }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 28 }}>

          {seccion === "identidad" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Identidad legal</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Razón social", key: "razonSocial" },
                  { label: "Nombre comercial", key: "nombreComercial" },
                  { label: "Nombre en app", key: "nombre" },
                  { label: "CIF / NIF", key: "cif" },
                  { label: "Actividad económica", key: "actividadEconomica" },
                  { label: "Código CNAE", key: "cnae" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={empresa[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {seccion === "contacto" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Datos de contacto</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Dirección", key: "direccion" },
                  { label: "Código postal", key: "codigoPostal" },
                  { label: "Ciudad", key: "ciudad" },
                  { label: "Provincia", key: "provincia" },
                  { label: "País", key: "pais" },
                  { label: "Teléfono", key: "telefono" },
                  { label: "Email principal", key: "email" },
                  { label: "Email facturación", key: "emailFacturacion" },
                  { label: "Sitio web", key: "web" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={empresa[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {seccion === "laboral" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Datos laborales y fiscales</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Nº Seguridad Social empresa", key: "seguridadSocial" },
                  { label: "Mutua de accidentes", key: "mutua" },
                  { label: "Convenio colectivo", key: "convenioColectivo" },
                  { label: "Cuenta bancaria (IBAN)", key: "cuentaBancaria" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={empresa[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {seccion === "apariencia" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Apariencia de la aplicación</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>URL del logo</label>
                  <input value={empresa.logo || ""} onChange={e => set("logo", e.target.value)}
                    placeholder="https://..." style={inputStyle} />
                  {empresa.logo && (
                    <img src={empresa.logo} alt="logo" style={{ marginTop: 8, height: 48, borderRadius: 8, border: "1px solid #e8eaf0" }} />
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Color barra lateral</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={empresa.colorSidebar || "#2d2b55"} onChange={e => set("colorSidebar", e.target.value)}
                      style={{ width: 44, height: 36, padding: 2, border: "1px solid #e8eaf0", borderRadius: 8, cursor: "pointer" }} />
                    <input value={empresa.colorSidebar || "#2d2b55"} onChange={e => set("colorSidebar", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Color de acento</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={empresa.colorAccent || "#6366f1"} onChange={e => set("colorAccent", e.target.value)}
                      style={{ width: 44, height: 36, padding: 2, border: "1px solid #e8eaf0", borderRadius: 8, cursor: "pointer" }} />
                    <input value={empresa.colorAccent || "#6366f1"} onChange={e => set("colorAccent", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 10, fontWeight: 500 }}>Vista previa</div>
              <div style={{ width: 200, background: empresa.colorSidebar || "#2d2b55", borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  {empresa.logo ? (
                    <img src={empresa.logo} alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: empresa.colorAccent || "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      {(empresa.nombreComercial || empresa.nombre || "E")[0]?.toUpperCase()}
                    </div>
                  )}
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{empresa.nombreComercial || empresa.nombre || "Empresa"}</span>
                </div>
                {["Dashboard", "Empleados", "Deudas"].map((item, i) => (
                  <div key={item} style={{ padding: "7px 10px", borderRadius: 7, color: i === 2 ? "#fff" : "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 3, background: i === 2 ? (empresa.colorAccent || "#6366f1") : "transparent", fontWeight: i === 2 ? 500 : 400 }}>{item}</div>
                ))}
              </div>
            </div>
          )}

          {seccion === "licencia" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Información de licencia</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Estado licencia", valor: empresa.licenciaActiva ? "Activa" : "Inactiva", color: empresa.licenciaActiva ? "#059669" : "#dc2626", bg: empresa.licenciaActiva ? "#d1fae5" : "#fee2e2" },
                  { label: "Expira el", valor: empresa.licenciaExpira ? new Date(empresa.licenciaExpira).toLocaleDateString("es-ES") : "Sin fecha", color: "#6366f1", bg: "#ede9fe" },
                  { label: "Máx. empleados", valor: empresa.maxEmpleados || 100, color: "#0284c7", bg: "#dbeafe" },
                ].map(k => (
                  <div key={k.label} style={{ background: k.bg, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: k.color, fontWeight: 500, marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: k.color }}>{k.valor}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f8f9ff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, color: "#718096", lineHeight: 1.8 }}>
                  <div><strong>ID de empresa:</strong> {empresa.id}</div>
                  <div><strong>Registrada el:</strong> {empresa.createdAt ? new Date(empresa.createdAt).toLocaleDateString("es-ES") : "—"}</div>
                  <div><strong>Última actualización:</strong> {empresa.updatedAt ? new Date(empresa.updatedAt).toLocaleDateString("es-ES") : "—"}</div>
                </div>
              </div>
            </div>
          )}

          {seccion === "usuarios" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Gestión de usuarios</h2>
                <button onClick={() => abrirModal("crear")} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  + Nuevo usuario
                </button>
              </div>
              <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9ff" }}>
                      {["Nombre", "Email", "Rol", "Creado", "Acciones"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u: any, i) => {
                      const rolStyle = getRolColor(u.role)
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                          <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "#1e1b4b" }}>{u.name || "—"}</td>
                          <td style={{ padding: "10px 16px", fontSize: 13, color: "#718096" }}>{u.email}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ ...rolStyle, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{u.role}</span>
                          </td>
                          <td style={{ padding: "10px 16px", fontSize: 12, color: "#a0aec0" }}>{new Date(u.createdAt).toLocaleDateString("es-ES")}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => abrirModal("editar", u)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Editar</button>
                              <button onClick={() => abrirModal("reset", u)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Reset</button>
                              <button onClick={() => abrirModal(u.role === "PAUSADO" ? "reactivar" : "pausar", u)} style={{ background: u.role === "PAUSADO" ? "#059669" : "#d97706", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>
                                {u.role === "PAUSADO" ? "Activar" : "Pausar"}
                              </button>
                              <button onClick={() => abrirModal("borrar", u)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Borrar</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

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
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Rol</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            )}

            {tempPassword ? (
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>⚠️ Contraseña temporal — cópiala ahora:</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#111827", fontFamily: "monospace", letterSpacing: 3, textAlign: "center", margin: "8px 0" }}>{tempPassword}</p>
                <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>No se volverá a mostrar.</p>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Contraseña SUPER_ADMIN para confirmar</label>
                <input type="password" value={modalPin} onChange={e => setModalPin(e.target.value)}
                  placeholder="Contraseña master"
                  style={{ ...inputStyle }} />
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