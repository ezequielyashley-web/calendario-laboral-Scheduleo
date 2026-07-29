"use client"
import { useState } from "react"
import Link from "next/link"

export default function SolicitarAccesoPage() {
  const [aceptado, setAceptado] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({ nombre: "", email: "", empresa: "", motivo: "" })

  const enviar = async (e: any) => {
    e.preventDefault()
    setError("")
    if (!form.nombre.trim() || !form.email.trim()) { setError("Nombre y email son obligatorios"); return }
    setEnviando(true)
    const res = await fetch("/api/solicitar-acceso", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setEnviando(false)
    if (data.error) { setError(data.error); return }
    setEnviado(true)
  }

  const inputStyle: React.CSSProperties = { width: "100%", height: 44, padding: "0 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, color: "#0F172A", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 14 }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, border: "1px solid #E2E4E9", padding: "36px 32px", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}>

        {!aceptado && !enviado && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Solicitar acceso a Scheduleo</h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>Antes de continuar, lee esta nota</p>

            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "16px 18px", marginBottom: 20, fontSize: 13, color: "#78350F", lineHeight: 1.7 }}>
              <strong>Esto es una funcion en fase de prueba.</strong> Por ahora, el formulario de "Solicitar acceso" registra tu peticion en nuestro sistema, pero no crea una cuenta de forma automatica ni inmediata. Un administrador revisara tu solicitud manualmente y, si procede, te enviara una invitacion por email para completar el registro.
              <br /><br />
              Los datos que introduzcas (nombre, email, empresa y motivo) se guardan unicamente para gestionar esta solicitud. No se usan con ningun otro fin, no se comparten con terceros, y puedes pedir que se eliminen en cualquier momento escribiendo al administrador de tu organizacion.
              <br /><br />
              Al continuar, confirmas que los datos que vas a introducir son tuyos y correctos, y aceptas que se utilicen exclusivamente para valorar tu solicitud de acceso.
            </div>

            <button onClick={() => setAceptado(true)} style={{ width: "100%", height: 46, background: "linear-gradient(135deg,#3b82f6,#1e40af)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
              Entendido, continuar
            </button>
            <Link href="/login" style={{ display: "block", textAlign: "center", fontSize: 13, color: "#64748B", textDecoration: "none" }}>Volver al inicio de sesion</Link>
          </div>
        )}

        {aceptado && !enviado && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Solicitar acceso</h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>Rellena tus datos y te contactaremos</p>

            <form onSubmit={enviar}>
              {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#B91C1C" }}>{error}</div>}

              <label style={{ fontSize: 12, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Nombre completo *</label>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} placeholder="Tu nombre" />

              <label style={{ fontSize: 12, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Correo electronico *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} placeholder="tu@empresa.com" />

              <label style={{ fontSize: 12, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Empresa</label>
              <input value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} style={inputStyle} placeholder="Nombre de tu empresa" />

              <label style={{ fontSize: 12, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Motivo de la solicitud</label>
              <textarea value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))} rows={3} style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" as const }} placeholder="Cuentanos brevemente por que necesitas acceso" />

              <button type="submit" disabled={enviando} style={{ width: "100%", height: 46, background: "linear-gradient(135deg,#3b82f6,#1e40af)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: enviando ? "default" : "pointer", opacity: enviando ? 0.7 : 1, marginTop: 6 }}>
                {enviando ? "Enviando..." : "Enviar solicitud"}
              </button>
            </form>
          </div>
        )}

        {enviado && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F63F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>Solicitud enviada</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>Un administrador la revisara y, si procede, recibiras un email con los siguientes pasos.</p>
            <Link href="/login" style={{ display: "inline-block", fontSize: 13, color: "#2F63F4", textDecoration: "none", fontWeight: 600 }}>Volver al inicio de sesion</Link>
          </div>
        )}

      </div>
    </div>
  )
}