"use client"
import { useState, useEffect } from "react"

const ESTADOS = [
  { key: "pendiente", label: "Pendiente", color: "#DC2626", bg: "#FEE2E2" },
  { key: "en_revision", label: "En revisión", color: "#D97706", bg: "#FEF3C7" },
  { key: "resuelto", label: "Resuelto", color: "#16A34A", bg: "#DCFCE7" },
]

function badgeEstado(estado: string) {
  const e = ESTADOS.find(x => x.key === estado) || ESTADOS[0]
  return <span style={{ background: e.bg, color: e.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{e.label}</span>
}

export default function PanelReportesFallo() {
  const [reportes, setReportes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState("todos")

  const cargar = () => {
    setCargando(true)
    const url = filtro === "todos" ? "/api/reportes-fallo" : `/api/reportes-fallo?estado=${filtro}`
    fetch(url).then(r => r.json()).then(d => { setReportes(Array.isArray(d) ? d : []); setCargando(false) }).catch(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [filtro])

  const cambiarEstado = async (id: string, estado: string) => {
    setReportes(prev => prev.map(r => r.id === id ? { ...r, estado } : r))
    await fetch("/api/reportes-fallo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado })
    })
  }

  const pendientes = reportes.filter(r => r.estado === "pendiente").length

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Reportes de fallos</h2>
      <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px" }}>
        Fallos reportados por quienes prueban la app en Modo Pruebas{pendientes > 0 && ` — ${pendientes} pendiente${pendientes > 1 ? "s" : ""}`}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[{ key: "todos", label: "Todos" }, ...ESTADOS].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            style={{ padding: "7px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: "pointer", border: "1px solid #E5E7EB", background: filtro === f.key ? "#673DE6" : "#fff", color: filtro === f.key ? "#fff" : "#374151" }}>
            {f.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13 }}>Cargando...</div>
      ) : reportes.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14 }}>No hay reportes {filtro !== "todos" ? "con este estado" : "todavía"}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reportes.map(r => (
            <div key={r.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
                <div style={{ fontSize: 13.5, color: "#111827", lineHeight: 1.5, flex: 1 }}>{r.descripcion}</div>
                {badgeEstado(r.estado)}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11.5, color: "#9CA3AF", marginBottom: 12 }}>
                <span>📍 {r.pagina || "—"}</span>
                <span>👤 {r.reportadoPor || "Desconocido"}</span>
                <span>🕐 {new Date(r.createdAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {ESTADOS.map(e => (
                  <button key={e.key} onClick={() => cambiarEstado(r.id, e.key)}
                    disabled={r.estado === e.key}
                    style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 6, cursor: r.estado === e.key ? "default" : "pointer", border: `1px solid ${e.color}33`, background: r.estado === e.key ? e.bg : "#fff", color: e.color, opacity: r.estado === e.key ? 1 : 0.7 }}>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}