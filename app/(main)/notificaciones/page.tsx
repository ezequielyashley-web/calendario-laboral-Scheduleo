"use client"
import { useNotifications } from "@/components/providers/NotificationProvider"

export default function NotificacionesPage() {
  const { notificaciones, marcarComoLeida, marcarTodasComoLeidas } = useNotifications()

  const tipoConfig: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    info:    { icon: "📬", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    success: { icon: "✅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    warning: { icon: "⚠️", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    error:   { icon: "❌", color: "#dc2626", bg: "#fff1f1", border: "#fecaca" },
  }

  const formatFecha = (fecha: any) => {
    if (!fecha) return "Ahora"
    try {
      const d = new Date(fecha)
      if (isNaN(d.getTime())) return "Ahora"
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    } catch { return "Ahora" }
  }

  const sinLeer = notificaciones.filter(n => !n.leida).length

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Notificaciones</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            {sinLeer > 0 ? `${sinLeer} sin leer de ${notificaciones.length} totales` : `${notificaciones.length} notificaciones · todas leídas`}
          </p>
        </div>
        {sinLeer > 0 && (
          <button onClick={marcarTodasComoLeidas}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
            ✓ Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Lista */}
      {notificaciones.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>No hay notificaciones</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>Las notificaciones de vacaciones, bajas y cambios de turno aparecerán aquí</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notificaciones.map((n: any) => {
            const config = tipoConfig[n.tipo] || tipoConfig.info
            return (
              <div key={n.id} onClick={() => marcarComoLeida(n.id)}
                style={{ background: n.leida ? "var(--surface)" : config.bg, border: `1px solid ${n.leida ? "var(--border)" : config.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all .15s", borderLeft: `4px solid ${n.leida ? "var(--border)" : config.color}` }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateX(4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateX(0)")}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: n.leida ? "var(--surface-2)" : config.bg, border: `1px solid ${config.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: n.leida ? 500 : 700, color: "var(--text-primary)", margin: 0 }}>{n.titulo || "Notificación"}</p>
                    {!n.leida && <span style={{ background: config.color, color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 20, padding: "2px 8px", textTransform: "uppercase" }}>NUEVO</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{n.mensaje || n.cuerpo || ""}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatFecha(n.createdAt || n.fecha)}</span>
                  {n.leida && <span style={{ fontSize: 10, color: "#9ca3af" }}>Leída</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
