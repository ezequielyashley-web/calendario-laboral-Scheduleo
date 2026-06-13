"use client"
import ChatDesktop from "@/components/desktop/ChatDesktop"
import { useNotifications } from "@/components/providers/NotificationProvider"
import { useState } from "react"

function NotificacionesPanel() {
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

  const sinLeer = notificaciones.filter((n: any) => !n.leida).length

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            {sinLeer > 0 ? `${sinLeer} sin leer de ${notificaciones.length} totales` : `${notificaciones.length} notificaciones · todas leidas`}
          </p>
        </div>
        {sinLeer > 0 && (
          <button onClick={marcarTodasComoLeidas}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Marcar todas como leidas
          </button>
        )}
      </div>
      {notificaciones.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>No hay notificaciones</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>Las notificaciones apareceran aqui</p>
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
                    <p style={{ fontSize: 14, fontWeight: n.leida ? 500 : 700, color: "var(--text-primary)", margin: 0 }}>{n.titulo || "Notificacion"}</p>
                    {!n.leida && <span style={{ background: config.color, color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 20, padding: "2px 8px" }}>NUEVO</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{n.mensaje || n.cuerpo || ""}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatFecha(n.createdAt || n.fecha)}</span>
                  {n.leida && <span style={{ fontSize: 10, color: "#9ca3af" }}>Leida</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const [tab, setTab] = useState<'chat' | 'notificaciones'>('chat')
  const { noLeidas } = useNotifications()

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {([
          { key: 'chat', label: 'Chat' },
          { key: 'notificaciones', label: 'Notificaciones', badge: noLeidas },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ position: "relative", padding: "8px 20px", fontSize: 13, fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "#6366f1" : "var(--text-muted)", background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer", transition: "all .15s", marginBottom: -1, display: "flex", alignItems: "center", gap: 8 }}>
            {t.label}
            {'badge' in t && t.badge > 0 && (
              <span style={{ background: "#dc2626", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {t.badge > 9 ? "9+" : t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'chat' ? <ChatDesktop /> : <NotificacionesPanel />}
    </div>
  )
}