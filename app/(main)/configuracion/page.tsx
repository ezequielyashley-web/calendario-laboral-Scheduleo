"use client"
import { useApariencia } from "@/components/providers/AparienciaProvider"
import { PALETAS } from "@/lib/paletas"


import { useState, useEffect, useRef, Fragment } from "react"
import { createPortal } from "react-dom"
import PanelReportesFallo from "@/components/PanelReportesFallo"
import InvitarPorCorreoModal from "@/components/InvitarPorCorreoModal"
import ListaInvitacionesEnviadas from "@/components/ListaInvitacionesEnviadas"
import ListaSolicitudesPendientes from "@/components/ListaSolicitudesPendientes"
import ListaSolicitudesAccesoPublica from "@/components/ListaSolicitudesAccesoPublica"
import PanelSeguridadCert from "@/components/PanelSeguridadCert"
import Configuracion2FA from "@/components/Configuracion2FA"
import dynamicImport from "next/dynamic"
const SelectorTema = dynamicImport(() => import("@/components/SelectorTema"), { ssr: false })

const ROLES = ["SUPER_ADMIN", "ADMIN_SEDE", "EMPLEADO"]

const SECCIONES = [
  { key: "identidad", label: "Identidad legal" },
  { key: "contacto", label: "Contacto" },
  { key: "laboral", label: "Datos laborales" },
  { key: "apariencia", label: "Apariencia" },
  { key: "licencia", label: "Licencia" },
  { key: "inspeccion", label: "Inspección laboral" },
  { key: "usuarios", label: "Usuarios gerenciales" },
  { key: "demo", label: "Gestion de datos" },
  { key: "imap", label: "Email IMAP (Bajas IT)" },
  { key: "seguridad", label: "Seguridad" },
  { key: "ai", label: "ScheduleoAI" },
  { key: "reportes", label: "Reportes de fallos" },
]

function GenerarToken({ masterPassword }: { masterPassword: string }) {
  const [tokens, setTokens] = useState<any[]>([])
  const [horas, setHoras] = useState(24)
  const [generando, setGenerando] = useState(false)
  const [nuevoToken, setNuevoToken] = useState("")
  const [copiado, setCopiado] = useState(false)
  const [log, setLog] = useState<any[]>([])
  const [vistaLog, setVistaLog] = useState(false)

  const cargarTokens = async () => {
    const res = await fetch("/api/inspeccion/token")
    const data = await res.json()
    setTokens(Array.isArray(data) ? data : [])
  }

  const cargarLog = async () => {
    const res = await fetch("/api/inspeccion/log")
    const data = await res.json()
    setLog(Array.isArray(data) ? data : [])
  }

  useEffect(() => { cargarTokens(); cargarLog() }, [])

  const generarToken = async () => {
    setGenerando(true)
    const res = await fetch("/api/inspeccion/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword, horas, creadoPor: "SUPER_ADMIN" })
    })
    const data = await res.json()
    setGenerando(false)
    if (data.error) { alert(data.error); return }
    setNuevoToken(data.token)
    cargarTokens()
  }

  const eliminarToken = async (id: string) => {
    await fetch(`/api/inspeccion/token?id=${id}`, { method: "DELETE" })
    cargarTokens()
  }

  const urlInspeccion = (token) => `${window.location.origin}/inspeccion?token=${token}`

  const copiar = (texto) => {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const seccionLabel = (s) => {
    const map = { acceso_inicial: "Acceso inicial", fichajes: "Registro jornada", modificaciones: "Log modificaciones", empleados: "Plantilla", vacaciones: "Vacaciones", bajas: "Bajas médicas", alertas: "Alertas legales" }
    return map[s] || s
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setVistaLog(false)}
          style={{ padding: "8px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: !vistaLog ? 600 : 400, color: !vistaLog ? "var(--accent)" : "#718096", background: !vistaLog ? "var(--accent-dim)" : "#f3f4f6", cursor: "pointer" }}>
          Tokens activos
        </button>
        <button onClick={() => setVistaLog(true)}
          style={{ padding: "8px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: vistaLog ? 600 : 400, color: vistaLog ? "var(--accent)" : "#718096", background: vistaLog ? "var(--accent-dim)" : "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          Log de accesos
          {log.length > 0 && <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 20, fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>{log.length}</span>}
        </button>
      </div>

      {!vistaLog ? (
        <div>
          <div style={{ background: "#f8f9ff", border: "0.5px solid #e8eaf0", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b", marginBottom: 14 }}>Generar nuevo acceso de inspección</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Duración del acceso</label>
                <select value={horas} onChange={e => setHoras(parseInt(e.target.value))}
                  style={{ padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, background: "#fff" }}>
                  <option value={4}>4 horas</option>
                  <option value={8}>8 horas</option>
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                </select>
              </div>
              <button onClick={generarToken} disabled={generando}
                style={{ background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                {generando ? "Generando..." : "Generar enlace de acceso"}
              </button>
            </div>

            {nuevoToken && (
              <div style={{ marginTop: 16, background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, color: "#065f46", fontWeight: 600, marginBottom: 8 }}>Enlace generado — cópialo y envíaselo al inspector</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input readOnly value={urlInspeccion(nuevoToken)}
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid #6ee7b7", borderRadius: 8, fontSize: 12, background: "#fff", color: "#1e1b4b" }} />
                  <button onClick={() => copiar(urlInspeccion(nuevoToken))}
                    style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {copiado ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "#065f46", marginTop: 8 }}>Este enlace expira en {horas} horas. El inspector solo puede ver datos, no modificarlos.</div>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b", marginBottom: 12 }}>Tokens generados</div>
            {tokens.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#a0aec0", fontSize: 13, background: "#f8f9ff", borderRadius: 10 }}>No hay tokens generados</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tokens.map(t => {
                  const expirado = new Date(t.expiraEn) < new Date()
                  return (
                    <div key={t.id} style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ background: expirado ? "#fee2e2" : "#d1fae5", color: expirado ? "#991b1b" : "#065f46", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                            {expirado ? "Expirado" : "Activo"}
                          </span>
                          <span style={{ fontSize: 12, color: "#718096" }}>Creado por {t.creadoPor}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#a0aec0" }}>
                          Creado: {new Date(t.creadoEn).toLocaleString("es-ES")} · Expira: {new Date(t.expiraEn).toLocaleString("es-ES")}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {!expirado && (
                          <button onClick={() => copiar(urlInspeccion(t.token))}
                            style={{ background: "#f0f4ff", color: "var(--accent)", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                            Copiar URL
                          </button>
                        )}
                        <button onClick={() => eliminarToken(t.id)}
                          style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                          Revocar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b", marginBottom: 12 }}>
            Historial de accesos de inspectores
          </div>
          {log.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#a0aec0", fontSize: 13, background: "#f8f9ff", borderRadius: 10 }}>Sin accesos registrados</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {log.map((l, i) => (
                <div key={i} style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }}></div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1e1b4b" }}>Token: {l.token}</span>
                      <span style={{ fontSize: 11, color: "#a0aec0" }}>IP: {l.ip}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#a0aec0" }}>{l.totalAccesos} consultas</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Primer acceso</div>
                      <div style={{ fontSize: 12, color: "#1e1b4b" }}>{new Date(l.primerAcceso).toLocaleString("es-ES")}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Último acceso</div>
                      <div style={{ fontSize: 12, color: "#1e1b4b" }}>{new Date(l.ultimoAcceso).toLocaleString("es-ES")}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 2 }}>Creado por</div>
                      <div style={{ fontSize: 12, color: "#1e1b4b" }}>{l.creadoPor || "—"}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 6 }}>Secciones consultadas</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[...new Set(l.secciones)].map((s: any) => (
                        <span key={s} style={{ background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                          {seccionLabel(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SeccionIMAP() {
  const [form, setForm] = useState({ host: "", port: "993", tls: true, user: "", pass: "", folder: "INBOX" })
  const [loading, setLoading] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [testando, setTestando] = useState(false)
  useEffect(() => {
    fetch("/api/configuracion")
      .then(r => r.json())
      .then(data => {
        if (data) setForm({
          host: data.imap_host || "",
          port: String(data.imap_port || "993"),
          tls: data.imap_tls ?? true,
          user: data.imap_user || "",
          pass: "",
          folder: data.imap_folder || "INBOX",
        })
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])
  const guardar = async () => {
    setLoading(true)
    await fetch("/api/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imap_host: form.host, imap_port: parseInt(form.port), imap_tls: form.tls, imap_user: form.user, imap_pass: form.pass, imap_folder: form.folder }),
    }).then(r => r.ok ? setMensaje({ texto: "Configuracion guardada", tipo: "ok" }) : setMensaje({ texto: "Error al guardar", tipo: "error" }))
    setLoading(false)
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
  }
  const testConexion = async () => {
    setTestando(true)
    try {
      const res = await fetch("/api/configuracion/imap-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const data = await res.json()
      setMensaje(res.ok ? { texto: `Conexion exitosa. ${data.mensajes} mensajes.`, tipo: "ok" } : { texto: data.error || "Error", tipo: "error" })
    } catch { setMensaje({ texto: "Error de red", tipo: "error" }) }
    setTestando(false)
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 5000)
  }
  if (cargando) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando...</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 10, padding: "12px 16px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", margin: "0 0 4px" }}>Email IMAP para bajas IT</p>
        <p style={{ fontSize: 12, color: "#1d4ed8", margin: 0 }}>Configura el buzon donde el INSS envia los partes de baja telematicos. RD 1060/2022.</p>
      </div>
      {mensaje.texto && <div style={{ background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2", border: `1px solid ${mensaje.tipo === "ok" ? "#86efac" : "#fca5a5"}`, borderRadius: 8, padding: "10px 16px", fontSize: 13, color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b" }}>{mensaje.texto}</div>}
      <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: "0 0 16px" }}>Servidor IMAP</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div><label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Servidor</label><input value={form.host} onChange={e => setForm(p => ({ ...p, host: e.target.value }))} placeholder="mail.tuempresa.com" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} /></div>
          <div><label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Puerto</label><input value={form.port} onChange={e => setForm(p => ({ ...p, port: e.target.value }))} placeholder="993" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} /></div>
          <div><label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Usuario</label><input value={form.user} onChange={e => setForm(p => ({ ...p, user: e.target.value }))} placeholder="bajas@empresa.com" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} /></div>
          <div><label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Contrasena</label><input type="password" value={form.pass} onChange={e => setForm(p => ({ ...p, pass: e.target.value }))} placeholder="••••••••" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} /></div>
          <div><label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Carpeta</label><input value={form.folder} onChange={e => setForm(p => ({ ...p, folder: e.target.value }))} placeholder="INBOX" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20 }}><input type="checkbox" id="tls" checked={form.tls} onChange={e => setForm(p => ({ ...p, tls: e.target.checked }))} /><label htmlFor="tls" style={{ fontSize: 13, color: "#1e1b4b", cursor: "pointer" }}>Usar TLS/SSL</label></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={testConexion} disabled={testando || !form.host || !form.user} style={{ background: "#f0f4ff", color: "var(--accent)", border: "1px solid #c7d2fe", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{testando ? "Probando..." : "Probar conexion"}</button>
          <button onClick={guardar} disabled={loading} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{loading ? "Guardando..." : "Guardar configuracion"}</button>
        </div>
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: "0 0 12px" }}>Como funciona y pasos para activarlo</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { n: "1", color: "var(--accent)", t: "Crea un buzon dedicado", d: "Crea un email especifico (ej: bajas@tuempresa.com) en tu proveedor de hosting para recibir los partes del INSS." },
            { n: "2", color: "#0891b2", t: "Registralo en Sistema RED", d: "En el portal de la Seguridad Social indica ese email como destinatario de comunicaciones IT de tu empresa." },
            { n: "3", color: "#16a34a", t: "Introduce las credenciales aqui", d: "Rellena el formulario, pulsa Probar conexion y si es correcto guarda la configuracion." },
            { n: "4", color: "#d97706", t: "Recibe partes automaticamente", d: "Scheduleo leera el email cada 30 min. Cuando el INSS envie un parte lo registrara y te enviara notificacion push." },
            { n: "5", color: "#7c3aed", t: "Confirma datos al INSS en 3 dias habiles", d: "Solo tendras que confirmar los datos economicos via Sistema RED. Art. 169 LGSS." },
          ].map(item => (
            <div key={item.n} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: item.color, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.n}</div>
              <div><p style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b", margin: "0 0 2px" }}>{item.t}</p><p style={{ fontSize: 12, color: "#718096", margin: 0 }}>{item.d}</p></div>
            </div>
          ))}
        </div>
        <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginTop: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#854d0e", margin: "0 0 2px" }}>Requisito previo</p>
          <p style={{ fontSize: 11, color: "#92400e", margin: 0 }}>Necesitas un buzon de correo dedicado en tu proveedor de hosting. El INSS enviara los partes a ese email via Sistema RED (RD 1060/2022).</p>
        </div>
      </div>
    </div>
  )
}

function SeccionDemo() {
  const [modoActual, setModoActual] = useState<"real"|"demo"|null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [stats, setStats] = useState({ reales: 0, demo: 50, maxEmpleados: 100 })
  const [modoBeta, setModoBeta] = useState(false)
  const [confirmacion, setConfirmacion] = useState<"activarDemo"|"activarReal"|null>(null)
  const [notificacion, setNotificacion] = useState({ texto: "", tipo: "" })

  const mostrarNotif = (texto: string, tipo = "ok") => {
    setNotificacion({ texto, tipo })
    setTimeout(() => setNotificacion({ texto: "", tipo: "" }), 4000)
  }

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/config/modo-demo').then(r => r.json()).catch(() => ({ modoDemo: false })),
      fetch('/api/empresa').then(r => r.json()).catch(() => ({ maxEmpleados: 100 })),
      fetch('/api/empleados/conteo').then(r => r.json()).catch(() => ({ reales: 0, demo: 50 }))
    ]).then(([demoRes, empRes, conteoRes]) => {
      const demo = demoRes.status === "fulfilled" ? demoRes.value : { modoDemo: false }
      const emp = empRes.status === "fulfilled" ? empRes.value : { maxEmpleados: 100 }
      const conteo = conteoRes.status === "fulfilled" ? conteoRes.value : { reales: 0, demo: 50 }
      setModoActual(demo.modoDemo ? "demo" : "real")
      setModoBeta(demo.modoBeta ?? false)
      setStats({ reales: conteo.reales || 0, demo: conteo.demo || 50, maxEmpleados: emp?.maxEmpleados || 100 })
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])

  const activarDemo = async () => {
    setGuardando(true)
    setConfirmacion(null)
    await fetch('/api/config/modo-demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modoDemo: true }) })
    await fetch('/api/config/modo-beta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modoBeta: true }) })
    setModoActual("demo")
    mostrarNotif("Modo demo activado — mostrando 50 empleados ficticios", "ok")
    if (typeof window !== 'undefined') { window.dispatchEvent(new Event('modoBetaChange')); window.dispatchEvent(new Event('modoPruebasChange')) }
    setGuardando(false)
  }

  const activarReal = async () => {
    setGuardando(true)
    setConfirmacion(null)
    await fetch('/api/config/modo-demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modoDemo: false }) })
    await fetch('/api/config/modo-beta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modoBeta: false }) })
    await fetch('/api/demo/limpiar', { method: 'POST' }).catch(() => {})
    setModoActual("real")
    mostrarNotif("Modo real activado — los datos demo han sido ocultados", "ok")
    if (typeof window !== 'undefined') { window.dispatchEvent(new Event('modoBetaChange')); window.dispatchEvent(new Event('modoPruebasChange')) }
    setGuardando(false)
  }

  if (cargando) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {notificacion.texto && (
        <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: notificacion.tipo === "ok" ? "#d1fae5" : "#fee2e2", color: notificacion.tipo === "ok" ? "#065f46" : "#991b1b", border: `1px solid ${notificacion.tipo === "ok" ? "#6ee7b7" : "#fca5a5"}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{notificacion.tipo === "ok" ? "✓" : "⚠"}</span>
          {notificacion.texto}
        </div>
      )}

      {/* Modal confirmacion */}
      {confirmacion && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{confirmacion === "activarDemo" ? "🎭" : "🏢"}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              {confirmacion === "activarDemo" ? "Activar modo demostración" : "Activar base de datos real"}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 20 }}>
              {confirmacion === "activarDemo"
                ? "Se mostraran los 50 empleados ficticios. Los datos reales quedaran ocultos pero NO se borraran. Podras volver al modo real en cualquier momento."
                : "Se ocultaran los datos demo y se mostraran solo los datos reales. Los datos generados en modo demo se eliminaran permanentemente."}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmacion(null)} style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={confirmacion === "activarDemo" ? activarDemo : activarReal} disabled={guardando}
                style={{ background: confirmacion === "activarDemo" ? "#F59E0B" : "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {guardando ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estado actual */}
      <div style={{ background: modoActual === "demo" ? "#FEF9C3" : "#F0FDF4", border: `1px solid ${modoActual === "demo" ? "#FDE68A" : "#86EFAC"}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: modoActual === "demo" ? "#F59E0B" : "#10B981", boxShadow: `0 0 6px ${modoActual === "demo" ? "#F59E0B" : "#10B981"}` }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: modoActual === "demo" ? "#92400E" : "#065F46" }}>
              {modoActual === "demo" ? "Modo demostración ACTIVO" : "Base de datos real ACTIVA"}
            </div>
            <div style={{ fontSize: 12, color: modoActual === "demo" ? "#D97706" : "#16A34A", marginTop: 2 }}>
              {modoActual === "demo" ? "Mostrando 50 empleados ficticios · datos reales ocultos" : `${stats.reales} empleados reales · datos demo ocultos`}
            </div>
          </div>
        </div>
      </div>

      {/* Dos opciones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* BD Real */}
        <div style={{ background: "#fff", border: modoActual === "real" ? "2px solid var(--accent)" : "1px solid #E5E7EB", borderRadius: 14, padding: 20, position: "relative", transition: "all 0.2s" }}>
          {modoActual === "real" && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>ACTIVA</div>
          )}
          <div style={{ fontSize: 24, marginBottom: 10 }}>🏢</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Base de datos real</div>
          <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, marginBottom: 14 }}>
            Muestra los empleados y datos reales de tu empresa. Los cambios se guardan permanentemente.
          <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#374151" }}><span style={{ fontWeight: 700 }}>{stats.reales}</span> de <span style={{ fontWeight: 700 }}>{stats.maxEmpleados}</span> empleados</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: stats.reales / (stats.maxEmpleados) > 0.8 ? "#dc2626" : stats.reales / (stats.maxEmpleados) > 0.6 ? "#F59E0B" : "#10B981" }}>{Math.round(stats.reales / (stats.maxEmpleados) * 100)}%</span>
            </div>
            <div style={{ height: 6, background: "#E5E7EB", borderRadius: 999 }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(stats.reales / (stats.maxEmpleados) * 100, 100)}%`, background: stats.reales / (stats.maxEmpleados) > 0.8 ? "#dc2626" : stats.reales / (stats.maxEmpleados) > 0.6 ? "#F59E0B" : "#10B981", transition: "width 0.5s ease" }} />
            </div>
          </div>
          </div>
          <button onClick={() => modoActual !== "real" && setConfirmacion("activarReal")} disabled={modoActual === "real" || guardando}
            style={{ width: "100%", background: modoActual === "real" ? "#10B981" : "#6B7280", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 600, cursor: modoActual === "real" ? "default" : "pointer", transition: "all 0.2s" }}>
            {modoActual === "real" ? "✓ Activa" : "Activar base de datos real"}
          </button>
        </div>

        {/* BD Demo */}
        <div style={{ background: "#fff", border: modoActual === "demo" ? "2px solid #F59E0B" : "1px solid #E5E7EB", borderRadius: 14, padding: 20, position: "relative", transition: "all 0.2s" }}>
          {modoActual === "demo" && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "#F59E0B", color: "#0b0e1a", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>ACTIVA</div>
          )}
          <div style={{ fontSize: 24, marginBottom: 10 }}>🎭</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Base de datos demo</div>
          <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, marginBottom: 14 }}>
            Muestra 50 empleados ficticios para demostrar el sistema. Los datos reales quedan ocultos y seguros.
          </div>
          <div style={{ background: "#FFFBEB", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#92400E" }}>
            <span style={{ fontWeight: 700 }}>{stats.demo}</span> empleados ficticios disponibles
          </div>
          <button onClick={() => modoActual !== "demo" && setConfirmacion("activarDemo")} disabled={modoActual === "demo" || guardando}
            style={{ width: "100%", background: modoActual === "demo" ? "#10B981" : "#6B7280", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 600, cursor: modoActual === "demo" ? "default" : "pointer", transition: "all 0.2s" }}>
            {modoActual === "demo" ? "✓ Activa" : "Activar modo demostración"}
          </button>
        </div>

      </div>

      {/* Info */}
      <div style={{ background: "#F8F9FA", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>¿Como funciona?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Los datos reales y demo nunca se mezclan entre si.",
            "Al activar demo, los datos reales quedan ocultos pero NO se borran.",
            "Al volver al modo real, los datos generados en demo se eliminan.",
            "Solo una base de datos puede estar activa a la vez.",
          ].map((txt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#6B7280" }}>
              <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>✓</span>
              {txt}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
function SeccionSeguridad() {
  const [expiracion, setExpiracion] = useState('90')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [bloqueoConfig, setBloqueoConfig] = useState(true)
  const [bloqueoSistema, setBloqueoSistema] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/configuracion').then(r => r.json()),
      fetch('/api/empresa').then(r => r.json()),
    ]).then(([d, emp]) => {
      if (d?.expiracionContrasena !== undefined) {
        setExpiracion(String(d.expiracionContrasena || '0'))
      }
      if (emp?.bloqueoConfigInactividad !== undefined) setBloqueoConfig(emp.bloqueoConfigInactividad)
      if (emp?.bloqueoSistemaInactividad !== undefined) setBloqueoSistema(emp.bloqueoSistemaInactividad)
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])

  const guardarBloqueo = async (campo: string, valor: boolean) => {
    if (campo === 'bloqueoConfigInactividad') setBloqueoConfig(valor)
    else setBloqueoSistema(valor)
    try {
      await fetch('/api/empresa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: valor })
      })
    } catch {}
  }

  const guardar = async (valor: string) => {
    setGuardando(true)
    setExpiracion(valor)
    try {
      await fetch('/api/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiracionContrasena: parseInt(valor) || 0 })
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } catch {}
    setGuardando(false)
  }

  if (cargando) return <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Cargando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Seguridad del sistema</h2>
      {/* NIVEL DE SEGURIDAD */}
      <PanelSeguridadCert />

      <Configuracion2FA />

      {/* Bloqueo por inactividad */}
      <div style={{ background: '#f8f9ff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 4 }}>Bloqueo de Configuracion por inactividad</div>
            <div style={{ fontSize: 12, color: '#718096' }}>Bloquea esta seccion tras 10 minutos sin uso.</div>
          </div>
          <button onClick={() => guardarBloqueo('bloqueoConfigInactividad', !bloqueoConfig)}
            style={{ width: 44, height: 24, borderRadius: 20, border: 'none', cursor: 'pointer', background: bloqueoConfig ? 'var(--accent)' : '#E5E7EB', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: bloqueoConfig ? 23 : 3, transition: 'left 0.15s' }} />
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 4 }}>Bloqueo del sistema por inactividad</div>
            <div style={{ fontSize: 12, color: '#718096' }}>Cierra la sesion de todo el sistema tras 1 hora sin uso.</div>
          </div>
          <button onClick={() => guardarBloqueo('bloqueoSistemaInactividad', !bloqueoSistema)}
            style={{ width: 44, height: 24, borderRadius: 20, border: 'none', cursor: 'pointer', background: bloqueoSistema ? 'var(--accent)' : '#E5E7EB', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: bloqueoSistema ? 23 : 3, transition: 'left 0.15s' }} />
          </button>
        </div>
      </div>

      {/* Grid 2 columnas: Expiracion + Requisitos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>

        {/* Expiracion contrasena */}
        <div style={{ background: '#f8f9ff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 4 }}>Expiracion de contrasena</div>
              <div style={{ fontSize: 12, color: '#718096' }}>Obligar a cambiar la contrasena cada X dias.</div>
            </div>
            {guardado && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, background: '#d1fae5', padding: '3px 8px', borderRadius: 20 }}>Guardado</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['0','Nunca'],['30','30d'],['60','60d'],['90','90d'],['180','180d']].map(([val, label]) => (
              <button key={val} onClick={() => guardar(val)} disabled={guardando}
                style={{ padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: expiracion === val ? 'var(--accent)' : '#fff',
                  color: expiracion === val ? '#fff' : '#475569',
                  border: expiracion === val ? '1px solid var(--accent)' : '1px solid #e2e8f0',
                  boxShadow: expiracion === val ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
                {label}
              </button>
            ))}
          </div>
          {expiracion !== '0' && (
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '7px 12px', borderRadius: 8 }}>
              Los usuarios deberan cambiar su contrasena cada {expiracion} dias. Se les avisara 7 dias antes.
            </div>
          )}
        </div>

        {/* Requisitos contrasena */}
        <div style={{ background: '#f8f9ff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 14 }}>Requisitos de contrasena</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Minimo 12 caracteres', activo: true },
              { label: 'Al menos una letra mayuscula', activo: true },
              { label: 'Al menos un numero', activo: true },
              { label: 'Al menos un simbolo (!@#$...)', activo: true },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: r.activo ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: r.activo ? '#059669' : '#dc2626', fontWeight: 700, flexShrink: 0 }}>
                  {r.activo ? '✓' : '✗'}
                </div>
                <span style={{ fontSize: 12, color: '#374151' }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function TooltipIconWrap({ texto, activo, children }: { texto: string; activo: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  return (
    <div ref={ref}
      onMouseEnter={() => { if (activo && ref.current) { const r = ref.current.getBoundingClientRect(); setPos({ top: r.top + r.height / 2, left: r.right + 8 }) } }}
      onMouseLeave={() => setPos(null)}>
      {children}
      {activo && pos && typeof document !== "undefined" && createPortal(
        <span style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateY(-50%)", background: "#1F2937", color: "#fff", fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 9999, pointerEvents: "none" }}>
          {texto}
        </span>,
        document.body
      )}
    </div>
  )
}

function SeccionPlan() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [conteo, setConteo] = useState({ reales: 0, demo: 0 })
  const [cargando, setCargando] = useState(true)
  const [nuevoPlan, setNuevoPlan] = useState("")
  const [masterPassword, setMasterPassword] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState({ texto: "", tipo: "" })
  const [editando, setEditando] = useState(false)

  const [solicitando, setSolicitando] = useState(false)
  const [planASolicitar, setPlanASolicitar] = useState("profesional")
  const [mensajeSolicitud, setMensajeSolicitud] = useState("")
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)

  const [claveActivacion, setClaveActivacion] = useState("")
  const [activando, setActivando] = useState(false)

  const [solicitudesPendientes, setSolicitudesPendientes] = useState<any[]>([])
  const [generandoClaveId, setGenerandoClaveId] = useState<string | null>(null)
  const [clavesGeneradas, setClavesGeneradas] = useState<Record<string, string>>({})

  const LIMITES: Record<string, number> = { basico: 100, profesional: 500, enterprise: Infinity }
  const NOMBRES: Record<string, string> = { basico: "Basico", profesional: "Profesional", enterprise: "Enterprise" }

  const cargarSolicitudes = () => {
    fetch("/api/plan/solicitudes").then(r => r.json()).then(d => { if (Array.isArray(d)) setSolicitudesPendientes(d) }).catch(() => {})
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/empresa").then(r => r.json()).catch(() => ({})),
      fetch("/api/empleados/conteo").then(r => r.json()).catch(() => ({ reales: 0, demo: 0 }))
    ]).then(([emp, c]) => { setEmpresa(emp); setConteo(c); setCargando(false); setNuevoPlan(emp.plan || "basico") })
    cargarSolicitudes()
  }, [])

  const mostrarMsg = (texto: string, tipo = "ok") => {
    setMsg({ texto, tipo })
    setTimeout(() => setMsg({ texto: "", tipo: "" }), 3000)
  }

  const guardarPlan = async () => {
    if (!masterPassword) { mostrarMsg("Introduce la contrasena maestra", "error"); return }
    setGuardando(true)
    const res = await fetch("/api/empresa", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: nuevoPlan, masterPassword })
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) { mostrarMsg(data.error, "error"); return }
    setEmpresa(data)
    setEditando(false)
    setMasterPassword("")
    mostrarMsg("Plan actualizado correctamente")
  }

  const enviarSolicitud = async () => {
    setEnviandoSolicitud(true)
    const res = await fetch("/api/plan/solicitar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSolicitado: planASolicitar, mensaje: mensajeSolicitud })
    })
    const data = await res.json()
    setEnviandoSolicitud(false)
    if (data.error) { mostrarMsg(data.error, "error"); return }
    setSolicitando(false)
    setMensajeSolicitud("")
    mostrarMsg("Solicitud enviada correctamente")
    cargarSolicitudes()
  }

  const activarClave = async () => {
    if (!claveActivacion.trim()) { mostrarMsg("Introduce la clave de activacion", "error"); return }
    setActivando(true)
    const res = await fetch("/api/plan/activar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: claveActivacion })
    })
    const data = await res.json()
    setActivando(false)
    if (data.error) { mostrarMsg(data.error, "error"); return }
    setClaveActivacion("")
    setEmpresa((e: any) => ({ ...e, plan: data.plan }))
    mostrarMsg(`Plan actualizado a ${NOMBRES[data.plan] || data.plan}`)
  }

  const generarClave = async (solicitud: any) => {
    setGenerandoClaveId(solicitud.id)
    const res = await fetch("/api/plan/generar-clave", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planDestino: solicitud.planSolicitado, solicitudId: solicitud.id, empresaId: solicitud.empresaId })
    })
    const data = await res.json()
    setGenerandoClaveId(null)
    if (data.error) { mostrarMsg(data.error, "error"); return }
    setClavesGeneradas(prev => ({ ...prev, [solicitud.id]: data.token }))
    cargarSolicitudes()
  }

  if (cargando) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando...</div>

  const planActual = empresa?.plan || "basico"
  const limite = LIMITES[planActual] ?? 100
  const porcentaje = limite === Infinity ? 0 : Math.min(100, (conteo.reales / limite) * 100)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {msg.texto && (
        <div style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: msg.tipo === "error" ? "#fee2e2" : "#d1fae5", color: msg.tipo === "error" ? "#991b1b" : "#065f46", border: `1px solid ${msg.tipo === "error" ? "#fca5a5" : "#6ee7b7"}` }}>
          {msg.texto}
        </div>
      )}

      <div style={{ background: "var(--accent-dim)", border: "1px solid #DDD6FE", borderRadius: 12, padding: 16, fontSize: 12.5, color: "#4C1D95", lineHeight: 1.6 }}>
        <strong>¿Que es esto?</strong> El plan de tu empresa determina cuantos empleados reales puedes tener registrados a la vez en Scheduleo. Al llegar al limite de tu plan, el sistema bloqueara la creacion de nuevos empleados hasta que liberes plazas (dando de baja a alguien) o cambies a un plan superior. Los empleados de demostracion no cuentan para este limite.
      </div>

      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: ".07em" }}>Plan actual</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>{NOMBRES[planActual] || planActual}</div>
          </div>
          {!editando && (
            <button onClick={() => setEditando(true)} style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}>Cambiar plan (manual)</button>
          )}
        </div>

        <div style={{ marginBottom: editando ? 16 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
            <span>Empleados</span>
            <span style={{ fontWeight: 700, color: "#374151" }}>{conteo.reales} / {limite === Infinity ? "Sin limite" : limite}</span>
          </div>
          {limite !== Infinity && (
            <div style={{ height: 8, background: "#F3F4F6", borderRadius: 999 }}>
              <div style={{ width: `${porcentaje}%`, height: "100%", background: porcentaje >= 90 ? "#DC2626" : "var(--accent)", borderRadius: 999, transition: "width 0.3s" }} />
            </div>
          )}
        </div>

        {editando && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Nuevo plan</label>
            <select value={nuevoPlan} onChange={e => setNuevoPlan(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginBottom: 6 }}>
              <option value="basico">Basico (100 empleados)</option>
              <option value="profesional">Profesional (500 empleados)</option>
              <option value="enterprise">Enterprise (sin limite)</option>
            </select>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 10, lineHeight: 1.5 }}>
              {nuevoPlan === "basico" && "Pensado para negocios pequenos: hasta 100 empleados registrados a la vez."}
              {nuevoPlan === "profesional" && "Para empresas en crecimiento: hasta 500 empleados registrados a la vez."}
              {nuevoPlan === "enterprise" && "Sin limite de empleados. Pensado para grupos empresariales o multiples negocios."}
            </div>
            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Contrasena maestra</label>
            <input type="password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginBottom: 12, boxSizing: "border-box" as const }} placeholder="Confirma con tu contrasena maestra" />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setEditando(false); setMasterPassword(""); setNuevoPlan(planActual) }} style={{ flex: 1, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarPlan} disabled={guardando} style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>{guardando ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Subir de plan</div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 14 }}>Solicita un aumento de plan, o introduce la clave de activacion que te hayamos enviado tras confirmarlo.</div>

        {!solicitando ? (
          <button onClick={() => setSolicitando(true)} style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, color: "#374151", cursor: "pointer", marginBottom: 16 }}>
            Solicitar aumento de plan
          </button>
        ) : (
          <div style={{ background: "#FAFBFC", border: "1px solid #EEF0F3", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Plan que quieres solicitar</label>
            <select value={planASolicitar} onChange={e => setPlanASolicitar(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginBottom: 10 }}>
              <option value="profesional">Profesional (500 empleados)</option>
              <option value="enterprise">Enterprise (sin limite)</option>
            </select>
            <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Mensaje (opcional)</label>
            <textarea value={mensajeSolicitud} onChange={e => setMensajeSolicitud(e.target.value)} rows={2} style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, marginBottom: 10, boxSizing: "border-box" as const, fontFamily: "inherit", resize: "vertical" as const }} placeholder="Cuentanos algo si quieres" />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSolicitando(false)} style={{ flex: 1, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
              <button onClick={enviarSolicitud} disabled={enviandoSolicitud} style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: enviandoSolicitud ? 0.6 : 1 }}>{enviandoSolicitud ? "Enviando..." : "Enviar solicitud"}</button>
            </div>
          </div>
        )}

        <div style={{ paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
          <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Introducir clave de activacion</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={claveActivacion} onChange={e => setClaveActivacion(e.target.value.toUpperCase())} placeholder="XXXX-XXXX-XXXX-XXXX" style={{ flex: 1, padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, fontFamily: "monospace" }} />
            <button onClick={activarClave} disabled={activando} style={{ background: "#111827", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: activando ? 0.6 : 1 }}>{activando ? "Activando..." : "Activar"}</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", textTransform: "uppercase" as const, letterSpacing: ".06em", marginBottom: 4 }}>Panel del proveedor (solo para ti)</div>
        <div style={{ fontSize: 12, color: "#78350F", marginBottom: 14 }}>Solicitudes de cambio de plan pendientes. Genera la clave y envisela al cliente por el medio que prefieras.</div>
        {solicitudesPendientes.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "#92400E" }}>No hay solicitudes pendientes.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {solicitudesPendientes.map((s: any) => (
              <div key={s.id} style={{ background: "#fff", border: "1px solid #FDE68A", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12.5, color: "#78350F" }}>
                  <strong>{NOMBRES[s.planActual] || s.planActual}</strong> → <strong>{NOMBRES[s.planSolicitado] || s.planSolicitado}</strong>
                </div>
                {s.mensaje && <div style={{ fontSize: 11.5, color: "#92400E", marginTop: 4 }}>"{s.mensaje}"</div>}
                {clavesGeneradas[s.id] ? (
                  <div style={{ marginTop: 8, background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8, padding: "8px 10px", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#065F46" }}>
                    {clavesGeneradas[s.id]}
                  </div>
                ) : (
                  <button onClick={() => generarClave(s)} disabled={generandoClaveId === s.id} style={{ marginTop: 8, background: "var(--accent)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 11.5, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: generandoClaveId === s.id ? 0.6 : 1 }}>
                    {generandoClaveId === s.id ? "Generando..." : "Generar clave de activacion"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SeccionAI() {
  const [config, setConfig] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [proveedoresEstado, setProveedoresEstado] = useState<any[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [claves, setClaves] = useState<Record<string, string>>({})
  const [probando, setProbando] = useState<Record<string, boolean>>({})
  const [guardandoClave, setGuardandoClave] = useState<Record<string, boolean>>({})
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState({ texto: "", tipo: "" })
  const [uso, setUso] = useState({ consultas: 0, tokens: 0 })
  const [mensajePrueba, setMensajePrueba] = useState("")
  const [historialPrueba, setHistorialPrueba] = useState<{ rol: string; texto: string }[]>([])
  const [enviandoPrueba, setEnviandoPrueba] = useState(false)

  const mostrarMsg = (texto: string, tipo = "ok") => {
    setMsg({ texto, tipo })
    setTimeout(() => setMsg({ texto: "", tipo: "" }), 3000)
  }

  const cargarProveedores = () => {
    fetch("/api/ai/proveedores").then(r => r.json()).then(d => { if (Array.isArray(d)) setProveedoresEstado(d) }).catch(() => {})
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/ai/config").then(r => r.json()).catch(() => ({})),
      fetch("/api/ai/uso").then(r => r.json()).catch(() => ({ consultas: 0, tokens: 0 }))
    ]).then(([cfg, u]) => { setConfig(cfg); setUso(u); setCargando(false) })
    cargarProveedores()
  }, [])

  const PROVEEDORES = [
    { id: "anthropic", label: "Anthropic", sub: "Claude Sonnet · Opus · Haiku", letra: "A", color: "#92400E", bg: "#F5EDE8", modelos: ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-6"] },
    { id: "openai", label: "OpenAI", sub: "GPT-4o · GPT-4o mini", letra: "O", color: "#065F46", bg: "#E8F5F0", modelos: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"] },
    { id: "google", label: "Google Gemini", sub: "Flash · Pro", letra: "G", color: "#1a73e8", bg: "#E8F0FE", modelos: ["gemini-1.5-flash", "gemini-1.5-pro"] },
    { id: "mistral", label: "Mistral", sub: "Small · Medium · Large", letra: "M", color: "#C2410C", bg: "#FFF0E8", modelos: ["mistral-small", "mistral-medium", "mistral-large-latest"] },
    { id: "groq", label: "Groq", sub: "Llama 3 · Mixtral — Ultrarrapida", letra: "Q", color: "#92400E", bg: "#FFF7ED", modelos: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it", "mixtral-8x7b-32768"] },
  ]

  const proveedorActual = PROVEEDORES.find(p => p.id === config?.proveedor) || PROVEEDORES[0]
  const estadoDe = (id: string) => proveedoresEstado.find(p => p.proveedor === id)

  const guardarClave = async (proveedorId: string) => {
    const clave = claves[proveedorId]
    if (!clave?.trim()) return
    setGuardandoClave(prev => ({ ...prev, [proveedorId]: true }))
    const res = await fetch("/api/ai/proveedores", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proveedor: proveedorId, apiKey: clave })
    })
    setGuardandoClave(prev => ({ ...prev, [proveedorId]: false }))
    if (res.ok) {
      mostrarMsg("Clave guardada correctamente")
      setEditando(null)
      setClaves(prev => ({ ...prev, [proveedorId]: "" }))
      cargarProveedores()
    } else {
      mostrarMsg("Error al guardar la clave", "error")
    }
  }

  const probarConexion = async (proveedorId: string) => {
    setProbando(prev => ({ ...prev, [proveedorId]: true }))
    const res = await fetch("/api/ai/validar-key", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proveedor: proveedorId, apiKey: claves[proveedorId] || "" })
    })
    const data = await res.json()
    setProbando(prev => ({ ...prev, [proveedorId]: false }))
    mostrarMsg(data.valido ? "Conexion correcta" : (data.error || "La clave no es valida"), data.valido ? "ok" : "error")
    cargarProveedores()
  }

  const guardarConfiguracion = async () => {
    setGuardando(true)
    const res = await fetch("/api/ai/config", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proveedor: config?.proveedor, modelo: config?.modelo, activo: config?.activo })
    })
    setGuardando(false)
    if (res.ok) mostrarMsg("Configuracion guardada correctamente")
    else mostrarMsg("Error al guardar", "error")
  }

  const enviarPrueba = async () => {
    if (!mensajePrueba.trim()) return
    const texto = mensajePrueba.trim()
    setHistorialPrueba(prev => [...prev, { rol: "user", texto }])
    setMensajePrueba("")
    setEnviandoPrueba(true)
    const res = await fetch("/api/ai/chat-prueba", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proveedor: config?.proveedor, modelo: config?.modelo, mensaje: texto })
    })
    const data = await res.json()
    setEnviandoPrueba(false)
    setHistorialPrueba(prev => [...prev, { rol: "assistant", texto: data.respuesta || data.error || "Error al obtener respuesta" }])
  }

  if (cargando) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {msg.texto && (
        <div style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: msg.tipo === "error" ? "#fee2e2" : "#d1fae5", color: msg.tipo === "error" ? "#991b1b" : "#065f46", border: `1px solid ${msg.tipo === "error" ? "#fca5a5" : "#6ee7b7"}` }}>
          {msg.texto}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#3C3489,var(--accent))", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>ScheduleoAI</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>Asistente inteligente</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 14px 5px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ position: "relative", width: 8, height: 8, display: "inline-block" }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: config?.activo ? "#4ade80" : "#9CA3AF", animation: config?.activo ? "pulso-scheduleo-ai 1.6s ease-out infinite" : "none" }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: config?.activo ? "#4ade80" : "#9CA3AF" }} />
            </span>
            {config?.activo ? `Activo · ${proveedorActual.label}` : "Inactivo"}
          </div>
          <div onClick={() => setConfig((c: any) => ({ ...c, activo: !c?.activo }))}
            style={{ width: 44, height: 24, borderRadius: 12, background: config?.activo ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)", position: "relative", cursor: "pointer" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: config?.activo ? 23 : 3, transition: "left 0.2s" }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes pulso-scheduleo-ai{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.8);opacity:0}}`}</style>

      {/* Tarjetas de proveedores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {PROVEEDORES.map(p => {
          const estado = estadoDe(p.id)
          const esActivo = config?.proveedor === p.id
          const estaEditando = editando === p.id
          let etiquetaEstado = "Sin configurar", colorEstado = "#6B7280", bgEstado = "#F3F4F6"
          if (estado?.tieneKey && estado?.valido === true) { etiquetaEstado = "Configurada"; colorEstado = "#065F46"; bgEstado = "#D1FAE5" }
          else if (estado?.tieneKey && estado?.valido === false) { etiquetaEstado = "Clave invalida"; colorEstado = "#991B1B"; bgEstado = "#FEE2E2" }
          else if (estado?.tieneKey) { etiquetaEstado = "Sin verificar"; colorEstado = "#92400E"; bgEstado = "#FEF3C7" }

          return (
            <div key={p.id} style={{ background: "#fff", border: esActivo ? "2px solid var(--accent)" : "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
              <div onClick={() => setConfig((c: any) => ({ ...c, proveedor: p.id, modelo: p.modelos[0] }))} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: p.color }}>{p.letra}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{p.label}</span>
                </div>
                <span style={{ background: bgEstado, color: colorEstado, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{etiquetaEstado}</span>
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
                {estado?.verificadoEn ? `Verificada ${new Date(estado.verificadoEn).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : (estado?.tieneKey ? "Sin verificar todavia" : "Aun no se ha anadido una clave")}
              </div>

              {estaEditando ? (
                <div style={{ marginBottom: 10 }}>
                  <input type="password" value={claves[p.id] || ""} onChange={e => setClaves(prev => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder="Pega tu API key aqui" style={{ width: "100%", padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, fontFamily: "monospace", marginBottom: 8, boxSizing: "border-box" as const }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditando(null)} style={{ flex: 1, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: 7, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
                    <button onClick={() => guardarClave(p.id)} disabled={guardandoClave[p.id]} style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 8, padding: 7, fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: guardandoClave[p.id] ? 0.6 : 1 }}>
                      {guardandoClave[p.id] ? "Guardando..." : "Guardar clave"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditando(p.id)} style={{ flex: 1, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: 7, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                    {estado?.tieneKey ? "Editar clave" : "Anadir clave"}
                  </button>
                  {estado?.tieneKey && (
                    <button onClick={() => probarConexion(p.id)} disabled={probando[p.id]} style={{ flex: 1, background: "#EEEDFE", border: "1px solid var(--accent)", borderRadius: 8, padding: 7, fontSize: 12, fontWeight: 600, color: "#3C3489", cursor: "pointer", opacity: probando[p.id] ? 0.6 : 1 }}>
                      {probando[p.id] ? "Probando..." : "Probar conexion"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modelo activo */}
      <div style={{ background: "#fff", border: "1px solid #DDD6FE", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 10 }}>Modelo activo</div>
        <select value={config?.modelo || ""} onChange={e => setConfig((c: any) => ({ ...c, modelo: e.target.value }))}
          style={{ width: "100%", padding: "9px 12px", border: "1.5px solid var(--accent)", borderRadius: 8, fontSize: 13, color: "var(--accent)", fontWeight: 600, background: "var(--accent-dim)", outline: "none" }}>
          {proveedorActual.modelos.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Probar el asistente en vivo */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Probar el asistente en vivo</span>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>(usa {proveedorActual.label} · {config?.modelo})</span>
        </div>
        <div style={{ background: "#F8FAFC", borderRadius: 8, padding: 12, minHeight: 70, maxHeight: 220, overflowY: "auto" as const, marginBottom: 10, display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {historialPrueba.length === 0 && <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" as const }}>Escribe un mensaje para probar el asistente</div>}
          {historialPrueba.map((m, i) => m.rol === "user" ? (
            <div key={i} style={{ alignSelf: "flex-end", background: "var(--accent)", color: "#fff", fontSize: 12, padding: "7px 12px", borderRadius: "10px 10px 0 10px", maxWidth: "75%" }}>{m.texto}</div>
          ) : (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 8, alignSelf: "flex-start" }}>
              <div className="robot-pensando-icono" style={{ width: 26, height: 26, borderRadius: 8, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3C3489" strokeWidth="2"><rect x="5" y="9" width="14" height="10" rx="2"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M12 9V6M9 6h6"/></svg>
              </div>
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", color: "#374151", fontSize: 12, padding: "7px 12px", borderRadius: "10px 10px 10px 0", maxWidth: "75%" }}>{m.texto}</div>
            </div>
          ))}
          {enviandoPrueba && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
              <div className="robot-pensando-icono" style={{ width: 26, height: 26, borderRadius: 8, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3C3489" strokeWidth="2"><rect x="5" y="9" width="14" height="10" rx="2"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M12 9V6M9 6h6"/></svg>
              </div>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>Escribiendo...</span>
            </div>
          )}
        </div>
        <style>{`@keyframes robot-pensando{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-2px) rotate(-4deg)}75%{transform:translateY(-2px) rotate(4deg)}}.robot-pensando-icono{animation:robot-pensando 1.8s ease-in-out infinite}`}</style>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={mensajePrueba} onChange={e => setMensajePrueba(e.target.value)} onKeyDown={e => e.key === "Enter" && enviarPrueba()}
            placeholder="Escribe un mensaje de prueba..." style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 12, outline: "none" }} />
          <button onClick={enviarPrueba} disabled={enviandoPrueba} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: enviandoPrueba ? 0.6 : 1 }}>Enviar</button>
        </div>
      </div>

      {/* Uso */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: ".07em" }}>Uso este mes</div>
          <span style={{ fontSize: 10, color: "#6B7280", background: "#F3F4F6", padding: "3px 9px", borderRadius: 10 }}>{new Date().toLocaleString("es-ES", { month: "long", year: "numeric" })}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Consultas hoy", valor: uso.consultas, color: "var(--accent)", bg: "var(--accent-dim)" },
            { label: "Tokens usados", valor: uso.tokens.toLocaleString(), color: "#10B981", bg: "#F0FDF4" },
            { label: "Coste estimado", valor: "$0", color: "#D97706", bg: "#FEF9C3" },
          ].map((item, i) => (
            <div key={i} style={{ background: item.bg, borderRadius: 12, padding: 16, textAlign: "center" as const }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.valor}</div>
              <div style={{ fontSize: 11, color: item.color, fontWeight: 600, marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={guardarConfiguracion} disabled={guardando}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: guardando ? 0.7 : 1 }}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

    </div>
  )
}

function SuperAdminSidebar({ usuario }: { usuario: any, onCambiarEmail: () => void, onResetPwd: () => void }) {
  if (!usuario) return null
  return (
    <a href="/super-admin" style={{ textDecoration: "none", display: "block" }}>
      <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1e1b4b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Administrador</div>
            <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 1 }}>Ver mi perfil completo</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </a>
  )
}
function SuperAdminCard({ usuario, onCambiarEmail, onResetPwd }: { usuario: any, onCambiarEmail: () => void, onResetPwd: () => void }) {
  const [verDatos, setVerDatos] = useState(false)
  const [pinVer, setPinVer] = useState("")
  const [errPin, setErrPin] = useState("")

  const verificarPin = async () => {
    const res = await fetch("/api/empresa", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterPassword: pinVer, _test: true }) })
    const data = await res.json()
    if (data.error === "Contraseña incorrecta") { setErrPin("Contrasena incorrecta"); return }
    setVerDatos(true); setErrPin("")
  }

  return (
    <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 16, padding: 24, color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,var(--paleta-grad-inicio),var(--paleta-grad-fin))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👑</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Administrador</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Acceso total al sistema</div>
        </div>
        <span style={{ marginLeft: "auto", background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)", color: "#a5b4fc", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>SUPER_ADMIN</span>
      </div>
      {!verDatos ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[["Nombre","••••••••••"],["Email","•••••••••••••••"],["Creado","••/••/••••"],["ID","••••••••"]].map(([label, val]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="password" value={pinVer} onChange={e => setPinVer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verificarPin()}
              placeholder="Introduce tu contrasena master"
              style={{ flex: 1, padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none" }} />
            <button onClick={verificarPin}
              style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              Ver mis datos
            </button>
          </div>
          {errPin && <p style={{ color: "#fca5a5", fontSize: 12, marginTop: 8 }}>{errPin}</p>}
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[["Nombre", usuario.name || "—"],["Email", usuario.email],["Creado", new Date(usuario.createdAt).toLocaleDateString("es-ES")],["ID", usuario.id.slice(0,8)+"..."]].map(([label, val]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onCambiarEmail}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Cambiar email
            </button>
            <button onClick={onResetPwd}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Cambiar contrasena
            </button>
            <button onClick={() => setVerDatos(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>
              Ocultar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default function ConfiguracionPage() {
  const [toggleTemaActivo, setToggleTemaActivo] = useState(true)
  const [acceso, setAcceso] = useState(false)
  const [pinAcceso, setPinAcceso] = useState("")
  const [errorAcceso, setErrorAcceso] = useState("")
  const [verificando, setVerificando] = useState(false)
  const [estadoIntento, setEstadoIntento] = useState<"idle"|"correcto"|"incorrecto">("idle")
  const [bloqueadoGlobal, setBloqueadoGlobal] = useState(false)
  const [mostrarPinAcceso, setMostrarPinAcceso] = useState(false)
  const [bloqueadoPorInactividad, setBloqueadoPorInactividad] = useState(false)
  const [seccion, setSeccion] = useState("identidad")
  const [submenuColapsado, setSubmenuColapsado] = useState(false)
  const [mostrarInvitarModal, setMostrarInvitarModal] = useState(false)
  const [submenuTocadoManual, setSubmenuTocadoManual] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)")
    const check = () => { if (!submenuTocadoManual) setSubmenuColapsado(mql.matches) }
    check()
    mql.addEventListener("change", check)
    return () => mql.removeEventListener("change", check)
  }, [submenuTocadoManual])
  const [empresa, setEmpresa] = useState<any>({})

  useEffect(() => {
    fetch("/api/empresa").then(r => r.json()).then(d => { if (d?.configAccesoBloqueado) setBloqueadoGlobal(true) }).catch(() => {})
  }, [])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [masterPassword, setMasterPassword] = useState("")
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [usuarios, setUsuarios] = useState([])
  const [superAdmin, setSuperAdmin] = useState<any>(null)

  useEffect(() => {
    fetch("/api/super-admin").then(r => r.json()).then(data => {
      if (data.usuario) setSuperAdmin(data.usuario)
    })
  }, [])



  const [modal, setModal] = useState<any>(null)
  const [showRevision, setShowRevision] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [comprobandoUsername, setComprobandoUsername] = useState(false)
  const [showExito, setShowExito] = useState(false)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
  const [errorRevision, setErrorRevision] = useState("")
  const [tempPassword, setTempPassword] = useState("")
  const [form, setForm] = useState<any>({ email: "", name: "", role: "EMPLEADO", telefono: "", dni: "", cargo: "", departamento: "", tipoContrato: "indefinido", jornada: "completa", horario: "manana", sueldoBase: "", mensaje: "" })

  useEffect(() => {
    const u = (form?.username || "").trim()
    if (!u) { setUsernameError(""); return }
    setComprobandoUsername(true)
    const timeout = setTimeout(() => {
      fetch(`/api/username-disponible?username=${encodeURIComponent(u)}`)
        .then(r => r.json())
        .then(data => { setUsernameError(data.disponible ? "" : (data.error || "No disponible")) })
        .finally(() => setComprobandoUsername(false))
    }, 500)
    return () => clearTimeout(timeout)
  }, [form?.username])
  const [modalPin, setModalPin] = useState("")

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000)
  }

  const verificarAcceso = async () => {
    setVerificando(true)
    setErrorAcceso("")
    const res = await fetch("/api/empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword: pinAcceso, _test: true })
    })
    const data = await res.json()
    setVerificando(false)
    if (data.error && data.error === "Contraseña incorrecta") {
      setErrorAcceso("Contraseña incorrecta")
      if (data.bloqueado) setBloqueadoGlobal(true)
      setEstadoIntento("incorrecto")
      return
    }
    setBloqueadoGlobal(false)
    setEstadoIntento("correcto")
    setMasterPassword(pinAcceso)
    cargar()
    setTimeout(() => { setAcceso(true) }, 4800)
  }

  const cargar = async () => {
    setLoading(true)
    const [e, u] = await Promise.all([
      fetch("/api/empresa").then(r => r.json()),
      fetch("/api/usuarios").then(r => r.json()),
    ])
    setEmpresa(e || {})
    setUsuarios(Array.isArray(u) ? u : [])
    setLoading(false)
  }

  const guardar = async () => {
    setGuardando(true)
    const res = await fetch("/api/empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...empresa, masterPassword })
    })
    const data = await res.json()
    setGuardando(false)
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Configuración guardada correctamente")
    if (typeof window !== 'undefined') { window.dispatchEvent(new Event('modoBetaChange')); window.dispatchEvent(new Event('modoPruebasChange')) }
    recargarApariencia()
  }

  const { setPreview, recargar: recargarApariencia } = useApariencia()
  const [subApariencia, setSubApariencia] = useState("identidad")
  const set = (key, val) => {
    setEmpresa(p => ({ ...p, [key]: val }))
    if (["nombreComercial", "logo", "colorSidebar", "colorAccent"].includes(key)) {
      setPreview({ [key === "nombreComercial" ? "nombre" : key]: val })
    }
  }

  const abrirModal = (tipo, usuario = null) => {
    setModal({ tipo, usuario })
    setModalPin("")
    setTempPassword("")
    setForm(usuario ? { email: usuario.email, name: usuario.name || "", role: usuario.role } : { email: "", name: "", role: "EMPLEADO" })
  }

  const cerrarModal = () => { setModal(null); setModalPin(""); setTempPassword("") }

  const crearUsuario = async () => {
    if (!form.nombre || !form.apellidos || !form.username || !form.email || !form.cargo || !form.telefono || !form.departamento || !form.sueldoBase) { mostrarMensaje("Todos los campos son obligatorios", "error"); return }
    if (usernameError) { mostrarMensaje(usernameError, "error"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { mostrarMensaje("El email no tiene formato valido", "error"); return }
    if (!form.permisos || Object.keys(form.permisos).filter(k => form.permisos[k]).length === 0) { mostrarMensaje("Debes asignar al menos un permiso de acceso al sistema", "error"); return }
    setShowRevision(true)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { mostrarMensaje("El email no tiene formato valido", "error"); return }
    setShowRevision(true)
  }

  const enviarSolicitud = async () => {
    const res = await fetch("/api/solicitudes-gerenciales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre, apellidos: form.apellidos,
        email: form.email,
        cargo: form.cargo,
        telefono: form.telefono || "",
        dni: form.dni || "",
        departamento: form.departamento || "",
        tipoContrato: form.tipoContrato || "indefinido",
        jornada: form.jornada || "completa",
        horario: form.horario || "manana",
        sueldoBase: form.sueldoBase || null,
        permisos: form.permisos || {},
        mensaje: form.mensaje || "", rol: form.rol || "GERENCIAL", activacionAutomatica: !!form.activacionAutomatica, username: form.username || ""
      })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    setShowRevision(false)
    cerrarModal()
    setShowExito(true)
    setTimeout(() => setShowExito(false), 5000)
    fetch("/api/solicitudes-gerenciales").then(r => r.json()).then((d:any) => {
      if (Array.isArray(d)) setSolicitudesPendientes(d.filter((s:any) => s.estado === "pendiente").length)
    })
  }
  const editarUsuario = async () => {
    const res = await fetch(`/api/usuarios/${modal.usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "editar", masterPassword: modalPin, ...form })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Usuario actualizado")
    cargar(); cerrarModal()
  }

  const accionUsuario = async (action, usuario) => {
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, masterPassword: modalPin })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    if (data.tempPassword) { setTempPassword(data.tempPassword); return }
    mostrarMensaje(data.message)
    cargar(); cerrarModal()
  }

  const cambiarEmail = async () => {
    if (!form.email) { mostrarMensaje("El email es obligatorio", "error"); return }
    const res = await fetch(`/api/usuarios/${modal.usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cambiarEmail", nuevoEmail: form.email, masterPassword: modalPin })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje(`Email actualizado a ${form.email}`)
    cargar(); cerrarModal()
  }

  const borrarUsuario = async () => {
    const res = await fetch(`/api/usuarios/${modal.usuario.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword: modalPin })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    mostrarMensaje("Usuario eliminado")
    cargar(); cerrarModal()
  }

  const getRolColor = (role) => {
    if (role === "SUPER_ADMIN") return { background: "#fef3c7", color: "#92400e" }
    if (role === "ADMIN_SEDE") return { background: "#dbeafe", color: "#1e40af" }
    if (role === "PAUSADO") return { background: "#fee2e2", color: "#991b1b" }
    return { background: "#d1fae5", color: "#065f46" }
  }

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const, color: "#0f172a", outline: "none", background: "#fff" }
  const labelStyle = { display: "block" as const, fontSize: 12, color: "#a0aec0", marginBottom: 4, fontWeight: 500 as const }

  if (!acceso) {
    const colorEstado = estadoIntento === "correcto" ? "#22C55E" : estadoIntento === "incorrecto" ? "#EF4444" : "#ffffff"
    const tituloEstado = estadoIntento === "correcto" ? "Bienvenido, Administrador" : estadoIntento === "incorrecto" ? "Acceso denegado" : bloqueadoPorInactividad ? "Sesión bloqueada" : "Acceso restringido"
    const subtituloEstado = estadoIntento === "correcto" ? "Bienvenido al panel de Configuración" : bloqueadoPorInactividad ? "Se cerró por inactividad tras 10 minutos sin uso" : "Esta sección requiere permisos elevados"
    const fondoPanelIzq = estadoIntento === "correcto" ? "linear-gradient(135deg,#BBF7D0,#86EFAC)" : estadoIntento === "incorrecto" ? "linear-gradient(135deg,#F87171,#DC2626)" : "linear-gradient(135deg,var(--paleta-grad-inicio),var(--paleta-grad-fin))"
    return (
      <div style={{ position: "relative", height: "100%", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: 1 }}>
        <style>{`
          @keyframes lock-float-pulse-config { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.08); } }
          @keyframes shake-lock-config { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        `}</style>
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 720, height: 560, margin: 20, display: "grid", gridTemplateColumns: "1fr 1.1fr", borderRadius: 26, overflow: "hidden", background: "rgba(255,255,255,0.97)", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 40px 100px rgba(0,0,0,0.45)" }}>

          <div style={{ background: fondoPanelIzq, transition: "background 0.3s", padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ position: "relative", width: estadoIntento === "incorrecto" ? 170 : 140, height: estadoIntento === "incorrecto" ? 170 : 140, marginBottom: 18, transition: "width 0.3s, height 0.3s" }}>
              {[
                { key: "idle", src: "/design-system/security/acceso-normal-azul.png", filtro: "drop-shadow(0 0 22px rgba(59,130,246,0.85))" },
                { key: "correcto", src: "/design-system/security/acceso-abierto-verde.png", filtro: "drop-shadow(0 0 22px rgba(34,197,94,0.85))" },
                { key: "incorrecto", src: "/design-system/security/acceso-cerrado-rojo.png", filtro: "drop-shadow(0 0 26px rgba(239,68,68,0.9))" },
              ].map(img => (
                <img key={img.key} src={img.src} alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: img.filtro,
                    opacity: estadoIntento === img.key ? 1 : 0, transition: "opacity 0.4s ease",
                    animation: estadoIntento === "incorrecto" && img.key === "incorrecto" ? "shake-lock-config 0.4s ease-in-out, lock-float-pulse-config 2.6s ease-in-out infinite" : "lock-float-pulse-config 2.6s ease-in-out infinite" }} />
              ))}
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: estadoIntento === "correcto" ? "#15803D" : "rgba(255,255,255,0.9)", margin: "0 0 26px", maxWidth: 220, transition: "color 0.3s", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{subtituloEstado}</p>
            <div style={{ fontSize: 12, color: estadoIntento === "correcto" ? "#15803D" : "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 7, textShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "color 0.3s" }}>
              <img src="/design-system/icons/icon-fingerprint.svg" alt="" style={{ width: 45, height: 45, filter: estadoIntento === "correcto" ? "invert(64%) sepia(84%) saturate(447%) hue-rotate(93deg) brightness(92%) contrast(92%)" : "brightness(0) invert(1)", transition: "filter 0.3s" }} />
              Zona de configuración avanzada · Solo personal autorizado
            </div>
          </div>

          <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fff", boxShadow: "-12px 0 30px rgba(0,0,0,0.05)", position: "relative", zIndex: 2 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--paleta-texto)", margin: "0 0 6px" }}>Verificación de seguridad</h2>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 16px" }}>Para continuar, verifica tu identidad con tu contraseña de administrador.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--paleta-fondo)", color: "var(--accent)", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600, width: "fit-content", marginBottom: 20 }}>
              <img src="/design-system/icons/icon-user.svg" alt="" style={{ width: 26, height: 26 }} />
              Administrador
            </div>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input type={mostrarPinAcceso ? "text" : "password"} value={pinAcceso} onChange={e => { setPinAcceso(e.target.value); if (estadoIntento === "incorrecto") { setEstadoIntento("idle"); setErrorAcceso("") } }}
                onKeyDown={e => e.key === "Enter" && verificarAcceso()}
                placeholder="Contraseña del administrador"
                style={{ ...inputStyle, marginBottom: 0, fontSize: 14, padding: "13px 42px 13px 15px" }} />
              <button type="button" onClick={() => setMostrarPinAcceso(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", opacity: 0.6 }} aria-label="Mostrar contraseña">
                <img src="/design-system/icons/icon-eye.svg" alt="" style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <p style={{ fontSize: 11.5, color: "#94A3B8", margin: "0 0 12px" }}>Solo el administrador del sistema puede acceder aquí.</p>
            {errorAcceso && (
              <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{errorAcceso}</div>
            )}
            {bloqueadoGlobal && (
              <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, marginBottom: 12, fontWeight: 600 }}>Acceso bloqueado tras varios intentos fallidos. Introduce la contraseña correcta del administrador para desbloquear.</div>
            )}
            <button onClick={verificarAcceso} disabled={verificando || !pinAcceso}
              style={{ width: "100%", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: !pinAcceso ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              {verificando ? "Verificando..." : "Acceder"}
              <img src="/design-system/icons/icon-arrow-right.svg" alt="" style={{ width: 26, height: 26, filter: "brightness(0) invert(1)" }} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "icon-lock.svg", txt: "Acceso cifrado y protegido" },
                { icon: "icon-shield-check.svg", txt: "Actividad registrada y monitoreada" },
                { icon: "icon-people.svg", txt: "Permisos verificados" },
              ].map(item => (
                <div key={item.txt} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#64748B" }}>
                  <img src={"/design-system/icons/" + item.icon} alt="" style={{ width: 26, height: 26 }} />
                  {item.txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando configuración...</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", animation: "fadeInConfigPanel 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
      <style>{`@keyframes fadeInConfigPanel { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {mensaje.texto && (
        <div style={{ padding: "10px 24px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46", borderBottom: "1px solid #E5E7EB" }}>
          {mensaje.texto}
        </div>
      )}
      <div className="config-grid-responsive" style={{ display: "grid", gridTemplateColumns: submenuColapsado ? "72px 1fr" : "210px 1fr", flex: 1, minHeight: 0, height: "100%", overflow: "hidden" }}>
      <style>{`
        @media (max-width: 768px) {
          .config-grid-responsive { grid-template-columns: 1fr !important; height: auto !important; overflow: visible !important; }
          .config-content-responsive { height: auto !important; overflow: visible !important; }
          .config-back-link { display: flex !important; }
        }

      `}</style>
        <div style={{ background: "linear-gradient(180deg,rgba(237,233,254,0.55) 0%,rgba(232,228,251,0.55) 100%)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", borderRight: "1px solid rgba(103,61,230,0.12)" }}>
          <div style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
            <button
              onClick={() => { setSubmenuTocadoManual(true); setSubmenuColapsado(c => !c) }}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: submenuColapsado ? "center" : "flex-end", padding: "6px 8px", marginBottom: 10, background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: submenuColapsado ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
              </svg>
            </button>


            {!submenuColapsado && <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, padding: "0 12px" }}>Empresa</div>}
            {[
              { key: "identidad", label: "Identidad legal", p: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
              { key: "contacto", label: "Contacto", p: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 21 17z" },
              { key: "laboral", label: "Datos laborales", p: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
              { key: "apariencia", label: "Apariencia", p: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
            ].map(s => (
              <TooltipIconWrap key={s.key} texto={s.label} activo={submenuColapsado}>
              <button onClick={() => setSeccion(s.key)}
                style={{ width: "100%", textAlign: "left", padding: submenuColapsado ? "10px 0" : "9px 12px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: seccion === s.key ? 600 : 400, color: seccion === s.key ? "var(--accent)" : "#6B7280", background: seccion === s.key ? "#fff" : "transparent", cursor: "pointer", marginBottom: 2, borderLeft: seccion === s.key ? "3px solid var(--accent)" : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: submenuColapsado ? "center" : "flex-start", gap: 8 }}>
                <svg width={submenuColapsado ? 20 : 14} height={submenuColapsado ? 20 : 14} style={{ transition: "all 0.15s", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.p} /></svg>
                {!submenuColapsado && s.label}
              </button>
                          </TooltipIconWrap>
            ))}
            <div style={{ height: 1, background: "rgba(103,61,230,0.12)", margin: "10px 6px" }} />
            {!submenuColapsado && <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, padding: "0 12px" }}>Sistema</div>}
            {[
              { key: "licencia", label: "Licencia", p: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
              { key: "inspeccion", label: "Inspeccion laboral", p: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
              { key: "usuarios", label: "Usuarios gerenciales", p: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
              { key: "imap", label: "Email IMAP", p: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" },
              { key: "demo", label: "Gestion de datos", p: "M21 5c0 1.66-4 3-9 3S3 6.66 3 5m18 0c0-1.66-4-3-9-3S3 3.34 3 5m18 0v14c0 1.66-4 3-9 3s-9-1.34-9-3V5m0 7c0 1.66 4 3 9 3s9-1.34 9-3" },
              { key: "seguridad", label: "Seguridad", p: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              { key: "ai", label: "ScheduleoAI", p: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" },
              { key: "reportes", label: "Reportes de fallos", p: "M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" },
              { key: "plan", label: "Plan y aforo", p: "M3 3v18h18M18 17V9M13 17V5M8 17v-3" },
            ].map(s => (
              <TooltipIconWrap key={s.key} texto={s.label} activo={submenuColapsado}>
              <button onClick={() => setSeccion(s.key)}
                style={{ width: "100%", textAlign: "left", padding: submenuColapsado ? "10px 0" : "9px 12px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: seccion === s.key ? 600 : 400, color: seccion === s.key ? "var(--accent)" : "#6B7280", background: seccion === s.key ? "#fff" : "transparent", cursor: "pointer", marginBottom: 2, borderLeft: seccion === s.key ? "3px solid var(--accent)" : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: submenuColapsado ? "center" : "flex-start", gap: 8 }}>
                <svg width={submenuColapsado ? 20 : 14} height={submenuColapsado ? 20 : 14} style={{ transition: "all 0.15s", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.p} /></svg>
                {!submenuColapsado && s.label}
              </button>
                          </TooltipIconWrap>
            ))}
          </div>






        </div>
        <div className="config-content-responsive" style={{ background: "rgba(250,250,250,0.55)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
          <button
            className="config-back-link"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ display: "none", marginBottom: 14, background: "#F1EEFE", color: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", alignItems: "center", gap: 6 }}>
            ← Volver a secciones
          </button>

          {seccion === "identidad" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Identidad legal</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Razón social", key: "razonSocial" },
                  { label: "Nombre comercial", key: "nombreComercial" },
                  { label: "Nombre en app", key: "nombre" },
                  { label: "CIF / NIF", key: "cif" },
                  { label: "Actividad económica", key: "actividadEconomica" },
                  { label: "Código CNAE", key: "cnae" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={empresa[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {seccion === "contacto" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Datos de contacto</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Dirección", key: "direccion" },
                  { label: "Código postal", key: "codigoPostal" },
                  { label: "Ciudad", key: "ciudad" },
                  { label: "Provincia", key: "provincia" },
                  { label: "País", key: "pais" },
                  { label: "Teléfono", key: "telefono" },
                  { label: "Email principal", key: "email" },
                  { label: "Email facturación", key: "emailFacturacion" },
                  { label: "Sitio web", key: "web" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={empresa[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {seccion === "laboral" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Datos laborales y fiscales</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Nº Seguridad Social empresa", key: "seguridadSocial" },
                  { label: "Mutua de accidentes", key: "mutua" },
                  { label: "Convenio colectivo", key: "convenioColectivo" },
                  { label: "Cuenta bancaria (IBAN)", key: "cuentaBancaria" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={empresa[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

{seccion === "apariencia" && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Apariencia de la aplicacion</h2>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px" }}>Personaliza la identidad visual de Scheduleo para tu empresa</p>
              <button type="button" onClick={() => {
                set("nombreComercial", "")
                set("logo", "")
                set("colorSidebar", "")
                set("colorAccent", "")
                set("fondoWorkspace", "")
                set("fondoOpacidad", 88)
                set("fondoBrillo", 100)
                setPreview({ fondoWorkspace: "", fondoOpacidad: 88, fondoBrillo: 100 })
              }} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#6B7280", cursor: "pointer", marginBottom: 20 }}>
                Restablecer a valores originales
              </button>

              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[
                  { key: "identidad", label: "Identidad", p: "M3 21h18M5 21V7l8-4v18M13 21V11l6 3v7" },
                  { key: "tema", label: "Tema", p: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" },
                  { key: "fondo", label: "Fondo", p: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21" },
                  { key: "chat", label: "Chat", p: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
                ].map(t => (
                  <button key={t.key} type="button" onClick={() => setSubApariencia(t.key)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, cursor: "pointer", background: subApariencia === t.key ? "var(--accent)" : "#fff", border: subApariencia === t.key ? "1px solid var(--accent)" : "1px solid #E5E7EB" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={subApariencia === t.key ? "#fff" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.p} /></svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: subApariencia === t.key ? "#fff" : "#374151" }}>{t.label}</span>
                  </button>
                ))}
              </div>

              {subApariencia === "identidad" && (
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ background: empresa.colorSidebar || "#2d2b55", padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: empresa.colorAccent || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {empresa.logo ? <img src={empresa.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{(empresa.nombreComercial || empresa.nombre || "E")[0]?.toUpperCase()}</span>}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{empresa.nombreComercial || empresa.nombre || "Nombre de la empresa"}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Se ve reflejado aqui mismo, en vivo</div>
                    </div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>Define el nombre y el logo con los que tu empresa aparece en toda la aplicacion, incluida la barra lateral.</p>
                    <label style={labelStyle}>Nombre de la empresa</label>
                    <input value={empresa.nombreComercial || empresa.nombre || ""} onChange={e => set("nombreComercial", e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
                    <label style={labelStyle}>Logo de la empresa</label>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, border: "1px solid #E5E7EB", flexShrink: 0, overflow: "hidden", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {empresa.logo ? <img src={empresa.logo} alt="preview logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 10, color: "#D1D5DB" }}>Sin logo</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label htmlFor="logoUpload" style={{ display: "block", border: "2px dashed #D1D5DB", borderRadius: 10, padding: 12, textAlign: "center", cursor: "pointer", background: "#FAFAFA" }}>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#4B5563" }}>Subir logo de la empresa</div>
                          <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>PNG o JPG - Max 2MB</div>
                        </label>
                        <input id="logoUpload" type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: "none" }}
                          onChange={async e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (file.size > 2 * 1024 * 1024) { mostrarMensaje("La imagen no puede superar 2MB", "error"); return }
                            const formData = new FormData()
                            formData.append("file", file)
                            const res = await fetch("/api/empresa/logo", { method: "POST", body: formData })
                            const data = await res.json()
                            if (data.error) { mostrarMensaje(data.error, "error"); return }
                            set("logo", data.url)
                          }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {subApariencia === "tema" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>Elige si la aplicacion se ve en modo claro, oscuro, o segun la preferencia del dispositivo de cada usuario.</p>
                    <SelectorTema toggleTemaActivo={toggleTemaActivo} setToggleTemaActivo={setToggleTemaActivo} />
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>Elige la paleta de color que usara todo el sistema. Se aplica igual en todas las pantallas (el menu lateral no cambia).</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      {Object.entries(PALETAS).map(([key, p]) => (
                        <button key={key} type="button" onClick={() => { set("paletaColor", key); setPreview({ paletaColor: key }) }}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: "#fff", border: (empresa.paletaColor || "azul") === key ? "2px solid " + p.acento : "1px solid #E5E7EB" }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg," + p.gradInicio + "," + p.gradFin + ")", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {subApariencia === "fondo" && (
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ position: "relative", height: 70, overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${empresa.fondoWorkspace || "/design-system/00-global/backgrounds/workspace-background-default.png"})`, backgroundSize: "cover", backgroundPosition: "center", filter: `brightness(${empresa.fondoBrillo ?? 100}%)` }} />
                    <div style={{ position: "absolute", inset: 0, background: `rgba(249,250,251,${(empresa.fondoOpacidad ?? 88) / 100})` }} />
                    <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>Asi se vera el fondo, en vivo</span>
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 14px" }}>Sube una imagen de fondo para el contenido de la app y ajusta cuanto se nota, sin afectar al menu lateral.</p>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid #E5E7EB", backgroundImage: `url(${empresa.fondoWorkspace || "/design-system/00-global/backgrounds/workspace-background-default.png"})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                      <label htmlFor="fondoUpload" style={{ flex: 1, border: "2px dashed #D1D5DB", borderRadius: 8, padding: "8px 10px", textAlign: "center", cursor: "pointer", background: "#FAFAFA" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>Subir fondo</span>
                        <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 6 }}>PNG, JPG o WEBP - Max 4MB</span>
                      </label>
                      <input id="fondoUpload" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style={{ display: "none" }}
                        onChange={async e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          if (file.size > 4 * 1024 * 1024) { mostrarMensaje("La imagen no puede superar 4MB", "error"); return }
                          const formData = new FormData()
                          formData.append("file", file)
                          const res = await fetch("/api/empresa/fondo", { method: "POST", body: formData })
                          const data = await res.json()
                          if (data.error) { mostrarMensaje(data.error, "error"); return }
                          set("fondoWorkspace", data.url)
                          setPreview({ fondoWorkspace: data.url })
                        }} />
                    </div>
                    <label style={{ ...labelStyle, fontSize: 11 }}>Tono del overlay ({empresa.fondoOpacidad ?? 88}%)</label>
                    <input type="range" min="0" max="100" value={empresa.fondoOpacidad ?? 88} onChange={e => { const v = Number(e.target.value); set("fondoOpacidad", v); setPreview({ fondoOpacidad: v }) }} style={{ width: "100%", height: 4, marginBottom: 10 }} />
                    <label style={{ ...labelStyle, fontSize: 11 }}>Brillo de la imagen ({empresa.fondoBrillo ?? 100}%)</label>
                    <input type="range" min="50" max="150" value={empresa.fondoBrillo ?? 100} onChange={e => { const v = Number(e.target.value); set("fondoBrillo", v); setPreview({ fondoBrillo: v }) }} style={{ width: "100%", height: 4 }} />
                  </div>
                </div>
              )}


              {subApariencia === "chat" && (
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>Elige los dos tonos de las burbujas del chat (estilo WhatsApp): el color de tus propios mensajes y el de los mensajes de la otra persona. Se aplica igual en el chat real y en el chat de prueba de ScheduleoAI.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={labelStyle}>Tus mensajes</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={empresa.chatColorPropio || "#2F63F4"} onChange={e => { set("chatColorPropio", e.target.value); setPreview({ chatColorPropio: e.target.value }) }} style={{ width: 44, height: 36, border: "1px solid #E5E7EB", borderRadius: 8, padding: 0, cursor: "pointer" }} />
                        <input value={empresa.chatColorPropio || "#2F63F4"} onChange={e => { set("chatColorPropio", e.target.value); setPreview({ chatColorPropio: e.target.value }) }} style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Mensajes de la otra persona</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={empresa.chatColorAjeno || "#ffffff"} onChange={e => { set("chatColorAjeno", e.target.value); setPreview({ chatColorAjeno: e.target.value }) }} style={{ width: 44, height: 36, border: "1px solid #E5E7EB", borderRadius: 8, padding: 0, cursor: "pointer" }} />
                        <input value={empresa.chatColorAjeno || "#ffffff"} onChange={e => { set("chatColorAjeno", e.target.value); setPreview({ chatColorAjeno: e.target.value }) }} style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "#e5ddd5", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ alignSelf: "flex-start", background: empresa.chatColorAjeno || "#ffffff", color: "#111827", padding: "7px 11px", borderRadius: "4px 12px 12px 12px", fontSize: 12, maxWidth: "70%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>Hola, como va todo?</div>
                    <div style={{ alignSelf: "flex-end", background: empresa.chatColorPropio || "#2F63F4", color: "#fff", padding: "7px 11px", borderRadius: "12px 4px 12px 12px", fontSize: 12, maxWidth: "70%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>Todo bien, gracias</div>
                  </div>
                </div>
              )}

            </div>
          )}
          {seccion === "licencia" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Información de licencia</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Estado licencia", valor: empresa.licenciaActiva ? "Activa" : "Inactiva", color: empresa.licenciaActiva ? "#059669" : "#dc2626", bg: empresa.licenciaActiva ? "#d1fae5" : "#fee2e2" },
                  { label: "Expira el", valor: empresa.licenciaExpira ? new Date(empresa.licenciaExpira).toLocaleDateString("es-ES") : "Sin fecha", color: "var(--accent)", bg: "var(--accent-dim)" },
                  { label: "Máx. empleados", valor: empresa.maxEmpleados || 100, color: "#0284c7", bg: "#dbeafe" },
                ].map(k => (
                  <div key={k.label} style={{ background: k.bg, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: k.color, fontWeight: 500, marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: k.color }}>{k.valor}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f8f9ff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, color: "#718096", lineHeight: 1.8 }}>
                  <div><strong>ID de empresa:</strong> {empresa.id}</div>
                  <div><strong>Registrada el:</strong> {empresa.createdAt ? new Date(empresa.createdAt).toLocaleDateString("es-ES") : "—"}</div>
                  <div><strong>Última actualización:</strong> {empresa.updatedAt ? new Date(empresa.updatedAt).toLocaleDateString("es-ES") : "—"}</div>
                </div>
              </div>
            </div>
          )}

          {seccion === "inspeccion" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 6px" }}>Acceso de Inspección Laboral</h2>
              <p style={{ fontSize: 13, color: "#a0aec0", margin: "0 0 24px", lineHeight: 1.6 }}>
                Genera enlaces temporales para que inspectores de trabajo o Hacienda accedan al sistema en modo solo lectura.
                Cada acceso queda registrado con timestamp e IP conforme al RDL 8/2019 y normativa 2026.
              </p>
              <GenerarToken masterPassword={masterPassword} />
            </div>
          )}

          {seccion === "demo" && <SeccionDemo />}
          {seccion === "imap" && <SeccionIMAP />}
          {seccion === "seguridad" && <SeccionSeguridad />}
          {seccion === "ai" && <SeccionAI />}
          {seccion === "reportes" && <PanelReportesFallo />}
          {seccion === "plan" && <SeccionPlan />}
          {seccion === "usuarios" && (
            <div>
              <ListaSolicitudesPendientes />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Gestión de usuarios</h2>
                <button onClick={() => abrirModal("crear")} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  + Solicitar usuario gerencial
                </button>
                <button onClick={() => setMostrarInvitarModal(true)} style={{ background: "#fff", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", marginLeft: 8 }}>
                  Invitar por correo
                </button>
              </div>
              <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9ff" }}>
                      {["Nombre", "Email", "Rol", "Creado", "Acciones"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#718096", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u: any, i) => {
                      const rolStyle = getRolColor(u.role)
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#f8f9ff" }}>
                          <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "#1e1b4b" }}>{u.name || "—"}</td>
                          <td style={{ padding: "10px 16px", fontSize: 13, color: "#718096" }}>{u.email}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ ...rolStyle, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{u.role}</span>
                          </td>
                          <td style={{ padding: "10px 16px", fontSize: 12, color: "#a0aec0" }}>{new Date(u.createdAt).toLocaleDateString("es-ES")}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => abrirModal("editar", u)} style={{ background: "#F9FAFB", color: "#374151", border: "1px solid #D1D5DB", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Editar</button>
                              <button onClick={() => abrirModal("reset", u)} style={{ background: "#6B7280", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Reset pwd</button>
                              <button onClick={() => abrirModal("cambiarEmail", u)} style={{ background: "#F9FAFB", color: "#374151", border: "1px solid #D1D5DB", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Email</button>
                              <button onClick={() => abrirModal(u.role === "PAUSADO" ? "reactivar" : "pausar", u)} style={{ background: "#6B7280", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                                {u.role === "PAUSADO" ? "Activar" : "Pausar"}
                              </button>
                              <button onClick={async () => {
                                if (!confirm(`Resetear el 2FA de ${u.name || u.email}? Volvera a usar codigo por email.`)) return
                                const res = await fetch("/api/2fa/admin-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) })
                                const data = await res.json()
                                alert(data.ok ? "2FA reseteado correctamente" : (data.error || "Error al resetear"))
                              }} style={{ background: "#F9FAFB", color: "#374151", border: "1px solid #D1D5DB", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Reset 2FA</button>
                              <button onClick={() => abrirModal("borrar", u)} style={{ background: "#fff", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Borrar</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <ListaInvitacionesEnviadas />
            </div>
          )}
          </div>
          {seccion !== "usuarios" && seccion !== "inspeccion" && (
            <div style={{ background: "#fff", borderTop: "1px solid #E5E7EB", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Cambios pendientes de guardar</span>
              </div>
              <button onClick={guardar} disabled={guardando} style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-hover))", color: "#fff", border: "none", borderRadius: 9, padding: "10px 26px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(103,61,230,0.3)" }}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* VENTANA EXITO */}
      {showExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 40px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0", pointerEvents: "all" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Solicitud enviada correctamente</div>
            <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 320 }}>La solicitud ha sido enviada al Administrador para su revision.<br/>Pronto recibiras una notificacion con el acceso temporal.</div>
          </div>
        </div>
      )}

      {/* VENTANA REVISION */}
      {showRevision && modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 560, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Revision de solicitud</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Revisa bien todos los datos antes de enviar. Una vez enviada no podras modificarla.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 10, letterSpacing: "0.05em" }}>DATOS PERSONALES</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: "#94a3b8" }}>Nombre: </span><strong>{form.nombre} {form.apellidos}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Email: </span><strong>{form.email}</strong></div>
                  {form.telefono && <div><span style={{ color: "#94a3b8" }}>Telefono: </span><strong>{form.telefono}</strong></div>}
                  {form.dni && <div><span style={{ color: "#94a3b8" }}>DNI/NIE: </span><strong>{form.dni}</strong></div>}
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 10, letterSpacing: "0.05em" }}>DATOS DEL PUESTO</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: "#94a3b8" }}>Cargo: </span><strong>{form.cargo}</strong></div>
                  {form.departamento && <div><span style={{ color: "#94a3b8" }}>Depto: </span><strong>{form.departamento}</strong></div>}
                  {form.sueldoBase && <div><span style={{ color: "#94a3b8" }}>Sueldo: </span><strong>{form.sueldoBase}€/mes</strong></div>}
                  <div><span style={{ color: "#94a3b8" }}>Contrato: </span><strong>{form.tipoContrato}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Jornada: </span><strong>{form.jornada}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Horario: </span><strong>{form.horario}</strong></div>
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 10, letterSpacing: "0.05em" }}>ACCESO AL SISTEMA</div>
                {form.permisos && Object.keys(form.permisos).filter(k => form.permisos[k]).length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.keys(form.permisos).filter(k => form.permisos[k]).map(k => (
                      <span key={k} style={{ background: k.endsWith("_mod") ? "#dbeafe" : "#f0fdf4", color: k.endsWith("_mod") ? "#1e40af" : "#15803d", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                        {k.replace("_ver", " (ver)").replace("_mod", " (modificar)")}
                      </span>
                    ))}
                  </div>
                ) : <div style={{ fontSize: 13, color: "#94a3b8" }}>Sin permisos</div>}
              </div>
              {form.mensaje && (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>NOTAS</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{form.mensaje}</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, padding: "10px 14px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#854d0e" }}>
              Esta solicitud expirara en <strong>48 horas</strong>. Si no es aprobada o rechazada se rechazara automaticamente.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setShowRevision(false)} style={{ background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>
                Volver y editar
              </button>
              <button onClick={enviarSolicitud} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Confirmar y enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}


      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 880, maxWidth: "98vw" }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: "#1e1b4b" }}>
              {modal.tipo === "crear" && "Nueva solicitud gerencial — revisa y envia"}
              {modal.tipo === "editar" && `Editar: ${modal.usuario.email}`}
              {modal.tipo === "borrar" && `Borrar: ${modal.usuario.email}`}
              {modal.tipo === "pausar" && `Pausar: ${modal.usuario.email}`}
              {modal.tipo === "reactivar" && `Activar: ${modal.usuario.email}`}
              {modal.tipo === "reset" && `Reset contrasena: ${modal.usuario.email}`}
              {modal.tipo === "cambiarEmail" && `Cambiar email: ${modal.usuario.email}`}
            </h2>
            {modal.tipo === "cambiarEmail" && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Nuevo email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="nuevo@email.com" style={inputStyle} />
                <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>El usuario debera usar este nuevo email para iniciar sesion.</p>
              </div>
            )}
            {modal.tipo === "crear" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em" }}>DATOS PERSONALES</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Nombre *</label><input value={form.nombre||""} onChange={e=>setForm((p:any)=>({...p,nombre:e.target.value.replace(/\b\w/g,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Carlos"/></div>
                  <div><label style={labelStyle}>Apellidos *</label><input value={form.apellidos||""} onChange={e=>setForm((p:any)=>({...p,apellidos:e.target.value.replace(/\b\w/g,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Garcia Lopez"/></div><div><label style={labelStyle}>Nombre de usuario *</label><input value={form.username||""} onChange={e=>setForm((p:any)=>({...p,username:e.target.value}))} style={inputStyle} placeholder="Ej: juanp"/>{comprobandoUsername&&<div style={{fontSize:11,color:"#6b7280"}}>Comprobando...</div>}{!comprobandoUsername&&usernameError&&<div style={{fontSize:11,color:"#ef4444"}}>{usernameError}</div>}{!comprobandoUsername&&!usernameError&&form.username&&<div style={{fontSize:11,color:"#16a34a"}}>Disponible</div>}</div>
                  <div><label style={labelStyle}>Email *</label><input type="email" value={form.email||""} onChange={e=>setForm((p:any)=>({...p,email:e.target.value.toLowerCase()}))} style={{...inputStyle,borderColor:form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)?"#ef4444":"var(--border)"}} placeholder="Ej: correo@empresa.com"/>{form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)&&<div style={{fontSize:11,color:"#ef4444"}}>Email invalido</div>}</div>
                  <div><label style={labelStyle}>Telefono</label><input value={form.telefono||""} onChange={e=>setForm((p:any)=>({...p,telefono:e.target.value.replace(/[^0-9+\s]/g,"")}))} style={inputStyle} placeholder="Ej: 600 000 000" maxLength={15}/></div>
                  <div><label style={labelStyle}>DNI / NIE</label><input value={form.dni||""} onChange={e=>setForm((p:any)=>({...p,dni:e.target.value.toUpperCase()}))} style={{...inputStyle,borderColor:form.dni&&!/^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/.test(form.dni)?"#ef4444":"var(--border)"}} placeholder="Ej: 12345678A" maxLength={9}/>{form.dni&&!/^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/.test(form.dni)&&<div style={{fontSize:11,color:"#ef4444"}}>Formato invalido</div>}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", marginTop: 6 }}>DATOS DEL PUESTO</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Cargo / Puesto *</label><input value={form.cargo||""} onChange={e=>setForm((p:any)=>({...p,cargo:e.target.value.replace(/^\w/,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Director de area"/></div>
                  <div><label style={labelStyle}>Departamento *</label><input value={form.departamento||""} onChange={e=>setForm((p:any)=>({...p,departamento:e.target.value.replace(/^\w/,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Recursos humanos"/></div><div><label style={labelStyle}>Rol</label><select value={form.rol||"GERENCIAL"} onChange={e=>setForm((p:any)=>({...p,rol:e.target.value}))} style={{...inputStyle,cursor:"pointer"}}><option value="GERENCIAL">Agente gerencial</option><option value="SUPER_ADMIN">Administrador</option></select></div>
                  <div><label style={labelStyle}>Sueldo base *</label><div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b",fontSize:14,pointerEvents:"none",zIndex:1}}>€</span><input type="text" inputMode="numeric" value={form.sueldoBase||""} onChange={e=>setForm((p:any)=>({...p,sueldoBase:e.target.value.replace(/[^0-9]/g,"")}))} style={{...inputStyle,paddingLeft:26}} placeholder="Ej: 2000" autoComplete="off" name="sueldobase" id="sueldobase"/></div></div>
                  <div><label style={labelStyle}>Tipo de contrato</label>
                    <select value={form.tipoContrato||"indefinido"} onChange={e=>setForm((p:any)=>({...p,tipoContrato:e.target.value}))} style={{...inputStyle,cursor:"pointer"}}>
                      <option value="indefinido">Indefinido</option>
                      <option value="temporal">Temporal</option>
                      <option value="obra">Obra y servicio</option>
                      <option value="practicas">Practicas</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>Jornada</label>
                    <select value={form.jornada||"completa"} onChange={e=>setForm((p:any)=>({...p,jornada:e.target.value}))} style={{...inputStyle,cursor:"pointer"}}>
                      <option value="completa">Jornada completa</option>
                      <option value="parcial">Jornada parcial</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>Horario</label>
                    <select value={form.horario||"manana"} onChange={e=>setForm((p:any)=>({...p,horario:e.target.value}))} style={{...inputStyle,cursor:"pointer"}}>
                      <option value="manana">Mañana</option>
                      <option value="tarde">Tarde</option>
                      <option value="rotativo">Turno rotativo</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", marginTop: 6 }}><div><div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Activacion automatica</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>La cuenta se activara de inmediato, sin pasar por la aprobacion manual habitual.</div></div><input type="checkbox" checked={!!form.activacionAutomatica} onChange={e=>setForm((p:any)=>({...p,activacionAutomatica:e.target.checked}))} style={{ cursor: "pointer", width: 18, height: 18, flexShrink: 0, marginLeft: 12 }} /></div><div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", marginTop: 6 }}>ACCESO AL SISTEMA</div>
                <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  {/* Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>MODULO</div>
                    <div style={{ padding: "8px 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "center" as const }}>VER</div>
                    <div style={{ padding: "8px 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "center" as const }}>MODIFICAR</div>
                  </div>
                  {[
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
                  ].map((p, i) => {
                    const tieneVer = form.permisos?.[p.ver] || false
                    const tieneMod = form.permisos?.[p.mod] || false
                    const activo = tieneVer || tieneMod
                    return (
                      <div key={p.modulo} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", borderBottom: i < 11 ? "1px solid #e2e8f0" : "none", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                        <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: activo ? 600 : 400, color: activo ? "#0f172a" : "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: activo ? "var(--accent)" : "#e2e8f0", flexShrink: 0 }} />
                          {p.modulo}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, padding: "6px 0" }}>
                          <input type="checkbox" checked={tieneVer} onChange={e=>setForm((prev:any)=>({...prev,permisos:{...prev.permisos,[p.ver]:e.target.checked}}))} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }} />
                          <span style={{ fontSize: 9, fontWeight: 700, color: tieneVer ? "var(--accent)" : "#e2e8f0" }}>{tieneVer ? "ON" : "OFF"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, padding: "6px 0" }}>
                          <input type="checkbox" checked={tieneMod} onChange={e=>{const v=e.target.checked;setForm((prev:any)=>({...prev,permisos:{...prev.permisos,[p.mod]:v,...(v?{[p.ver]:true}:{})}}))}} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0284c7" }} />
                          <span style={{ fontSize: 9, fontWeight: 700, color: tieneMod ? "#0284c7" : "#e2e8f0" }}>{tieneMod ? "ON" : "OFF"}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div><label style={labelStyle}>Notas adicionales</label>
                  <textarea value={form.mensaje||""} onChange={e=>setForm((p:any)=>({...p,mensaje:e.target.value}))}
                    placeholder="Informacion adicional..."
                    style={{...inputStyle, height:60, resize:"none" as const}}/>
                </div>
                {/* Resumen */}
                {(form.name || form.email || form.cargo) && (
                  <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0284c7", marginBottom: 8, letterSpacing: "0.05em" }}>RESUMEN DE LA SOLICITUD</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#0f172a" }}>
                      {form.name && <div><span style={{ color: "#94a3b8" }}>Nombre: </span><strong>{form.name}</strong></div>}
                      {form.email && <div><span style={{ color: "#94a3b8" }}>Email: </span><strong>{form.email}</strong></div>}
                      {form.cargo && <div><span style={{ color: "#94a3b8" }}>Cargo: </span><strong>{form.cargo}</strong></div>}
                      {form.departamento && <div><span style={{ color: "#94a3b8" }}>Depto: </span><strong>{form.departamento}</strong></div>}
                      {form.sueldoBase && <div><span style={{ color: "#94a3b8" }}>Sueldo: </span><strong>{form.sueldoBase}€/mes</strong></div>}
                      {form.tipoContrato && <div><span style={{ color: "#94a3b8" }}>Contrato: </span><strong>{form.tipoContrato}</strong></div>}
                    </div>
                    {form.permisos && Object.keys(form.permisos).filter(k => form.permisos[k]).length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 11, color: "#0284c7" }}>
                        <span style={{ fontWeight: 700 }}>Permisos: </span>
                        {Object.keys(form.permisos).filter(k => form.permisos[k]).map(k => k.replace("_ver", " (ver)").replace("_mod", " (mod)")).join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {modal.tipo === "editar" && (
              <div style={{ marginBottom: 16 }}>
                {[{ label: "Nombre", key: "name", type: "text" }, { label: "Email", key: "email", type: "email" }].map((f:any) => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} value={form[f.key]||""} onChange={e => setForm((p:any) => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Rol</label>
                  <select value={form.role||""} onChange={e => setForm((p:any) => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            )}
            {tempPassword ? (
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>Contraseña temporal — cópiala ahora:</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#111827", fontFamily: "monospace", letterSpacing: 3, textAlign: "center", margin: "8px 0" }}>{tempPassword}</p>
                <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>No se volverá a mostrar.</p>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Contraseña de Administrador para confirmar</label>
                <input type="password" value={modalPin} onChange={e => setModalPin(e.target.value)} placeholder="Contraseña master" style={inputStyle} />
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={cerrarModal} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}>
                {tempPassword ? "Cerrar" : "Cancelar"}
              </button>
              {!tempPassword && (
                <button
                  onClick={() => {
                    if (modal.tipo === "crear") crearUsuario()
                    else if (modal.tipo === "editar") editarUsuario()
                    else if (modal.tipo === "borrar") borrarUsuario()
                    else accionUsuario(modal.tipo, modal.usuario)
                  }}
                  style={{ background: modal.tipo === "borrar" ? "#dc2626" : "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {mostrarInvitarModal && <InvitarPorCorreoModal onCerrar={() => setMostrarInvitarModal(false)} />}
    </div>
  )
}