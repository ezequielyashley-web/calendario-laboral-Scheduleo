"use client"
import BannerEstadoEmpleado from "@/components/BannerEstadoEmpleado"
import CalendarioEmpleado from "@/components/CalendarioEmpleado"
import CalendarioAsuntosPropios from "@/components/vacaciones/CalendarioAsuntosPropios"
import React from "react"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

const TABS = [
  { key: "general", label: "General" },
  { key: "fichajes", label: "Fichajes" },
  { key: "vacaciones", label: "Vacaciones" },
  { key: "asuntos_propios", label: "Asuntos propios" },
  { key: "bajas", label: "Bajas" },
  { key: "deudas", label: "Deudas" },
  { key: "permisos", label: "Permisos" },
  { key: "justificantes", label: "Justificantes" },
  { key: "historial", label: "Historial cargos" },
  { key: "calendario", label: "Calendario laboral" },
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
  const [modalDeuda, setModalDeuda] = useState(null)
  const [formDeuda, setFormDeuda] = useState({ estado: "", fechaAprobacion: "", fechaPago: "", aprobadoPor: "", metodoPago: "EFECTIVO", porcentajeCobro: "", notas: "", importePagado: "" })
  const [pagoTipo, setPagoTipo] = useState("importe")
  const [modalVacacion, setModalVacacion] = useState<string | null>(null)
  const [formVacacion, setFormVacacion] = useState({ fechaInicio: "", fechaFin: "", observaciones: "" })
  const [loadingVacacion, setLoadingVacacion] = useState(false)

  const gestionarVacacion = async (vid: string, estado: string) => {
    if (!confirm(`¿${estado === "APROBADA" ? "Aprobar" : "Rechazar"} esta solicitud?`)) return
    const res = await fetch(`/api/vacaciones/${vid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    if (res.ok) { setMensaje({ texto: `Vacación ${estado === "APROBADA" ? "aprobada" : "rechazada"} correctamente`, tipo: "ok" }); cargar() }
    else { setMensaje({ texto: "Error al actualizar", tipo: "error" }) }
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
  }

  const eliminarVacacion = async (vid: string) => {
    if (!confirm("¿Eliminar esta solicitud?")) return
    const res = await fetch(`/api/vacaciones/${vid}`, { method: "DELETE" })
    if (res.ok) { setMensaje({ texto: "Solicitud eliminada", tipo: "ok" }); cargar() }
    else { const d = await res.json(); setMensaje({ texto: d.error || "Error al eliminar", tipo: "error" }) }
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
  }

  const crearVacacion = async () => {
    setLoadingVacacion(true)
    const res = await fetch("/api/vacaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: id, ...formVacacion }),
    })
    const data = await res.json()
    setLoadingVacacion(false)
    if (res.ok) {
      setModalVacacion(null)
      setFormVacacion({ fechaInicio: "", fechaFin: "", observaciones: "" })
      setMensaje({ texto: "Solicitud creada correctamente", tipo: "ok" })
      cargar()
    } else {
      setMensaje({ texto: data.error || "Error al crear", tipo: "error" })
    }
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
  }

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

  const guardarDeuda = async () => {
    const body: any = { id: modalDeuda.id }
    if (formDeuda.estado) body.estado = formDeuda.estado
    if (formDeuda.fechaAprobacion) body.fechaAprobacion = new Date(formDeuda.fechaAprobacion).toISOString()
    if (formDeuda.fechaPago) body.fechaPago = new Date(formDeuda.fechaPago).toISOString()
    if (formDeuda.aprobadoPor) body.aprobadoPor = formDeuda.aprobadoPor
    if (formDeuda.metodoPago) body.metodoPago = formDeuda.metodoPago
    if (formDeuda.notas) body.notas = formDeuda.notas

    const pagadoActual = parseFloat(modalDeuda.importepagado || 0)
    const total = parseFloat(modalDeuda.importetotal)

    if (pagoTipo === "importe" && formDeuda.importePagado) {
      const nuevoPagado = pagadoActual + parseFloat(formDeuda.importePagado)
      body.importePagado = nuevoPagado
      body.cuotasPagadas = (modalDeuda.cuotaspagadas || 0) + 1
      if (nuevoPagado >= total) body.estado = "PAGADA"
    }
    if (pagoTipo === "porcentaje" && formDeuda.porcentajeCobro) {
      const pct = parseFloat(formDeuda.porcentajeCobro) / 100
      const nuevoPagado = pagadoActual + (total * pct)
      body.importePagado = nuevoPagado
      body.porcentajeCobro = parseFloat(formDeuda.porcentajeCobro)
      if (nuevoPagado >= total) body.estado = "PAGADA"
    }
    if (pagoTipo === "cuota" && modalDeuda.numerocuotas > 1) {
      const cuota = total / modalDeuda.numerocuotas
      const nuevoPagado = pagadoActual + cuota
      body.importePagado = nuevoPagado
      body.cuotasPagadas = (modalDeuda.cuotaspagadas || 0) + 1
      if (nuevoPagado >= total) body.estado = "PAGADA"
    }

    await fetch("/api/deudas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    setModalDeuda(null)
    setMensaje({ texto: "Deuda actualizada correctamente", tipo: "ok" })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
    cargar()
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

  const esDemo = empleado.esDemostracion === true || empleado.esdemostration === true || empleado.esdemostración === true || String(empleado.esDemostracion) === "true"
  const horasTotales = empleado.fichajes?.reduce((s, f) => {
    if (!f.horaSalida) return s
    return s + (new Date(f.horaSalida).getTime() - new Date(f.horaEntrada).getTime()) / 3600000
  }, 0) || 0

  const tardanzas = empleado.fichajes?.filter(f => new Date(f.horaEntrada).getHours() >= 9).length || 0
  const deudasActivas = empleado.deudas?.filter(d => d.estado === "ACTIVA") || []

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

      {esDemo && (
        <div style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 14, padding: "14px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 24 }}>🧪</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Empleado de demostración</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Este empleado es ficticio. Sus datos, fichajes, vacaciones, bajas y deudas son de prueba y no corresponden a personas reales.</div>
          </div>
          <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>MODO DEMO</span>
        </div>
      )}
      <BannerEstadoEmpleado empleado={empleado} />
      <div style={{ background: esDemo ? "#fffbeb" : "#fff", border: esDemo ? "1px solid #fcd34d" : "0.5px solid #e8eaf0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
      </div>

      <div className="tabs-scroll" style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e8eaf0", overflowX: "auto" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Días asignados", valor: empleado.diasVacaciones ?? 22, color: "#6366f1", bg: "#ede9fe" },
              { label: "Aprobados", valor: empleado.vacaciones?.filter(v => v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0) || 0, color: "#059669", bg: "#d1fae5" },
              { label: "Pendientes", valor: empleado.vacaciones?.filter(v => v.estado === "PENDIENTE").reduce((s,v) => s + v.diasTotales, 0) || 0, color: "#d97706", bg: "#fef3c7" },
              { label: "Disponibles", valor: (empleado.diasVacaciones ?? 22) - (empleado.vacaciones?.filter(v => v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0) || 0), color: "#0284c7", bg: "#dbeafe" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.valor}</div>
                <div style={{ fontSize: 11, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Botón nueva solicitud */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>Solicitudes de vacaciones</h3>
            <button onClick={() => setModalVacacion("nueva")}
              style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              + Nueva solicitud
            </button>
          </div>

          {/* Tabla vacaciones */}
          <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f8f9ff" }}>
                {["Desde", "Hasta", "Días", "Estado", "Observaciones", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {!empleado.vacaciones?.length ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin vacaciones registradas</td></tr>
                ) : empleado.vacaciones?.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(v.fechaInicio).toLocaleDateString("es-ES")}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(v.fechaFin).toLocaleDateString("es-ES")}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{v.diasTotales}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: v.estado === "APROBADA" ? "#d1fae5" : v.estado === "PENDIENTE" ? "#fef3c7" : "#fee2e2", color: v.estado === "APROBADA" ? "#065f46" : v.estado === "PENDIENTE" ? "#92400e" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{v.estado}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#718096" }}>{v.observaciones || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {v.estado === "PENDIENTE" && (
                          <>
                            <button onClick={() => gestionarVacacion(v.id, "APROBADA")}
                              style={{ background: "#d1fae5", color: "#065f46", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              Aprobar
                            </button>
                            <button onClick={() => gestionarVacacion(v.id, "RECHAZADA")}
                              style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              Rechazar
                            </button>
                          </>
                        )}
                        {v.estado !== "APROBADA" && (
                          <button onClick={() => eliminarVacacion(v.id)}
                            style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === "asuntos_propios" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Stats asuntos propios */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Total (Art.37.3 ET)", valor: empleado.diasAsuntosPropios ?? 6, color: "#9d174d", bg: "#fce7f3" },
              { label: "Aprobados", valor: empleado.vacaciones?.filter(v => v.tipo === "ASUNTOS_PROPIOS" && v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0) || 0, color: "#065f46", bg: "#d1fae5" },
              { label: "Pendientes", valor: empleado.vacaciones?.filter(v => v.tipo === "ASUNTOS_PROPIOS" && v.estado === "PENDIENTE").reduce((s,v) => s + v.diasTotales, 0) || 0, color: "#92400e", bg: "#fef3c7" },
              { label: "Disponibles", valor: (empleado.diasAsuntosPropios ?? 6) - (empleado.vacaciones?.filter(v => v.tipo === "ASUNTOS_PROPIOS" && v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0) || 0), color: "#6d28d9", bg: "#ede9fe" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.valor}</div>
                <div style={{ fontSize: 11, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Nota legal */}
          <div style={{ background: "#fce7f3", border: "1px solid #f9a8d4", borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9d174d", margin: "0 0 4px" }}>📋 Art. 37.3 Estatuto de los Trabajadores</p>
            <p style={{ fontSize: 12, color: "#831843", margin: 0 }}>Los trabajadores tienen derecho a 6 días de asuntos propios al año retribuidos. No son acumulables al año siguiente. No pueden solicitarse en fines de semana, festivos, ni días adyacentes a libranzas, festivos o cumpleaños.</p>
          </div>

          {/* Botón solicitar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>Solicitudes de asuntos propios</h3>
            <button onClick={() => setModalVacacion("asuntos_propios")}
              style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              + Solicitar días
            </button>
          </div>

          {/* Tabla asuntos propios */}
          <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f8f9ff" }}>
                {["Fecha", "Días", "Estado", "Observaciones", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {!empleado.vacaciones?.filter(v => v.tipo === "ASUNTOS_PROPIOS").length ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#a0aec0" }}>Sin solicitudes de asuntos propios</td></tr>
                ) : empleado.vacaciones?.filter(v => v.tipo === "ASUNTOS_PROPIOS").map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(v.fechaInicio).toLocaleDateString("es-ES")}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{v.diasTotales}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: v.estado === "APROBADA" ? "#d1fae5" : v.estado === "PENDIENTE" ? "#fef3c7" : "#fee2e2", color: v.estado === "APROBADA" ? "#065f46" : v.estado === "PENDIENTE" ? "#92400e" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{v.estado}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#718096" }}>{v.observaciones || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {v.estado === "PENDIENTE" && (
                          <>
                            <button onClick={() => gestionarVacacion(v.id, "APROBADA")}
                              style={{ background: "#d1fae5", color: "#065f46", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              Aprobar
                            </button>
                            <button onClick={() => gestionarVacacion(v.id, "RECHAZADA")}
                              style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              Rechazar
                            </button>
                          </>
                        )}
                        {v.estado !== "APROBADA" && (
                          <button onClick={() => eliminarVacacion(v.id)}
                            style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendario asuntos propios */}
      {modalVacacion === "asuntos_propios" && (
        <CalendarioAsuntosPropios
          empleadoId={String(id)}
          grupoTrabajoId={empleado.grupoTrabajoId}
          fechaNacimiento={empleado.fechaNacimiento}
          diasDisponibles={(empleado.diasAsuntosPropios ?? 6) - (empleado.vacaciones?.filter(v => v.tipo === "ASUNTOS_PROPIOS" && v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0) || 0)}
          onConfirmar={async (dias, obs) => {
            const res = await fetch("/api/vacaciones", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ empleadoId: String(id), tipo: "ASUNTOS_PROPIOS", diasSueltos: dias, observaciones: obs }),
            })
            const data = await res.json()
            if (res.ok) { setModalVacacion(null); setMensaje({ texto: `${dias.length} día(s) solicitados`, tipo: "ok" }); cargar() }
            else setMensaje({ texto: data.error || "Error", tipo: "error" })
            setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
          }}
          onCancelar={() => setModalVacacion(null)}
        />
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
        <div>
          {empleado.deudas?.length === 0 ? (
            <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 40, textAlign: "center", color: "#a0aec0" }}>Sin deudas registradas</div>
          ) : empleado.deudas?.map(d => (
            <div key={d.id} style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", background: d.tipo === "ANTICIPO" ? "#ede9fe" : d.tipo === "PRODUCTO" ? "#dbeafe" : "#fef9c3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: d.tipo === "ANTICIPO" ? "#6366f1" : d.tipo === "PRODUCTO" ? "#0284c7" : "#d97706", background: "rgba(255,255,255,0.5)", padding: "2px 8px", borderRadius: 20 }}>{d.tipo}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#1e1b4b" }}>{d.descripcion}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, background: d.estado === "PAGADA" ? "#d1fae5" : "#fef3c7", color: d.estado === "PAGADA" ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{d.estado}</span>
                  <button onClick={() => {
                    setModalDeuda(d)
                    setFormDeuda({ estado: d.estado, fechaAprobacion: d.fechaAprobacion ? d.fechaAprobacion.split("T")[0] : "", fechaPago: d.fechaPago ? d.fechaPago.split("T")[0] : "", aprobadoPor: d.aprobadoPor || "", metodoPago: d.metodoPago || "EFECTIVO", porcentajeCobro: "", notas: d.notas || "", importePagado: "" })
                    setPagoTipo("importe")
                  }}
                    style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    Editar / Pagar
                  </button>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { label: "Importe total", valor: parseFloat(d.importetotal).toFixed(2) + "€", color: "#1e1b4b" },
                  { label: "Pagado", valor: parseFloat(d.importepagado || 0).toFixed(2) + "€", color: "#059669" },
                  { label: "Pendiente", valor: (parseFloat(d.importetotal) - parseFloat(d.importepagado || 0)).toFixed(2) + "€", color: "#dc2626" },
                  { label: "Cuotas", valor: d.numerocuotas > 1 ? `${d.cuotaspagadas || 0}/${d.numerocuotas} · ${(parseFloat(d.importetotal)/d.numerocuotas).toFixed(2)}€/mes` : "Pago único", color: "#1e1b4b" },
                  { label: "Día cobro", valor: `Día ${d.diacobro}`, color: "#1e1b4b" },
                  { label: "Método pago", valor: d.metodoPago || "Efectivo", color: "#1e1b4b" },
                  { label: "Fecha solicitud", valor: d.fechaSolicitud ? new Date(d.fechaSolicitud).toLocaleDateString("es-ES") : "—", color: "#1e1b4b" },
                  { label: "Fecha aprobación", valor: d.fechaAprobacion ? new Date(d.fechaAprobacion).toLocaleDateString("es-ES") : "—", color: "#1e1b4b" },
                  { label: "Fecha pago", valor: d.fechaPago ? new Date(d.fechaPago).toLocaleDateString("es-ES") : "—", color: "#1e1b4b" },
                ].map(f => (
                  <div key={f.label} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: f.color }}>{f.valor}</div>
                  </div>
                ))}
                {d.notas && (
                  <div style={{ gridColumn: "1/-1", borderBottom: "1px solid #f3f4f6", paddingBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Notas</div>
                    <div style={{ fontSize: 13, color: "#718096" }}>{d.notas}</div>
                  </div>
                )}
              </div>
              {d.numerocuotas > 1 && (
                <div style={{ padding: "0 20px 16px" }}>
                  <div style={{ background: "#f3f4f6", borderRadius: 8, height: 6, overflow: "hidden" }}>
                    <div style={{ background: "#6366f1", height: 6, width: `${((d.cuotaspagadas || 0) / d.numerocuotas) * 100}%`, borderRadius: 8 }}></div>
                  </div>
                  <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 4 }}>{d.cuotaspagadas || 0} de {d.numerocuotas} cuotas pagadas</div>
                </div>
              )}
            </div>
          ))}
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

      {modalDeuda && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 500, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>Editar deuda — {modalDeuda.descripcion}</h2>
              <button onClick={() => setModalDeuda(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#a0aec0" }}>✕</button>
            </div>
            <div style={{ background: "#f0f4ff", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#a0aec0" }}>Total</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1e1b4b" }}>{parseFloat(modalDeuda.importetotal).toFixed(2)}€</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#a0aec0" }}>Pagado</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#059669" }}>{parseFloat(modalDeuda.importepagado || 0).toFixed(2)}€</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#a0aec0" }}>Pendiente</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#dc2626" }}>{(parseFloat(modalDeuda.importetotal) - parseFloat(modalDeuda.importepagado || 0)).toFixed(2)}€</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 8, fontWeight: 500 }}>Tipo de pago</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { key: "importe", label: "Importe directo" },
                  { key: "porcentaje", label: "Por porcentaje" },
                  { key: "cuota", label: "Una cuota" },
                ].map(t => (
                  <button key={t.key} onClick={() => setPagoTipo(t.key)}
                    style={{ flex: 1, padding: "8px 4px", border: `1px solid ${pagoTipo === t.key ? "#6366f1" : "#e8eaf0"}`, borderRadius: 8, background: pagoTipo === t.key ? "#ede9fe" : "#fff", color: pagoTipo === t.key ? "#6366f1" : "#718096", fontSize: 12, fontWeight: pagoTipo === t.key ? 600 : 400, cursor: "pointer" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {pagoTipo === "importe" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Importe a pagar (€)</label>
                <input type="number" value={formDeuda.importePagado} onChange={e => setFormDeuda(p => ({ ...p, importePagado: e.target.value }))}
                  placeholder={`Máx: ${(parseFloat(modalDeuda.importetotal) - parseFloat(modalDeuda.importepagado || 0)).toFixed(2)}€`}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            )}
            {pagoTipo === "porcentaje" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Porcentaje a cobrar (%)</label>
                <input type="number" min={1} max={100} value={formDeuda.porcentajeCobro} onChange={e => setFormDeuda(p => ({ ...p, porcentajeCobro: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
                {formDeuda.porcentajeCobro && (
                  <div style={{ fontSize: 12, color: "#6366f1", marginTop: 4 }}>
                    = {(parseFloat(modalDeuda.importetotal) * parseFloat(formDeuda.porcentajeCobro) / 100).toFixed(2)}€
                  </div>
                )}
              </div>
            )}
            {pagoTipo === "cuota" && modalDeuda.numerocuotas > 1 && (
              <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13 }}>
                Se registrará el pago de <strong>{(parseFloat(modalDeuda.importetotal) / modalDeuda.numerocuotas).toFixed(2)}€</strong> (cuota {(modalDeuda.cuotaspagadas || 0) + 1} de {modalDeuda.numerocuotas})
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Método de pago</label>
                <select value={formDeuda.metodoPago} onChange={e => setFormDeuda(p => ({ ...p, metodoPago: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14 }}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="DESCUENTO_NOMINA">Descuento nómina</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Estado</label>
                <select value={formDeuda.estado} onChange={e => setFormDeuda(p => ({ ...p, estado: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14 }}>
                  <option value="ACTIVA">Activa</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Fecha aprobación</label>
                <input type="date" value={formDeuda.fechaAprobacion} onChange={e => setFormDeuda(p => ({ ...p, fechaAprobacion: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Fecha pago</label>
                <input type="date" value={formDeuda.fechaPago} onChange={e => setFormDeuda(p => ({ ...p, fechaPago: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Aprobado por</label>
                <input value={formDeuda.aprobadoPor} onChange={e => setFormDeuda(p => ({ ...p, aprobadoPor: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Notas</label>
              <textarea value={formDeuda.notas} onChange={e => setFormDeuda(p => ({ ...p, notas: e.target.value }))} rows={2}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModalDeuda(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarDeuda} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {tab === "calendario" && (
        <div style={{ background: "#f1f5f9", borderRadius: 16, padding: 28, boxShadow: "0 8px 32px rgba(99,102,241,0.25)" }}>
          <CalendarioEmpleado empleado={empleado} />
        </div>
      )}
      {modalVacacion === "nueva" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 480, maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>Nueva solicitud de vacaciones</h2>
              <button onClick={() => setModalVacacion(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#a0aec0" }}>✕</button>
            </div>
            <div style={{ background: "#dbeafe", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#1e40af" }}>
              <strong>{empleado.nombre} {empleado.apellidos}</strong> · Días disponibles: <strong>{(empleado.diasVacaciones ?? 22) - (empleado.vacaciones?.filter(v => v.estado === "APROBADA").reduce((s,v) => s + v.diasTotales, 0) || 0)}</strong>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Tipo de vacación *</label>
              <select value={formVacacion.tipo} onChange={e => setFormVacacion(p => ({ ...p, tipo: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }}>
                <option value="VERANO">☀️ Verano</option>
                <option value="INVIERNO">❄️ Invierno</option>
                <option value="MES_COMPLETO">📅 Mes completo</option>
                <option value="LIBRE_ELECCION">🗓️ Libre elección</option>
              </select>
              {formVacacion.tipo === "ASUNTOS_PROPIOS" && (
                <p style={{ fontSize: 11, color: "#9d174d", marginTop: 4, background: "#fce7f3", padding: "6px 10px", borderRadius: 4 }}>
                  Art. 37.3 ET · 6 días de asuntos propios al año · no acumulables al siguiente año
                </p>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Fecha inicio *</label>
                <input type="date" value={formVacacion.fechaInicio} onChange={e => setFormVacacion(p => ({ ...p, fechaInicio: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Fecha fin *</label>
                <input type="date" value={formVacacion.fechaFin} onChange={e => setFormVacacion(p => ({ ...p, fechaFin: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Observaciones</label>
              <textarea value={formVacacion.observaciones} onChange={e => setFormVacacion(p => ({ ...p, observaciones: e.target.value }))} rows={3}
                placeholder="Opcional..."
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModalVacacion(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={crearVacacion} disabled={loadingVacacion || !formVacacion.fechaInicio || !formVacacion.fechaFin}
                style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", opacity: loadingVacacion ? 0.6 : 1 }}>
                {loadingVacacion ? "Creando..." : "Crear solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalHistorial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 560, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>
                {modalHistorial === "sueldo" ? "Ajustar sueldo" : "Cambiar puesto"}
              </h2>
              <button onClick={() => setModalHistorial(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#a0aec0" }}>✕</button>
            </div>

            {modalHistorial === "sueldo" && (
              <>
                <div style={{ background: "#f0f4ff", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Sueldo bruto actual</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#6366f1" }}>{empleado.sueldoBase ? parseFloat(empleado.sueldoBase).toFixed(2) + "€" : "—"}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Paga mensual actual</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>{empleado.sueldoBase ? (parseFloat(empleado.sueldoBase) / 12).toFixed(2) + "€" : "—"}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Nuevo sueldo bruto anual (€)</label>
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
                    <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>O subida por porcentaje (%)</label>
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

                {formHistorial.nuevoSueldo && parseFloat(formHistorial.nuevoSueldo) > 0 && (
                  <div style={{ background: "#f8f9ff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b", marginBottom: 12 }}>Desglose en 12 pagas</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                      {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((mes, i) => (
                        <div key={mes} style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#a0aec0", marginBottom: 2 }}>{mes}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>{(parseFloat(formHistorial.nuevoSueldo) / 12).toFixed(2)}€</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, borderTop: "0.5px solid #e8eaf0", paddingTop: 12 }}>
                      {[
                        { label: "Bruto anual", valor: parseFloat(formHistorial.nuevoSueldo).toFixed(2) + "€", color: "#1e1b4b" },
                        { label: "Paga mensual", valor: (parseFloat(formHistorial.nuevoSueldo) / 12).toFixed(2) + "€", color: "#6366f1" },
                        { label: "Incremento", valor: formHistorial.porcentaje ? (parseFloat(formHistorial.porcentaje) > 0 ? "+" : "") + parseFloat(formHistorial.porcentaje).toFixed(2) + "%" : "—", color: "#059669" },
                        { label: "Bruto anterior", valor: empleado.sueldoBase ? parseFloat(empleado.sueldoBase).toFixed(2) + "€" : "—", color: "#718096" },
                        { label: "Diferencia mensual", valor: empleado.sueldoBase ? "+" + ((parseFloat(formHistorial.nuevoSueldo) - parseFloat(empleado.sueldoBase)) / 12).toFixed(2) + "€" : "—", color: "#059669" },
                        { label: "Diferencia anual", valor: empleado.sueldoBase ? "+" + (parseFloat(formHistorial.nuevoSueldo) - parseFloat(empleado.sueldoBase)).toFixed(2) + "€" : "—", color: "#059669" },
                      ].map(k => (
                        <div key={k.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#a0aec0", marginBottom: 2 }}>{k.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: k.color }}>{k.valor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {modalHistorial === "cargo" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Nuevo puesto</label>
                <input value={formHistorial.puesto} onChange={e => setFormHistorial(p => ({ ...p, puesto: e.target.value }))}
                  placeholder="Nombre del puesto"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
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






