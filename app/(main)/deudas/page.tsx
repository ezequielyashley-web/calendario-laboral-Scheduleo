"use client"


import { useState, useEffect } from "react"

const TIPOS = ["ANTICIPO", "PRODUCTO", "DESCUENTO"]

function DeudasInner() {
  const [empleados, setEmpleados] = useState([])
  const [deudas, setDeudas] = useState([])
  const [limites, setLimites] = useState([])
  const [empleadoSel, setEmpleadoSel] = useState(null)
  const [tab, setTab] = useState("deudas")
  const [modal, setModal] = useState(null)
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [form, setForm] = useState({ tipo: "ANTICIPO", descripcion: "", importeTotal: "", numeroCuotas: 1, diaCobro: 1, notas: "" })
  const [pagoForm, setPagoForm] = useState({ deudaId: "", importe: "", notas: "" })
  const [limiteForm, setLimiteForm] = useState({ limite: "", esGeneral: false })

  const cargar = async () => {
    const [e, d, l] = await Promise.all([
      fetch("/api/empleados?empresaId=empresa-001").then(r => r.json()),
      fetch("/api/deudas?empresaId=empresa-001").then(r => r.json()),
      fetch("/api/deudas/limite?empresaId=empresa-001").then(r => r.json()),
    ])
    setEmpleados(Array.isArray(e) ? e : [])
    setDeudas(Array.isArray(d) ? d : [])
    setLimites(Array.isArray(l) ? l : [])
  }

  useEffect(() => { cargar() }, [])

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000)
  }

  const deudasEmpleado = deudas.filter(d => d.empleadoId === empleadoSel?.id)
  const limiteEmpleado = limites.find(l => l.empleadoId === empleadoSel?.id) || limites.find(l => l.esGeneral)

  const crearDeuda = async () => {
    if (!empleadoSel) return
    const res = await fetch("/api/deudas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, empleadoId: empleadoSel.id, empresaId: "empresa-001", importeTotal: parseFloat(form.importeTotal) })
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
    if (!empleadoSel && !limiteForm.esGeneral) return
    const res = await fetch("/api/deudas/limite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: limiteForm.esGeneral ? null : empleadoSel?.id, empresaId: "empresa-001", limite: parseFloat(limiteForm.limite), esGeneral: limiteForm.esGeneral })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Límite guardado")
    setModal(null)
    cargar()
  }

  const porPuesto = empleados.reduce((acc, e) => {
    const puesto = e.puestoDeTrabajo?.nombre || "Sin puesto"
    if (!acc[puesto]) acc[puesto] = []
    acc[puesto].push(e)
    return acc
  }, {})

  const getEstadoStyle = (estado) => {
    if (estado === "PAGADA") return { background: "#d1fae5", color: "#065f46" }
    if (estado === "CANCELADA") return { background: "#fee2e2", color: "#991b1b" }
    return { background: "#fef3c7", color: "#92400e" }
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f1f5f9" }}>
      {/* Panel izquierdo - Lista empleados */}
      <div style={{ width: 280, background: "#fff", borderRight: "1px solid #e5e7eb", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0284c7", margin: 0 }}>Empleados</h2>
        </div>
        {Object.entries(porPuesto).map(([puesto, emps]) => (
          <div key={puesto}>
            <div style={{ padding: "8px 16px", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>
              {puesto}
            </div>
            {emps.map(e => {
              const deudasEmp = deudas.filter(d => d.empleadoId === e.id && d.estado === "ACTIVA")
              const seleccionado = empleadoSel?.id === e.id
              return (
                <div key={e.id} onClick={() => setEmpleadoSel(e)}
                  style={{ padding: "10px 16px", cursor: "pointer", background: seleccionado ? "#eff6ff" : "#fff", borderLeft: seleccionado ? "3px solid #0284c7" : "3px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: seleccionado ? 600 : 400, color: "#111827" }}>{e.nombre} {e.apellidos}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{e.grupoTrabajo?.nombre || "Sin grupo"}</div>
                  </div>
                  {deudasEmp.length > 0 && (
                    <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>
                      {deudasEmp.length}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Panel derecho */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {!empleadoSel ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 15 }}>
            Selecciona un empleado para ver sus deudas
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>{empleadoSel.nombre} {empleadoSel.apellidos}</h1>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                  {empleadoSel.puestoDeTrabajo?.nombre || "Sin puesto"} · {empleadoSel.grupoTrabajo?.nombre || "Sin grupo"}
                  {limiteEmpleado && <span style={{ marginLeft: 8, color: "#7c3aed", fontWeight: 600 }}>Límite anticipo: {parseFloat(limiteEmpleado.limite).toFixed(2)}€</span>}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setModal("limite"); setLimiteForm({ limite: limiteEmpleado?.limite || "", esGeneral: false }) }}
                  style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Límite
                </button>
                <button onClick={() => { setModal("crear"); setForm({ tipo: "ANTICIPO", descripcion: "", importeTotal: "", numeroCuotas: 1, diaCobro: 1, notas: "" }) }}
                  style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  + Nueva deuda
                </button>
              </div>
            </div>

            {mensaje.texto && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", borderRadius: 4, fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46" }}>
                {mensaje.texto}
              </div>
            )}

            {/* Resumen */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total deuda", valor: deudasEmpleado.reduce((s, d) => s + parseFloat(d.importeTotal), 0).toFixed(2) + "€", color: "#dc2626" },
                { label: "Pagado", valor: deudasEmpleado.reduce((s, d) => s + parseFloat(d.importePagado), 0).toFixed(2) + "€", color: "#059669" },
                { label: "Pendiente", valor: deudasEmpleado.reduce((s, d) => s + (parseFloat(d.importeTotal) - parseFloat(d.importePagado)), 0).toFixed(2) + "€", color: "#d97706" },
              ].map(c => (
                <div key={c.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.valor}</div>
                </div>
              ))}
            </div>

            {/* Tabla deudas */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Tipo", "Descripción", "Total", "Pagado", "Pendiente", "Cuota", "Día cobro", "Estado", ""].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deudasEmpleado.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin deudas registradas</td></tr>
                  ) : deudasEmpleado.map((d, i) => (
                    <tr key={d.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                      <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600 }}>{d.tipo}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{d.descripcion}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{parseFloat(d.importeTotal).toFixed(2)}€</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#059669" }}>{parseFloat(d.importePagado).toFixed(2)}€</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{(parseFloat(d.importeTotal) - parseFloat(d.importePagado)).toFixed(2)}€</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{d.numeroCuotas > 1 ? `${(parseFloat(d.importeTotal) / d.numeroCuotas).toFixed(2)}€` : "Un pago"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>Día {d.diaCobro}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ ...getEstadoStyle(d.estado), padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{d.estado}</span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {d.estado === "ACTIVA" && (
                          <button onClick={() => { setModal("pago"); setPagoForm({ deudaId: d.id, importe: (parseFloat(d.importeTotal) / d.numeroCuotas).toFixed(2), notas: "" }) }}
                            style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal crear deuda */}
      {modal === "crear" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Nueva deuda — {empleadoSel?.nombre}</h2>
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
                placeholder="Ej: Anticipo nómina, Merluza 2kg..."
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Importe (€)</label>
                <input type="number" value={form.importeTotal} onChange={e => setForm(p => ({ ...p, importeTotal: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Nº cuotas</label>
                <input type="number" min={1} value={form.numeroCuotas} onChange={e => setForm(p => ({ ...p, numeroCuotas: parseInt(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Día cobro</label>
                <input type="number" min={1} max={31} value={form.diaCobro} onChange={e => setForm(p => ({ ...p, diaCobro: parseInt(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            {form.importeTotal && form.numeroCuotas > 1 && (
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 4, padding: "8px 12px", marginBottom: 12, fontSize: 13 }}>
                Cuota: <strong>{(parseFloat(form.importeTotal) / form.numeroCuotas).toFixed(2)}€/mes</strong> · Cobro el día <strong>{form.diaCobro}</strong>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Notas</label>
              <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={2}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={crearDeuda} style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pago */}
      {modal === "pago" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: 380, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Registrar pago</h2>
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

      {/* Modal límite */}
      {modal === "limite" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: 380, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Límite anticipo — {empleadoSel?.nombre}</h2>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="general" checked={limiteForm.esGeneral} onChange={e => setLimiteForm(p => ({ ...p, esGeneral: e.target.checked }))} />
              <label htmlFor="general" style={{ fontSize: 14 }}>Aplicar a todos los empleados</label>
            </div>
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

export default function DeudasPage() { return <DeudasInner /> }
