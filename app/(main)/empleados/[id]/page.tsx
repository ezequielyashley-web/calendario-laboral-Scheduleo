"use client"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

const TABS = [
  { key: "general", label: "General" },
  { key: "fichajes", label: "Fichajes" },
  { key: "vacaciones", label: "Vacaciones" },
  { key: "bajas", label: "Bajas" },
  { key: "deudas", label: "Deudas" },
  { key: "permisos", label: "Permisos" },
  { key: "justificantes", label: "Justificantes" },
  { key: "historial", label: "Historial cargos" },
]

export default function PerfilEmpleadoPage() {
  const { id } = useParams()
  const [empleado, setEmpleado] = useState(null)
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(searchParams.get("tab") || "general")
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [form, setForm] = useState({ nombre: "", apellidos: "", dni: "", telefono: "", fechaNacimiento: "", fechaContratacion: "" })
  const [modalHistorial, setModalHistorial] = useState(null)
  const [formHistorial, setFormHistorial] = useState({ nuevoSueldo: "", porcentaje: "", puesto: "", fechaInicio: "", notas: "" })
  const [deudaDetalle, setDeudaDetalle] = useState(null)

  const cargar = () => {
    if (!id) return
    fetch(`/api/empleados/${id}`)
      .then(r => r.json())
      .then(data => {
        setEmpleado(data)
        setForm({
          nombre: data.nombre || "",
          apellidos: data.apellidos || "",
          dni: data.dni || "",
          telefono: data.telefono || "",
          fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split("T")[0] : "",
          fechaContratacion: data.fechaContratacion ? data.fechaContratacion.split("T")[0] : "",
        })
        setLoading(false)
      })
  }

  useEffect(() => { cargar() }, [id])

  const guardar = async () => {
    setGuardando(true)
    const res = await fetch(`/api/empleados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) {
      setMensaje({ texto: data.error, tipo: "error" })
    } else {
      setMensaje({ texto: "Datos guardados correctamente", tipo: "ok" })
      setEditando(false)
      cargar()
    }
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
  }

  const guardarHistorial = async () => {
    const sueldoActual = parseFloat(empleado.sueldoBase) || 0
    const nuevoSueldo = parseFloat(formHistorial.nuevoSueldo) || 0
    const pct = sueldoActual > 0 ? (((nuevoSueldo - sueldoActual) / sueldoActual) * 100).toFixed(2) : 0

    await fetch(`/api/empleados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sueldoBase: nuevoSueldo })
    })

    await fetch("/api/historial-cargo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empleadoId: id,
        empresaId: "empresa-001",
        puesto: formHistorial.puesto || empleado.puestoDeTrabajo?.nombre || "Sin puesto",
        fechaInicio: formHistorial.fechaInicio || new Date().toISOString().split("T")[0],
        sueldoAlEntrar: nuevoSueldo,
        porcentajeAumento: pct,
        notas: formHistorial.notas
      })
    })

    setModalHistorial(null)
    setMensaje({ texto: "Cambio guardado correctamente", tipo: "ok" })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
    cargar()
  }

  const eliminarHistorial = async (hid) => {
    if (!confirm("¿Eliminar este registro?")) return
    await fetch(`/api/historial-cargo?id=${hid}`, { method: "DELETE" })
    cargar()
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Cargando perfil...</div>
  if (!empleado || empleado.error) return <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>Empleado no encontrado</div>

  const horasTotales = empleado.fichajes?.reduce((s, f) => {
    if (!f.horaSalida) return s
    return s + (new Date(f.horaSalida).getTime() - new Date(f.horaEntrada).getTime()) / 3600000
  }, 0) || 0

  const tardanzas = empleado.fichajes?.filter(f => new Date(f.horaEntrada).getHours() >= 9).length || 0
  const deudasActivas = empleado.deudas?.filter(d => d.estado === "ACTIVA") || []
  const totalDeuda = deudasActivas.reduce((s, d) => s + (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)), 0)

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

      {/* Cabecera */}
      <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: totalDeuda > 0 ? 16 : 0 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 500, color: "#fff", flexShrink: 0 }}>
            {empleado.nombre[0]}{empleado.apellidos[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>{empleado.nombre} {empleado.apellidos}</h1>
            <p style={{ fontSize: 14, color: "#a0aec0", margin: "4px 0 0" }}>
              {empleado.puestoDeTrabajo?.nombre || "Sin puesto"} · {empleado.grupoTrabajo?.nombre || "Sin grupo"} · Nº {empleado.numeroEmpleado}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Sueldo base", valor: empleado.sueldoBase ? parseFloat(empleado.sueldoBase).toFixed(2) + "€" : "—" },
              { label: "Horas mes", valor: horasTotales.toFixed(0) + "h" },
              { label: "Tardanzas", valor: tardanzas },
              { label: "Deudas activas", valor: deudasActivas.length },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", background: "#f0f4ff", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: "#6366f1" }}>{s.valor}</div>
                <div style={{ fontSize: 11, color: "#a0aec0" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen deudas siempre visible */}
        {totalDeuda > 0 && (
          <div style={{ borderTop: "0.5px solid #e8eaf0", paddingTop: 14 }}>
            <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 8, fontWeight: 500 }}>DEUDAS PENDIENTES</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {deudasActivas.map(d => (
                <div key={d.id} onClick={() => setDeudaDetalle(d)}
                  style={{ background: d.tipo === "ANTICIPO" ? "#ede9fe" : d.tipo === "PRODUCTO" ? "#dbeafe" : "#fef9c3", border: `1px solid ${d.tipo === "ANTICIPO" ? "#c4b5fd" : d.tipo === "PRODUCTO" ? "#93c5fd" : "#fde047"}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: d.tipo === "ANTICIPO" ? "#6366f1" : d.tipo === "PRODUCTO" ? "#0284c7" : "#d97706" }}>{d.tipo}</div>
                    <div style={{ fontSize: 11, color: "#718096" }}>{d.descripcion}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{(parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)).toFixed(2)}€</div>
                    <div style={{ fontSize: 10, color: "#a0aec0" }}>pendiente</div>
                  </div>
                </div>
              ))}
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#991b1b" }}>Total pendiente</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>{totalDeuda.toFixed(2)}€</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e8eaf0", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "10px 18px", border: "none", background: "none", fontSize: 13, fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "#6366f1" : "#718096", borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent", marginBottom: -2, cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {mensaje.texto && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", borderRadius: 8, fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46" }}>
          {mensaje.texto}
        </div>
      )}

      {tab === "general" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Datos personales</h2>
            <button onClick={() => setEditando(!editando)}
              style={{ background: editando ? "#f3f4f6" : "#6366f1", color: editando ? "#374151" : "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {editando ? "Cancelar" : "Editar"}
            </button>
          </div>
          {editando ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
                {[
                  { label: "Nombre", key: "nombre", type: "text" },
                  { label: "Apellidos", key: "apellidos", type: "text" },
                  { label: "DNI", key: "dni", type: "text" },
                  { label: "Teléfono", key: "telefono", type: "text" },
                  { label: "Fecha nacimiento", key: "fechaNacimiento", type: "date" },
                  { label: "Fecha contratación", key: "fechaContratacion", type: "date" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", color: "#1e1b4b" }} />
                  </div>
                ))}
              </div>
              <button onClick={guardar} disabled={guardando}
                style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {[
                { label: "Nombre completo", valor: `${empleado.nombre} ${empleado.apellidos}` },
                { label: "Nº Empleado", valor: empleado.numeroEmpleado },
                { label: "DNI", valor: empleado.dni || "—" },
                { label: "Teléfono", valor: empleado.telefono || "—" },
                { label: "Fecha nacimiento", valor: empleado.fechaNacimiento ? new Date(empleado.fechaNacimiento).toLocaleDateString("es-ES") : "—" },
                { label: "Fecha contratación", valor: empleado.fechaContratacion ? new Date(empleado.fechaContratacion).toLocaleDateString("es-ES") : "—" },
                { label: "Puesto", valor: empleado.puestoDeTrabajo?.nombre || "—" },
                { label: "Grupo turno", valor: empleado.grupoTrabajo?.nombre || "—" },
              ].map(f => (
                <div key={f.label} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#1e1b4b" }}>{f.valor}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "fichajes" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f8f9ff" }}>
              {["Fecha", "Entrada", "Salida", "Horas", "Estado"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {empleado.fichajes?.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin fichajes registrados</td></tr>
              ) : empleado.fichajes?.map((f, i) => {
                const horas = f.horaSalida ? ((new Date(f.horaSalida).getTime() - new Date(f.horaEntrada).getTime()) / 3600000).toFixed(1) : "—"
                return (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(f.horaEntrada).toLocaleDateString("es-ES")}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(f.horaEntrada).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{f.horaSalida ? new Date(f.horaSalida).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{horas}h</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: f.horaSalida ? "#d1fae5" : "#fef3c7", color: f.horaSalida ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {f.horaSalida ? "Completo" : "En curso"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "vacaciones" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f8f9ff" }}>
              {["Desde", "Hasta", "Días", "Estado"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {empleado.vacaciones?.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin vacaciones registradas</td></tr>
              ) : empleado.vacaciones?.map((v, i) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(v.fechaInicio).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(v.fechaFin).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{Math.ceil((new Date(v.fechaFin).getTime() - new Date(v.fechaInicio).getTime()) / 86400000)}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: v.estado === "APROBADA" ? "#d1fae5" : v.estado === "PENDIENTE" ? "#fef3c7" : "#fee2e2", color: v.estado === "APROBADA" ? "#065f46" : v.estado === "PENDIENTE" ? "#92400e" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{v.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "bajas" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f8f9ff" }}>
              {["Tipo", "Inicio", "Fin", "Estado", "Diagnóstico"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {empleado.bajas?.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin bajas registradas</td></tr>
              ) : empleado.bajas?.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{b.tipo}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(b.fechaInicio).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{b.fechaFin ? new Date(b.fechaFin).toLocaleDateString("es-ES") : "En curso"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: b.estado === "CERRADA" ? "#d1fae5" : "#fef3c7", color: b.estado === "CERRADA" ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{b.estado}</span>
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#718096" }}>{b.diagnostico || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "deudas" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f8f9ff" }}>
              {["Tipo", "Descripción", "Total", "Pagado", "Pendiente", "Cuota", "Estado"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {empleado.deudas?.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin deudas registradas</td></tr>
              ) : empleado.deudas?.map((d, i) => (
                <tr key={d.id} onClick={() => setDeudaDetalle(d)} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f8f9ff"}>
                  <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600 }}>{d.tipo}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{d.descripcion}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{parseFloat(d.importetotal).toFixed(2)}€</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#059669" }}>{parseFloat(d.importepagado || 0).toFixed(2)}€</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{(parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)).toFixed(2)}€</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{d.numerocuotas > 1 ? `${(parseFloat(d.importetotal)/d.numerocuotas).toFixed(2)}€/mes` : "Un pago"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: d.estado === "PAGADA" ? "#d1fae5" : "#fef3c7", color: d.estado === "PAGADA" ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{d.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "permisos" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f8f9ff" }}>
              {["Fecha", "Hora", "Duración", "Motivo", "Estado"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {empleado.permisos?.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin permisos registrados</td></tr>
              ) : empleado.permisos?.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(p.fecha).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{p.hora}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{p.duracion} min</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{p.motivo}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: p.estado === "APROBADO" ? "#d1fae5" : p.estado === "PENDIENTE" ? "#fef3c7" : "#fee2e2", color: p.estado === "APROBADO" ? "#065f46" : p.estado === "PENDIENTE" ? "#92400e" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "justificantes" && (
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f8f9ff" }}>
              {["Tipo", "Descripción", "Fecha límite", "Estado"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {empleado.justificantes?.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin justificantes pendientes</td></tr>
              ) : empleado.justificantes?.map((j, i) => (
                <tr key={j.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{j.tipo}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{j.descripcion}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{j.fechaLimite ? new Date(j.fechaLimite).toLocaleDateString("es-ES") : "—"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: j.estado === "ENTREGADO" ? "#d1fae5" : "#fee2e2", color: j.estado === "ENTREGADO" ? "#065f46" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{j.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "historial" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: "12px 20px", display: "flex", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Sueldo actual</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#6366f1" }}>{empleado.sueldoBase ? parseFloat(empleado.sueldoBase).toFixed(2) + "€" : "—"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Puestos ocupados</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#1e1b4b" }}>{empleado.historialCargos?.length || 0}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setModalHistorial("sueldo"); setFormHistorial({ nuevoSueldo: String(empleado.sueldoBase || ""), porcentaje: "", puesto: "", fechaInicio: new Date().toISOString().split("T")[0], notas: "" }) }}
                style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Ajustar sueldo
              </button>
              <button onClick={() => { setModalHistorial("cargo"); setFormHistorial({ nuevoSueldo: "", porcentaje: "", puesto: "", fechaInicio: new Date().toISOString().split("T")[0], notas: "" }) }}
                style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Cambiar puesto
              </button>
            </div>
          </div>
          <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f8f9ff" }}>
                {["Puesto", "Desde", "Hasta", "Sueldo entrada", "% Aumento", "Notas", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {empleado.historialCargos?.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin historial de cargos</td></tr>
                ) : empleado.historialCargos?.map((h, i) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>{h.puesto}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(h.fechaInicio).toLocaleDateString("es-ES")}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{h.fechaFin ? new Date(h.fechaFin).toLocaleDateString("es-ES") : <span style={{ color: "#6366f1", fontWeight: 500 }}>Actual</span>}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{h.sueldoAlEntrar ? parseFloat(h.sueldoAlEntrar).toFixed(2) + "€" : "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      {h.porcentajeAumento ? (
                        <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>+{parseFloat(h.porcentajeAumento).toFixed(2)}%</span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#718096" }}>{h.notas || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <button onClick={() => eliminarHistorial(h.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal deuda detalle */}
      {deudaDetalle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>Detalle de deuda</h2>
              <button onClick={() => setDeudaDetalle(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#a0aec0" }}>✕</button>
            </div>

            <div style={{ background: "#f0f4ff", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", background: "#ede9fe", padding: "2px 8px", borderRadius: 20 }}>{deudaDetalle.tipo}</span>
                <span style={{ fontSize: 11, color: deudaDetalle.estado === "PAGADA" ? "#065f46" : "#92400e", background: deudaDetalle.estado === "PAGADA" ? "#d1fae5" : "#fef3c7", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{deudaDetalle.estado}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1e1b4b" }}>{deudaDetalle.descripcion}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Importe total", valor: parseFloat(deudaDetalle.importetotal).toFixed(2) + "€", color: "#1e1b4b" },
                { label: "Pagado", valor: parseFloat(deudaDetalle.importepagado || 0).toFixed(2) + "€", color: "#059669" },
                { label: "Pendiente", valor: (parseFloat(deudaDetalle.importetotal) - parseFloat(deudaDetalle.importepagado || 0)).toFixed(2) + "€", color: "#dc2626" },
                { label: "Cuota mensual", valor: deudaDetalle.numerocuotas > 1 ? (parseFloat(deudaDetalle.importetotal) / deudaDetalle.numerocuotas).toFixed(2) + "€" : "Pago único", color: "#6366f1" },
                { label: "Nº cuotas", valor: deudaDetalle.numerocuotas > 1 ? `${deudaDetalle.cuotaspagadas}/${deudaDetalle.numerocuotas}` : "—", color: "#1e1b4b" },
                { label: "Día de cobro", valor: `Día ${deudaDetalle.diacobro} de cada mes`, color: "#1e1b4b" },
              ].map(f => (
                <div key={f.label} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: f.color }}>{f.valor}</div>
                </div>
              ))}
            </div>

            {deudaDetalle.numerocuotas > 1 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 8 }}>Progreso de pago</div>
                <div style={{ background: "#f3f4f6", borderRadius: 8, height: 8, overflow: "hidden" }}>
                  <div style={{ background: "#6366f1", height: 8, width: `${(deudaDetalle.cuotaspagadas / deudaDetalle.numerocuotas) * 100}%`, borderRadius: 8 }}></div>
                </div>
                <div style={{ fontSize: 11, color: "#718096", marginTop: 4 }}>{deudaDetalle.cuotaspagadas} de {deudaDetalle.numerocuotas} cuotas pagadas</div>
              </div>
            )}

            {deudaDetalle.notas && (
              <div style={{ background: "#f8f9ff", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#718096" }}>
                <strong>Notas:</strong> {deudaDetalle.notas}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal historial */}
      {modalHistorial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: "#1e1b4b" }}>
              {modalHistorial === "sueldo" ? "Ajustar sueldo" : "Cambiar puesto"}
            </h2>
            {modalHistorial === "sueldo" && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f0f4ff", borderRadius: 8, fontSize: 13 }}>
                Sueldo actual: <strong>{empleado.sueldoBase ? parseFloat(empleado.sueldoBase).toFixed(2) + "€" : "No definido"}</strong>
              </div>
            )}
            {modalHistorial === "cargo" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Nuevo puesto</label>
                <input value={formHistorial.puesto} onChange={e => setFormHistorial(p => ({ ...p, puesto: e.target.value }))}
                  placeholder="Nombre del puesto"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Nuevo sueldo (€)</label>
                <input type="number" value={formHistorial.nuevoSueldo}
                  onChange={e => {
                    const nuevo = parseFloat(e.target.value) || 0
                    const actual = parseFloat(empleado.sueldoBase) || 0
                    const pct = actual > 0 ? (((nuevo - actual) / actual) * 100).toFixed(2) : ""
                    setFormHistorial(p => ({ ...p, nuevoSueldo: e.target.value, porcentaje: pct }))
                  }}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>% Aumento</label>
                <input type="number" value={formHistorial.porcentaje}
                  onChange={e => {
                    const pct = parseFloat(e.target.value) || 0
                    const actual = parseFloat(empleado.sueldoBase) || 0
                    const nuevo = actual > 0 ? (actual * (1 + pct / 100)).toFixed(2) : ""
                    setFormHistorial(p => ({ ...p, porcentaje: e.target.value, nuevoSueldo: nuevo }))
                  }}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            {formHistorial.nuevoSueldo && (
              <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13 }}>
                Nuevo sueldo: <strong style={{ color: "#6366f1" }}>{parseFloat(formHistorial.nuevoSueldo).toFixed(2)}€</strong>
                {formHistorial.porcentaje && <span style={{ color: "#059669", marginLeft: 8 }}>({parseFloat(formHistorial.porcentaje) > 0 ? "+" : ""}{parseFloat(formHistorial.porcentaje).toFixed(2)}%)</span>}
              </div>
            )}
            {modalHistorial === "cargo" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Fecha inicio</label>
                <input type="date" value={formHistorial.fechaInicio} onChange={e => setFormHistorial(p => ({ ...p, fechaInicio: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Notas</label>
              <textarea value={formHistorial.notas} onChange={e => setFormHistorial(p => ({ ...p, notas: e.target.value }))} rows={2}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModalHistorial(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarHistorial} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
