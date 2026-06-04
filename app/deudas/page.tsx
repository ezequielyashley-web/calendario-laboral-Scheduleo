"use client"
import { useState, useEffect } from "react"

const TIPOS = ["ANTICIPO", "PRODUCTO", "DESCUENTO"]

export default function DeudasPage() {
  const [deudas, setDeudas] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [limites, setLimites] = useState([])
  const [tab, setTab] = useState("deudas")
  const [modal, setModal] = useState(null)
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [form, setForm] = useState({ empleadoId: "", tipo: "ANTICIPO", descripcion: "", importeTotal: "", numeroCuotas: 1, diaCobro: 1, notas: "" })
  const [pagoForm, setPagoForm] = useState({ deudaId: "", importe: "", notas: "" })
  const [limiteForm, setLimiteForm] = useState({ empleadoId: "", limite: "", esGeneral: false })

  const cargar = async () => {
    const [d, e, l] = await Promise.all([
      fetch("/api/deudas?empresaId=empresa-001").then(r => r.json()),
      fetch("/api/empleados?empresaId=empresa-001").then(r => r.json()),
      fetch("/api/deudas/limite?empresaId=empresa-001").then(r => r.json()),
    ])
    setDeudas(Array.isArray(d) ? d : [])
    setEmpleados(Array.isArray(e) ? e : [])
    setLimites(Array.isArray(l) ? l : [])
  }

  useEffect(() => { cargar() }, [])

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000)
  }

  const crearDeuda = async () => {
    const res = await fetch("/api/deudas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, empresaId: "empresa-001", importeTotal: parseFloat(form.importeTotal) })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Deuda creada correctamente")
    setModal(null)
    cargar()
  }

  const registrarPago = async () => {
    const res = await fetch("/api/deudas/pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pagoForm, importe: parseFloat(pagoForm.importe) })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Pago registrado")
    setModal(null)
    cargar()
  }

  const guardarLimite = async () => {
    const res = await fetch("/api/deudas/limite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...limiteForm, empresaId: "empresa-001", limite: parseFloat(limiteForm.limite) })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Límite guardado")
    setModal(null)
    cargar()
  }

  const getEstadoStyle = (estado) => {
    if (estado === "PAGADA") return { bg: "#d1fae5", color: "#065f46" }
    if (estado === "CANCELADA") return { bg: "#fee2e2", color: "#991b1b" }
    return { bg: "#fef3c7", color: "#92400e" }
  }

  const pendiente = (d) => (parseFloat(d.importeTotal) - parseFloat(d.importePagado)).toFixed(2)
  const cuotaMensual = (d) => (parseFloat(d.importeTotal) / d.numeroCuotas).toFixed(2)

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0284c7", margin: 0 }}>Deudas y Anticipos</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setModal("limite"); setLimiteForm({ empleadoId: "", limite: "", esGeneral: false }) }}
            style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Límites
          </button>
          <button onClick={() => { setModal("crear"); setForm({ empleadoId: "", tipo: "ANTICIPO", descripcion: "", importeTotal: "", numeroCuotas: 1, diaCobro: 1, notas: "" }) }}
            style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Nueva deuda
          </button>
        </div>
      </div>

      {mensaje.texto && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", border: `1px solid ${mensaje.tipo === "error" ? "#fca5a5" : "#6ee7b7"}`, borderRadius: 4, fontSize: 14, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46" }}>
          {mensaje.texto}
        </div>
      )}

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #e5e7eb" }}>
        {["deudas", "limites"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", border: "none", background: "none", fontSize: 14, fontWeight: tab === t ? 700 : 400, color: tab === t ? "#0284c7" : "#6b7280", borderBottom: tab === t ? "2px solid #0284c7" : "2px solid transparent", marginBottom: -2, cursor: "pointer" }}>
            {t === "deudas" ? "Deudas activas" : "Límites anticipo"}
          </button>
        ))}
      </div>

      {tab === "deudas" && (
        <div style={{ background: "#fff", border: "1px solid #b8c4d8", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Empleado", "Tipo", "Descripción", "Total", "Pagado", "Pendiente", "Cuota/mes", "Día cobro", "Estado", ""].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deudas.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No hay deudas registradas</td></tr>
              ) : deudas.map((d, i) => {
                const estilo = getEstadoStyle(d.estado)
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500 }}>{d.empleado_nombre || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12 }}>{d.tipo}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{d.descripcion}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{parseFloat(d.importeTotal).toFixed(2)}€</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#059669" }}>{parseFloat(d.importePagado).toFixed(2)}€</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{pendiente(d)}€</td>
                    <td style={{ padding: "10px 12px", fontSize: 13 }}>{d.numeroCuotas > 1 ? `${cuotaMensual(d)}€` : "Un pago"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13 }}>Día {d.diaCobro}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ ...estilo, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{d.estado}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {d.estado === "ACTIVA" && (
                        <button onClick={() => { setModal("pago"); setPagoForm({ deudaId: d.id, importe: cuotaMensual(d), notas: "" }) }}
                          style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "limites" && (
        <div style={{ background: "#fff", border: "1px solid #b8c4d8", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Empleado", "Límite anticipo", "Tipo"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limites.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No hay límites configurados</td></tr>
              ) : limites.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14 }}>{l.esGeneral ? "Todos los empleados" : (l.empleado_nombre || "—")}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600 }}>{parseFloat(l.limite).toFixed(2)}€</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: l.esGeneral ? "#dbeafe" : "#d1fae5", color: l.esGeneral ? "#1e40af" : "#065f46", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {l.esGeneral ? "General" : "Individual"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === "crear" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 500, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nueva deuda / anticipo</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Empleado</label>
              <select value={form.empleadoId} onChange={e => setForm(p => ({ ...p, empleadoId: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14 }}>
                <option value="">Seleccionar empleado</option>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Tipo</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14 }}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Descripción</label>
              <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Ej: Anticipo nómina julio, Merluza 2kg..."
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Importe total (€)</label>
                <input type="number" value={form.importeTotal} onChange={e => setForm(p => ({ ...p, importeTotal: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Nº cuotas</label>
                <input type="number" min={1} value={form.numeroCuotas} onChange={e => setForm(p => ({ ...p, numeroCuotas: parseInt(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Día de cobro</label>
                <input type="number" min={1} max={31} value={form.diaCobro} onChange={e => setForm(p => ({ ...p, diaCobro: parseInt(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            {form.importeTotal && form.numeroCuotas > 1 && (
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 4, padding: "10px 12px", marginBottom: 12, fontSize: 13 }}>
                Cuota mensual: <strong>{(parseFloat(form.importeTotal) / form.numeroCuotas).toFixed(2)}€</strong> — Se cobrará el día <strong>{form.diaCobro}</strong> de cada mes
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Notas</label>
              <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                rows={2} style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={crearDeuda} style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {modal === "pago" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 400, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Registrar pago</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Importe (€)</label>
              <input type="number" value={pagoForm.importe} onChange={e => setPagoForm(p => ({ ...p, importe: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Notas</label>
              <input value={pagoForm.notas} onChange={e => setPagoForm(p => ({ ...p, notas: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={registrarPago} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Registrar</button>
            </div>
          </div>
        </div>
      )}

      {modal === "limite" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 420, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Configurar límite de anticipo</h2>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="general" checked={limiteForm.esGeneral} onChange={e => setLimiteForm(p => ({ ...p, esGeneral: e.target.checked, empleadoId: "" }))} />
              <label htmlFor="general" style={{ fontSize: 14 }}>Aplicar a todos los empleados</label>
            </div>
            {!limiteForm.esGeneral && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Empleado</label>
                <select value={limiteForm.empleadoId} onChange={e => setLimiteForm(p => ({ ...p, empleadoId: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14 }}>
                  <option value="">Seleccionar empleado</option>
                  {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Límite máximo (€)</label>
              <input type="number" value={limiteForm.limite} onChange={e => setLimiteForm(p => ({ ...p, limite: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarLimite} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}