"use client"
import { useState, useEffect } from "react"

export default function ConfiguracionPage() {
  const [form, setForm] = useState({
    imap_host: "",
    imap_port: 993,
    imap_tls: true,
    imap_user: "",
    imap_pass: "",
    imap_folder: "INBOX",
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    fetch("/api/configuracion")
      .then(r => r.json())
      .then(data => setForm(prev => ({ ...prev, ...data })))
  }, [])

  const guardar = async () => {
    setGuardando(true)
    setMensaje("")
    try {
      const res = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) setMensaje("✅ Configuración guardada correctamente")
      else setMensaje("❌ Error al guardar")
    } catch {
      setMensaje("❌ Error de conexión")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#0284c7" }}>
        Configuración del sistema
      </h1>

      <div style={{ background: "#fff", border: "1px solid #b8c4d8", borderRadius: 6, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Correo IMAP — Bajas médicas
        </h2>

        {[
          { label: "Servidor IMAP", key: "imap_host", type: "text", placeholder: "mail.empresa.com" },
          { label: "Puerto", key: "imap_port", type: "number", placeholder: "993" },
          { label: "Usuario (email)", key: "imap_user", type: "email", placeholder: "bajas@empresa.com" },
          { label: "Contraseña", key: "imap_pass", type: "password", placeholder: "••••••••" },
          { label: "Carpeta", key: "imap_folder", type: "text", placeholder: "INBOX" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
              {label}
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={(form as any)[key]}
              onChange={e => setForm(prev => ({ ...prev, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
              style={{
                width: "100%", padding: "8px 12px", border: "1px solid #b8c4d8",
                borderRadius: 4, fontSize: 14, outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            id="tls"
            checked={form.imap_tls}
            onChange={e => setForm(prev => ({ ...prev, imap_tls: e.target.checked }))}
          />
          <label htmlFor="tls" style={{ fontSize: 13, color: "#374151" }}>Usar TLS/SSL</label>
        </div>

        <button
          onClick={guardar}
          disabled={guardando}
          style={{
            background: "#0369a1", color: "#fff", border: "none",
            borderRadius: 4, padding: "10px 24px", fontSize: 14,
            fontWeight: 600, cursor: "pointer", width: "100%"
          }}
        >
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>

        {mensaje && (
          <p style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>{mensaje}</p>
        )}
      </div>
    </div>
  )
}
