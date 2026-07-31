"use client"

import React, { useState, useEffect } from "react"
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

  return (
    <div className="deudas-responsive-wrap" style={{ padding: 24, maxWidth: 1100, margin: "0 auto", background: "rgba(255,255,255,0.92)", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <style>{`
        @media (max-width: 768px) {
          .deudas-responsive-wrap { padding: 14px !important; }
          .deudas-header-responsive { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .deudas-header-responsive input { width: 100% !important; box-sizing: border-box !important; }
          .deudas-kpis-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .deudas-kpis-grid > div { min-width: 0 !important; overflow: hidden !important; }
          .deudas-kpis-grid > div > div { white-space: normal !important; word-break: break-word !important; }
          .deudas-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
          .deudas-table-wrap table { min-width: 600px !important; }
        }
      `}</style>
      <div className="deudas-header-responsive" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", margin: 0 }}>Deudas y Anticipos</h1>
          <p style={{ fontSize: 13, color: "#a0aec0", margin: "4px 0 0" }}>{empleadosConDeudas.length} empleados con deudas activas</p>
        </div>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar empleado..."
          style={{ padding: "8px 14px", border: "0.5px solid #e8eaf0", borderRadius: 8, fontSize: 13, width: 200, outline: "none", background: "#fff", color: "#1e1b4b" }} />
      </div>

      <div className="deudas-kpis-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total pendiente", valor: totalPendiente.toFixed(2) + "€", color: "#dc2626", bg: "#fee2e2" },
          { label: "Anticipos", valor: totalAnticipos.toFixed(2) + "€", color: "var(--accent)", bg: "var(--accent-dim)" },
          { label: "Productos", valor: totalProductos.toFixed(2) + "€", color: "var(--accent)", bg: "var(--accent-dim)" },
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
      ) : empleadosConDeudas.length === 0 ? (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 40, textAlign: "center", color: "#a0aec0" }}>No hay empleados con deudas activas</div>
      ) : (
        <div className="deudas-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 12 }}>
          {empleadosConDeudas.map((e) => {
            const pAnticipo = getPendiente(e.id, "ANTICIPO")
            const pProducto = getPendiente(e.id, "PRODUCTO")
            const pDescuento = getPendiente(e.id, "DESCUENTO")
            const total = getPendiente(e.id)

            return (
              <div key={e.id}
                onClick={() => router.push(`/empleados/${e.id}?tab=deudas`)}
                style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={el => el.currentTarget.style.background = "var(--accent-dim)"}
                onMouseLeave={el => el.currentTarget.style.background = "#fff"}
              >
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,var(--paleta-grad-inicio),var(--paleta-grad-fin))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                  {e.nombre[0]}{e.apellidos[0]}
                </div>
                <div style={{ minWidth: 130, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.nombre} {e.apellidos}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>Nº {e.numeroEmpleado}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
                  {pAnticipo > 0 && <span style={{ background: "var(--accent-dim)", color: "var(--accent)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>Anticipo {pAnticipo.toFixed(2)}€</span>}
                  {pProducto > 0 && <span style={{ background: "var(--accent-dim)", color: "var(--accent)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>Producto {pProducto.toFixed(2)}€</span>}
                  {pDescuento > 0 && <span style={{ background: "#fef9c3", color: "#d97706", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>Descuento {pDescuento.toFixed(2)}€</span>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>{total.toFixed(2)}€</div>
                  <div style={{ fontSize: 10, color: "#a0aec0" }}>pendiente</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}