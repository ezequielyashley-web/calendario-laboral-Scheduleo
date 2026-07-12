"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

const violeta = "#673DE6"
const gris = "#6B7280"

export default function AceptarInvitacionPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [cargando, setCargando] = useState(true)
  const [invitacionValida, setInvitacionValida] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const [nombre, setNombre] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [completado, setCompletado] = useState(false)

  useEffect(() => {
    fetch(`/api/invitaciones/${token}`).then(r => r.json()).then(d => {
      if (d.error) { setError(d.error); setCargando(false); return }
      setEmail(d.email)
      setInvitacionValida(true)
      setCargando(false)
    }).catch(() => { setError("Error al verificar la invitacion"); setCargando(false) })
  }, [token])

  const enviar = async () => {
    setError("")
    if (!nombre.trim()) { setError("Introduce tu nombre"); return }
    if (password.length < 8) { setError("La contrasena debe tener al menos 8 caracteres"); return }
    if (password !== password2) { setError("Las contrasenas no coinciden"); return }

    setEnviando(true)
    const res = await fetch(`/api/invitaciones/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, password })
    })
    const data = await res.json()
    setEnviando(false)
    if (data.error) { setError(data.error); return }
    setCompletado(true)
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 420,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
  }
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14,
    boxSizing: "border-box" as const, marginBottom: 14, outline: "none"
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#673DE6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>S</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Scheduleo</div>
        </div>

        {cargando ? (
          <div style={{ textAlign: "center", color: gris, fontSize: 13 }}>Verificando invitacion...</div>
        ) : completado ? (
          <div style={{ textAlign: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" style={{ marginBottom: 12 }}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Solicitud enviada</div>
            <div style={{ fontSize: 13, color: gris, lineHeight: 1.5 }}>
              Tu cuenta esta pendiente de aprobacion. Te avisaremos por email en cuanto un administrador la confirme.
            </div>
          </div>
        ) : !invitacionValida ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Invitacion no valida</div>
            <div style={{ fontSize: 13, color: gris }}>{error}</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4, textAlign: "center" }}>Crea tu cuenta</div>
            <div style={{ fontSize: 12.5, color: gris, marginBottom: 20, textAlign: "center" }}>{email}</div>

            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} placeholder="Tu nombre" />

            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Contrasena</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="Minimo 8 caracteres" />

            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Confirmar contrasena</label>
            <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} style={inputStyle} placeholder="Repite la contrasena" />

            {error && <div style={{ color: "#DC2626", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

            <button
              onClick={enviar}
              disabled={enviando}
              style={{ width: "100%", background: violeta, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: enviando ? 0.6 : 1 }}>
              {enviando ? "Enviando..." : "Crear cuenta"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}