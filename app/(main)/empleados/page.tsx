"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const grupoColors: Record<string, { bg: string; color: string; border: string; avatar: string }> = {
  G1A: { bg: '#ede9fe', color: '#6366f1', border: '#c4b5fd', avatar: '#6366f1' },
  G1B: { bg: '#e0e7ff', color: '#4f46e5', border: '#a5b4fc', avatar: '#4f46e5' },
  G2A: { bg: '#e0f2fe', color: '#0891b2', border: '#7dd3fc', avatar: '#0891b2' },
  G2B: { bg: '#cffafe', color: '#0e7490', border: '#67e8f9', avatar: '#0e7490' },
  G3A: { bg: '#dcfce7', color: '#16a34a', border: '#86efac', avatar: '#16a34a' },
  G3B: { bg: '#d1fae5', color: '#15803d', border: '#6ee7b7', avatar: '#15803d' },
  L1:  { bg: '#fef9c3', color: '#d97706', border: '#fde68a', avatar: '#d97706' },
  L2:  { bg: '#fef3c7', color: '#ca8a04', border: '#fcd34d', avatar: '#ca8a04' },
  L3:  { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', avatar: '#dc2626' },
}

const formInicial = {
  nombre: "", apellidos: "", email: "", pin: "",
  dni: "", naf: "", iban: "", telefono: "", salario: "",
  fechaNacimiento: "", fechaContratacion: "",
  grupoTrabajoId: "", puestoDeTrabajoId: "",
  diasVacaciones: "22", diasAsuntosPropios: "6",
}

export default function EmpleadosPage() {
  const router = useRouter()
  const [empleados, setEmpleados] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)
  const [grupos, setGrupos] = useState<any[]>([])
  const [puestos, setPuestos] = useState<any[]>([])
  const [modalAlta, setModalAlta] = useState(false)
  const [form, setForm] = useState(formInicial)
  const [guardando, setGuardando] = useState(false)
  const [errorAlta, setErrorAlta] = useState("")

  const cargarEmpleados = () => {
    fetch("/api/empleados?empresaId=empresa-001")
      .then(r => r.json())
      .then(data => { setEmpleados(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => {
    fetch("/api/config/modo-demo").then(r => r.json()).then(d => setModoDemo(d.modoDemo))
    fetch("/api/grupos").then(r => r.json()).then(d => setGrupos(Array.isArray(d) ? d : []))
    fetch("/api/puestos").then(r => r.json()).then(d => setPuestos(Array.isArray(d) ? d : []))
    cargarEmpleados()
  }, [])

  const crearEmpleado = async () => {
    setErrorAlta("")
    if (!form.nombre || !form.apellidos || !form.email) {
      setErrorAlta("Nombre, apellidos y email son obligatorios")
      return
    }
    setGuardando(true)
    try {
      const res = await fetch("/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          diasVacaciones:     parseInt(form.diasVacaciones),
          diasAsuntosPropios: parseInt(form.diasAsuntosPropios),
        })
      })
      const data = await res.json()
      if (!res.ok) { setErrorAlta(data.error || "Error al crear empleado"); return }
      setModalAlta(false)
      setForm(formInicial)
      cargarEmpleados()
    } catch {
      setErrorAlta("Error de conexion")
    } finally {
      setGuardando(false)
    }
  }

  const normalizar = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const busquedaNorm = normalizar(busqueda)
  const filtrados = empleados.filter((e: any) =>
    normalizar(`${e.nombre} ${e.apellidos}`).includes(busquedaNorm) ||
    normalizar(e.numeroEmpleado || "").includes(busquedaNorm)
  )

  const porGrupo = filtrados.reduce((acc: any, e: any) => {
    const grupo = e.gruponombre || e.grupoNombre || "Sin grupo"
    if (!acc[grupo]) acc[grupo] = []
    acc[grupo].push(e)
    return acc
  }, {})

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0",
    borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box",
    outline: "none", background: "#fafafa",
  }
  const labelStyle = { display: "block", fontSize: 12, color: "#6b7280", marginBottom: 4, fontWeight: 500 }

  return (
    <div className="empleados-responsive-wrap" style={{ padding: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <style>{`
        @media (max-width: 768px) {
          .empleados-responsive-wrap { padding: 14px !important; }
          .empleados-header-responsive { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .empleados-search-input { width: 100% !important; box-sizing: border-box !important; }
        }
      `}</style>

      {modoDemo && (
        <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 14, padding: "16px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 28 }}>🧪</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Modo demostracion activo</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                Estas viendo <strong>50 empleados ficticios</strong> de prueba.
              </div>
            </div>
          </div>
          <button onClick={() => router.push("/configuracion")}
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Ir a Configuracion
          </button>
        </div>
      )}

      <div className="empleados-header-responsive" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#6366f1", margin: 0 }}>Empleados</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>{empleados.length} empleados {modoDemo ? "de demostracion" : "en total"}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar empleado..." className="empleados-search-input"
            style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, width: 220, outline: "none" }} />
          {!modoDemo && (
            <button onClick={() => setModalAlta(true)}
              style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              + Nuevo empleado
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>No se encontraron empleados</div>
      ) : (
        Object.entries(porGrupo).map(([grupo, emps]) => {
          const gc = grupoColors[grupo] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', avatar: '#6b7280' }
          return (
            <div key={grupo} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 16px", background: gc.bg, border: `1px solid ${gc.border}`, borderRadius: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: gc.avatar, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  {grupo}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: gc.color }}>Grupo {grupo}</div>
                  <div style={{ fontSize: 11, color: gc.color, opacity: 0.7 }}>{(emps as any[]).length} empleados asignados</div>
                </div>
                {modoDemo && (
                  <span style={{ marginLeft: "auto", background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>DEMO</span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, width: "100%" }}>
                {(emps as any[]).map((e: any) => (
                  <div key={e.id} onClick={() => router.push(`/empleados/${e.id}`)}
                    style={{ background: "#fff", border: `1px solid ${gc.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 12, position: "relative" }}
                    onMouseEnter={el => { el.currentTarget.style.background = gc.bg; el.currentTarget.style.transform = "translateY(-1px)" }}
                    onMouseLeave={el => { el.currentTarget.style.background = "#fff"; el.currentTarget.style.transform = "translateY(0)" }}
                  >
                    {modoDemo && (
                      <div style={{ position: "absolute", top: 6, right: 8, background: "#f59e0b", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>DEMO</div>
                    )}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: gc.avatar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {e.nombre[0]}{e.apellidos[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {e.nombre} {e.apellidos}
                      </div>
                      <div style={{ fontSize: 11, color: gc.color, fontWeight: 500 }}>N {e.numeroEmpleado}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gc.color} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* MODAL NUEVO EMPLEADO REAL */}
      {modalAlta && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0369a1", margin: 0 }}>Nuevo empleado real</h2>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>Los datos sensibles se cifran con AES-256-GCM</p>
              </div>
              <button onClick={() => { setModalAlta(false); setForm(formInicial); setErrorAlta("") }}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>x</button>
            </div>

            {/* Datos basicos */}
            <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Datos basicos</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input style={inputStyle} value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Maria" />
                </div>
                <div>
                  <label style={labelStyle}>Apellidos *</label>
                  <input style={inputStyle} value={form.apellidos} onChange={e => setForm(p => ({ ...p, apellidos: e.target.value }))} placeholder="Garcia Lopez" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="maria@empresa.com" />
                </div>
                <div>
                  <label style={labelStyle}>PIN acceso (4 digitos)</label>
                  <input style={inputStyle} type="password" maxLength={4} value={form.pin} onChange={e => setForm(p => ({ ...p, pin: e.target.value }))} placeholder="1234" />
                </div>
                <div>
                  <label style={labelStyle}>Fecha nacimiento</label>
                  <input style={inputStyle} type="date" value={form.fechaNacimiento} onChange={e => setForm(p => ({ ...p, fechaNacimiento: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Fecha contratacion</label>
                  <input style={inputStyle} type="date" value={form.fechaContratacion} onChange={e => setForm(p => ({ ...p, fechaContratacion: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Datos sensibles cifrados */}
            <div style={{ background: "#fefce8", borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                Datos sensibles - cifrado AES-256
              </div>
              <div style={{ fontSize: 11, color: "#92400e", marginBottom: 12 }}>Estos datos se almacenan cifrados. Solo el sistema puede leerlos.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>DNI / NIE</label>
                  <input style={inputStyle} value={form.dni} onChange={e => setForm(p => ({ ...p, dni: e.target.value }))} placeholder="12345678A" />
                </div>
                <div>
                  <label style={labelStyle}>NAF (Num. Afiliacion SS)</label>
                  <input style={inputStyle} value={form.naf} onChange={e => setForm(p => ({ ...p, naf: e.target.value }))} placeholder="28000000000" />
                </div>
                <div>
                  <label style={labelStyle}>IBAN</label>
                  <input style={inputStyle} value={form.iban} onChange={e => setForm(p => ({ ...p, iban: e.target.value }))} placeholder="ES91 2100 0418 45..." />
                </div>
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input style={inputStyle} value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="612345678" />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Salario bruto anual (EUR)</label>
                  <input style={inputStyle} type="number" value={form.salario} onChange={e => setForm(p => ({ ...p, salario: e.target.value }))} placeholder="18000" />
                </div>
              </div>
            </div>

            {/* Asignacion */}
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Asignacion</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Grupo de trabajo</label>
                  <select style={inputStyle} value={form.grupoTrabajoId} onChange={e => setForm(p => ({ ...p, grupoTrabajoId: e.target.value }))}>
                    <option value="">Sin asignar</option>
                    {grupos.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Puesto de trabajo</label>
                  <select style={inputStyle} value={form.puestoDeTrabajoId} onChange={e => setForm(p => ({ ...p, puestoDeTrabajoId: e.target.value }))}>
                    <option value="">Sin asignar</option>
                    {puestos.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Dias de vacaciones</label>
                  <input style={inputStyle} type="number" min={0} max={60} value={form.diasVacaciones} onChange={e => setForm(p => ({ ...p, diasVacaciones: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Dias asuntos propios</label>
                  <input style={inputStyle} type="number" min={0} max={10} value={form.diasAsuntosPropios} onChange={e => setForm(p => ({ ...p, diasAsuntosPropios: e.target.value }))} />
                </div>
              </div>
            </div>

            {errorAlta && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                {errorAlta}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setModalAlta(false); setForm(formInicial); setErrorAlta("") }}
                style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151" }}>
                Cancelar
              </button>
              <button onClick={crearEmpleado} disabled={guardando}
                style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: guardando ? "#93c5fd" : "#0369a1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: guardando ? "not-allowed" : "pointer" }}>
                {guardando ? "Guardando..." : "Crear empleado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}