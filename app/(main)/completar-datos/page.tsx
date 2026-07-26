"use client"
import { useState, useEffect } from "react"

const violeta = "#673DE6"
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13,
  boxSizing: "border-box" as const, marginBottom: 14, outline: "none"
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const
}

export default function CompletarDatosPage() {
  const [estado, setEstado] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [dni, setDni] = useState("")
  const [naf, setNaf] = useState("")
  const [iban, setIban] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    fetch("/api/empleado/completar-datos").then(r => r.json()).then(d => {
      if (!d.error) {
        setEstado(d)
        if (d.fechaNacimiento) setFechaNacimiento(new Date(d.fechaNacimiento).toISOString().split("T")[0])
      }
      setCargando(false)
    })
  }, [])

  const enviar = async () => {
    setError("")
    if (!dni.trim() || !naf.trim() || !iban.trim() || !telefono.trim() || !direccion.trim() || !fechaNacimiento) {
      setError("Todos los campos son obligatorios")
      return
    }
    setGuardando(true)
    const res = await fetch("/api/empleado/completar-datos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni, naf, iban, telefono, direccion, fechaNacimiento })
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) { setError(data.error); return }
    setEnviado(true)
  }

  if (cargando) return <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF" }}>Cargando...</div>

  if (estado?.error) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", padding: 24, textAlign: "center", color: "#6B7280" }}>
        No tienes una ficha de empleado vinculada a tu cuenta. Contacta con tu administrador.
      </div>
    )
  }

  if (enviado || estado?.estadoDatosPersonales === "en_revision") {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Tus datos están en revisión</div>
        <div style={{ fontSize: 13, color: "#6B7280" }}>El Super Admin revisará la información enviada. Te avisaremos cuando se confirme.</div>
      </div>
    )
  }

  if (estado?.estadoDatosPersonales === "confirmado") {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Tus datos ya están confirmados</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 28 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Completa tus datos personales</div>
      <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 20 }}>Esta información es necesaria para tu ficha de empleado. Un Super Admin revisará los datos antes de confirmarlos.</div>

      {estado?.estadoDatosPersonales === "rechazado" && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12.5, color: "#991B1B" }}>
          <strong>Tus datos fueron rechazados.</strong> Motivo: {estado.motivoRechazoDatos}. Corrige la información y vuelve a enviarla.
        </div>
      )}

      <label style={labelStyle}>DNI / NIE</label>
      <input value={dni} onChange={e => setDni(e.target.value)} style={inputStyle} placeholder="12345678A" />

      <label style={labelStyle}>Numero de la Seguridad Social (NAF)</label>
      <input value={naf} onChange={e => setNaf(e.target.value)} style={inputStyle} placeholder="123456789012" />

      <label style={labelStyle}>IBAN</label>
      <input value={iban} onChange={e => setIban(e.target.value)} style={inputStyle} placeholder="ES00 0000 0000 0000 0000 0000" />

      <label style={labelStyle}>Telefono</label>
      <input value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} placeholder="600000000" />

      <label style={labelStyle}>Direccion</label>
      <input value={direccion} onChange={e => setDireccion(e.target.value)} style={inputStyle} placeholder="Calle Ejemplo 1, Madrid" />

      <label style={labelStyle}>Fecha de nacimiento</label>
      <input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} style={inputStyle} />

      {error && <div style={{ color: "#DC2626", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

      <button onClick={enviar} disabled={guardando}
        style={{ width: "100%", background: violeta, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>
        {guardando ? "Enviando..." : "Enviar para revision"}
      </button>
    </div>
  )
}