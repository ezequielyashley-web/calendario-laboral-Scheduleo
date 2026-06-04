"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EmpleadosPage() {
  const router = useRouter()
  const [empleados, setEmpleados] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/empleados?empresaId=empresa-001")
      .then(r => r.json())
      .then(data => { setEmpleados(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtrados = empleados.filter(e =>
    `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.numeroEmpleado?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const porPuesto = filtrados.reduce((acc, e) => {
    const puesto = e.puestoDeTrabajo?.nombre || "Sin puesto"
    if (!acc[puesto]) acc[puesto] = []
    acc[puesto].push(e)
    return acc
  }, {})

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0284c7", margin: 0 }}>Empleados</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>{empleados.length} empleados en total</p>
        </div>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar empleado..."
          style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, width: 220, outline: "none" }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>No se encontraron empleados</div>
      ) : (
        Object.entries(porPuesto).map(([puesto, emps]) => (
          <div key={puesto} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              {puesto} ({(emps as any[]).length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {(emps as any[]).map(e => (
                <div key={e.id} onClick={() => router.push(`/empleados/${e.id}`)}
                  style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 14 }}
                  onMouseEnter={el => (el.currentTarget.style.borderColor = "#0284c7") }
                  onMouseLeave={el => (el.currentTarget.style.borderColor = "#e5e7eb") }
                >
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {e.nombre[0]}{e.apellidos[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.nombre} {e.apellidos}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {e.grupoTrabajo?.nombre || "Sin grupo"} · Nº {e.numeroEmpleado}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}