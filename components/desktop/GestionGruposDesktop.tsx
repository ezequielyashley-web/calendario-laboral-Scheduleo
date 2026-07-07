"use client"
import { useState, useEffect } from "react"

type Empleado = { id: string; nombre: string; apellidos: string; numeroEmpleado: string }
type Puesto = { id: string; nombre: string; descripcion: string; empleados: Empleado[]; total_empleados: number }

const COLORES = ["#0284c7","#6366f1","#0891b2","#16a34a","#d97706","#7c3aed"]

export default function CoberturaDesktop() {
  const [puestos, setPuestos] = useState<Puesto[]>([])
  const [todosEmpleados, setTodosEmpleados] = useState<Empleado[]>([])
  const [cargando, setCargando] = useState(true)
  const [dragEmpleado, setDragEmpleado] = useState<{ empleado: Empleado; desdePuesto: string | null } | null>(null)
  const [dragOverPuesto, setDragOverPuesto] = useState<string | null>(null)
  const [modal, setModal] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [errorPass, setErrorPass] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [modalPuesto, setModalPuesto] = useState<any>(null)
  const [formPuesto, setFormPuesto] = useState({ nombre: "", descripcion: "" })

  const cargar = async () => {
    setCargando(true)
    const [p, e] = await Promise.all([
      fetch("/api/puestos?empresaId=empresa-001").then(r => r.json()),
      fetch("/api/empleados?empresaId=empresa-001").then(r => r.json()),
    ])
    setPuestos(Array.isArray(p) ? p : [])
    setTodosEmpleados(Array.isArray(e) ? e : [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const empleadosSinPuesto = todosEmpleados.filter(e =>
    !puestos.some(p => p.empleados.some(em => em.id === e.id))
  )

  const confirmarAccion = async () => {
    if (!password) { setErrorPass("Introduce la contrasena"); return }
    setGuardando(true)
    setErrorPass("")
    const res = await fetch("/api/puestos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...modal.payload, masterPassword: password })
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) { setErrorPass(data.error); return }
    setModal(null)
    setPassword("")
    cargar()
  }

  const confirmarPuesto = async () => {
    if (!password) { setErrorPass("Introduce la contrasena"); return }
    setGuardando(true)
    setErrorPass("")
    const res = await fetch("/api/puestos", {
      method: modalPuesto.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(modalPuesto.id ? { id: modalPuesto.id, accion: "editar" } : {}),
        nombre: formPuesto.nombre,
        descripcion: formPuesto.descripcion,
        empresaId: "empresa-001",
        masterPassword: password
      })
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) { setErrorPass(data.error); return }
    setModalPuesto(null)
    setPassword("")
    setFormPuesto({ nombre: "", descripcion: "" })
    cargar()
  }

  const onDrop = (hastaPuesto: string) => {
    if (!dragEmpleado) return
    if (dragEmpleado.desdePuesto === hastaPuesto) { setDragEmpleado(null); setDragOverPuesto(null); return }
    setModal({
      titulo: `Mover a ${puestos.find(p => p.id === hastaPuesto)?.nombre}`,
      descripcion: `Asignar a ${dragEmpleado.empleado.nombre} ${dragEmpleado.empleado.apellidos} al puesto seleccionado.`,
      payload: { id: hastaPuesto, empleadoId: dragEmpleado.empleado.id, accion: "asignar" }
    })
    setDragEmpleado(null)
    setDragOverPuesto(null)
  }

  const asignarEmpleado = (puestoId: string, empleado: Empleado) => {
    setModal({
      titulo: `Asignar a ${puestos.find(p => p.id === puestoId)?.nombre}`,
      descripcion: `Asignar a ${empleado.nombre} ${empleado.apellidos} a este puesto.`,
      payload: { id: puestoId, empleadoId: empleado.id, accion: "asignar" }
    })
  }

  const quitarEmpleado = (puestoId: string, empleado: Empleado) => {
    setModal({
      titulo: "Quitar del puesto",
      descripcion: `Quitar a ${empleado.nombre} ${empleado.apellidos} de este puesto.`,
      payload: { id: puestoId, empleadoId: empleado.id, accion: "quitar" }
    })
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }

  if (cargando) return <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Cargando puestos...</div>

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="puestos-header-responsive" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <style>{`
          @media (max-width: 640px) {
            .puestos-header-responsive { flex-direction: column !important; gap: 12px !important; align-items: stretch !important; }
            .puestos-header-responsive button { width: 100% !important; }
          }
        `}</style>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Puestos de trabajo</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Asigna y gestiona empleados por puesto arrastrando o usando el selector</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => { setModalPuesto({ id: null }); setFormPuesto({ nombre: "", descripcion: "" }) }}
            style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Nuevo puesto
          </button>
        </div>
      </div>

      {/* Sin puesto */}
      {empleadosSinPuesto.length > 0 && (
        <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#854d0e", marginBottom: 10 }}>
            Sin puesto asignado ({empleadosSinPuesto.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {empleadosSinPuesto.map(e => (
              <div key={e.id} draggable onDragStart={() => setDragEmpleado({ empleado: e, desdePuesto: null })}
                style={{ background: "#fff", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, color: "#92400e", cursor: "grab", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                  {e.nombre[0]}{e.apellidos[0]}
                </div>
                {e.nombre} {e.apellidos}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid puestos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {puestos.map((puesto, idx) => (
          <div key={puesto.id}
            onDragOver={e => { e.preventDefault(); setDragOverPuesto(puesto.id) }}
            onDragLeave={() => setDragOverPuesto(null)}
            onDrop={() => onDrop(puesto.id)}
            style={{ background: "var(--surface)", border: `2px solid ${dragOverPuesto === puesto.id ? "#0284c7" : "var(--border)"}`, borderRadius: 14, padding: 20, transition: "all 0.2s", boxShadow: dragOverPuesto === puesto.id ? "0 0 0 4px rgba(2,132,199,0.15)" : "var(--shadow-sm)", borderTop: `3px solid ${COLORES[idx % COLORES.length]}` }}>

            {/* Header puesto */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{puesto.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{puesto.descripcion}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ background: "#dbeafe", color: "#1e40af", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  {puesto.empleados.length} emp.
                </span>
                <button onClick={() => { setModalPuesto(puesto); setFormPuesto({ nombre: puesto.nombre, descripcion: puesto.descripcion }) }}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer", color: "var(--text-secondary)" }}>
                  Editar
                </button>
              </div>
            </div>

            {/* Empleados */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
              {puesto.empleados.length === 0 ? (
                <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12, border: "2px dashed var(--border)", borderRadius: 8 }}>
                  Arrastra empleados aqui
                </div>
              ) : puesto.empleados.map(emp => (
                <div key={emp.id} draggable onDragStart={() => setDragEmpleado({ empleado: emp, desdePuesto: puesto.id })}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border)", cursor: "grab" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${COLORES[idx % COLORES.length]},${COLORES[(idx+1) % COLORES.length]})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {emp.nombre[0]}{emp.apellidos[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.nombre} {emp.apellidos}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Nº {emp.numeroEmpleado}</div>
                  </div>
                  <button onClick={() => quitarEmpleado(puesto.id, emp)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, padding: "2px 4px", borderRadius: 4 }}>✕</button>
                </div>
              ))}
            </div>

            {/* Selector asignar */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <select onChange={e => {
                const emp = todosEmpleados.find(em => em.id === e.target.value)
                if (emp) { asignarEmpleado(puesto.id, emp); e.target.value = "" }
              }}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", background: "var(--surface)", cursor: "pointer" }}>
                <option value="">+ Asignar empleado...</option>
                {empleadosSinPuesto.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Modal confirmacion */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: 400, maxWidth: "90vw" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{modal.titulo}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>{modal.descripcion}</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Contrasena master para confirmar</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && confirmarAccion()}
                placeholder="••••••••" style={inputStyle} />
              {errorPass && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{errorPass}</p>}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setModal(null); setPassword(""); setErrorPass("") }}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "var(--text-secondary)" }}>
                Cancelar
              </button>
              <button onClick={confirmarAccion} disabled={guardando}
                style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {guardando ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar puesto */}
      {modalPuesto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: 420, maxWidth: "90vw" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
              {modalPuesto.id ? "Editar puesto" : "Nuevo puesto"}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Nombre del puesto</label>
              <input value={formPuesto.nombre} onChange={e => setFormPuesto(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Pescadero/a" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Descripcion</label>
              <input value={formPuesto.descripcion} onChange={e => setFormPuesto(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripcion del puesto" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Contrasena master</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={inputStyle} />
              {errorPass && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{errorPass}</p>}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setModalPuesto(null); setPassword(""); setErrorPass(""); setFormPuesto({ nombre: "", descripcion: "" }) }}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "var(--text-secondary)" }}>
                Cancelar
              </button>
              <button onClick={confirmarPuesto} disabled={guardando || !formPuesto.nombre}
                style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !formPuesto.nombre ? 0.6 : 1 }}>
                {guardando ? "Guardando..." : modalPuesto.id ? "Guardar cambios" : "Crear puesto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
