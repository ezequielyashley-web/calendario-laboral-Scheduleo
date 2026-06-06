"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function InspeccionContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [acceso, setAcceso] = useState(false)
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(true)
  const [seccion, setSeccion] = useState("fichajes")
  const [datos, setDatos] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [empresa, setEmpresa] = useState<any>({})
  const [filtros, setFiltros] = useState({
    desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    hasta: new Date().toISOString().split("T")[0],
    empleadoId: ""
  })

  useEffect(() => {
    if (!token) { setError("Token no proporcionado"); setCargando(false); return }
    verificarToken()
  }, [token])

  const verificarToken = async () => {
    const res = await fetch("/api/inspeccion/acceso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, seccion: "acceso_inicial" })
    })
    const data = await res.json()
    setCargando(false)
    if (data.error) { setError(data.error); return }
    setAcceso(true)
    const emp = await fetch("/api/empresa").then(r => r.json())
    setEmpresa(emp)
    cargarEmpleados()
    cargarDatos("fichajes")
  }

  const cargarEmpleados = async () => {
    const res = await fetch(`/api/inspeccion/datos?token=${token}&tipo=empleados`)
    const data = await res.json()
    setEmpleados(Array.isArray(data) ? data : [])
  }

  const cargarDatos = async (tipo = seccion) => {
    setLoadingDatos(true)
    const params = new URLSearchParams({ token, tipo, desde: filtros.desde, hasta: filtros.hasta })
    if (filtros.empleadoId) params.set("empleadoId", filtros.empleadoId)
    const res = await fetch(`/api/inspeccion/datos?${params}`)
    const data = await res.json()
    setDatos(Array.isArray(data) ? data : [])
    setLoadingDatos(false)
  }

  const cambiarSeccion = (s) => {
    setSeccion(s)
    cargarDatos(s)
  }

  if (cargando) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4ff" }}>
      <div style={{ textAlign: "center", color: "#6366f1" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 14 }}>Verificando acceso...</div>
      </div>
    </div>
  )

  if (error || !acceso) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4ff" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#dc2626", margin: "0 0 8px" }}>Acceso denegado</h2>
        <p style={{ fontSize: 14, color: "#718096", margin: 0 }}>{error || "Token inválido o expirado"}</p>
      </div>
    </div>
  )

  const SECCIONES = [
    { key: "fichajes", label: "Registro de jornada", icon: "🕐" },
    { key: "empleados", label: "Plantilla", icon: "👥" },
    { key: "vacaciones", label: "Vacaciones", icon: "🏖️" },
    { key: "bajas", label: "Bajas médicas", icon: "🏥" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff" }}>

      {/* Header oficial */}
      <div style={{ background: "#1e1b4b", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "#6366f1", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700 }}>
            INSPECCIÓN
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>{empresa.razonSocial || empresa.nombre}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>CIF: {empresa.cif} · Acceso de solo lectura · RDL 8/2019</div>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "right" }}>
          <div>Acceso autorizado</div>
          <div>{new Date().toLocaleString("es-ES")}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0, maxWidth: 1400, margin: "0 auto", padding: 24, gap: 20 }}>

        {/* Sidebar */}
        <div>
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#a0aec0", fontWeight: 600, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Secciones</div>
            {SECCIONES.map(s => (
              <button key={s.key} onClick={() => cambiarSeccion(s.key)}
                style={{ width: "100%", textAlign: "left", padding: "10px 12px", border: "none", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontWeight: seccion === s.key ? 600 : 400, color: seccion === s.key ? "#6366f1" : "#718096", background: seccion === s.key ? "#ede9fe" : "transparent", cursor: "pointer", marginBottom: 2 }}>
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#a0aec0", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Filtros</div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, color: "#a0aec0", marginBottom: 4 }}>Desde</label>
              <input type="date" value={filtros.desde} onChange={e => setFiltros(p => ({ ...p, desde: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8eaf0", borderRadius: 7, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, color: "#a0aec0", marginBottom: 4 }}>Hasta</label>
              <input type="date" value={filtros.hasta} onChange={e => setFiltros(p => ({ ...p, hasta: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8eaf0", borderRadius: 7, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            {seccion === "fichajes" && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 11, color: "#a0aec0", marginBottom: 4 }}>Empleado</label>
                <select value={filtros.empleadoId} onChange={e => setFiltros(p => ({ ...p, empleadoId: e.target.value }))}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8eaf0", borderRadius: 7, fontSize: 13 }}>
                  <option value="">Todos</option>
                  {empleados.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={() => cargarDatos()}
              style={{ width: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Aplicar filtros
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div>
          <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "0.5px solid #e8eaf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>
                  {SECCIONES.find(s => s.key === seccion)?.label}
                </h2>
                <p style={{ fontSize: 12, color: "#a0aec0", margin: "2px 0 0" }}>{datos.length} registros · Solo lectura</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  const csv = datos.map((r: any) => Object.values(r).join(",")).join("\n")
                  const blob = new Blob([Object.keys(datos[0] || {}).join(",") + "\n" + csv], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a"); a.href = url; a.download = `${seccion}_${filtros.desde}_${filtros.hasta}.csv`; a.click()
                }} style={{ background: "#f0f4ff", color: "#6366f1", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  Exportar CSV
                </button>
                <button onClick={() => window.print()}
                  style={{ background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  Imprimir
                </button>
              </div>
            </div>

            {loadingDatos ? (
              <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando registros...</div>
            ) : datos.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Sin registros en el período seleccionado</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9ff" }}>
                      {seccion === "fichajes" && ["Nº Emp.", "Nombre", "Apellidos", "Fecha", "Entrada", "Salida", "Horas", "Estado"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                      {seccion === "empleados" && ["Nº Emp.", "Nombre", "Apellidos", "DNI", "Contratación"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                      ))}
                      {seccion === "vacaciones" && ["Nº Emp.", "Nombre", "Apellidos", "Desde", "Hasta", "Días", "Estado"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                      ))}
                      {seccion === "bajas" && ["Nº Emp.", "Nombre", "Apellidos", "Tipo", "Inicio", "Fin", "Estado"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((r: any, i) => (
                      <tr key={r.id || i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                        {seccion === "fichajes" && (
                          <>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#718096" }}>{r.numeroempleado || r.numeroEmpleado}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.nombre}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.apellidos}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{new Date(r.horaentrada || r.horaEntrada).toLocaleDateString("es-ES")}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{new Date(r.horaentrada || r.horaEntrada).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{r.horasalida || r.horaSalida ? new Date(r.horasalida || r.horaSalida).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 600 }}>
                              {r.horasalida || r.horaSalida ? ((new Date(r.horasalida || r.horaSalida).getTime() - new Date(r.horaentrada || r.horaEntrada).getTime()) / 3600000).toFixed(1) + "h" : "—"}
                            </td>
                            <td style={{ padding: "9px 14px" }}>
                              <span style={{ background: (r.horasalida || r.horaSalida) ? "#d1fae5" : "#fef3c7", color: (r.horasalida || r.horaSalida) ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                {(r.horasalida || r.horaSalida) ? "Completo" : "En curso"}
                              </span>
                            </td>
                          </>
                        )}
                        {seccion === "empleados" && (
                          <>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#718096" }}>{r.numeroempleado || r.numeroEmpleado}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.nombre}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.apellidos}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{r.dni || "—"}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{r.fechacontratacion || r.fechaContratacion ? new Date(r.fechacontratacion || r.fechaContratacion).toLocaleDateString("es-ES") : "—"}</td>
                          </>
                        )}
                        {seccion === "vacaciones" && (
                          <>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#718096" }}>{r.numeroempleado || r.numeroEmpleado}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.nombre}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.apellidos}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{new Date(r.fechainicio || r.fechaInicio).toLocaleDateString("es-ES")}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{new Date(r.fechafin || r.fechaFin).toLocaleDateString("es-ES")}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 600 }}>{Math.ceil((new Date(r.fechafin || r.fechaFin).getTime() - new Date(r.fechainicio || r.fechaInicio).getTime()) / 86400000)}</td>
                            <td style={{ padding: "9px 14px" }}>
                              <span style={{ background: r.estado === "APROBADA" ? "#d1fae5" : "#fef3c7", color: r.estado === "APROBADA" ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.estado}</span>
                            </td>
                          </>
                        )}
                        {seccion === "bajas" && (
                          <>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#718096" }}>{r.numeroempleado || r.numeroEmpleado}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.nombre}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.apellidos}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 600 }}>{r.tipo}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{new Date(r.fechainicio || r.fechaInicio).toLocaleDateString("es-ES")}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{r.fechafin || r.fechaFin ? new Date(r.fechafin || r.fechaFin).toLocaleDateString("es-ES") : "En curso"}</td>
                            <td style={{ padding: "9px 14px" }}>
                              <span style={{ background: r.estado === "CERRADA" ? "#d1fae5" : "#fef3c7", color: r.estado === "CERRADA" ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.estado}</span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, padding: "12px 16px", background: "#fff", borderRadius: 12, border: "0.5px solid #e8eaf0" }}>
            <div style={{ fontSize: 11, color: "#a0aec0", display: "flex", gap: 24 }}>
              <span>🔒 Acceso de solo lectura — RDL 8/2019 y normativa 2026</span>
              <span>📋 Sesión registrada con timestamp y IP</span>
              <span>⏱️ Los registros se conservan 4 años según la ley</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InspeccionPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Cargando...</div>}>
      <InspeccionContent />
    </Suspense>
  )
}