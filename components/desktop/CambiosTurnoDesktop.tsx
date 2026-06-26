"use client"
import { useState, useEffect, useCallback } from "react"

type CambioTurno = {
  id: string
  empleadoOrigenId: string
  empleadoOrigen: { id: string; nombre: string; apellidos: string; numeroEmpleado: string; grupoTrabajo?: { nombre: string; color: string } }
  empleadoDestinoId: string
  empleadoDestino: { id: string; nombre: string; apellidos: string; numeroEmpleado: string; grupoTrabajo?: { nombre: string; color: string } }
  tipo: string
  fecha: string
  fechaOrigen?: string
  fechaDestino?: string
  turnoOrigen: string
  turnoDestino: string
  motivo?: string
  estado: string
  aprobadoPor?: string
  fechaAprobacion?: string
  createdAt: string
}

const estadoStyle: Record<string, { label: string; bg: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", bg: "#fef9c3", color: "#854d0e" },
  APROBADO:  { label: "Aprobado",  bg: "#dcfce7", color: "#15803d" },
  RECHAZADO: { label: "Rechazado", bg: "#fee2e2", color: "#b91c1c" },
  CANCELADO: { label: "Cancelado", bg: "#f3f4f6", color: "#6b7280" },
}

const tipoStyle: Record<string, { label: string; emoji: string }> = {
  ENTRE_EMPLEADOS: { label: "Entre empleados", emoji: "🔄" },
  CAMBIO_DIA:      { label: "Cambio de dia",   emoji: "📅" },
}

const TURNOS = ["Mañana", "Tarde", "Noche", "Partido", "Libre"]

function Avatar({ nombre, size = 32 }: { nombre: string; size?: number }) {
  const initials = nombre.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
  const colors = ["#7c3aed", "#6d28d9", "#0891b2", "#d97706", "#16a34a", "#db2777"]
  const color = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: size * 0.36, fontWeight: 700 }}>
      {initials}
    </div>
  )
}

export default function CambiosTurnoDesktop() {
  const [cambios, setCambios] = useState<CambioTurno[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState("TODOS")
  const [filtroTipo, setFiltroTipo] = useState("TODOS")
  const [busqueda, setBusqueda] = useState("")
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "error" } | null>(null)
  const [showNuevo, setShowNuevo] = useState(false)
  const [empleados, setEmpleados] = useState<any[]>([])
  const [form, setForm] = useState({ empleadoOrigenId: "", empleadoDestinoId: "", tipo: "ENTRE_EMPLEADOS", fechaOrigen: "", fechaDestino: "", turnoOrigen: "Mañana", turnoDestino: "Tarde", motivo: "" })
  const [loadingForm, setLoadingForm] = useState(false)
  const [errorForm, setErrorForm] = useState("")
  const [selected, setSelected] = useState<CambioTurno | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [accion, setAccion] = useState<"APROBADO" | "RECHAZADO" | null>(null)
  const [observaciones, setObservaciones] = useState("")
  const [masterPassword, setMasterPassword] = useState("")
  const [errorMaster, setErrorMaster] = useState("")

  const mostrarToast = (msg: string, tipo: "ok" | "error") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== "TODOS") params.set("estado", filtroEstado)
      if (filtroTipo !== "TODOS") params.set("tipo", filtroTipo)
      const res = await fetch(`/api/cambios-turno?${params}`)
      const data = await res.json()
      setCambios(Array.isArray(data) ? data : [])
    } catch {
      mostrarToast("Error al cargar", "error")
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, filtroTipo])

  useEffect(() => { cargar() }, [cargar])
  useEffect(() => {
    fetch("/api/empleados").then(r => r.json()).then(d => setEmpleados(Array.isArray(d) ? d : []))
  }, [])

  const getAlertaEmpleados = () => {
    if (form.tipo !== "ENTRE_EMPLEADOS" || !form.empleadoOrigenId || !form.empleadoDestinoId) return null
    const origen = empleados.find(e => e.id === form.empleadoOrigenId)
    const destino = empleados.find(e => e.id === form.empleadoDestinoId)
    if (!origen || !destino) return null
    const mismoPuesto = origen.puestoDeTrabajoId === destino.puestoDeTrabajoId
    const mismoGrupo = origen.grupoTrabajoId === destino.grupoTrabajoId
    return { mismoPuesto, mismoGrupo, origen, destino }
  }

  const crearCambio = async () => {
    setErrorForm("")
    if (!form.empleadoOrigenId || !form.fechaOrigen) { setErrorForm("Empleado y fecha son obligatorios"); return }
    const alerta = getAlertaEmpleados()
    if (alerta && !alerta.mismoPuesto) { setErrorForm("Los empleados no tienen el mismo puesto de trabajo"); return }
    setLoadingForm(true)
    const res = await fetch("/api/cambios-turno", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoadingForm(false)
    if (res.ok) {
      setShowNuevo(false)
      setForm({ empleadoOrigenId: "", empleadoDestinoId: "", tipo: "ENTRE_EMPLEADOS", fechaOrigen: "", fechaDestino: "", turnoOrigen: "Mañana", turnoDestino: "Tarde", motivo: "" })
      if (data.alertaGrupo) mostrarToast("⚠️ Solicitud creada — grupos distintos. El admin debe aprobar con clave master.", "ok")
      else mostrarToast("Solicitud creada ✅", "ok")
      cargar()
    } else {
      setErrorForm(data.error || "Error al crear")
    }
  }

  const gestionar = async () => {
    if (!selected || !accion) return
    setErrorMaster("")
    const grupoOrigen = selected.empleadoOrigen.grupoTrabajo?.nombre
    const grupoDestino = selected.empleadoDestino.grupoTrabajo?.nombre
    const gruposDistintos = grupoOrigen !== grupoDestino
    if (gruposDistintos && accion === "APROBADO") {
      if (!masterPassword.trim()) { setErrorMaster("Este cambio requiere clave master — los empleados son de grupos distintos"); return }
      const resVerif = await fetch("/api/empresa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterPassword }) })
      if (!resVerif.ok) { setErrorMaster("Clave master incorrecta"); return }
    }
    const res = await fetch(`/api/cambios-turno/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: accion, observaciones }),
    })
    if (res.ok) {
      mostrarToast(accion === "APROBADO" ? "Cambio aprobado ✅" : "Cambio rechazado ❌", "ok")
      setShowModal(false)
      setSelected(null)
      setAccion(null)
      setObservaciones("")
      setMasterPassword("")
      cargar()
    } else mostrarToast("Error al gestionar", "error")
  }

  const lista = cambios.filter(c => {
    const texto = `${c.empleadoOrigen.nombre} ${c.empleadoOrigen.apellidos} ${c.empleadoDestino.nombre} ${c.empleadoDestino.apellidos}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const stats = {
    total:      cambios.length,
    pendientes: cambios.filter(c => c.estado === "PENDIENTE").length,
    aprobados:  cambios.filter(c => c.estado === "APROBADO").length,
    rechazados: cambios.filter(c => c.estado === "RECHAZADO").length,
  }

  const alerta = getAlertaEmpleados()

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 20px", borderRadius: 8, background: toast.tipo === "ok" ? "#16a34a" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total solicitudes", value: stats.total,      color: "#6366f1" },
          { label: "Pendientes",        value: stats.pendientes, color: "#d97706" },
          { label: "Aprobados",         value: stats.aprobados,  color: "#16a34a" },
          { label: "Rechazados",        value: stats.rechazados, color: "#dc2626" },
        ].map((k, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 20, borderLeft: `3px solid ${k.color}`, boxShadow: "var(--shadow-sm)" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{k.label}</p>
            <p style={{ fontSize: 30, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input type="text" placeholder="Buscar empleado..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="input-base text-xs py-1.5 px-3 w-48" />
        <div style={{ display: "flex", gap: 4 }}>
          {["TODOS", "PENDIENTE", "APROBADO", "RECHAZADO"].map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: "pointer", transition: "all .15s", background: filtroEstado === e ? "var(--accent)" : "var(--surface-2)", color: filtroEstado === e ? "#fff" : "var(--text-secondary)", border: `1px solid ${filtroEstado === e ? "var(--accent)" : "var(--border-strong)"}` }}>
              {e === "TODOS" ? "Todos" : estadoStyle[e]?.label}
            </button>
          ))}
        </div>
        <select className="input-base text-xs py-1.5 px-2 w-auto" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="TODOS">Todos los tipos</option>
          {Object.entries(tipoStyle).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
        </select>
        <button onClick={cargar} className="btn-secondary text-xs px-3 py-1.5">🔄</button>
        <button onClick={() => setShowNuevo(true)} className="btn-primary text-xs px-4 py-2 ml-auto">+ Nueva solicitud</button>
      </div>

      {/* Tabla */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Solicitudes de cambio de turno</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{lista.length} resultado{lista.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Cargando...</div>
          ) : lista.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>🔄 No hay solicitudes</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Solicitante", "Receptor", "Tipo", "Fechas", "Turno", "Estado", "Acciones"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map(c => {
                  const es = estadoStyle[c.estado] || estadoStyle.PENDIENTE
                  const ts = tipoStyle[c.tipo] || tipoStyle.ENTRE_EMPLEADOS
                  const gruposDistintos = c.empleadoOrigen.grupoTrabajo?.nombre !== c.empleadoDestino.grupoTrabajo?.nombre
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", transition: "background .15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar nombre={`${c.empleadoOrigen.nombre} ${c.empleadoOrigen.apellidos}`} size={32} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{c.empleadoOrigen.nombre} {c.empleadoOrigen.apellidos}</p>
                            {c.empleadoOrigen.grupoTrabajo && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: c.empleadoOrigen.grupoTrabajo.color, borderRadius: 3, padding: "1px 6px" }}>{c.empleadoOrigen.grupoTrabajo.nombre}</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar nombre={`${c.empleadoDestino.nombre} ${c.empleadoDestino.apellidos}`} size={32} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{c.empleadoDestino.nombre} {c.empleadoDestino.apellidos}</p>
                            {c.empleadoDestino.grupoTrabajo && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: c.empleadoDestino.grupoTrabajo.color, borderRadius: 3, padding: "1px 6px" }}>{c.empleadoDestino.grupoTrabajo.nombre}</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", background: "#ede9fe", borderRadius: 3, padding: "2px 8px" }}>{ts.emoji} {ts.label}</span>
                        {gruposDistintos && <div style={{ fontSize: 10, color: "#d97706", marginTop: 2 }}>⚠️ Grupos distintos</div>}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {c.fechaOrigen ? new Date(c.fechaOrigen).toLocaleDateString("es-ES") : new Date(c.fecha).toLocaleDateString("es-ES")}
                        {c.fechaDestino && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>→ {new Date(c.fechaDestino).toLocaleDateString("es-ES")}</div>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 12 }}>{c.turnoOrigen}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>→ {c.turnoDestino}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: es.color, background: es.bg, borderRadius: 3, padding: "2px 8px" }}>{es.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => { setSelected(c); setShowModal(false) }}
                            style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)", fontWeight: 600, cursor: "pointer" }}>Ver</button>
                          {c.estado === "PENDIENTE" && (
                            <>
                              <button onClick={() => { setSelected(c); setAccion("APROBADO"); setShowModal(true) }}
                                style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 600, cursor: "pointer" }}>✓</button>
                              <button onClick={() => { setSelected(c); setAccion("RECHAZADO"); setShowModal(true) }}
                                style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontWeight: 600, cursor: "pointer" }}>✗</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal detalle */}
      {selected && !showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 520 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>🔄 Detalle cambio de turno</p>
              <button onClick={() => setSelected(null)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              {selected.empleadoOrigen.grupoTrabajo?.nombre !== selected.empleadoDestino.grupoTrabajo?.nombre && (
                <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#854d0e", margin: "0 0 4px" }}>⚠️ Empleados de grupos distintos</p>
                  <p style={{ fontSize: 11, color: "#92400e", margin: 0 }}>
                    {selected.empleadoOrigen.nombre} ({selected.empleadoOrigen.grupoTrabajo?.nombre}) y {selected.empleadoDestino.nombre} ({selected.empleadoDestino.grupoTrabajo?.nombre}) tienen libranzas distintas. Se requiere clave master para aprobar.
                  </p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Tipo", valor: `${tipoStyle[selected.tipo]?.emoji} ${tipoStyle[selected.tipo]?.label}` },
                  { label: "Estado", valor: estadoStyle[selected.estado]?.label },
                  { label: "Fecha origen", valor: selected.fechaOrigen ? new Date(selected.fechaOrigen).toLocaleDateString("es-ES") : "—" },
                  { label: "Fecha destino", valor: selected.fechaDestino ? new Date(selected.fechaDestino).toLocaleDateString("es-ES") : "—" },
                  { label: "Turno origen", valor: selected.turnoOrigen },
                  { label: "Turno destino", valor: selected.turnoDestino },
                  { label: "Motivo", valor: selected.motivo || "—" },
                  { label: "Aprobado por", valor: selected.aprobadoPor || "—" },
                ].map(f => (
                  <div key={f.label} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{f.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{f.valor}</p>
                  </div>
                ))}
              </div>
              {selected.estado === "PENDIENTE" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setAccion("APROBADO"); setShowModal(true) }}
                    style={{ flex: 1, padding: "8px", fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 6, cursor: "pointer" }}>✓ Aprobar</button>
                  <button onClick={() => { setAccion("RECHAZADO"); setShowModal(true) }}
                    style={{ flex: 1, padding: "8px", fontSize: 12, fontWeight: 600, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer" }}>✗ Rechazar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal aprobar/rechazar */}
      {showModal && selected && accion && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div style={{ background: "var(--surface)", borderRadius: 8, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 440 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: accion === "APROBADO" ? "#dcfce7" : "#fee2e2", borderRadius: "8px 8px 0 0" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: accion === "APROBADO" ? "#15803d" : "#b91c1c", margin: 0 }}>
                {accion === "APROBADO" ? "✓ Aprobar cambio de turno" : "✗ Rechazar cambio de turno"}
              </p>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 12, fontSize: 13 }}>
                {selected.empleadoOrigen.nombre} {selected.empleadoOrigen.apellidos} ↔ {selected.empleadoDestino.nombre} {selected.empleadoDestino.apellidos}
              </div>
              {selected.empleadoOrigen.grupoTrabajo?.nombre !== selected.empleadoDestino.grupoTrabajo?.nombre && (
                <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#854d0e", margin: "0 0 4px" }}>⚠️ Grupos distintos — requiere clave master</p>
                  <p style={{ fontSize: 11, color: "#92400e", margin: 0 }}>
                    Grupo {selected.empleadoOrigen.grupoTrabajo?.nombre} ↔ Grupo {selected.empleadoDestino.grupoTrabajo?.nombre}. Sus libranzas son diferentes.
                  </p>
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Observaciones</label>
                <textarea className="input-base text-sm" rows={2} style={{ resize: "none" }}
                  placeholder={accion === "APROBADO" ? "Opcional..." : "Motivo del rechazo..."}
                  value={observaciones} onChange={e => setObservaciones(e.target.value)} />
              </div>
              {selected.empleadoOrigen.grupoTrabajo?.nombre !== selected.empleadoDestino.grupoTrabajo?.nombre && accion === "APROBADO" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Clave master *</label>
                  <input type="password" className="input-base text-sm" placeholder="Introduce la clave master para aprobar"
                    value={masterPassword} onChange={e => setMasterPassword(e.target.value)} />
                  {errorMaster && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errorMaster}</p>}
                </div>
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <button onClick={() => { setShowModal(false); setAccion(null); setObservaciones(""); setMasterPassword(""); setErrorMaster("") }} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={gestionar}
                style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: 600, background: accion === "APROBADO" ? "#16a34a" : "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva solicitud */}
      {showNuevo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowNuevo(false) }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>🔄 Nueva solicitud de cambio de turno</p>
              <button onClick={() => setShowNuevo(false)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              {errorForm && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#b91c1c" }}>{errorForm}</div>
              )}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Tipo de cambio *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {Object.entries(tipoStyle).map(([k, v]) => (
                    <button key={k} onClick={() => setForm(p => ({ ...p, tipo: k }))}
                      style={{ flex: 1, padding: "8px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: `1px solid ${form.tipo === k ? "var(--accent)" : "var(--border-strong)"}`, background: form.tipo === k ? "var(--accent)" : "var(--surface-2)", color: form.tipo === k ? "#fff" : "var(--text-secondary)" }}>
                      {v.emoji} {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Empleado solicitante *</label>
                <select className="input-base text-sm" value={form.empleadoOrigenId} onChange={e => setForm(p => ({ ...p, empleadoOrigenId: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos} — Nº {e.numeroEmpleado}</option>)}
                </select>
              </div>
              {form.tipo === "ENTRE_EMPLEADOS" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Empleado receptor *</label>
                  <select className="input-base text-sm" value={form.empleadoDestinoId} onChange={e => setForm(p => ({ ...p, empleadoDestinoId: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {empleados.filter(e => e.id !== form.empleadoOrigenId).map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos} — Nº {e.numeroEmpleado}</option>)}
                  </select>
                  {alerta && (
                    <div style={{ marginTop: 6 }}>
                      {!alerta.mismoPuesto && (
                        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#b91c1c" }}>
                          🚫 Puestos distintos — no se puede realizar el cambio de turno.
                        </div>
                      )}
                      {alerta.mismoPuesto && !alerta.mismoGrupo && (
                        <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#854d0e" }}>
                          ⚠️ Grupos de libranza distintos ({alerta.origen.grupoTrabajoId} ↔ {alerta.destino.grupoTrabajoId}). El admin necesitará clave master para aprobar.
                        </div>
                      )}
                      {alerta.mismoPuesto && alerta.mismoGrupo && (
                        <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#15803d" }}>
                          ✅ Mismo puesto y grupo — cambio permitido sin restricciones.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Fecha origen *</label>
                  <input type="date" className="input-base text-sm" value={form.fechaOrigen} onChange={e => setForm(p => ({ ...p, fechaOrigen: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>{form.tipo === "ENTRE_EMPLEADOS" ? "Fecha destino" : "Cambiar por fecha"}</label>
                  <input type="date" className="input-base text-sm" value={form.fechaDestino} onChange={e => setForm(p => ({ ...p, fechaDestino: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Turno origen *</label>
                  <select className="input-base text-sm" value={form.turnoOrigen} onChange={e => setForm(p => ({ ...p, turnoOrigen: e.target.value }))}>
                    {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Turno destino</label>
                  <select className="input-base text-sm" value={form.turnoDestino} onChange={e => setForm(p => ({ ...p, turnoDestino: e.target.value }))}>
                    {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Motivo</label>
                <textarea className="input-base text-sm" rows={2} style={{ resize: "none" }} placeholder="Motivo del cambio..." value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowNuevo(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button onClick={crearCambio} disabled={loadingForm || (alerta !== null && !alerta.mismoPuesto)} className="btn-primary flex-1 py-2 text-sm">
                  {loadingForm ? "Creando..." : "Crear solicitud"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
