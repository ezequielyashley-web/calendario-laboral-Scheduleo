"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DeudasPage() {
  const router = useRouter()
  const [deudas, setDeudas] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/deudas?empresaId=empresa-001").then(r => r.json()),
      fetch("/api/empleados?empresaId=empresa-001").then(r => r.json()),
    ]).then(([d, e]) => {
      setDeudas(Array.isArray(d) ? d : [])
      setEmpleados(Array.isArray(e) ? e : [])
      setLoading(false)
    })
  }, [])

  // Agrupar deudas por empleado
  const deudasPorEmpleado = deudas.reduce((acc, d) => {
    if (!acc[d.empleadoid]) acc[d.empleadoid] = []
    acc[d.empleadoid].push(d)
    return acc
  }, {})

  const empleadosConDeudas = empleados.filter(e =>
    deudasPorEmpleado[e.id] && deudasPorEmpleado[e.id].some(d => d.estado === "ACTIVA")
  ).filter(e =>
    `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getTotalPendiente = (empId) => {
    const ds = deudasPorEmpleado[empId] || []
    return ds.filter(d => d.estado === "ACTIVA").reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0).toFixed(2)
  }

  const getNumDeudas = (empId) => {
    const ds = deudasPorEmpleado[empId] || []
    return ds.filter(d => d.estado === "ACTIVA").length
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0284c7", margin: 0 }}>Deudas y Anticipos</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
            {empleadosConDeudas.length} empleados con deudas activas
          </p>
        </div>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar empleado..."
          style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, width: 220, outline: "none" }}
        />
      </div>

      {/* Resumen total */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total pendiente", valor: deudas.filter(d => d.estado === "ACTIVA").reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0).toFixed(2) + "€", color: "#dc2626" },
          { label: "Con deudas/anticipos", valor: empleadosConDeudas.length, color: "#d97706" },
          { label: "Deudas/anticipos activos", valor: deudas.filter(d => d.estado === "ACTIVA").length, color: "#0284c7" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.valor}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Cargando...</div>
      ) : empleadosConDeudas.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#9ca3af" }}>
          No hay empleados con deudas activas
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Empleado", "Puesto", "Deudas/anticipos activos", "Total pendiente", "Próximo cobro", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleadosConDeudas.map((e, i) => {
                const ds = (deudasPorEmpleado[e.id] || []).filter(d => d.estado === "ACTIVA")
                const proximoCobro = ds.length > 0 ? `Día ${ds[0].diacobro}` : "—"
                return (
                  <tr key={e.id}
                    onClick={() => router.push(`/empleados/${e.id}?tab=deudas`)}
                    style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb", cursor: "pointer" }}
                    onMouseEnter={el => el.currentTarget.style.background = "#eff6ff"}
                    onMouseLeave={el => el.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f9fafb"}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {e.nombre[0]}{e.apellidos[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nombre} {e.apellidos}</div>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>Nº {e.numeroEmpleado}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{e.puestoDeTrabajo?.nombre || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {getNumDeudas(e.id)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "#dc2626" }}>{getTotalPendiente(e.id)}€</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{proximoCobro}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
