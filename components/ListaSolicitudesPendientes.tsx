"use client"
import { useState, useEffect } from "react"

const violeta = "#673DE6"
const gris = "#6B7280"

export default function ListaSolicitudesPendientes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalActivo, setModalActivo] = useState<{ id: string; accion: "aprobar" | "rechazar"; nombre: string } | null>(null)
  const [masterPassword, setMasterPassword] = useState("")
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState("")

  const cargar = () => {
    setCargando(true)
    fetch("/api/solicitudes-gerenciales").then(r => r.json()).then(d => {
      const pendientes = Array.isArray(d) ? d.filter((s: any) => s.estado === "pendiente") : []
      setSolicitudes(pendientes)
      setCargando(false)
    }).catch(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
    window.addEventListener("invitacionEnviada", cargar)
    return () => window.removeEventListener("invitacionEnviada", cargar)
  }, [])

  const confirmarAccion = async () => {
    if (!modalActivo || !masterPassword.trim()) { setError("Introduce tu contraseña master"); return }
    setProcesando(true)
    setError("")
    const res = await fetch("/api/solicitudes-gerenciales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: modalActivo.id, accion: modalActivo.accion, masterPassword })
    })
    const data = await res.json()
    setProcesando(false)
    if (data.error) { setError(data.error); return }
    setModalActivo(null)
    setMasterPassword("")
    setSolicitudes(prev => prev.filter(s => s.id !== modalActivo.id))
  }

  if (cargando) return null
  if (solicitudes.length === 0) return null

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>Solicitudes pendientes de aprobación</div>
        <button onClick={cargar} style={{ background: "none", border: "none", color: violeta, fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Actualizar</button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #FDE68A", borderRadius: 10, overflow: "hidden" }}>
        {solicitudes.map((s, i) => (
          <div key={s.id} style={{ padding: "12px 14px", borderBottom: i < solicitudes.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: "#FFFBEB" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e1b4b" }}>{s.nombre}</div>
              <div style={{ fontSize: 10.5, color: "#92400E" }}>{s.email} · {s.cargo || "Sin cargo"} {s.origen === "invitacion" ? "· Autoregistrado por invitación" : ""}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setModalActivo({ id: s.id, accion: "rechazar", nombre: s.nombre })}
                style={{ background: "#fff", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 8, padding: "6px 14px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                Rechazar
              </button>
              <button
                onClick={() => setModalActivo({ id: s.id, accion: "aprobar", nombre: s.nombre })}
                style={{ background: violeta, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                Aprobar
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalActivo && (
        <div onClick={() => { setModalActivo(null); setMasterPassword(""); setError("") }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 26, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              {modalActivo.accion === "aprobar" ? "Aprobar" : "Rechazar"} a {modalActivo.nombre}
            </div>
            <div style={{ fontSize: 12.5, color: gris, marginBottom: 16 }}>
              Introduce tu contraseña master para confirmar esta acción.
            </div>
            <input
              type="password"
              value={masterPassword}
              onChange={e => setMasterPassword(e.target.value)}
              placeholder="Contraseña master"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, boxSizing: "border-box", marginBottom: 10, outline: "none" }}
            />
            {error && <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setModalActivo(null); setMasterPassword(""); setError("") }} style={{ background: "none", border: "none", color: gris, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Cancelar</button>
              <button
                onClick={confirmarAccion}
                disabled={procesando}
                style={{ background: modalActivo.accion === "aprobar" ? violeta : "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: procesando ? 0.6 : 1 }}>
                {procesando ? "Procesando..." : (modalActivo.accion === "aprobar" ? "Confirmar aprobación" : "Confirmar rechazo")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}