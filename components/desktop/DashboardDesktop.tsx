"use client"
import InspectorBanner from "@/components/desktop/InspectorBanner"

const kpis = [
  { label: "Empleados activos", valor: 68, trend: "+3%", up: true, color: "#6366f1", bg: "#ede9fe", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { label: "En vacaciones",     valor: 12, trend: "-2%", up: false, color: "#ec4899", bg: "#fce7f3", icon: "M18 3a3 3 0 0 0-3 3l-7 3a3 3 0 0 0 0 6l7 3a3 3 0 1 0 3-3l-7-3 7-3A3 3 0 0 0 18 3z" },
  { label: "Solicitudes",       valor: 5,  trend: "+1",  up: false, color: "#d97706", bg: "#fef9c3", icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
  { label: "Horas este mes",    valor: "5.440", trend: "+5%", up: true, color: "#fff", bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", gradient: true, icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" },
]

const asistencia = [
  { dia:'L', pct:85 }, { dia:'M', pct:92 }, { dia:'X', pct:88 },
  { dia:'J', pct:95 }, { dia:'V', pct:90 }, { dia:'S', pct:87 },
  { dia:'D', pct:20, danger:true },
]

const grupos = [
  { nombre:'G1A', empleados:12, total:12, color:'#6366f1' },
  { nombre:'G1B', empleados:11, total:12, color:'#4f46e5' },
  { nombre:'G2A', empleados:11, total:12, color:'#8b5cf6' },
  { nombre:'G2B', empleados:12, total:12, color:'#a78bfa' },
  { nombre:'G3A', empleados:11, total:12, color:'#c4b5fd' },
  { nombre:'G3B', empleados:11, total:12, color:'#ddd6fe' },
]

const actividad = [
  { icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", txt: "Solicitud vacaciones enviada", emp: "Juan García", tiempo: "5 min", color: "#6366f1", bg: "#ede9fe" },
  { icon: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3", txt: "Cambio de turno aprobado", emp: "María López", tiempo: "18 min", color: "#16a34a", bg: "#dcfce7" },
  { icon: "M22 12h-4l-3 9L9 3l-3 9H2", txt: "Baja médica registrada", emp: "Carlos Martín", tiempo: "1h", color: "#d97706", bg: "#fef9c3" },
  { icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", txt: "Anticipo solicitado", emp: "Ana Sánchez", tiempo: "2h", color: "#ec4899", bg: "#fce7f3" },
]

export default function DashboardDesktop() {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <InspectorBanner />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: k.gradient ? k.bg : "#fff", borderRadius: 16, padding: 20, border: k.gradient ? "none" : "0.5px solid #e8eaf0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 45, height: 45, background: k.gradient ? "rgba(255,255,255,0.2)" : k.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={k.gradient ? "#fff" : k.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={k.icon}/>
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: k.gradient ? "#fff" : k.up ? "#16a34a" : "#ef4444", background: k.gradient ? "rgba(255,255,255,0.2)" : k.up ? "#dcfce7" : "#fee2e2", padding: "3px 8px", borderRadius: 20 }}>
                {k.trend}
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 500, color: k.gradient ? "#fff" : "#1e1b4b", marginBottom: 4 }}>{k.valor}</div>
            <div style={{ fontSize: 12, color: k.gradient ? "rgba(255,255,255,0.7)" : "#a0aec0" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "0.5px solid #e8eaf0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1e1b4b" }}>Asistencia semanal</div>
            <span style={{ fontSize: 11, color: "#6366f1", background: "#ede9fe", padding: "4px 10px", borderRadius: 20 }}>Esta semana</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
            {asistencia.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", background: d.danger ? "#fee2e2" : "#ede9fe", height: d.pct + "px", borderRadius: "8px 8px 0 0", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: d.danger ? "#ef4444" : "#6366f1", height: (d.pct * 0.7) + "px", borderRadius: "6px 6px 0 0", opacity: 0.9 }}></div>
                </div>
                <span style={{ fontSize: 11, color: "#a0aec0" }}>{d.dia}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "0.5px solid #e8eaf0" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1e1b4b", marginBottom: 16 }}>Distribución por turno</div>
          {grupos.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#718096", width: 32 }}>{g.nombre}</span>
              <div style={{ flex: 1, background: "#f0f4ff", borderRadius: 4, height: 6 }}>
                <div style={{ width: (g.empleados / g.total * 100) + "%", background: g.color, height: 6, borderRadius: 4 }}></div>
              </div>
              <span style={{ fontSize: 12, color: "#718096", width: 36, textAlign: "right" }}>{g.empleados}/{g.total}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "0.5px solid #e8eaf0" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#1e1b4b", marginBottom: 16 }}>Actividad reciente</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {actividad.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8f9ff", borderRadius: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.icon}/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.txt}</div>
                <div style={{ fontSize: 11, color: "#a0aec0" }}>{a.emp} · Hace {a.tiempo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}