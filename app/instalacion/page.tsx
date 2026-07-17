"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const violeta = "#673DE6"
const gris = "#6B7280"
const grisClaro = "#E5E7EB"

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: `1px solid ${grisClaro}`, borderRadius: 8, fontSize: 14,
  boxSizing: "border-box" as const, marginBottom: 14, outline: "none"
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const
}

export default function InstalacionPage() {
  const router = useRouter()
  const [verificando, setVerificando] = useState(true)
  const [disponible, setDisponible] = useState(false)

  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [claveInstalacion, setClaveInstalacion] = useState("")

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState(false)

  useEffect(() => {
    fetch("/api/instalacion").then(r => r.json()).then(data => {
      setDisponible(!!data.disponible)
      setVerificando(false)
    }).catch(() => setVerificando(false))
  }, [])

  const enviar = async () => {
    setError("")
    if (!nombre.trim() || !apellidos.trim() || !email.trim() || !password || !claveInstalacion.trim()) {
      setError("Todos los campos son obligatorios"); return
    }
    if (password.length < 8) { setError("La contrasena debe tener al menos 8 caracteres"); return }
    if (password !== confirmarPassword) { setError("Las contrasenas no coinciden"); return }

    setEnviando(true)
    const res = await fetch("/api/instalacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellidos, email, password, claveInstalacion })
    })
    const data = await res.json()
    setEnviando(false)
    if (data.error) { setError(data.error); return }
    setExito(true)
    setTimeout(() => router.push("/login"), 2000)
  }

  if (verificando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ fontSize: 14, color: gris }}>Verificando instalacion...</div>
      </div>
    )
  }

  if (!disponible) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>La instalacion ya se completo</div>
          <div style={{ fontSize: 13, color: gris, marginBottom: 20 }}>Ya existe un Super Admin en este sistema. Ve a la pantalla de inicio de sesion.</div>
          <a href="/login" style={{ display: "inline-block", background: violeta, color: "#fff", textDecoration: "none", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Ir al login</a>
        </div>
      </div>
    )
  }

  if (exito) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Cuenta creada correctamente</div>
          <div style={{ fontSize: 13, color: gris }}>Redirigiendo al inicio de sesion...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 14, background: violeta, marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>S</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Configura tu Super Admin</div>
          <div style={{ fontSize: 12.5, color: gris, marginTop: 4 }}>Esta pantalla solo funciona una vez, para crear la primera cuenta del sistema.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} placeholder="Ej: Ezequiel" />
          </div>
          <div>
            <label style={labelStyle}>Apellidos</label>
            <input value={apellidos} onChange={e => setApellidos(e.target.value)} style={inputStyle} placeholder="Ej: Yashley" />
          </div>
        </div>

        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="tu@email.com" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Contrasena</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="Minimo 8 caracteres" />
          </div>
          <div>
            <label style={labelStyle}>Confirmar</label>
            <input type="password" value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)} style={inputStyle} placeholder="Repite la contrasena" />
          </div>
        </div>

        <label style={labelStyle}>Clave de instalacion</label>
        <input type="password" value={claveInstalacion} onChange={e => setClaveInstalacion(e.target.value)} style={inputStyle} placeholder="La clave SETUP_SECRET del servidor" />

        {error && <div style={{ color: "#DC2626", fontSize: 12.5, marginBottom: 14 }}>{error}</div>}

        <button
          onClick={enviar}
          disabled={enviando}
          style={{ width: "100%", height: 44, background: violeta, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: enviando ? "not-allowed" : "pointer", opacity: enviando ? 0.6 : 1 }}>
          {enviando ? "Creando cuenta..." : "Crear cuenta Super Admin"}
        </button>
      </div>
    </div>
  )
}