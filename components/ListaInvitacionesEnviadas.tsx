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
  const [cancelando, setCancelando] = useState<string | null>(null)

  const cargar = () => {
    setCargando(true)
    fetch("/api/invitaciones").then(r => r.json()).then(d => {
      setInvitaciones(Array.isArray(d) ? d : [])
      setCargando(false)
    }).catch(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
    window.addEventListener("invitacionEnviada", cargar)
    return () => window.removeEventListener("invitacionEnviada", cargar)
  }, [])

  const cancelar = async (id: string) => {
    if (!confirm("¿Cancelar esta invitación? El enlace dejará de funcionar.")) return
    setCancelando(id)
    setInvitaciones(prev => prev.filter(i => i.id !== id))
    await fetch(`/api/invitaciones?id=${id}`, { method: "DELETE" }).catch(() => {})
    setCancelando(null)
  }

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
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: est.bg, color: est.color, whiteSpace: "nowrap" as const }}>{est.label}</span>
                  {(estadoKey === "pendiente" || estadoKey === "expirada") && (
                    <button
                      onClick={() => cancelar(inv.id)}
                      disabled={cancelando === inv.id}
                      style={{ background: "none", border: "none", color: "#DC2626", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      {cancelando === inv.id ? "..." : "Cancelar"}
                    </button>
                  )}
                  {estadoKey === "usada" && (
                    <button
                      onClick={() => cancelar(inv.id)}
                      disabled={cancelando === inv.id}
                      title="Borra el registro. No afecta a la solicitud ya creada."
                      style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      {cancelando === inv.id ? "..." : "Quitar"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}