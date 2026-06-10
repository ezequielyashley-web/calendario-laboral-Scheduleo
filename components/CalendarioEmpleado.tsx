"use client"
import { useState } from "react"

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DIAS = ["L","M","X","J","V","S","D"]
const DOMINGOS_LABORABLES_2026 = ["2026-12-20", "2026-12-27"]

const FESTIVOS: Record<number, number[]> = {
  0:[1,6], 3:[2,3], 4:[1], 5:[24], 6:[25], 7:[15], 8:[12], 9:[12], 10:[1,2,9], 11:[6,8,25]
}

interface Props { empleado: any }

export default function CalendarioEmpleado({ empleado }: Props) {
  const hoy = new Date()
  const hoyStr = hoy.toISOString().split("T")[0]
  const [anno, setAnno] = useState(hoy.getFullYear())

  const getTipoDia = (fecha: Date) => {
    const mes = fecha.getMonth()
    const dia = fecha.getDate()
    const dow = fecha.getDay()
    const fechaStr = fecha.toISOString().split("T")[0]

    if (dow === 0 && DOMINGOS_LABORABLES_2026.includes(fechaStr)) return { tipo: "trabajo", color: "#6b7280", bg: "#fff", border: "#f3f4f6", tooltip: "Domingo laborable (excepcion empresa)" }
    if (dow === 0) return { tipo: "domingo", color: "#ef4444", bg: "#fff1f1", border: "#fecaca", tooltip: "Domingo" }
    if (FESTIVOS[mes]?.includes(dia)) return { tipo: "festivo", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", tooltip: "Festivo" }

    const baja = empleado.bajas?.find((b: any) =>
      b.estado === "ACTIVA" && new Date(b.fechaInicio) <= fecha && (!b.fechaFin || new Date(b.fechaFin) >= fecha)
    )
    if (baja) return { tipo: "baja", color: "#ef4444", bg: "#fff1f1", border: "#fecaca", tooltip: "Baja medica" }

    const vacacion = empleado.vacaciones?.find((v: any) =>
      v.estado === "APROBADA" && v.tipo !== "ASUNTOS_PROPIOS" &&
      new Date(v.fechaInicio).toISOString().split("T")[0] <= fechaStr &&
      new Date(v.fechaFin).toISOString().split("T")[0] >= fechaStr
    )
    if (vacacion) return { tipo: "vacacion", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", tooltip: "Vacaciones" }

    const asunto = empleado.vacaciones?.find((v: any) =>
      v.estado === "APROBADA" && v.tipo === "ASUNTOS_PROPIOS" &&
      new Date(v.fechaInicio).toISOString().split("T")[0] <= fechaStr &&
      new Date(v.fechaFin).toISOString().split("T")[0] >= fechaStr
    )
    if (asunto) return { tipo: "asunto", color: "#ec4899", bg: "#fdf2f8", border: "#fbcfe8", tooltip: "Asunto propio" }

    const cambio = empleado.cambiosTurno?.find((c: any) => {
      const fo = c.fechaOrigen ? new Date(c.fechaOrigen).toISOString().split("T")[0] : null
      const fd = c.fechaDestino ? new Date(c.fechaDestino).toISOString().split("T")[0] : null
      return fo === fechaStr || fd === fechaStr
    })
    if (cambio) {
      const otro = cambio.empleadoOrigenId === empleado.id ? cambio.empleadoDestino : cambio.empleadoOrigen
      return { tipo: "cambio", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", tooltip: "Cambio turno con " + (otro?.nombre || "") }
    }

    if (dow === 6) return { tipo: "sabado", color: "#9ca3af", bg: "#f9fafb", border: "#f3f4f6", tooltip: "Sabado" }
    return { tipo: "trabajo", color: "#6b7280", bg: "#ffffff", border: "#f3f4f6", tooltip: "Laborable" }
  }

  const getDiasDelMes = (mes: number): (Date | null)[] => {
    const primerDia = new Date(anno, mes, 1)
    const totalDias = new Date(anno, mes + 1, 0).getDate()
    let startDow = primerDia.getDay() - 1
    if (startDow === -1) startDow = 6
    const celdas: (Date | null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= totalDias; d++) celdas.push(new Date(anno, mes, d))
    return celdas
  }

  const resumen = { vacaciones: 0, bajas: 0, asuntos: 0, cambios: 0 }
  for (let m = 0; m < 12; m++) {
    const dias = getDiasDelMes(m).filter(Boolean) as Date[]
    dias.forEach(d => {
      const t = getTipoDia(d).tipo
      if (t === "vacacion") resumen.vacaciones++
      if (t === "baja") resumen.bajas++
      if (t === "asunto") resumen.asuntos++
      if (t === "cambio") resumen.cambios++
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: empleado.grupoTrabajo?.color || "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
            {empleado.grupoTrabajo?.nombre?.[0] || "?"}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Grupo entre semana</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b", margin: "2px 0 0" }}>{empleado.grupoTrabajo?.nombre || "Sin asignar"}</p>
          </div>
        </div>
        <div style={{ width: 1, background: "#e5e7eb", height: 36 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
            L
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Grupo libranza lunes</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b", margin: "2px 0 0" }}>Pendiente asignar</p>
          </div>
        </div>
        <div style={{ width: 1, background: "#e5e7eb", height: 36 }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", margin: 0 }}>Tipo de libranza</p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>
            {["L1","L2","L3"].includes(empleado.grupoTrabajo?.nombre) ? "Libranza lunes" : empleado.grupoTrabajo?.nombre ? "Libranza entre semana" : "Sin asignar"}
          </p>
        </div>
        <div style={{ width: 1, background: "#e5e7eb", height: 36 }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", margin: 0 }}>Patron de libranza</p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>
            {["L1","L2","L3"].includes(empleado.grupoTrabajo?.nombre) ? "Libra todos los lunes del año" : empleado.grupoTrabajo?.nombre ? "Libra segun rotacion del grupo" : "Se asignara en modulo libranzas"}
          </p>
        </div>
        <div style={{ marginLeft: "auto", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#854d0e", fontWeight: 500 }}>
          En desarrollo
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setAnno(a => a - 1)} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#374151" }}>&#8249;</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b" }}>Calendario {anno}</span>
          <button onClick={() => setAnno(a => a + 1)} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#374151" }}>&#8250;</button>
        </div>
        <button onClick={() => setAnno(hoy.getFullYear())} style={{ background: "#fff", color: "#6366f1", border: "1px solid #c7d2fe", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Hoy</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "Dias vacaciones", valor: resumen.vacaciones, bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
          { label: "Dias baja medica", valor: resumen.bajas, bg: "#fff1f1", color: "#dc2626", border: "#fecaca" },
          { label: "Asuntos propios", valor: resumen.asuntos, bg: "#fdf2f8", color: "#db2777", border: "#fbcfe8" },
          { label: "Cambios turno", valor: resumen.cambios, bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: "1px solid " + s.border, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.valor}</div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", background: "#fff", borderRadius: 8, padding: "8px 14px", border: "1px solid #e5e7eb" }}>
        {[
          { bg: "#fff", border: "#e5e7eb", label: "Trabajo", color: "#6b7280" },
          { bg: "#f9fafb", border: "#f3f4f6", label: "Sabado", color: "#9ca3af" },
          { bg: "#fff1f1", border: "#fecaca", label: "Domingo", color: "#ef4444" },
          { bg: "#f5f3ff", border: "#ddd6fe", label: "Festivo", color: "#8b5cf6" },
          { bg: "#f0fdf4", border: "#bbf7d0", label: "Vacaciones", color: "#16a34a" },
          { bg: "#fdf2f8", border: "#fbcfe8", label: "Asuntos propios", color: "#db2777" },
          { bg: "#fff1f1", border: "#fecaca", label: "Baja medica", color: "#dc2626" },
          { bg: "#eff6ff", border: "#bfdbfe", label: "Cambio turno", color: "#2563eb" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 11, height: 11, borderRadius: 3, background: l.bg, border: "1px solid " + l.border }} />
            <span style={{ fontSize: 11, color: "#6b7280" }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {MESES.map((nombreMes, mes) => {
          const celdas = getDiasDelMes(mes)
          const esMesActual = mes === hoy.getMonth() && anno === hoy.getFullYear()
          return (
            <div key={mes} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: esMesActual ? "2px solid #6366f1" : "1px solid #e5e7eb", boxShadow: esMesActual ? "0 2px 12px rgba(99,102,241,0.15)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ background: esMesActual ? "#6366f1" : "#f8f9ff", padding: "7px 12px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: esMesActual ? "#fff" : "#374151" }}>{nombreMes} {anno}</span>
                {esMesActual && <span style={{ fontSize: 9, background: "rgba(255,255,255,0.3)", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>HOY</span>}
              </div>
              <div style={{ padding: "7px 5px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 3 }}>
                  {DIAS.map((d, i) => (
                    <div key={d} style={{ textAlign: "center", fontSize: 8, fontWeight: 600, color: i >= 5 ? "#d1d5db" : "#9ca3af" }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
                  {celdas.map((fecha, i) => {
                    if (!fecha) return <div key={i} />
                    const info = getTipoDia(fecha)
                    const esHoyDia = fecha.toISOString().split("T")[0] === hoyStr
                    return (
                      <div key={i} title={info.tooltip} style={{
                        background: esHoyDia ? "#6366f1" : info.bg,
                        borderRadius: esHoyDia ? "50%" : 3,
                        padding: "3px 0",
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: esHoyDia ? 700 : 400,
                        color: esHoyDia ? "#fff" : info.color,
                        cursor: "default",
                        border: "1px solid " + (esHoyDia ? "#6366f1" : info.border),
                      }}>
                        {fecha.getDate()}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
