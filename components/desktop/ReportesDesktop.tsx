"use client"
import { useState, useEffect } from "react"

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

export default function ReportesDesktop() {
  const [datos, setDatos] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [tab, setTab] = useState("fichajes")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reportes?mes=${mes}&anio=${anio}`)
      .then(r => r.json())
      .then(data => { setDatos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mes, anio])

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando reportes...</div>
  if (!datos || !datos.fichajes || !datos.vacaciones || !datos.bajas) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Inicia sesion para ver los reportes</div>

  const tabs = [
    { key: "fichajes", label: "Fichajes" },
    { key: "vacaciones", label: "Vacaciones" },
    { key: "horas", label: "Horas" },
    { key: "bajas", label: "Bajas" },
    { key: "cambios", label: "Cambios turno" },
    { key: "grupos", label: "Grupos" },
  ]

  if (!datos) return <div style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}>Cargando reportes...</div>

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

      {/* Selector mes/año */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1e1b4b", flex: 1 }}>
          Reportes — {MESES[mes-1]} {anio}
        </div>
        <select value={mes} onChange={e => setMes(Number(e.target.value))}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
          {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={anio} onChange={e => setAnio(Number(e.target.value))}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
          {[2024, 2025, 2026, 2027].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* KPIs generales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Empleados activos", valor: datos.totalEmpleados, color: "#6366f1", bg: "#f5f3ff" },
          { label: "Fichajes del mes", valor: datos.fichajes.total, color: "#0891b2", bg: "#f0f9ff" },
          { label: "Días vacaciones aprobados", valor: datos.vacaciones.diasAprobados, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Bajas activas", valor: datos.bajas.enCurso, color: "#dc2626", bg: "#fef2f2" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: "18px 20px", border: `1px solid ${k.color}22` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.valor}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "10px 18px", border: "none", background: "none", fontSize: 13, fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "#6366f1" : "#64748b", borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent", marginBottom: -2, cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Fichajes */}
      {tab === "fichajes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Fichajes correctos", valor: datos.fichajes.correctos, pct: datos.fichajes.pctCorrectos + "%", color: "#16a34a", bg: "#f0fdf4" },
            { label: "Fichajes tardios", valor: datos.fichajes.tardios, pct: datos.fichajes.pctTardios + "%", color: "#d97706", bg: "#fef9c3" },
            { label: "Sin hora salida", valor: datos.fichajes.sinSalida, pct: datos.fichajes.total > 0 ? (datos.fichajes.sinSalida / datos.fichajes.total * 100).toFixed(1) + "%" : "0%", color: "#dc2626", bg: "#fef2f2" },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: "24px 20px", border: `1px solid ${k.color}33`, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: k.color }}>{k.valor}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: k.color, marginTop: 4 }}>{k.pct}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Vacaciones */}
      {tab === "vacaciones" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Solicitudes aprobadas", valor: datos.vacaciones.aprobadas, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Solicitudes pendientes", valor: datos.vacaciones.pendientes, color: "#d97706", bg: "#fef9c3" },
            { label: "Solicitudes rechazadas", valor: datos.vacaciones.rechazadas, color: "#dc2626", bg: "#fef2f2" },
            { label: "Dias aprobados", valor: datos.vacaciones.diasAprobados, color: "#6366f1", bg: "#f5f3ff" },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: "24px 20px", border: `1px solid ${k.color}33`, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: k.color }}>{k.valor}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Horas */}
      {tab === "horas" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Horas trabajadas", valor: datos.horas.totales + "h", color: "#16a34a", bg: "#f0fdf4" },
            { label: "Horas esperadas", valor: datos.horas.esperadas + "h", color: "#6366f1", bg: "#f5f3ff" },
            { label: "Promedio por empleado", valor: datos.horas.promedioPorEmpleado + "h", color: "#0891b2", bg: "#f0f9ff" },
            { label: "Cumplimiento", valor: datos.horas.pctCumplimiento + "%", color: "#d97706", bg: "#fef9c3" },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: "24px 20px", border: `1px solid ${k.color}33`, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: k.color }}>{k.valor}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Bajas */}
      {tab === "bajas" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Bajas en el mes", valor: datos.bajas.total, color: "#dc2626", bg: "#fef2f2" },
            { label: "Bajas activas actualmente", valor: datos.bajas.enCurso, color: "#d97706", bg: "#fef9c3" },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: "24px 20px", border: `1px solid ${k.color}33`, textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: k.color }}>{k.valor}</div>
              <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Cambios turno */}
      {tab === "cambios" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Total solicitudes", valor: datos.cambiosTurno.total, color: "#6366f1", bg: "#f5f3ff" },
            { label: "Aprobados", valor: datos.cambiosTurno.aprobados, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Pendientes", valor: datos.cambiosTurno.pendientes, color: "#d97706", bg: "#fef9c3" },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: "24px 20px", border: `1px solid ${k.color}33`, textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: k.color }}>{k.valor}</div>
              <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Grupos */}
      {tab === "grupos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {datos.grupos.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No hay grupos configurados</div>
          ) : datos.grupos.map((g: any) => (
            <div key={g.nombre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{g.nombre}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{g.empleados} empleados</div>
              <div style={{ background: g.color + "22", color: g.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${g.color}44` }}>
                {g.empleados > 0 ? Math.round(g.empleados / (datos.totalEmpleados || 1) * 100) + "%" : "0%"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
