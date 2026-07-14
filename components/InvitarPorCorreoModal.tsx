"use client"
import { useState } from "react"

const violeta = "#673DE6"
const gris = "#6B7280"
const grisClaro = "#E5E7EB"

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: `1px solid ${grisClaro}`, borderRadius: 8, fontSize: 13,
  boxSizing: "border-box" as const, marginBottom: 12, outline: "none"
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const
}

const MODULOS = [
  { modulo: "Empleados", ver: "empleados_ver", mod: "empleados_mod" },
  { modulo: "Vacaciones", ver: "vacaciones_ver", mod: "vacaciones_mod" },
  { modulo: "Fichajes", ver: "fichajes_ver", mod: "fichajes_mod" },
  { modulo: "Reportes", ver: "reportes_ver", mod: "reportes_mod" },
  { modulo: "Bajas medicas", ver: "bajas_ver", mod: "bajas_mod" },
  { modulo: "Cambios de turno", ver: "cambios_ver", mod: "cambios_mod" },
  { modulo: "Deudas", ver: "deudas_ver", mod: "deudas_mod" },
  { modulo: "Grupos", ver: "grupos_ver", mod: "grupos_mod" },
  { modulo: "Libranzas", ver: "libranzas_ver", mod: "libranzas_mod" },
  { modulo: "Minimos por puesto", ver: "minimos_ver", mod: "minimos_mod" },
  { modulo: "Calendario", ver: "calendario_ver", mod: "calendario_mod" },
  { modulo: "Configuracion", ver: "config_ver", mod: "config_mod" },
]

export default function InvitarPorCorreoModal({ onCerrar }: { onCerrar: () => void }) {
  const [email, setEmail] = useState("")
  const [rol, setRol] = useState("GERENCIAL")
  const [cargo, setCargo] = useState("")
  const [departamento, setDepartamento] = useState("")
  const [tipoContrato, setTipoContrato] = useState("indefinido")
  const [jornada, setJornada] = useState("completa")
  const [horario, setHorario] = useState("")
  const [sueldoBase, setSueldoBase] = useState("")
  const [funciones, setFunciones] = useState("")
  const [permisos, setPermisos] = useState<Record<string, boolean>>({})

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [enviado, setEnviado] = useState(false)

  const togglePermiso = (clave: string) => {
    setPermisos(prev => ({ ...prev, [clave]: !prev[clave] }))
  }

  const enviar = async () => {
    setError("")
    if (!email.trim()) { setError("El email es obligatorio"); return }
    if (Object.keys(permisos).filter(k => permisos[k]).length === 0) { setError("Debes asignar al menos un permiso de acceso al sistema"); return }
    setEnviando(true)
    const res = await fetch("/api/invitaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, rol, cargo, departamento, tipoContrato, jornada, horario, sueldoBase, funciones, permisos })
    })
    const data = await res.json()
    setEnviando(false)
    if (data.error) { setError(data.error); return }
    setEnviado(true)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("invitacionEnviada"))
    setTimeout(() => onCerrar(), 1800)
  }

  return (
    <div onClick={onCerrar} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto" }}>

        {enviado ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Invitación enviada correctamente</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Invitar por correo</div>
            <div style={{ fontSize: 12.5, color: gris, marginBottom: 18 }}>La persona recibirá un correo con un enlace de un solo uso para crear su propia cuenta.</div>

            <label style={labelStyle}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="nombre@ejemplo.com" />

            <label style={labelStyle}>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="GERENCIAL">Agente gerencial</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Cargo</label>
                <input value={cargo} onChange={e => setCargo(e.target.value)} style={inputStyle} placeholder="Encargado de tienda" />
              </div>
              <div>
                <label style={labelStyle}>Departamento</label>
                <input value={departamento} onChange={e => setDepartamento(e.target.value)} style={inputStyle} placeholder="Operaciones" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Tipo de contrato</label>
                <select value={tipoContrato} onChange={e => setTipoContrato(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="indefinido">Indefinido</option>
                  <option value="temporal">Temporal</option>
                  <option value="obra y servicio">Obra y servicio</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Jornada</label>
                <select value={jornada} onChange={e => setJornada(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="completa">Completa</option>
                  <option value="parcial">Parcial</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Horario</label>
                <input value={horario} onChange={e => setHorario(e.target.value)} style={inputStyle} placeholder="Turno de mañana" />
              </div>
              <div>
                <label style={labelStyle}>Salario bruto anual</label>
                <input value={sueldoBase} onChange={e => setSueldoBase(e.target.value.replace(/[^0-9.]/g, ""))} style={inputStyle} placeholder="21000" />
              </div>
            </div>

            <label style={labelStyle}>Funciones (una por línea)</label>
            <textarea
              value={funciones}
              onChange={e => setFunciones(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }}
              placeholder={"Gestión de turnos del personal\nAprobación de vacaciones y bajas"}
            />

            <label style={labelStyle}>Acceso al sistema</label>
            <div style={{ background: "#F8FAFC", borderRadius: 10, border: `1px solid ${grisClaro}`, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px", background: "#F1F5F9", borderBottom: `1px solid ${grisClaro}` }}>
                <div style={{ padding: "7px 12px", fontSize: 10.5, fontWeight: 700, color: "#94A3B8" }}>MODULO</div>
                <div style={{ padding: "7px 0", fontSize: 10.5, fontWeight: 700, color: "#94A3B8", textAlign: "center" as const }}>VER</div>
                <div style={{ padding: "7px 0", fontSize: 10.5, fontWeight: 700, color: "#94A3B8", textAlign: "center" as const }}>MODIFICAR</div>
              </div>
              {MODULOS.map(m => (
                <div key={m.modulo} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px", borderBottom: "1px solid #EEF0F3", alignItems: "center" }}>
                  <div style={{ padding: "7px 12px", fontSize: 12, color: "#374151" }}>{m.modulo}</div>
                  <div style={{ textAlign: "center" as const }}>
                    <input type="checkbox" checked={!!permisos[m.ver]} onChange={() => togglePermiso(m.ver)} style={{ cursor: "pointer" }} />
                  </div>
                  <div style={{ textAlign: "center" as const }}>
                    <input type="checkbox" checked={!!permisos[m.mod]} onChange={() => togglePermiso(m.mod)} style={{ cursor: "pointer" }} />
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={{ color: "#DC2626", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button onClick={onCerrar} style={{ background: "none", border: "none", color: gris, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Cancelar</button>
              <button
                onClick={enviar}
                disabled={enviando}
                style={{ background: violeta, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: enviando ? 0.6 : 1 }}>
                {enviando ? "Enviando..." : "Enviar invitación"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}