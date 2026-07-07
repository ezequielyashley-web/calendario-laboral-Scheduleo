"use client"
import { useState, useEffect, useCallback } from "react"

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

// Domingos especiales laborables 2026
const DOMINGOS_LABORABLES_2026 = ["2026-12-20", "2026-12-27"]

// Festivos nacionales + Comunidad de Madrid 2026
const FESTIVOS_2026: Record<string, string> = {
  "2026-01-01": "Año Nuevo",
  "2026-01-06": "Epifanía del Señor",
  "2026-04-02": "Jueves Santo",
  "2026-04-03": "Viernes Santo",
  "2026-05-01": "Día del Trabajo",
  "2026-05-02": "Día de la Comunidad de Madrid",
  "2026-05-15": "San Isidro (Madrid)",
  "2026-08-15": "Asunción de la Virgen",
  "2026-10-12": "Fiesta Nacional de España",
  "2026-11-02": "Todos los Santos (trasladado)",
  "2026-11-09": "Nuestra Señora de la Almudena",
  "2026-12-06": "Día de la Constitución",
  "2026-12-08": "Inmaculada Concepción",
  "2026-12-25": "Navidad",
}
const DIAS_SEMANA = ["L","M","X","J","V","S","D"]

const GRUPOS_CONFIG = [
  { id: "glib-g1a", nombre: "G1A", nombreCompleto: "Grupo 1 · Azul Claro",  color: "#818cf8", bg: "#f5f3ff", border: "#ddd6fe", tipo: "ENTRE_SEMANA" },
  { id: "glib-g1b", nombre: "G1B", nombreCompleto: "Grupo 1 · Azul Oscuro", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", tipo: "ENTRE_SEMANA" },
  { id: "glib-g2a", nombre: "G2A", nombreCompleto: "Grupo 2 · Rojo Claro",  color: "#f87171", bg: "#fff5f5", border: "#fecaca", tipo: "ENTRE_SEMANA" },
  { id: "glib-g2b", nombre: "G2B", nombreCompleto: "Grupo 2 · Rojo Oscuro", color: "#ef4444", bg: "#fff1f1", border: "#fecaca", tipo: "ENTRE_SEMANA" },
  { id: "glib-g3a", nombre: "G3A", nombreCompleto: "Grupo 3 · Verde Claro",  color: "#4ade80", bg: "#f0fdf4", border: "#bbf7d0", tipo: "ENTRE_SEMANA" },
  { id: "glib-g3b", nombre: "G3B", nombreCompleto: "Grupo 3 · Verde Oscuro", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", tipo: "ENTRE_SEMANA" },
  { id: "glib-l1",  nombre: "L1",  nombreCompleto: "Lunes · Grupo 1", color: "#fbbf24", bg: "#fffbeb", border: "#fde68a", tipo: "LUNES" },
  { id: "glib-l2",  nombre: "L2",  nombreCompleto: "Lunes · Grupo 2", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", tipo: "LUNES" },
  { id: "glib-l3",  nombre: "L3",  nombreCompleto: "Lunes · Grupo 3", color: "#d97706", bg: "#fef9c3", border: "#fcd34d", tipo: "LUNES" },
]

export default function LibranzasDesktop() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(GRUPOS_CONFIG[0])
  const [diasGrupo, setDiasGrupo] = useState<Record<string, string[]>>({})
  const [anno, setAnno] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "error" } | null>(null)
  const [mesVista, setMesVista] = useState(new Date().getMonth())
  const [showAddDia, setShowAddDia] = useState(false)
  const [newFecha, setNewFecha] = useState("")
  const [newObservacion, setNewObservacion] = useState("")
  const [masterPassword, setMasterPassword] = useState("")
  const [errorMaster, setErrorMaster] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [showAutoModal, setShowAutoModal] = useState(false)
  const [autoConfig, setAutoConfig] = useState({ diasPorSemana: 2, empezarDia: "martes" })
  const [filtroTipo, setFiltroTipo] = useState("TODOS")

  const mostrarToast = (msg: string, tipo: "ok" | "error") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const cargarDias = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/libranzas")
      const data = await res.json()
      const diasMap: Record<string, string[]> = {}
      if (Array.isArray(data)) {
        data.forEach((g: any) => {
          diasMap[g.id] = g.dias?.map((d: any) => d.fecha?.split("T")[0]) || []
        })
      }
      setDiasGrupo(diasMap)
    } catch { mostrarToast("Error al cargar", "error") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargarDias() }, [cargarDias])

  const getDiasDelMes = (mes: number) => {
    const primerDia = new Date(anno, mes, 1)
    const totalDias = new Date(anno, mes + 1, 0).getDate()
    let startDow = primerDia.getDay() - 1
    if (startDow === -1) startDow = 6
    const celdas: (number | null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= totalDias; d++) celdas.push(d)
    return celdas
  }

  const getFechaStr = (mes: number, dia: number) =>
    `${anno}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`

  const diasGrupoActual = diasGrupo[grupoSeleccionado.id] || []

  const toggleDia = (fechaStr: string) => {
    const existe = diasGrupoActual.includes(fechaStr)
    const nuevos = existe
      ? diasGrupoActual.filter(d => d !== fechaStr)
      : [...diasGrupoActual, fechaStr].sort()
    setDiasGrupo(prev => ({ ...prev, [grupoSeleccionado.id]: nuevos }))
  }

  const guardarDias = async () => {
    setErrorMaster("")
    if (!masterPassword.trim()) { setErrorMaster("Introduce la clave master"); return }
    setGuardando(true)
    try {
      const resVerif = await fetch("/api/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterPassword })
      })
      if (!resVerif.ok) { setErrorMaster("Clave master incorrecta"); setGuardando(false); return }

      const res = await fetch("/api/libranzas/dias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupoLibranzaId: grupoSeleccionado.id,
          anno,
          fechas: diasGrupoActual
        })
      })
      if (res.ok) {
        mostrarToast(`Dias de ${grupoSeleccionado.nombre} guardados y aplicados a empleados ✅`, "ok")
        setMasterPassword("")
        setErrorMaster("")
        cargarDias()
      } else {
        mostrarToast("Error al guardar", "error")
      }
    } catch { mostrarToast("Error al guardar", "error") }
    setGuardando(false)
  }

  const distribucionAutomatica = () => {
    const DIAS_POR_SEMANA = autoConfig.diasPorSemana
    const diasLibres: Record<string, string[]> = {}
    GRUPOS_CONFIG.filter(g => g.tipo === "ENTRE_SEMANA").forEach(g => { diasLibres[g.id] = [] })

    const diasSemana: Record<string, number> = {
      lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6
    }

    let grupoIdx = 0
    const gruposES = GRUPOS_CONFIG.filter(g => g.tipo === "ENTRE_SEMANA")
    const fecha = new Date(anno, 0, 1)
    const fin = new Date(anno, 11, 31)

    while (fecha <= fin) {
      const dow = fecha.getDay()
      if (dow !== 0) { // No domingo
        const fechaStr = fecha.toISOString().split("T")[0]
        const grupo = gruposES[grupoIdx % gruposES.length]
        if (!diasLibres[grupo.id]) diasLibres[grupo.id] = []
        diasLibres[grupo.id].push(fechaStr)
        grupoIdx++
      }
      fecha.setDate(fecha.getDate() + 1)
    }

    // Distribuir equitativamente con rotacion
    const nuevosDias: Record<string, string[]> = {}
    gruposES.forEach(g => { nuevosDias[g.id] = [] })

    const totalDiasAnno = Object.values(diasLibres).flat().length
    const diasPorGrupo = Math.floor(totalDiasAnno / gruposES.length)

    let diaActual = new Date(anno, 0, 1)
    let grupoActual = 0
    let contadorGrupo = 0

    while (diaActual <= new Date(anno, 11, 31)) {
      const dow = diaActual.getDay()
      if (dow !== 0 && dow !== 6) { // Solo entre semana
        const fechaStr = diaActual.toISOString().split("T")[0]
        const g = gruposES[grupoActual]
        if (!nuevosDias[g.id]) nuevosDias[g.id] = []
        nuevosDias[g.id].push(fechaStr)
        contadorGrupo++
        if (contadorGrupo >= DIAS_POR_SEMANA) {
          contadorGrupo = 0
          grupoActual = (grupoActual + 1) % gruposES.length
        }
      }
      diaActual.setDate(diaActual.getDate() + 1)
    }

    setDiasGrupo(prev => ({ ...prev, ...nuevosDias }))
    setShowAutoModal(false)
    mostrarToast("Distribucion automatica aplicada — revisa y guarda con clave master", "ok")
  }

  const gruposFiltrados = filtroTipo === "TODOS" ? GRUPOS_CONFIG : GRUPOS_CONFIG.filter(g => g.tipo === filtroTipo)

  const resumenAnno = {
    total: diasGrupoActual.filter(d => d.startsWith(String(anno))).length,
    mes: diasGrupoActual.filter(d => d.startsWith(`${anno}-${String(mesVista + 1).padStart(2, "0")}`)).length
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 20px", borderRadius: 10, background: toast.tipo === "ok" ? "#16a34a" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.tipo === "ok" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="libranzas-header-responsive" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <style>{`
          @media (max-width: 768px) {
            .libranzas-header-responsive { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
            .libranzas-main-grid { grid-template-columns: 1fr !important; }
            .libranzas-cal-header-responsive { flex-wrap: wrap !important; gap: 8px !important; }
            .libranzas-leyenda-responsive { flex-wrap: wrap !important; }
          }
        `}</style>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Gestión de libranzas</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>Asigna los días libres de cada grupo para {anno}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setAnno(a => a - 1)} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--text-primary)" }}>‹</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", minWidth: 40, textAlign: "center" }}>{anno}</span>
          <button onClick={() => setAnno(a => a + 1)} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--text-primary)" }}>›</button>
          <button onClick={() => setShowAutoModal(true)}
            style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #c4b5fd", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ⚡ Distribución automática
          </button>
        </div>
      </div>

      {/* Filtro tipo */}
      <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", borderRadius: 10, padding: 4, width: "fit-content", border: "1px solid var(--border)" }}>
        {[{ key: "TODOS", label: "Todos" }, { key: "ENTRE_SEMANA", label: "📅 Entre semana" }, { key: "LUNES", label: "🗓️ Lunes" }].map(t => (
          <button key={t.key} onClick={() => setFiltroTipo(t.key)}
            style={{ padding: "7px 16px", fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", background: filtroTipo === t.key ? "var(--surface)" : "transparent", color: filtroTipo === t.key ? "var(--text-primary)" : "var(--text-muted)", boxShadow: filtroTipo === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="libranzas-main-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>

        {/* Lista grupos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {gruposFiltrados.map(g => {
            const diasAnno = (diasGrupo[g.id] || []).filter(d => d.startsWith(String(anno))).length
            const isSelected = grupoSeleccionado.id === g.id
            return (
              <div key={g.id} onClick={() => setGrupoSeleccionado(g)}
                style={{ background: isSelected ? g.bg : "var(--surface)", border: `1.5px solid ${isSelected ? g.color : "var(--border)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "all .15s", borderLeft: `4px solid ${g.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: g.color, margin: 0 }}>{g.nombre}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{g.nombreCompleto}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: g.color, margin: 0 }}>{diasAnno}</p>
                    <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>días {anno}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Panel detalle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Info grupo seleccionado */}
          <div style={{ background: grupoSeleccionado.bg, border: `1.5px solid ${grupoSeleccionado.color}`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: grupoSeleccionado.color, margin: 0 }}>{grupoSeleccionado.nombre}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>{grupoSeleccionado.nombreCompleto}</p>
            </div>
            <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 900, color: grupoSeleccionado.color, margin: 0 }}>{resumenAnno.total}</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>días libres {anno}</p>
              </div>
              <div style={{ width: 1, background: grupoSeleccionado.border }} />
              <div>
                <p style={{ fontSize: 28, fontWeight: 900, color: grupoSeleccionado.color, margin: 0 }}>{resumenAnno.mes}</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>en {MESES[mesVista]}</p>
              </div>
            </div>
          </div>

          {/* Calendario */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div className="libranzas-cal-header-responsive" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setMesVista(m => Math.max(0, m - 1))} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>‹</button>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", minWidth: 100, textAlign: "center" }}>{MESES[mesVista]} {anno}</span>
                <button onClick={() => setMesVista(m => Math.min(11, m + 1))} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>›</button>
              </div>
              <div className="libranzas-leyenda-responsive" style={{ display: "flex", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: grupoSeleccionado.color }} />
                  Día libre
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#f3f4f6", border: "1px solid #e5e7eb" }} />
                  Laborable
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#f5f3ff", border: "1px solid #ddd6fe" }} />
                  Festivo
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#fee2e2", border: "1px solid #fecaca" }} />
                  Domingo
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
              {DIAS_SEMANA.map((d, i) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: i >= 5 ? "#fff" : "#fff", background: i >= 5 ? "#9ca3af" : grupoSeleccionado.color, borderRadius: 4, padding: "4px 0" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {getDiasDelMes(mesVista).map((dia, i) => {
                if (!dia) return <div key={i} />
                const fechaStr = getFechaStr(mesVista, dia)
                const esLibre = diasGrupoActual.includes(fechaStr)
                const fecha = new Date(anno, mesVista, dia)
                const esDomingo = fecha.getDay() === 0 && !DOMINGOS_LABORABLES_2026.includes(fechaStr)
                const esSabado = fecha.getDay() === 6
                const esFestivo = !!FESTIVOS_2026[fechaStr]
                const hoy = new Date().toISOString().split("T")[0] === fechaStr
                return (
                  <div key={i} onClick={() => !esDomingo && toggleDia(fechaStr)}
                    title={esFestivo ? FESTIVOS_2026[fechaStr] : esLibre ? "Click para quitar día libre" : "Click para añadir día libre"}
                    style={{
                      background: esLibre ? grupoSeleccionado.color : esFestivo ? "#f5f3ff" : esDomingo ? "#fee2e2" : esSabado ? "#f9fafb" : "#fff",
                      borderRadius: hoy ? "50%" : 6,
                      padding: "8px 0",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: esLibre || hoy ? 700 : 400,
                      color: esLibre ? "#fff" : esFestivo ? "#7c3aed" : esDomingo ? "#ef4444" : esSabado ? "#9ca3af" : "var(--text-primary)",
                      cursor: esDomingo || esFestivo ? "default" : "pointer",
                      border: `1px solid ${esLibre ? grupoSeleccionado.color : esFestivo ? "#ddd6fe" : hoy ? "#6366f1" : "#f3f4f6"}`,
                      outline: hoy ? "2px solid #6366f1" : "none",
                      outlineOffset: 1,
                      transition: "all .1s",
                      userSelect: "none"
                    }}>
                    {dia}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lista dias del mes */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Días libres en {MESES[mesVista]} — {resumenAnno.mes} días
              </p>
              <button onClick={() => setShowAddDia(true)}
                style={{ background: grupoSeleccionado.bg, color: grupoSeleccionado.color, border: `1px solid ${grupoSeleccionado.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                + Añadir día
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {diasGrupoActual
                .filter(d => d.startsWith(`${anno}-${String(mesVista + 1).padStart(2, "0")}`))
                .sort()
                .map(d => {
                  const fecha = new Date(d + "T00:00:00")
                  return (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: 4, background: grupoSeleccionado.bg, border: `1px solid ${grupoSeleccionado.border}`, borderRadius: 6, padding: "3px 8px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: grupoSeleccionado.color }}>
                        {fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}
                      </span>
                      <button onClick={() => toggleDia(d)} style={{ background: "none", border: "none", color: grupoSeleccionado.color, cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                  )
                })
              }
              {resumenAnno.mes === 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No hay días libres en este mes</span>}
            </div>
          </div>

          {/* Guardar con clave master */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px" }}>
              💾 Guardar y aplicar a empleados
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px" }}>
              Al guardar, los {resumenAnno.total} días libres de {grupoSeleccionado.nombre} se aplicarán automáticamente al calendario de todos sus empleados.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="password" placeholder="Clave master para confirmar" value={masterPassword}
                onChange={e => setMasterPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && guardarDias()}
                style={{ flex: 1, padding: "9px 12px", border: `1px solid ${errorMaster ? "#fca5a5" : "var(--border-strong)"}`, borderRadius: 8, fontSize: 13, background: "var(--surface)", color: "var(--text-primary)" }} />
              <button onClick={guardarDias} disabled={guardando}
                style={{ background: grupoSeleccionado.color, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: guardando ? 0.6 : 1, whiteSpace: "nowrap" }}>
                {guardando ? "Guardando..." : `Guardar ${grupoSeleccionado.nombre}`}
              </button>
            </div>
            {errorMaster && <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0" }}>{errorMaster}</p>}
          </div>
        </div>
      </div>

      {/* Modal añadir dia */}
      {showAddDia && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddDia(false) }}>
          <div style={{ background: "var(--surface)", borderRadius: 14, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 400 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: grupoSeleccionado.bg, borderRadius: "14px 14px 0 0" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: grupoSeleccionado.color, margin: 0 }}>+ Añadir día libre — {grupoSeleccionado.nombre}</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Fecha *</label>
                <input type="date" className="input-base text-sm" value={newFecha} onChange={e => setNewFecha(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Observación (opcional)</label>
                <input type="text" className="input-base text-sm" placeholder="Ej: Festivo local, cambio convenio..." value={newObservacion} onChange={e => setNewObservacion(e.target.value)} />
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <button onClick={() => { setShowAddDia(false); setNewFecha(""); setNewObservacion("") }} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={() => {
                if (!newFecha) return
                if (!diasGrupoActual.includes(newFecha)) {
                  setDiasGrupo(prev => ({ ...prev, [grupoSeleccionado.id]: [...(prev[grupoSeleccionado.id] || []), newFecha].sort() }))
                  mostrarToast(`Día ${newFecha} añadido — guarda con clave master`, "ok")
                }
                setShowAddDia(false)
                setNewFecha("")
                setNewObservacion("")
              }} disabled={!newFecha}
                style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: 700, background: grupoSeleccionado.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: !newFecha ? 0.5 : 1 }}>
                Añadir día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal añadir dia */}
      {showAddDia && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddDia(false) }}>
          <div style={{ background: "var(--surface)", borderRadius: 14, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 400 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: grupoSeleccionado.bg, borderRadius: "14px 14px 0 0" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: grupoSeleccionado.color, margin: 0 }}>+ Añadir día libre — {grupoSeleccionado.nombre}</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Fecha *</label>
                <input type="date" className="input-base text-sm" value={newFecha} onChange={e => setNewFecha(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Observación (opcional)</label>
                <input type="text" className="input-base text-sm" placeholder="Ej: Festivo local, cambio convenio..." value={newObservacion} onChange={e => setNewObservacion(e.target.value)} />
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <button onClick={() => { setShowAddDia(false); setNewFecha(""); setNewObservacion("") }} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={() => {
                if (!newFecha) return
                if (!diasGrupoActual.includes(newFecha)) {
                  setDiasGrupo(prev => ({ ...prev, [grupoSeleccionado.id]: [...(prev[grupoSeleccionado.id] || []), newFecha].sort() }))
                  mostrarToast(`Día ${newFecha} añadido — guarda con clave master`, "ok")
                }
                setShowAddDia(false)
                setNewFecha("")
                setNewObservacion("")
              }} disabled={!newFecha}
                style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: 700, background: grupoSeleccionado.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: !newFecha ? 0.5 : 1 }}>
                Añadir día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal distribución automática */}
      {showAutoModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAutoModal(false) }}>
          <div style={{ background: "var(--surface)", borderRadius: 14, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 460 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "#ede9fe", borderRadius: "14px 14px 0 0" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#6d28d9", margin: 0 }}>⚡ Distribución automática de libranzas</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                El sistema calculará y distribuirá los días libres equitativamente entre todos los grupos entre semana para {anno}. Cada grupo tendrá el mismo número de días libres.
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Días libres por semana por empleado</label>
                <select className="input-base text-sm" value={autoConfig.diasPorSemana}
                  onChange={e => setAutoConfig(p => ({ ...p, diasPorSemana: parseInt(e.target.value) }))}>
                  <option value={1}>1 día por semana</option>
                  <option value={2}>2 días por semana</option>
                </select>
              </div>
              <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#854d0e" }}>
                ⚠️ Esto sobrescribirá los días actuales de todos los grupos entre semana. Deberás confirmar con clave master para guardar.
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <button onClick={() => setShowAutoModal(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button onClick={distribucionAutomatica}
                style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: 700, background: "#6d28d9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                Calcular distribución
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
