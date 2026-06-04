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

  useEffect(() => {
    if (!id) return
    fetch(`/api/empleados/${id}`)
      .then(r => r.json())
      .then(data => { setEmpleado(data); setLoading(false) })
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Cargando perfil...</div>
  if (!empleado || empleado.error) return <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>Empleado no encontrado</div>

  const horasTotales = empleado.fichajes?.reduce((s, f) => {
    if (!f.horaSalida) return s
    return s + (new Date(f.horaSalida).getTime() - new Date(f.horaEntrada).getTime()) / 3600000
  }, 0) || 0

  const tardanzas = empleado.fichajes?.filter(f => {
    const hora = new Date(f.horaEntrada).getHours()
    return hora >= 9
  }).length || 0

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Cabecera */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {empleado.nombre[0]}{empleado.apellidos[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>{empleado.nombre} {empleado.apellidos}</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>
            {empleado.puestoDeTrabajo?.nombre || "Sin puesto"} · {empleado.grupoTrabajo?.nombre || "Sin grupo"} · Nº {empleado.numeroEmpleado}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { label: "Horas mes", valor: horasTotales.toFixed(0) + "h" },
            { label: "Tardanzas", valor: tardanzas },
            { label: "Deudas activas", valor: empleado.deudas?.filter(d => d.estado === "ACTIVA").length || 0 },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", background: "#f8fafc", borderRadius: 6, padding: "10px 16px" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0284c7" }}>{s.valor}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e5e7eb", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "10px 18px", border: "none", background: "none", fontSize: 13, fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? "#0284c7" : "#6b7280", borderBottom: tab === t.key ? "2px solid #0284c7" : "2px solid transparent", marginBottom: -2, cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === "general" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Datos personales</h2>
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
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{f.valor}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fichajes */}
      {tab === "fichajes" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Fecha", "Entrada", "Salida", "Horas", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleado.fichajes?.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin fichajes registrados</td></tr>
              ) : empleado.fichajes?.map((f, i) => {
                const horas = f.horaSalida ? ((new Date(f.horaSalida).getTime() - new Date(f.horaEntrada).getTime()) / 3600000).toFixed(1) : "—"
                return (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
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

      {/* Vacaciones */}
      {tab === "vacaciones" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Desde", "Hasta", "Días", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleado.vacaciones?.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin vacaciones registradas</td></tr>
              ) : empleado.vacaciones?.map((v, i) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(v.fechaInicio).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(v.fechaFin).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{Math.ceil((new Date(v.fechaFin).getTime() - new Date(v.fechaInicio).getTime()) / 86400000)}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: v.estado === "APROBADA" ? "#d1fae5" : v.estado === "PENDIENTE" ? "#fef3c7" : "#fee2e2", color: v.estado === "APROBADA" ? "#065f46" : v.estado === "PENDIENTE" ? "#92400e" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {v.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bajas */}
      {tab === "bajas" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Tipo", "Inicio", "Fin", "Estado", "Descripción"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleado.bajas?.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin bajas registradas</td></tr>
              ) : empleado.bajas?.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{b.tipo}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(b.fechaInicio).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{b.fechaFin ? new Date(b.fechaFin).toLocaleDateString("es-ES") : "En curso"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: b.estado === "CERRADA" ? "#d1fae5" : "#fef3c7", color: b.estado === "CERRADA" ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {b.estado}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#6b7280" }}>{b.descripcion || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deudas */}
      {tab === "deudas" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Tipo", "Descripción", "Total", "Pagado", "Pendiente", "Cuota", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleado.deudas?.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin deudas registradas</td></tr>
              ) : empleado.deudas?.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600 }}>{d.tipo}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{d.descripcion}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{parseFloat(d.importeTotal).toFixed(2)}€</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#059669" }}>{parseFloat(d.importePagado).toFixed(2)}€</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{(parseFloat(d.importeTotal) - parseFloat(d.importePagado)).toFixed(2)}€</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{d.numeroCuotas > 1 ? `${(parseFloat(d.importeTotal)/d.numeroCuotas).toFixed(2)}€/mes` : "Un pago"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: d.estado === "PAGADA" ? "#d1fae5" : "#fef3c7", color: d.estado === "PAGADA" ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{d.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permisos */}
      {tab === "permisos" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Fecha", "Hora", "Duración", "Motivo", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleado.permisos?.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin permisos registrados</td></tr>
              ) : empleado.permisos?.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
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

      {/* Justificantes */}
      {tab === "justificantes" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Tipo", "Descripción", "Fecha límite", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleado.justificantes?.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin justificantes pendientes</td></tr>
              ) : empleado.justificantes?.map((j, i) => (
                <tr key={j.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
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

      {/* Historial cargos */}
      {tab === "historial" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Puesto", "Desde", "Hasta", "Notas"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleado.historialCargos?.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Sin historial de cargos</td></tr>
              ) : empleado.historialCargos?.map((h, i) => (
                <tr key={h.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{h.puesto}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{new Date(h.fechaInicio).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13 }}>{h.fechaFin ? new Date(h.fechaFin).toLocaleDateString("es-ES") : "Actual"}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#6b7280" }}>{h.notas || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

