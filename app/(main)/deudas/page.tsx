"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DeudasPage() {
  const router = useRouter()
  const [deudas, setDeudas] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [expandido, setExpandido] = useState(null)

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
  const totalPendiente = activas.reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0)
  const totalAnticipos = activas.filter(d => d.tipo === "ANTICIPO").reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0)
  const totalProductos = activas.filter(d => d.tipo === "PRODUCTO").reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0)
  const totalDescuentos = activas.filter(d => d.tipo === "DESCUENTO").reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0)

  const empleadosConDeudas = empleados.filter(e =>
    (deudasPorEmpleado[e.id] || []).some(d => d.estado === "ACTIVA")
  ).filter(e =>
    `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getPendiente = (empId, tipo = null) => {
    const ds = (deudasPorEmpleado[empId] || []).filter(d => d.estado === "ACTIVA" && (tipo ? d.tipo === tipo : true))
    return ds.reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0)
  }

  const getDeudas = (empId, tipo) => (deudasPorEmpleado[empId] || []).filter(d => d.estado === "ACTIVA" && d.tipo === tipo)

  const tipoBg = { ANTICIPO: "#ede9fe", PRODUCTO: "#dbeafe", DESCUENTO: "#fef9c3" }
  const tipoColor = { ANTICIPO: "#6366f1", PRODUCTO: "#0284c7", DESCUENTO: "#d97706" }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Deudas y Anticipos</h1>
          <p style={{ fontSize: 13, color: "#a0aec0", margin: "4px 0 0" }}>{empleadosConDeudas.length} empleados con deudas activas</p>
        </div>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar empleado..."
          style={{ padding: "8px 14px", border: "0.5px solid #e8eaf0", borderRadius: 8, fontSize: 13, width: 200, outline: "none", background: "#fff", color: "#1e1b4b" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total pendiente", valor: totalPendiente.toFixed(2) + "€", color: "#dc2626", bg: "#fee2e2" },
          { label: "Anticipos", valor: totalAnticipos.toFixed(2) + "€", color: "#6366f1", bg: "#ede9fe" },
          { label: "Productos", valor: totalProductos.toFixed(2) + "€", color: "#0284c7", bg: "#dbeafe" },
          { label: "Descuentos", valor: totalDescuentos.toFixed(2) + "€", color: "#d97706", bg: "#fef9c3" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: k.color, fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: k.color }}>{k.valor}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#a0aec0" }}>Cargando...</div>
      ) : (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9ff" }}>
                {["Empleado", "Anticipo", "Producto", "Descuento", "Total pendiente", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: h === "Total pendiente" ? "right" : h === "" ? "center" : "left", fontSize: 12, fontWeight: 500, color: "#718096", borderBottom: "0.5px solid #e8eaf0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleadosConDeudas.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>No hay empleados con deudas activas</td></tr>
              ) : empleadosConDeudas.map((e, i) => {
                const isOpen = expandido === e.id
                const anticipos = getDeudas(e.id, "ANTICIPO")
                const productos = getDeudas(e.id, "PRODUCTO")
                const descuentos = getDeudas(e.id, "DESCUENTO")
                const pAnticipo = getPendiente(e.id, "ANTICIPO")
                const pProducto = getPendiente(e.id, "PRODUCTO")
                const pDescuento = getPendiente(e.id, "DESCUENTO")
                const total = getPendiente(e.id)

                return (
                  <React.Fragment key={e.id}>
                    <tr
                      onClick={() => {
                        if (expandido === e.id) {
                          router.push(`/empleados/${e.id}?tab=deudas`)
                        } else {
                          setExpandido(e.id)
                        }
                      }}
                      style={{ borderBottom: isOpen ? "none" : "0.5px solid #f3f4f6", background: isOpen ? "#f8f9ff" : i % 2 === 0 ? "#fff" : "#fafafa", cursor: "pointer" }}
                      onMouseEnter={el => { if (!isOpen) el.currentTarget.style.background = "#f0f4ff" }}
                      onMouseLeave={el => { if (!isOpen) el.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa" }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                            {e.nombre[0]}{e.apellidos[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b" }}>{e.nombre} {e.apellidos}</div>
                            <div style={{ fontSize: 11, color: "#a0aec0" }}>Nº {e.numeroEmpleado}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {pAnticipo > 0 ? <span style={{ background: "#ede9fe", color: "#6366f1", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{pAnticipo.toFixed(2)}€</span> : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {pProducto > 0 ? <span style={{ background: "#dbeafe", color: "#0284c7", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{pProducto.toFixed(2)}€</span> : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {pDescuento > 0 ? <span style={{ background: "#fef9c3", color: "#d97706", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{pDescuento.toFixed(2)}€</span> : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 15, fontWeight: 500, color: "#dc2626" }}>{total.toFixed(2)}€</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: "#a0aec0" }}>{isOpen ? "▲" : "▼"}</td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={6} style={{ padding: "0 16px 16px", background: "#f8f9ff", borderBottom: "0.5px solid #e8eaf0" }}>
                          <div style={{ paddingTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                              <button
                                onClick={ev => { ev.stopPropagation(); router.push(`/empleados/${e.id}?tab=deudas`) }}
                                style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                                Ver perfil completo →
                              </button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                              {[...anticipos, ...productos, ...descuentos].map(d => (
                                <div key={d.id} style={{ background: tipoBg[d.tipo], borderRadius: 10, padding: "12px 14px" }}>
                                  <div style={{ fontSize: 11, color: tipoColor[d.tipo], fontWeight: 500, marginBottom: 4 }}>{d.tipo}</div>
                                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b", marginBottom: 4 }}>{d.descripcion}</div>
                                  <div style={{ fontSize: 11, color: "#718096", marginBottom: 8 }}>
                                    {d.numerocuotas > 1 ? `${d.cuotaspagadas}/${d.numerocuotas} cuotas · ${(parseFloat(d.importetotal)/d.numerocuotas).toFixed(2)}€/mes` : "Pago único"} · Día {d.diacobro}
                                  </div>
                                  <div style={{ fontSize: 15, fontWeight: 500, color: "#dc2626" }}>
                                    {(parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)).toFixed(2)}€ pendiente
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}