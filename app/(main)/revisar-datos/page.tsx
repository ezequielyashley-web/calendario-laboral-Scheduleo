"use client"
import { useState, useEffect } from "react"

const violeta = "#673DE6"

export default function RevisarDatosPage() {
  const [pendientes, setPendientes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [seleccionado, setSeleccionado] = useState<any>(null)
  const [accion, setAccion] = useState<"confirmar" | "rechazar" | null>(null)
  const [motivo, setMotivo] = useState("")
  const [masterPassword, setMasterPassword] = useState("")
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState("")

  const cargar = () => {
    setCargando(true)
    fetch("/api/empleado/revisar-datos").then(r => r.json()).then(d => {
      setPendientes(Array.isArray(d) ? d : [])
      setCargando(false)
    })
  }
  useEffect(() => { cargar() }, [])

  const abrir = (p: any, a: "confirmar" | "rechazar") => {
    setSeleccionado(p)
    setAccion(a)
    setMotivo("")
    setMasterPassword("")
    setError("")
  }

  const procesar = async () => {
    setError("")
    if (!masterPassword) { setError("Introduce la contrasena maestra"); return }
    if (accion === "rechazar" && !motivo.trim()) { setError("El motivo del rechazo es obligatorio"); return }
    setProcesando(true)
    const res = await fetch("/api/empleado/revisar-datos", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: seleccionado.id, accion, motivo, masterPassword })
    })
    const data = await res.json()
    setProcesando(false)
    if (data.error) { setError(data.error); return }
    setSeleccionado(null)
    setAccion(null)
    cargar()
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Revision de datos personales</div>
      <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 20 }}>Empleados que han enviado sus datos personales y esperan confirmacion.</div>

      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Cargando...</div>
      ) : pendientes.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 32, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
          No hay revisiones pendientes
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pendientes.map((p: any) => (
            <div key={p.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{p.nombre} {p.apellidos}</div>
                <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>{p.numeroEmpleado} · {p.user?.email}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a href={`/empleados/${p.id}`} target="_blank" rel="noreferrer"
                  style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
                  Ver ficha
                </a>
                <button onClick={() => abrir(p, "rechazar")}
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer" }}>
                  Rechazar
                </button>
                <button onClick={() => abrir(p, "confirmar")}
                  style={{ background: violeta, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                  Confirmar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {seleccionado && (
        <div onClick={() => setSeleccionado(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
              {accion === "confirmar" ? "Confirmar datos" : "Rechazar datos"} de {seleccionado.nombre}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>
              Revisa primero la ficha completa (boton "Ver ficha") antes de confirmar.
            </div>

            {accion === "rechazar" && (
              <>
                <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Motivo del rechazo</label>
                <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginBottom: 12, boxSizing: "border-box" as const, fontFamily: "inherit", resize: "vertical" as const }}
                  placeholder="Ej: el IBAN no es valido" />
              </>
            )}

            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Contrasena maestra</label>
            <input type="password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginBottom: 12, boxSizing: "border-box" as const }}
              placeholder="Confirma con tu contrasena maestra" />

            {error && <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSeleccionado(null)} style={{ flex: 1, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: 10, fontSize: 12.5, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
              <button onClick={procesar} disabled={procesando}
                style={{ flex: 1, background: accion === "confirmar" ? violeta : "#DC2626", border: "none", borderRadius: 8, padding: 10, fontSize: 12.5, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: procesando ? 0.6 : 1 }}>
                {procesando ? "Procesando..." : accion === "confirmar" ? "Confirmar datos" : "Rechazar datos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}