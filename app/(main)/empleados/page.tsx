"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const grupoColors: Record<string, { bg: string; color: string; border: string; avatar: string }> = {
  G1A: { bg: '#ede9fe', color: '#6366f1', border: '#c4b5fd', avatar: '#6366f1' },
  G1B: { bg: '#e0e7ff', color: '#4f46e5', border: '#a5b4fc', avatar: '#4f46e5' },
  G2A: { bg: '#e0f2fe', color: '#0891b2', border: '#7dd3fc', avatar: '#0891b2' },
  G2B: { bg: '#cffafe', color: '#0e7490', border: '#67e8f9', avatar: '#0e7490' },
  G3A: { bg: '#dcfce7', color: '#16a34a', border: '#86efac', avatar: '#16a34a' },
  G3B: { bg: '#d1fae5', color: '#15803d', border: '#6ee7b7', avatar: '#15803d' },
  L1:  { bg: '#fef9c3', color: '#d97706', border: '#fde68a', avatar: '#d97706' },
  L2:  { bg: '#fef3c7', color: '#ca8a04', border: '#fcd34d', avatar: '#ca8a04' },
  L3:  { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', avatar: '#dc2626' },
}

export default function EmpleadosPage() {
  const router = useRouter()
  const [empleados, setEmpleados] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)

  useEffect(() => {
    fetch("/api/config/modo-demo").then(r => r.json()).then(d => setModoDemo(d.modoDemo))
    fetch("/api/empleados?empresaId=empresa-001")
      .then(r => r.json())
      .then(data => { setEmpleados(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtrados = empleados.filter((e: any) =>
    `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.numeroEmpleado?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const porGrupo = filtrados.reduce((acc: any, e: any) => {
    const grupo = e.gruponombre || e.grupoNombre || "Sin grupo"
    if (!acc[grupo]) acc[grupo] = []
    acc[grupo].push(e)
    return acc
  }, {})

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>

      {modoDemo && (
        <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 14, padding: "16px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 28 }}>🧪</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Modo demostración activo</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                Estás viendo <strong>50 empleados ficticios</strong> de prueba. Los datos son completamente inventados y no corresponden a personas reales.
              </div>
            </div>
          </div>
          <button onClick={() => router.push("/configuracion")}
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            Ir a Configuración →
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#6366f1", margin: 0 }}>Empleados</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>{empleados.length} empleados {modoDemo ? "de demostración" : "en total"}</p>
        </div>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar empleado..."
          style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, width: 220, outline: "none" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>No se encontraron empleados</div>
      ) : (
        Object.entries(porGrupo).map(([grupo, emps]) => {
          const gc = grupoColors[grupo] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', avatar: '#6b7280' }
          return (
            <div key={grupo} style={{ marginBottom: 28 }}>
              {/* Cabecera grupo */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 16px", background: gc.bg, border: `1px solid ${gc.border}`, borderRadius: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: gc.avatar, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  {grupo}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: gc.color }}>Grupo {grupo}</div>
                  <div style={{ fontSize: 11, color: gc.color, opacity: 0.7 }}>{(emps as any[]).length} empleados asignados</div>
                </div>
                {modoDemo && (
                  <span style={{ marginLeft: "auto", background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>DEMO</span>
                )}
              </div>

              {/* Grid empleados */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {(emps as any[]).map((e: any) => (
                  <div key={e.id} onClick={() => router.push(`/empleados/${e.id}`)}
                    style={{ background: "#fff", border: `1px solid ${gc.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 12, position: "relative" }}
                    onMouseEnter={el => { el.currentTarget.style.background = gc.bg; el.currentTarget.style.transform = "translateY(-1px)" }}
                    onMouseLeave={el => { el.currentTarget.style.background = "#fff"; el.currentTarget.style.transform = "translateY(0)" }}
                  >
                    {modoDemo && (
                      <div style={{ position: "absolute", top: 6, right: 8, background: "#f59e0b", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 8, letterSpacing: "0.5px" }}>
                        DEMO
                      </div>
                    )}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: gc.avatar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {e.nombre[0]}{e.apellidos[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {e.nombre} {e.apellidos}
                      </div>
                      <div style={{ fontSize: 11, color: gc.color, fontWeight: 500 }}>
                        Nº {e.numeroEmpleado}
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gc.color} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
