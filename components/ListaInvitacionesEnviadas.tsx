"use client"
import { useState, useEffect } from "react"

const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Esperando respuesta", color: "#D97706", bg: "#FEF3C7" },
  usada: { label: "Cuenta creada, en revisión", color: "#0284C7", bg: "#DBEAFE" },
  expirada: { label: "Caducada", color: "#6B7280", bg: "#F3F4F6" },
}

export default function ListaInvitacionesEnviadas() {
  const [invitaciones, setInvitaciones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    setCargando(true)
    fetch("/api/invitaciones").then(r => r.json()).then(d => {
      setInvitaciones(Array.isArray(d) ? d : [])
      setCargando(false)
    }).catch(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const ahora = new Date()

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>Invitaciones enviadas</div>
        <button onClick={cargar} style={{ background: "none", border: "none", color: "#673DE6", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Actualizar</button>
      </div>

      {cargando ? (
        <div style={{ fontSize: 12, color: "#9CA3AF", padding: 16, textAlign: "center" }}>Cargando...</div>
      ) : invitaciones.length === 0 ? (
        <div style={{ fontSize: 12, color: "#9CA3AF", padding: 16, textAlign: "center", background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 10 }}>
          No has enviado ninguna invitación todavía
        </div>
      ) : (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 10, overflow: "hidden" }}>
          {invitaciones.map((inv, i) => {
            const expirada = inv.estado === "pendiente" && new Date(inv.expiresAt) < ahora
            const estadoKey = expirada ? "expirada" : inv.estado
            const est = ESTADOS[estadoKey] || ESTADOS.pendiente
            return (
              <div key={inv.id} style={{ padding: "10px 14px", borderBottom: i < invitaciones.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e1b4b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{inv.email}</div>
                  <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>{inv.cargo || inv.rol} · Enviada el {new Date(inv.createdAt).toLocaleDateString("es-ES")}</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: est.bg, color: est.color, flexShrink: 0, whiteSpace: "nowrap" as const }}>{est.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}