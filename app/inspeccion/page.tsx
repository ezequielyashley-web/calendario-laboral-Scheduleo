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

  const SECCIONES = [
    { key: "fichajes", label: "Registro de jornada", icon: "🕐" },
    { key: "modificaciones", label: "Log de modificaciones", icon: "📝" },
    { key: "empleados", label: "Plantilla", icon: "👥" },
    { key: "vacaciones", label: "Vacaciones", icon: "🏖️" },
    { key: "bajas", label: "Bajas médicas", icon: "🏥" },
  ]

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

  const exportarCSV = () => {
    if (!datos.length) return
    const headers = Object.keys(datos[0]).join(",")
    const rows = datos.map((r: any) => Object.values(r).map(v => `"${v ?? ""}"`).join(",")).join("\n")
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inspeccion_${seccion}_${filtros.desde}_${filtros.hasta}.csv`
    a.click()
  }

  const exportarPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const seccionLabel = SECCIONES.find(s => s.key === seccion)?.label || seccion

    doc.setFillColor(30, 27, 75)
    doc.rect(0, 0, 297, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(empresa.razonSocial || empresa.nombre || "Empresa", 14, 12)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`CIF: ${empresa.cif || "—"} · ${empresa.direccion || ""} · ${empresa.ciudad || ""}`, 14, 19)
    doc.text(`Informe: ${seccionLabel} · Período: ${filtros.desde} / ${filtros.hasta}`, 14, 25)
    doc.setTextColor(180, 180, 200)
    doc.text("RDL 8/2019 · Normativa Control Horario 2026 · Documento oficial de auditoría", 14, 29)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(seccionLabel, 14, 40)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    doc.text(`${datos.length} registros · Generado el ${new Date().toLocaleString("es-ES")}`, 14, 46)

    let columns: any[] = []
    let rows: any[] = []

    if (seccion === "fichajes") {
      columns = [
        { header: "Nº Emp.", dataKey: "num" },
        { header: "Nombre", dataKey: "nombre" },
        { header: "Apellidos", dataKey: "apellidos" },
        { header: "Fecha", dataKey: "fecha" },
        { header: "Entrada", dataKey: "entrada" },
        { header: "Salida", dataKey: "salida" },
        { header: "Horas", dataKey: "horas" },
        { header: "Modificado", dataKey: "modificado" },
        { header: "Estado", dataKey: "estado" },
      ]
      rows = datos.map((r: any) => {
        const entrada = new Date(r.horaentrada || r.horaEntrada)
        const salida = (r.horasalida || r.horaSalida) ? new Date(r.horasalida || r.horaSalida) : null
        const horas = salida ? ((salida.getTime() - entrada.getTime()) / 3600000).toFixed(1) + "h" : "—"
        return {
          num: r.numeroempleado || r.numeroEmpleado,
          nombre: r.nombre,
          apellidos: r.apellidos,
          fecha: entrada.toLocaleDateString("es-ES"),
          entrada: entrada.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          salida: salida ? salida.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—",
          horas,
          modificado: (r.fue_modificado === "SI" || r.modificado) ? "SÍ" : "NO",
          estado: salida ? "Completo" : "En curso",
        }
      })
    } else if (seccion === "modificaciones") {
      columns = [
        { header: "Fecha", dataKey: "fecha" },
        { header: "Empleado", dataKey: "empleado" },
        { header: "Campo", dataKey: "campo" },
        { header: "Valor anterior", dataKey: "anterior" },
        { header: "Valor nuevo", dataKey: "nuevo" },
        { header: "Modificado por", dataKey: "por" },
        { header: "Motivo", dataKey: "motivo" },
      ]
      rows = datos.map((r: any) => ({
        fecha: new Date(r.creadoEn || r.creadoen).toLocaleString("es-ES"),
        empleado: `${r.nombre || ""} ${r.apellidos || ""}`,
        campo: r.campoModificado || r.campomodificado,
        anterior: r.valorAnterior || r.valoranterior || "—",
        nuevo: r.valorNuevo || r.valornuevo || "—",
        por: r.modificadoPor || r.modificadopor,
        motivo: r.motivoCambio || r.motivocambio || "—",
      }))
    } else if (seccion === "empleados") {
      columns = [
        { header: "Nº Emp.", dataKey: "num" },
        { header: "Nombre", dataKey: "nombre" },
        { header: "Apellidos", dataKey: "apellidos" },
        { header: "DNI", dataKey: "dni" },
        { header: "Fecha contratación", dataKey: "contratacion" },
      ]
      rows = datos.map((r: any) => ({
        num: r.numeroempleado || r.numeroEmpleado,
        nombre: r.nombre,
        apellidos: r.apellidos,
        dni: r.dni || "—",
        contratacion: (r.fechacontratacion || r.fechaContratacion) ? new Date(r.fechacontratacion || r.fechaContratacion).toLocaleDateString("es-ES") : "—",
      }))
    } else if (seccion === "vacaciones") {
      columns = [
        { header: "Nº Emp.", dataKey: "num" },
        { header: "Nombre", dataKey: "nombre" },
        { header: "Apellidos", dataKey: "apellidos" },
        { header: "Desde", dataKey: "desde" },
        { header: "Hasta", dataKey: "hasta" },
        { header: "Días", dataKey: "dias" },
        { header: "Estado", dataKey: "estado" },
      ]
      rows = datos.map((r: any) => ({
        num: r.numeroempleado || r.numeroEmpleado,
        nombre: r.nombre,
        apellidos: r.apellidos,
        desde: new Date(r.fechainicio || r.fechaInicio).toLocaleDateString("es-ES"),
        hasta: new Date(r.fechafin || r.fechaFin).toLocaleDateString("es-ES"),
        dias: Math.ceil((new Date(r.fechafin || r.fechaFin).getTime() - new Date(r.fechainicio || r.fechaInicio).getTime()) / 86400000),
        estado: r.estado,
      }))
    } else if (seccion === "bajas") {
      columns = [
        { header: "Nº Emp.", dataKey: "num" },
        { header: "Nombre", dataKey: "nombre" },
        { header: "Apellidos", dataKey: "apellidos" },
        { header: "Tipo", dataKey: "tipo" },
        { header: "Inicio", dataKey: "inicio" },
        { header: "Fin", dataKey: "fin" },
        { header: "Estado", dataKey: "estado" },
      ]
      rows = datos.map((r: any) => ({
        num: r.numeroempleado || r.numeroEmpleado,
        nombre: r.nombre,
        apellidos: r.apellidos,
        tipo: r.tipo,
        inicio: new Date(r.fechainicio || r.fechaInicio).toLocaleDateString("es-ES"),
        fin: (r.fechafin || r.fechaFin) ? new Date(r.fechafin || r.fechaFin).toLocaleDateString("es-ES") : "En curso",
        estado: r.estado,
      }))
    }

    autoTable(doc, {
      startY: 50,
      columns,
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [30, 27, 75], textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Página ${data.pageNumber} de ${pageCount} · ${empresa.razonSocial || empresa.nombre} · CIF: ${empresa.cif} · Generado: ${new Date().toLocaleString("es-ES")} · RDL 8/2019`,
          14, doc.internal.pageSize.height - 8
        )
      }
    })

    doc.save(`inspeccion_${seccion}_${filtros.desde}_${filtros.hasta}.pdf`)
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

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff" }}>

      <div style={{ background: "#1e1b4b", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "#6366f1", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700 }}>
            INSPECCIÓN
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>{empresa.razonSocial || empresa.nombre}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>CIF: {empresa.cif} · Acceso de solo lectura · RDL 8/2019 · Normativa 2026</div>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "right" }}>
          <div>Sesión registrada</div>
          <div>{new Date().toLocaleString("es-ES")}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24, display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>

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

          {seccion !== "modificaciones" && seccion !== "empleados" && (
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
          )}
        </div>

        <div>
          <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "0.5px solid #e8eaf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1e1b4b", margin: 0 }}>
                  {SECCIONES.find(s => s.key === seccion)?.label}
                </h2>
                <p style={{ fontSize: 12, color: "#a0aec0", margin: "2px 0 0" }}>{datos.length} registros · Solo lectura · Inmutable</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={exportarCSV}
                  style={{ background: "#f0f4ff", color: "#6366f1", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  Exportar CSV
                </button>
                <button onClick={exportarPDF}
                  style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  Exportar PDF
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
                      {seccion === "fichajes" && ["Nº Emp.", "Nombre", "Apellidos", "Fecha", "Entrada", "Salida", "Horas", "Modificado", "Estado"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                      {seccion === "modificaciones" && ["Fecha", "Empleado", "Campo", "Valor anterior", "Valor nuevo", "Modificado por", "Motivo"].map(h => (
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
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{(r.horasalida || r.horaSalida) ? new Date(r.horasalida || r.horaSalida).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 600 }}>
                              {(r.horasalida || r.horaSalida) ? ((new Date(r.horasalida || r.horaSalida).getTime() - new Date(r.horaentrada || r.horaEntrada).getTime()) / 3600000).toFixed(1) + "h" : "—"}
                            </td>
                            <td style={{ padding: "9px 14px" }}>
                              {(r.fue_modificado === "SI" || r.modificado) ? (
                                <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Modificado</span>
                              ) : (
                                <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Original</span>
                              )}
                            </td>
                            <td style={{ padding: "9px 14px" }}>
                              <span style={{ background: (r.horasalida || r.horaSalida) ? "#d1fae5" : "#fef3c7", color: (r.horasalida || r.horaSalida) ? "#065f46" : "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                {(r.horasalida || r.horaSalida) ? "Completo" : "En curso"}
                              </span>
                            </td>
                          </>
                        )}
                        {seccion === "modificaciones" && (
                          <>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{new Date(r.creadoEn || r.creadoen).toLocaleString("es-ES")}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.nombre} {r.apellidos}</td>
                            <td style={{ padding: "9px 14px" }}>
                              <span style={{ background: "#ede9fe", color: "#6366f1", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.campoModificado || r.campomodificado}</span>
                            </td>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#dc2626" }}>{r.valorAnterior || r.valoranterior || "—"}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#059669" }}>{r.valorNuevo || r.valornuevo || "—"}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 500 }}>{r.modificadoPor || r.modificadopor}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#718096" }}>{r.motivoCambio || r.motivocambio || "—"}</td>
                          </>
                        )}
                        {seccion === "empleados" && (
                          <>
                            <td style={{ padding: "9px 14px", fontSize: 12, color: "#718096" }}>{r.numeroempleado || r.numeroEmpleado}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.nombre}</td>
                            <td style={{ padding: "9px 14px", fontSize: 13 }}>{r.apellidos}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{r.dni || "—"}</td>
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{(r.fechacontratacion || r.fechaContratacion) ? new Date(r.fechacontratacion || r.fechaContratacion).toLocaleDateString("es-ES") : "—"}</td>
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
                            <td style={{ padding: "9px 14px", fontSize: 12 }}>{(r.fechafin || r.fechaFin) ? new Date(r.fechafin || r.fechaFin).toLocaleDateString("es-ES") : "En curso"}</td>
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
            <div style={{ fontSize: 11, color: "#a0aec0", display: "flex", gap: 24, flexWrap: "wrap" }}>
              <span>🔒 Acceso de solo lectura — RDL 8/2019 y normativa 2026</span>
              <span>📋 Sesión registrada con timestamp e IP</span>
              <span>📝 Log de modificaciones inmutable</span>
              <span>⏱️ Registros conservados 4 años según la ley</span>
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
