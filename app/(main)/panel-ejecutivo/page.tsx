"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

function Avatar({ nombre, size = 38, online, dorado = false }: { nombre: string; size?: number; online?: boolean; dorado?: boolean }) {
  const initials = (nombre || "?").split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: dorado ? "#c9a14d" : "#2a2f45",
        color: dorado ? "#0b0e1a" : "#c9ccd9",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.34, fontWeight: 500
      }}>{initials}</div>
      <span style={{
        position: "absolute", bottom: -1, right: -1, width: size * 0.28, height: size * 0.28,
        borderRadius: "50%", background: online ? "#1D9E75" : "#5a5f78",
        border: "2px solid #0b0e1a"
      }} />
    </div>
  )
}

function tiempoDesde(fecha: string | null) {
  if (!fecha) return "Nunca conectado"
  const diff = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Ahora mismo"
  if (min < 60) return `hace ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias}d`
}

export default function PanelEjecutivoPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<any>(null)

  const usuarioActual = { id: "admin-001", nombre: "Administrador" }

  const cargar = async () => {
    const res = await fetch("/api/panel-ejecutivo").catch(() => null)
    if (res) { const d = await res.json(); setData(d) }
    setLoading(false)
  }

  useEffect(() => {
    cargar()
    const t = setInterval(cargar, 15000)
    fetch("/api/heartbeat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: usuarioActual.id }) })
    intervalRef.current = setInterval(() => {
      fetch("/api/heartbeat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: usuarioActual.id }) })
    }, 30000)
    return () => { clearInterval(t); clearInterval(intervalRef.current) }
  }, [])

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#8d92ab" }}>Cargando panel ejecutivo...</div>

  const superAdmins = data?.superAdmins || []
  const gerenciales = data?.gerenciales || []
  const totalOnline = data?.totalOnline || 0

  return (
    <div style={{ minHeight: "calc(100vh - 100px)", background: "#0b0e1a", borderRadius: 16, padding: "1.5rem", border: "0.5px solid #2a2f45" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#f1ecdd", letterSpacing: "0.01em" }}>Panel ejecutivo</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#161a2c", border: "1px solid #2a2f45", padding: "5px 12px", borderRadius: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#c9ccd9" }}>{totalOnline} conectado{totalOnline !== 1 ? "s" : ""} ahora</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#8d92ab", marginBottom: 24, marginLeft: 30 }}>Usuarios y accesos del sistema</div>

      <div style={{ fontSize: 11, color: "#8d92ab", letterSpacing: "0.06em", marginBottom: 8, marginLeft: 4 }}>SUPER ADMINISTRADORES ({superAdmins.length})</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {superAdmins.map((u: any) => (
          <div key={u.id} onClick={() => router.push(`/panel-ejecutivo/${u.id}`)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
            background: u.esFundador ? "linear-gradient(180deg, #1a1f33, #15192a)" : "#161a2c",
            border: u.esFundador ? "1px solid #c9a14d" : "1px solid #2a2f45"
          }}>
            <Avatar nombre={u.name} size={38} online={u.online} dorado={u.esFundador} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#f1ecdd" }}>{u.name}</span>
                {u.esFundador ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#c9a14d", color: "#0b0e1a", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>👑 Fundador</span>
                ) : (
                  <span style={{ background: "#2a2f45", color: "#c9ccd9", fontSize: 10, padding: "2px 8px", borderRadius: 6 }}>Super Admin #{u.ordenSuperAdmin || "—"}</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: u.online ? "#1D9E75" : "#8d92ab", marginTop: 2 }}>
                {u.online ? "En línea ahora" : `Desconectado · ${tiempoDesde(u.ultimaActividad)}`}
                {u.id === usuarioActual.id && " · eres tú"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#8d92ab", letterSpacing: "0.06em", marginBottom: 8, marginLeft: 4 }}>USUARIOS GERENCIALES ({gerenciales.length})</div>
      {gerenciales.length === 0 ? (
        <div style={{ background: "#161a2c", border: "1px solid #2a2f45", borderRadius: 10, padding: 30, textAlign: "center", color: "#8d92ab", fontSize: 13 }}>
          Sin usuarios gerenciales todavía
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gerenciales.map((u: any) => (
            <div key={u.id} onClick={() => router.push(`/panel-ejecutivo/${u.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "#161a2c", border: "1px solid #2a2f45", cursor: "pointer" }}>
              <Avatar nombre={u.name} size={34} online={u.online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#f1ecdd" }}>{u.name}</div>
                <div style={{ fontSize: 11, color: u.online ? "#1D9E75" : "#8d92ab", marginTop: 2 }}>
                  {u.online ? "En línea ahora" : `Desconectado · ${tiempoDesde(u.ultimaActividad)}`}
                  {u.cargo && ` · ${u.cargo}`}
                </div>
              </div>
              <span style={{ color: "#5a5f78", fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}