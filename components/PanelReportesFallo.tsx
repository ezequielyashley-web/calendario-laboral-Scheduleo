"use client"
import { useState, useEffect } from "react"
import InfoPanel from "@/components/InfoPanel"

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
  const [modoDemo, setModoDemo] = useState(false)
  const [modoPruebasManual, setModoPruebasManual] = useState(false)
  const [modoPruebasActivo, setModoPruebasActivo] = useState(false)
  const [guardandoToggle, setGuardandoToggle] = useState(false)

  const cargarConfig = () => {
    fetch("/api/config/modo-pruebas").then(r => r.json()).then(d => {
      setModoDemo(!!d.modoDemo)
      setModoPruebasManual(!!d.modoPruebasManual)
      setModoPruebasActivo(!!d.modoPruebas)
    }).catch(() => {})
  }

  const cargar = () => {
    setCargando(true)
    const url = filtro === "todos" ? "/api/reportes-fallo" : `/api/reportes-fallo?estado=${filtro}`
    fetch(url).then(r => r.json()).then(d => { setReportes(Array.isArray(d) ? d : []); setCargando(false) }).catch(() => setCargando(false))
  }

  useEffect(() => { cargarConfig() }, [])
  useEffect(() => { cargar() }, [filtro])

  const toggleManual = async () => {
    const nuevo = !modoPruebasManual
    setGuardandoToggle(true)
    setModoPruebasManual(nuevo)
    setModoPruebasActivo(modoDemo || nuevo)
    try {
      await fetch("/api/config/modo-pruebas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modoPruebas: nuevo })
      })
      if (typeof window !== "undefined") window.dispatchEvent(new Event("modoPruebasChange"))
    } catch {}
    setGuardandoToggle(false)
  }

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

      <div style={{ marginBottom: 20 }}>
        <InfoPanel titulo="Como funciona el Modo Pruebas" color="#673DE6" bg="#F1EEFE" border="#DDD6FE" items={[
          { icon: "🧪", titulo: "Con Modo Demo encendido", desc: "El Modo Pruebas se activa solo, automaticamente. Cualquiera que pruebe la app con los 50 empleados ficticios vera el boton rojo de reportar fallos." },
          { icon: "🔴", titulo: "Con base de datos real", desc: "El Modo Pruebas NO se activa solo. Debes encenderlo manualmente aqui abajo cuando quieras que alguien pruebe con los datos reales de tu empresa." },
          { icon: "🐞", titulo: "Como reporta alguien un fallo", desc: "Mientras el Modo Pruebas este activo, aparece un boton flotante rojo en la esquina inferior izquierda de toda la app. Al tocarlo, describen el fallo y se envia aqui." },
          { icon: "📍", titulo: "Contexto automatico", desc: "Cada reporte guarda solo la pagina donde ocurrio, quien lo mando y la fecha, sin que la persona que prueba tenga que escribirlo." },
          { icon: "✅", titulo: "Gestion de estados", desc: "Cada reporte pasa por Pendiente, En revision y Resuelto. Cambia el estado con los botones de cada tarjeta." },
        ]} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 18, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 2 }}>Modo Pruebas</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            {modoDemo
              ? "Activo automáticamente porque el Modo Demo está encendido"
              : modoPruebasActivo
                ? "Activado manualmente con la base de datos real"
                : "Apagado — actívalo para que se pueda reportar fallos con la base de datos real"}
          </div>
        </div>
        <button
          onClick={toggleManual}
          disabled={modoDemo || guardandoToggle}
          title={modoDemo ? "Se activa solo mientras el Modo Demo esté encendido" : ""}
          style={{ width: 46, height: 26, borderRadius: 20, border: "none", cursor: modoDemo ? "default" : "pointer", background: modoPruebasActivo ? "#673DE6" : "#E5E7EB", position: "relative", flexShrink: 0, opacity: modoDemo ? 0.6 : 1 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: modoPruebasActivo ? 23 : 3, transition: "left 0.15s" }} />
        </button>
      </div>

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