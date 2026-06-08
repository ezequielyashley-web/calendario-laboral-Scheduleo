"use client"
import { useState, useEffect, useCallback } from "react"

type GrupoLibranza = {
  id: string
  nombre: string
  color: string
  tipo: string
  descripcion?: string
  dias: { fecha: string; observacion?: string }[]
  empleados: { empleado: { id: string; nombre: string; apellidos: string; numeroEmpleado: string } }[]
}

function Avatar({ nombre, size = 28 }: { nombre: string; size?: number }) {
  const initials = nombre.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
  const colors = ["#7c3aed", "#0891b2", "#d97706", "#16a34a", "#db2777", "#6366f1"]
  const color = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: size * 0.36, fontWeight: 700 }}>
      {initials}
    </div>
  )
}

export default function LibranzasDesktop() {
  const [grupos, setGrupos] = useState<GrupoLibranza[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<GrupoLibranza | null>(null)
  const [filtroTipo, setFiltroTipo] = useState("TODOS")
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "error" } | null>(null)
  const [empleados, setEmpleados] = useState<any[]>([])
  const [showAsignar, setShowAsignar] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("")
  const [loadingAsignar, setLoadingAsignar] = useState(false)
  const [mesVista, setMesVista] = useState(new Date().getMonth())

  const mostrarToast = (msg: string, tipo: "ok" | "error") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/libranzas")
      const data = await res.json()
      setGrupos(Array.isArray(data) ? data : [])
      if (data.length > 0 && !grupoSeleccionado) setGrupoSeleccionado(data[0])
    } catch { mostrarToast("Error al cargar", "error") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])
  useEffect(() => {
    fetch("/api/empleados").then(r => r.json()).then(d => setEmpleados(Array.isArray(d) ? d : []))
  }, [])

  const asignarEmpleado = async () => {
    if (!empleadoSeleccionado || !grupoSeleccionado) return
    setLoadingAsignar(true)
    const res = await fetch("/api/libranzas/asignar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: empleadoSeleccionado, grupoLibranzaId: grupoSeleccionado.id })
    })
    const data = await res.json()
    setLoadingAsignar(false)
    if (res.ok) {
      mostrarToast("Empleado asignado ✅", "ok")
      setShowAsignar(false)
      setEmpleadoSeleccionado("")
      cargar()
    } else mostrarToast(data.error || "Error al asignar", "error")
  }

  const desasignarEmpleado = async (empleadoId: string) => {
    if (!grupoSeleccionado) return
    const res = await fetch("/api/libranzas/asignar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId, grupoLibranzaId: grupoSeleccionado.id })
    })
    if (res.ok) { mostrarToast("Empleado desasignado", "ok"); cargar() }
    else mostrarToast("Error al desasignar", "error")
  }

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  const DIAS = ["L","M","X","J","V","S","D"]

  const getDiasDelMes = (mes: number) => {
    const primerDia = new Date(2026, mes, 1)
    const totalDias = new Date(2026, mes + 1, 0).getDate()
    let startDow = primerDia.getDay() - 1
    if (startDow === -1) startDow = 6
    const celdas: (number | null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= totalDias; d++) celdas.push(d)
    return celdas
  }

  const diasLibresGrupo = grupoSeleccionado?.dias.map(d => d.fecha.split("T")[0]) || []

  const gruposFiltrados = filtroTipo === "TODOS" ? grupos : grupos.filter(g => g.tipo === filtroTipo)

  return (
    <div className="space-y-5">
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 20px", borderRadius: 8, background: toast.tipo === "ok" ? "#16a34a" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Grupos de libranza</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{grupos.length} grupos configurados</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["TODOS", "ENTRE_SEMANA", "LUNES"].map(t => (
            <button key={t} onClick={() => setFiltroTipo(t)}
              style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: "pointer", background: filtroTipo === t ? "var(--accent)" : "var(--surface-2)", color: filtroTipo === t ? "#fff" : "var(--text-secondary)", border: `1px solid ${filtroTipo === t ? "var(--accent)" : "var(--border-strong)"}` }}>
              {t === "TODOS" ? "Todos" : t === "ENTRE_SEMANA" ? "Entre semana" : "Lunes"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Lista grupos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Cargando...</div>
          ) : gruposFiltrados.map(g => (
            <div key={g.id} onClick={() => setGrupoSeleccionado(g)}
              style={{ background: grupoSeleccionado?.id === g.id ? "var(--surface-2)" : "var(--surface)", border: `1px solid ${grupoSeleccionado?.id === g.id ? g.color : "var(--border)"}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer", transition: "all .15s", borderLeft: `4px solid ${g.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{g.nombre}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                    {g.tipo === "LUNES" ? "🗓️ Lunes" : "📅 Entre semana"} · {g.dias.length} días · {g.empleados.length} empleados
                  </p>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Panel detalle */}
        {grupoSeleccionado ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Info grupo */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, borderTop: `4px solid ${grupoSeleccionado.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{grupoSeleccionado.nombre}</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{grupoSeleccionado.descripcion || "Sin descripcion"}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, background: grupoSeleccionado.tipo === "LUNES" ? "#fef9c3" : "#ede9fe", color: grupoSeleccionado.tipo === "LUNES" ? "#854d0e" : "#6d28d9", borderRadius: 4, padding: "3px 10px" }}>
                  {grupoSeleccionado.tipo === "LUNES" ? "Grupo Lunes" : "Entre semana"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>
                {[
                  { label: "Dias libres 2026", valor: grupoSeleccionado.dias.length },
                  { label: "Empleados asignados", valor: grupoSeleccionado.empleados.length },
                  { label: "Tipo libranza", valor: grupoSeleccionado.tipo === "LUNES" ? "Lunes" : "Rotacion" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--surface-2)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: grupoSeleccionado.color, margin: 0 }}>{s.valor}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendario mini del mes */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Dias libres — {MESES[mesVista]} 2026</h3>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setMesVista(m => Math.max(0, m - 1))} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>‹</button>
                  <button onClick={() => setMesVista(m => Math.min(11, m + 1))} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>›</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 6 }}>
                {DIAS.map((d, i) => (
                  <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: i >= 5 ? "#9ca3af" : "var(--text-muted)" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                {getDiasDelMes(mesVista).map((dia, i) => {
                  if (!dia) return <div key={i} />
                  const fechaStr = `2026-${String(mesVista + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
                  const esLibre = diasLibresGrupo.includes(fechaStr)
                  const fecha = new Date(2026, mesVista, dia)
                  const esDomingo = fecha.getDay() === 0
                  return (
                    <div key={i} style={{
                      background: esLibre ? grupoSeleccionado.color : esDomingo ? "#fee2e2" : "var(--surface-2)",
                      borderRadius: 4, padding: "4px 0", textAlign: "center", fontSize: 11,
                      fontWeight: esLibre ? 700 : 400,
                      color: esLibre ? "#fff" : esDomingo ? "#dc2626" : "var(--text-secondary)",
                      border: `1px solid ${esLibre ? grupoSeleccionado.color : "var(--border)"}`,
                    }}>
                      {dia}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Empleados del grupo */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Empleados — {grupoSeleccionado.empleados.length}</h3>
                <button onClick={() => setShowAsignar(true)}
                  style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  + Asignar empleado
                </button>
              </div>
              {grupoSeleccionado.empleados.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>No hay empleados asignados</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {grupoSeleccionado.empleados.map(({ empleado: e }) => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 6 }}>
                      <Avatar nombre={`${e.nombre} ${e.apellidos}`} size={28} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{e.nombre} {e.apellidos}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Nº {e.numeroEmpleado}</p>
                      </div>
                      <button onClick={() => desasignarEmpleado(e.id)}
                        style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 600 }}>
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
            Selecciona un grupo para ver los detalles
          </div>
        )}
      </div>

      {/* Modal asignar empleado */}
      {showAsignar && grupoSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAsignar(false) }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 440 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Asignar empleado — {grupoSeleccionado.nombre}</p>
              <button onClick={() => setShowAsignar(false)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding: 20 }} className="space-y-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Empleado</label>
                <select className="input-base text-sm" value={empleadoSeleccionado} onChange={e => setEmpleadoSeleccionado(e.target.value)}>
                  <option value="">Seleccionar empleado...</option>
                  {empleados
                    .filter(e => !grupoSeleccionado.empleados.find(ge => ge.empleado.id === e.id))
                    .map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos} — Nº {e.numeroEmpleado}</option>)
                  }
                </select>
              </div>
              <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)" }}>
                Al asignar este empleado a <strong>{grupoSeleccionado.nombre}</strong>, sus dias libres aparecerán automáticamente en su calendario laboral.
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <button onClick={() => setShowAsignar(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={asignarEmpleado} disabled={!empleadoSeleccionado || loadingAsignar} className="btn-primary flex-1 py-2 text-sm">
                {loadingAsignar ? "Asignando..." : "Asignar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
