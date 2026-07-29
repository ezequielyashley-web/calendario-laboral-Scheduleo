"use client"
import { useState } from "react"
import Link from "next/link"

export default function SolicitarAccesoPage() {
  const [aceptaTratamiento, setAceptaTratamiento] = useState(false)
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
      body: JSON.stringify({ ...form, aceptaTratamiento: true })
    })
    const data = await res.json()
    setEnviando(false)
    if (data.error) { setError(data.error); return }
    setEnviado(true)
  }

  const inputStyle: React.CSSProperties = { width: "100%", height: 44, padding: "0 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, color: "#0F172A", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 14 }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 20, border: "1px solid #E2E4E9", padding: "36px 32px", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}>

        {!aceptado && !enviado && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>Solicitar acceso a Scheduleo</h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>Antes de continuar, lee esta informacion sobre el tratamiento de tus datos</p>

            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 16px", marginBottom: 16, fontSize: 12.5, color: "#78350F", lineHeight: 1.6 }}>
              <strong>Esta funcion esta en fase de prueba.</strong> El formulario registra tu peticion, pero no crea una cuenta de forma automatica: un administrador la revisara manualmente y, si procede, recibiras una invitacion por email.
            </div>

            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 18px", marginBottom: 20, fontSize: 12.5, color: "#334155", lineHeight: 1.7, maxHeight: 260, overflowY: "auto" }}>
              <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Informacion sobre proteccion de datos (RGPD)</div>

              <p style={{ margin: "0 0 8px" }}><strong>Responsable del tratamiento:</strong> la empresa titular de esta instancia de Scheduleo, como responsable de sus propios datos laborales, con Scheduleo como plataforma tecnologica que presta el servicio.</p>

              <p style={{ margin: "0 0 8px" }}><strong>Finalidad:</strong> gestionar tu solicitud de acceso a Scheduleo, contactarte sobre su resolucion y, en caso de ser aprobada, generar la invitacion para crear tu cuenta de usuario.</p>

              <p style={{ margin: "0 0 8px" }}><strong>Base legal (art. 6 RGPD):</strong> el consentimiento que otorgas al enviar este formulario (art. 6.1.a) y la necesidad de aplicar, a peticion tuya, las medidas previas a un posible acceso al sistema (art. 6.1.b).</p>

              <p style={{ margin: "0 0 8px" }}><strong>Datos tratados:</strong> nombre, correo electronico, empresa y el motivo que indiques, unicamente los que aportas en este formulario.</p>

              <p style={{ margin: "0 0 8px" }}><strong>Conservacion:</strong> mientras se resuelve la solicitud y durante un plazo razonable posterior para justificar la decision tomada, o hasta que solicites su eliminacion.</p>

              <p style={{ margin: "0 0 8px" }}><strong>Destinatarios:</strong> no se ceden datos a terceros. Se almacenan en la infraestructura tecnica que usa Scheduleo para operar (base de datos y correo transaccional).</p>

              <p style={{ margin: "0 0 8px" }}><strong>Tus derechos:</strong> puedes acceder, rectificar, suprimir, oponerte, limitar el tratamiento o pedir la portabilidad de tus datos (arts. 15 a 22 RGPD), asi como retirar este consentimiento en cualquier momento, escribiendo al administrador de la empresa que gestiona esta instancia de Scheduleo.</p>

              <p style={{ margin: 0 }}>Al marcar la casilla inferior y enviar el formulario, confirmas que los datos son tuyos y correctos, y aceptas expresamente este tratamiento con la finalidad descrita.</p>
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#334155", marginBottom: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={aceptaTratamiento} onChange={e => setAceptaTratamiento(e.target.checked)} style={{ marginTop: 3 }} />
              He leido la informacion anterior y acepto el tratamiento de mis datos por Scheduleo con la finalidad descrita.
            </label>

            <button onClick={() => setAceptado(true)} disabled={!aceptaTratamiento} style={{ width: "100%", height: 46, background: "linear-gradient(135deg,#3b82f6,#1e40af)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: aceptaTratamiento ? "pointer" : "default", opacity: aceptaTratamiento ? 1 : 0.5, marginBottom: 12 }}>
              Continuar
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