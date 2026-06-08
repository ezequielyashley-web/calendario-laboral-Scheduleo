"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const GRUPOS_CONFIG = [
  { id: "glib-g1a", key: "G1A", nombre: "G1A", nombreCompleto: "Grupo 1 · Azul Claro",  color: "#818cf8", bg: "#f5f3ff", border: "#ddd6fe", tipo: "ENTRE_SEMANA" },
  { id: "glib-g1b", key: "G1B", nombre: "G1B", nombreCompleto: "Grupo 1 · Azul Oscuro", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", tipo: "ENTRE_SEMANA" },
  { id: "glib-g2a", key: "G2A", nombre: "G2A", nombreCompleto: "Grupo 2 · Rojo Claro",  color: "#f87171", bg: "#fff5f5", border: "#fecaca", tipo: "ENTRE_SEMANA" },
  { id: "glib-g2b", key: "G2B", nombre: "G2B", nombreCompleto: "Grupo 2 · Rojo Oscuro", color: "#ef4444", bg: "#fff1f1", border: "#fecaca", tipo: "ENTRE_SEMANA" },
  { id: "glib-g3a", key: "G3A", nombre: "G3A", nombreCompleto: "Grupo 3 · Verde Claro",  color: "#4ade80", bg: "#f0fdf4", border: "#bbf7d0", tipo: "ENTRE_SEMANA" },
  { id: "glib-g3b", key: "G3B", nombre: "G3B", nombreCompleto: "Grupo 3 · Verde Oscuro", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", tipo: "ENTRE_SEMANA" },
  { id: "glib-l1",  key: "L1",  nombre: "L1",  nombreCompleto: "Lunes · Grupo 1", color: "#fbbf24", bg: "#fffbeb", border: "#fde68a", tipo: "LUNES" },
  { id: "glib-l2",  key: "L2",  nombre: "L2",  nombreCompleto: "Lunes · Grupo 2", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", tipo: "LUNES" },
  { id: "glib-l3",  key: "L3",  nombre: "L3",  nombreCompleto: "Lunes · Grupo 3", color: "#d97706", bg: "#fef9c3", border: "#fcd34d", tipo: "LUNES" },
]

const AVATAR_COLORS = ["#7c3aed","#0891b2","#d97706","#16a34a","#db2777","#6366f1","#dc2626","#0e7490","#b45309","#15803d","#6d28d9","#0369a1"]

function Avatar({ nombre, color, size = 28 }: { nombre: string; color: string; size?: number }) {
  const initials = nombre.trim().split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: size * 0.35, fontWeight: 800, boxShadow: `0 2px 6px ${color}50` }}>
      {initials}
    </div>
  )
}

export default function GruposDesktop() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [asignaciones, setAsignaciones] = useState<Record<string, { entresemana: string; lunes: string }>>({})
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState<{ empleadoId: string; fromGrupo: string; tipo: "entresemana" | "lunes" } | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [tab, setTab] = useState<"entresemana" | "lunes">("entresemana")
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "error" } | null>(null)
  const [showHistorial, setShowHistorial] = useState(false)
  const router = useRouter()
  const [busqueda, setBusqueda] = useState("")
  const [busquedaGrupo, setBusquedaGrupo] = useState<Record<string, string>>({})
  const [pendiente, setPendiente] = useState<{ empleadoId: string; fromGrupo: string; toGrupo: string; tipo: "entresemana" | "lunes" } | null>(null)
  const [masterPassword, setMasterPassword] = useState("")
  const [errorMaster, setErrorMaster] = useState("")
  const [guardando, setGuardando] = useState(false)

  const mostrarToast = (msg: string, tipo: "ok" | "error") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const cargar = async () => {
      try {
        const [empRes, libRes] = await Promise.all([
          fetch("/api/empleados?empresaId=empresa-001"),
          fetch("/api/libranzas")
        ])
        const emps = await empRes.json()
        const libs = await libRes.json()
        const asigs: Record<string, { entresemana: string; lunes: string }> = {}
        if (Array.isArray(libs)) {
          libs.forEach((g: any) => {
            g.empleados?.forEach((rel: any) => {
              if (!asigs[rel.empleado.id]) asigs[rel.empleado.id] = { entresemana: "", lunes: "" }
              if (g.tipo === "LUNES") asigs[rel.empleado.id].lunes = g.id
              else asigs[rel.empleado.id].entresemana = g.id
            })
          })
        }
        setEmpleados(Array.isArray(emps) ? emps : [])
        setAsignaciones(asigs)
      } catch { mostrarToast("Error al cargar", "error") }
      finally { setLoading(false) }
    }
    cargar()
  }, [])

  const getEmpleadosGrupo = (grupoId: string, tipo: "entresemana" | "lunes") =>
    empleados.filter(e => {
      const asig = asignaciones[e.id]
      if (!asig) return false
      return tipo === "lunes" ? asig.lunes === grupoId : asig.entresemana === grupoId
    }).filter(e => busqueda === "" || `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()))

  const getSinAsignar = (tipo: "entresemana" | "lunes") =>
    empleados.filter(e => {
      const asig = asignaciones[e.id]
      return !asig || (tipo === "lunes" ? !asig.lunes : !asig.entresemana)
    }).filter(e => busqueda === "" || `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()))

  const handleDrop = (toGrupoId: string) => {
    if (!dragging || dragging.fromGrupo === toGrupoId) { setDragging(null); setDragOver(null); return }
    setPendiente({ empleadoId: dragging.empleadoId, fromGrupo: dragging.fromGrupo, toGrupo: toGrupoId, tipo: dragging.tipo })
    setMasterPassword("")
    setErrorMaster("")
    setDragging(null); setDragOver(null)
  }

  const confirmarCambio = async () => {
    if (!pendiente) return
    setErrorMaster("")
    if (!masterPassword.trim()) { setErrorMaster("Introduce la clave master"); return }
    setGuardando(true)

    // Verificar clave master
    const resVerif = await fetch("/api/empresa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterPassword }) })
    if (!resVerif.ok) { setErrorMaster("Clave master incorrecta"); setGuardando(false); return }

    const { empleadoId, fromGrupo, toGrupo, tipo } = pendiente
    const emp = empleados.find(e => e.id === empleadoId)
    const grupoFrom = GRUPOS_CONFIG.find(g => g.id === fromGrupo)
    const grupoTo = GRUPOS_CONFIG.find(g => g.id === toGrupo)

    try {
      // Desasignar del grupo anterior si existe
      if (fromGrupo) {
        await fetch("/api/libranzas/asignar", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empleadoId, grupoLibranzaId: fromGrupo })
        })
      }
      // Asignar al nuevo grupo
      await fetch("/api/libranzas/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empleadoId, grupoLibranzaId: toGrupo })
      })

      // Actualizar estado local
      setAsignaciones(prev => ({ ...prev, [empleadoId]: { ...prev[empleadoId], [tipo]: toGrupo } }))
      setHistorial(prev => [{
        empleadoId, nombre: `${emp?.nombre} ${emp?.apellidos}`,
        de: grupoFrom?.nombreCompleto || "Sin grupo",
        a: grupoTo?.nombreCompleto || "",
        tipo, fecha: new Date().toLocaleTimeString("es-ES"),
        asigAnterior: { ...asignaciones[empleadoId] }
      }, ...prev.slice(0, 49)])

      mostrarToast(`${emp?.nombre} → ${grupoTo?.nombreCompleto} ✅`, "ok")
      setPendiente(null)
      setMasterPassword("")
    } catch {
      mostrarToast("Error al guardar en BD", "error")
    }
    setGuardando(false)
  }

  const handleDropSinAsignar = () => {
    if (!dragging) return
    const { empleadoId, tipo } = dragging
    const emp = empleados.find(e => e.id === empleadoId)
    if (!emp) return
    const grupoFrom = GRUPOS_CONFIG.find(g => g.id === dragging.fromGrupo)
    setAsignaciones(prev => ({ ...prev, [empleadoId]: { ...prev[empleadoId], [tipo]: "" } }))
    setHistorial(prev => [{ empleadoId, nombre: `${emp.nombre} ${emp.apellidos}`, de: grupoFrom?.nombreCompleto || "Sin grupo", a: "Sin grupo", tipo, fecha: new Date().toLocaleTimeString("es-ES"), asigAnterior: prev[empleadoId] }, ...prev.slice(0, 49)])
    mostrarToast(`${emp.nombre} quitado del grupo`, "ok")
    setDragging(null); setDragOver(null)
  }

  const deshacer = () => {
    if (historial.length === 0) return
    const ultimo = historial[0]
    setAsignaciones(prev => ({ ...prev, [ultimo.empleadoId]: ultimo.asigAnterior || { entresemana: "", lunes: "" } }))
    setHistorial(prev => prev.slice(1))
    mostrarToast("Accion deshecha ↩️", "ok")
  }

  const grupos = GRUPOS_CONFIG.filter(g => tab === "entresemana" ? g.tipo === "ENTRE_SEMANA" : g.tipo === "LUNES")

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Cargando grupos...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 20px", borderRadius: 10, background: toast.tipo === "ok" ? "#16a34a" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.tipo === "ok" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Grupos de libranza</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>{empleados.length} empleados · Arrastra para reasignar grupos</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="text" placeholder="Buscar empleado..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ padding: "7px 12px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 12, background: "var(--surface)", color: "var(--text-primary)", width: 180 }} />
          {historial.length > 0 && (
            <button onClick={deshacer} style={{ background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ↩️ Deshacer
            </button>
          )}
          <button onClick={() => setShowHistorial(!showHistorial)}
            style={{ background: showHistorial ? "#ede9fe" : "var(--surface-2)", color: showHistorial ? "#6d28d9" : "var(--text-secondary)", border: `1px solid ${showHistorial ? "#c4b5fd" : "var(--border-strong)"}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            📋 Historial {historial.length > 0 && `(${historial.length})`}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", borderRadius: 12, padding: 4, width: "fit-content", border: "1px solid var(--border)" }}>
        {[{ key: "entresemana", label: "📅 Entre semana" }, { key: "lunes", label: "🗓️ Días lunes" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ padding: "8px 22px", fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", background: tab === t.key ? "var(--surface)" : "transparent", color: tab === t.key ? "var(--text-primary)" : "var(--text-muted)", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all .2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sin asignar */}
      <div onDragOver={e => { e.preventDefault(); setDragOver("sin-asignar") }} onDragLeave={() => setDragOver(null)} onDrop={handleDropSinAsignar}
        style={{ background: dragOver === "sin-asignar" ? "#fee2e2" : "var(--surface-2)", border: `2px dashed ${dragOver === "sin-asignar" ? "#dc2626" : "var(--border-strong)"}`, borderRadius: 12, padding: "12px 16px", transition: "all .2s", minHeight: 52 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Sin asignar · {getSinAsignar(tab).length}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {getSinAsignar(tab).map((emp, idx) => (
            <div key={emp.id} draggable onDragStart={() => setDragging({ empleadoId: emp.id, fromGrupo: "", tipo: tab })}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 10px 4px 4px", cursor: "grab", userSelect: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <Avatar nombre={`${emp.nombre} ${emp.apellidos}`} color={AVATAR_COLORS[idx % AVATAR_COLORS.length]} size={22} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{emp.nombre} {emp.apellidos.split(" ")[0]}</span>
            </div>
          ))}
          {getSinAsignar(tab).length === 0 && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✅ Todos asignados</span>}
        </div>
      </div>

      {/* Grid grupos */}
      <div style={{ display: "grid", gridTemplateColumns: tab === "entresemana" ? "repeat(3,1fr)" : "repeat(3,1fr)", gap: 14 }}>
        {grupos.map(grupo => {
          const empsGrupo = getEmpleadosGrupo(grupo.id, tab)
          const isDragOver = dragOver === grupo.id
          return (
            <div key={grupo.id} onDragOver={e => { e.preventDefault(); setDragOver(grupo.id) }} onDragLeave={() => setDragOver(null)} onDrop={() => handleDrop(grupo.id)}
              style={{ background: isDragOver ? grupo.bg : "#fff", border: `2px solid ${isDragOver ? grupo.color : grupo.border}`, borderRadius: 14, overflow: "hidden", transition: "all .2s", boxShadow: isDragOver ? `0 8px 24px ${grupo.color}30` : "0 1px 4px rgba(0,0,0,0.06)", transform: isDragOver ? "scale(1.02)" : "scale(1)" }}>

              {/* Header */}
              <div style={{ background: grupo.color, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>{grupo.nombre}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", margin: "2px 0 0", fontWeight: 500 }}>{grupo.nombreCompleto}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, minWidth: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", padding: "0 10px" }}>
                  {empsGrupo.length}
                </div>
              </div>

              {/* Busqueda interna del grupo */}
              {empsGrupo.length > 4 && (
                <div style={{ padding: "6px 10px", borderBottom: "1px solid var(--border)" }}>
                  <input type="text" placeholder="Buscar en grupo..." value={busquedaGrupo[grupo.id] || ""}
                    onChange={e => setBusquedaGrupo(prev => ({ ...prev, [grupo.id]: e.target.value }))}
                    style={{ width: "100%", padding: "5px 8px", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 11, background: "var(--surface)", color: "var(--text-primary)", boxSizing: "border-box" as "border-box" }} />
                </div>
              )}
              {/* Empleados */}
              <div className="grupo-empleados" style={{ padding: 10, minHeight: 140, display: "flex", flexDirection: "column", gap: 3 }}>
                {empsGrupo.filter(e => !busquedaGrupo[grupo.id] || `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busquedaGrupo[grupo.id].toLowerCase())).length === 0 && !isDragOver && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#d1d5db", paddingTop: 20 }}>
                    <span style={{ fontSize: 24 }}>⠿</span>
                    <span style={{ fontSize: 11, fontStyle: "italic" }}>Arrastra empleados aquí</span>
                  </div>
                )}
                {empsGrupo.filter(e => !busquedaGrupo[grupo.id] || `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busquedaGrupo[grupo.id].toLowerCase())).map((emp, idx) => (
                  <div key={emp.id} draggable onDragStart={() => setDragging({ empleadoId: emp.id, fromGrupo: grupo.id, tipo: tab })}
                    className="emp-card" data-nombre={`${emp.nombre} ${emp.apellidos}`.toLowerCase()}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: grupo.bg, border: `1px solid ${grupo.border}`, borderRadius: 8, padding: "6px 8px", cursor: "grab", userSelect: "none", transition: "transform .1s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateX(3px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateX(0)")}>
                    <Avatar nombre={`${emp.nombre} ${emp.apellidos}`} color={grupo.color} size={26} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {emp.nombre} {emp.apellidos}
                      </p>
                      <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>Nº {emp.numeroEmpleado}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); router.push(`/empleados/${emp.id}`) }}
                      style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.7)", color: grupo.color, border: `1px solid ${grupo.border}`, cursor: "pointer", fontWeight: 600, flexShrink: 0 }}
                      title="Ver perfil">
                      →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal confirmacion clave master */}
      {pendiente && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div style={{ background: "var(--surface)", borderRadius: 14, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 420 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "#fef9c3", borderRadius: "14px 14px 0 0" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#854d0e", margin: 0 }}>🔐 Confirmar cambio de grupo</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 12, fontSize: 13 }}>
                {(() => {
                  const emp = empleados.find(e => e.id === pendiente.empleadoId)
                  const grupoFrom = GRUPOS_CONFIG.find(g => g.id === pendiente.fromGrupo)
                  const grupoTo = GRUPOS_CONFIG.find(g => g.id === pendiente.toGrupo)
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>{emp?.nombre} {emp?.apellidos}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ background: grupoFrom?.bg || "#f3f4f6", color: grupoFrom?.color || "#6b7280", border: `1px solid ${grupoFrom?.border || "#e5e7eb"}`, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{grupoFrom?.nombre || "Sin grupo"}</span>
                        <span style={{ color: "var(--text-muted)" }}>→</span>
                        <span style={{ background: grupoTo?.bg, color: grupoTo?.color, border: `1px solid ${grupoTo?.border}`, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{grupoTo?.nombre}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Clave master *</label>
                <input type="password" className="input-base text-sm" placeholder="Introduce la clave master"
                  value={masterPassword} onChange={e => setMasterPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && confirmarCambio()} autoFocus />
                {errorMaster && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errorMaster}</p>}
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <button onClick={() => { setPendiente(null); setMasterPassword(""); setErrorMaster("") }}
                className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={confirmarCambio} disabled={guardando}
                style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: 700, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando..." : "Confirmar cambio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      {showHistorial && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>📋 Historial de cambios</h3>
          {historial.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No hay cambios aún</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {historial.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: i === 0 ? "#f0fdf4" : "var(--surface-2)", borderRadius: 8, fontSize: 12, border: i === 0 ? "1px solid #bbf7d0" : "1px solid transparent" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 10, whiteSpace: "nowrap", minWidth: 50 }}>{h.fecha}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", minWidth: 140 }}>{h.nombre}</span>
                  <span style={{ color: "#dc2626", fontWeight: 600, fontSize: 11 }}>{h.de}</span>
                  <span style={{ color: "var(--text-muted)" }}>→</span>
                  <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 11 }}>{h.a}</span>
                  <span style={{ marginLeft: "auto", background: h.tipo === "lunes" ? "#fef9c3" : "#ede9fe", color: h.tipo === "lunes" ? "#854d0e" : "#6d28d9", borderRadius: 4, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>
                    {h.tipo === "lunes" ? "Lunes" : "Entre semana"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
