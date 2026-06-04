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

  const deudasPorEmpleado = deudas.reduce((acc, d) => {
    if (!acc[d.empleadoid]) acc[d.empleadoid] = []
    acc[d.empleadoid].push(d)
    return acc
  }, {})

  const activas = deudas.filter(d => d.estado === "ACTIVA")
  const anticiposActivos = activas.filter(d => d.tipo === "ANTICIPO")
  const productosActivos = activas.filter(d => d.tipo === "PRODUCTO")
  const descuentosActivos = activas.filter(d => d.tipo === "DESCUENTO")

  const empConAnticipos = empleados.filter(e => (deudasPorEmpleado[e.id] || []).some(d => d.estado === "ACTIVA" && d.tipo === "ANTICIPO"))
  const empConProductos = empleados.filter(e => (deudasPorEmpleado[e.id] || []).some(d => d.estado === "ACTIVA" && d.tipo === "PRODUCTO"))
  const empConDescuentos = empleados.filter(e => (deudasPorEmpleado[e.id] || []).some(d => d.estado === "ACTIVA" && d.tipo === "DESCUENTO"))

  const empleadosConDeudas = empleados.filter(e =>
    (deudasPorEmpleado[e.id] || []).some(d => d.estado === "ACTIVA")
  ).filter(e =>
    `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getTotalPendiente = (empId, tipo = null) => {
    const ds = (deudasPorEmpleado[empId] || []).filter(d => d.estado === "ACTIVA" && (tipo ? d.tipo === tipo : true))
    return ds.reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0).toFixed(2)
  }

  const getDeudas = (empId, tipo = null) => {
    return (deudasPorEmpleado[empId] || []).filter(d => d.estado === "ACTIVA" && (tipo ? d.tipo === tipo : true))
  }

  const totalPendiente = activas.reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0).toFixed(2)

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0284c7", margin: 0 }}>Deudas y Anticipos</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Gestión de anticipos, productos y descuentos</p>
        </div>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar empleado..."
          style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, width: 220, outline: "none" }} />
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total pendiente", valor: totalPendiente + "€", color: "#dc2626", bg: "#fee2e2" },
          { label: "Emp. con anticipos", valor: empConAnticipos.length, color: "#7c3aed", bg: "#ede9fe" },
          { label: "Anticipos activos", valor: anticiposActivos.length, color: "#7c3aed", bg: "#ede9fe" },
          { label: "Emp. con productos", valor: empConProductos.length, color: "#0284c7", bg: "#dbeafe" },
          { label: "Productos activos", valor: productosActivos.length, color: "#0284c7", bg: "#dbeafe" },
          { label: "Emp. con descuentos", valor: empConDescuentos.length, color: "#d97706", bg: "#fef3c7" },
          { label: "Descuentos activos", valor: descuentosActivos.length, color: "#d97706", bg: "#fef3c7" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.valor}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Cargando...</div>
      ) : empleadosConDeudas.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#9ca3af" }}>
          No hay empleados con deudas o anticipos activos
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Empleado", "Anticipos", "Productos", "Descuentos", "Total pendiente", "Próximo cobro", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleadosConDeudas.map((e, i) => {
                const anticipos = getDeudas(e.id, "ANTICIPO")
                const productos = getDeudas(e.id, "PRODUCTO")
                const descuentos = getDeudas(e.id, "DESCUENTO")
                const todasDeudas = getDeudas(e.id)
                const proximoCobro = todasDeudas.length > 0 ? `Día ${todasDeudas[0].diacobro}` : "—"
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
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>{e.puestoDeTrabajo?.nombre || "Sin puesto"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {anticipos.length > 0 ? (
                        <div>
                          <span style={{ background: "#ede9fe", color: "#7c3aed", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{anticipos.length}</span>
                          <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2 }}>{parseFloat(getTotalPendiente(e.id, "ANTICIPO")).toFixed(2)}€</div>
                        </div>
                      ) : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {productos.length > 0 ? (
                        <div>
                          <span style={{ background: "#dbeafe", color: "#0284c7", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{productos.length}</span>
                          <div style={{ fontSize: 11, color: "#0284c7", marginTop: 2 }}>{parseFloat(getTotalPendiente(e.id, "PRODUCTO")).toFixed(2)}€</div>
                        </div>
                      ) : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {descuentos.length > 0 ? (
                        <div>
                          <span style={{ background: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{descuentos.length}</span>
                          <div style={{ fontSize: 11, color: "#d97706", marginTop: 2 }}>{parseFloat(getTotalPendiente(e.id, "DESCUENTO")).toFixed(2)}€</div>
                        </div>
                      ) : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 15, fontWeight: 700, color: "#dc2626" }}>{getTotalPendiente(e.id)}€</td>
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