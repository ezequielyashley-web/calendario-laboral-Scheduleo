"use client"


import { useState, useEffect, Fragment } from "react"
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
          style={{ padding: "8px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: !vistaLog ? 600 : 400, color: !vistaLog ? "#6366f1" : "#718096", background: !vistaLog ? "#ede9fe" : "#f3f4f6", cursor: "pointer" }}>
          Tokens activos
        </button>
        <button onClick={() => setVistaLog(true)}
          style={{ padding: "8px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: vistaLog ? 600 : 400, color: vistaLog ? "#6366f1" : "#718096", background: vistaLog ? "#ede9fe" : "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          Log de accesos
          {log.length > 0 && <span style={{ background: "#6366f1", color: "#fff", borderRadius: 20, fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>{log.length}</span>}
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
                            style={{ background: "#f0f4ff", color: "#6366f1", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
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
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }}></div>
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
                        <span key={s} style={{ background: "#ede9fe", color: "#6366f1", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
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
          <button onClick={testConexion} disabled={testando || !form.host || !form.user} style={{ background: "#f0f4ff", color: "#6366f1", border: "1px solid #c7d2fe", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{testando ? "Probando..." : "Probar conexion"}</button>
          <button onClick={guardar} disabled={loading} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{loading ? "Guardando..." : "Guardar configuracion"}</button>
        </div>
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: "0 0 12px" }}>Como funciona y pasos para activarlo</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { n: "1", color: "#6366f1", t: "Crea un buzon dedicado", d: "Crea un email especifico (ej: bajas@tuempresa.com) en tu proveedor de hosting para recibir los partes del INSS." },
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
      setStats({ reales: conteo.reales || 0, demo: conteo.demo || 50, maxEmpleados: emp?.maxEmpleados || 100 })
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])

  const activarDemo = async () => {
    setGuardando(true)
    setConfirmacion(null)
    await fetch('/api/config/modo-demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modoDemo: true }) })
    setModoActual("demo")
    mostrarNotif("Modo demo activado — mostrando 50 empleados ficticios", "ok")
    setGuardando(false)
  }

  const activarReal = async () => {
    setGuardando(true)
    setConfirmacion(null)
    await fetch('/api/config/modo-demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modoDemo: false }) })
    await fetch('/api/demo/limpiar', { method: 'POST' }).catch(() => {})
    setModoActual("real")
    mostrarNotif("Modo real activado — los datos demo han sido ocultados", "ok")
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
                style={{ background: confirmacion === "activarDemo" ? "#F59E0B" : "#673DE6", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
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
        <div style={{ background: "#fff", border: modoActual === "real" ? "2px solid #673DE6" : "1px solid #E5E7EB", borderRadius: 14, padding: 20, position: "relative", transition: "all 0.2s" }}>
          {modoActual === "real" && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "#673DE6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>ACTIVA</div>
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
              <span style={{ color: "#673DE6", fontWeight: 700, flexShrink: 0 }}>✓</span>
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

  useEffect(() => {
    fetch('/api/configuracion')
      .then(r => r.json())
      .then(d => {
        if (d?.expiracionContrasena !== undefined) {
          setExpiracion(String(d.expiracionContrasena || '0'))
        }
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1e1b4b', margin: 0 }}>Seguridad del sistema</h2>

      {/* Expiracion contrasena */}
      <div style={{ background: '#f8f9ff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', marginBottom: 4 }}>Expiracion de contrasena</div>
            <div style={{ fontSize: 13, color: '#718096' }}>El sistema obligara a cambiar la contrasena cada X dias. Elige Nunca para desactivar.</div>
          </div>
          {guardado && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, background: '#d1fae5', padding: '4px 10px', borderRadius: 20 }}>Guardado</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['0','Nunca'],['30','30 dias'],['60','60 dias'],['90','90 dias'],['180','180 dias']].map(([val, label]) => (
            <button key={val} onClick={() => guardar(val)} disabled={guardando}
              style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: expiracion === val ? '#6366f1' : '#fff',
                color: expiracion === val ? '#fff' : '#475569',
                border: expiracion === val ? '1px solid #6366f1' : '1px solid #e2e8f0',
                boxShadow: expiracion === val ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
        {expiracion !== '0' && (
          <div style={{ marginTop: 12, fontSize: 12, color: '#6366f1', background: '#ede9fe', padding: '8px 14px', borderRadius: 8 }}>
            Los usuarios deberan cambiar su contrasena cada {expiracion} dias. Se les avisara 7 dias antes.
          </div>
        )}
      </div>

      {/* Requisitos contrasena */}
      <div style={{ background: '#f8f9ff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', marginBottom: 16 }}>Requisitos de contrasena</div>
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
              <span style={{ fontSize: 13, color: '#374151' }}>{r.label}</span>
            </div>
          ))}
        </div>
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
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Super Admin</div>
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
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👑</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Super Administrador</div>
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
              style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
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
  const [seccion, setSeccion] = useState("identidad")
  const [empresa, setEmpresa] = useState<any>({})
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
  const [showExito, setShowExito] = useState(false)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
  const [errorRevision, setErrorRevision] = useState("")
  const [tempPassword, setTempPassword] = useState("")
  const [form, setForm] = useState<any>({ email: "", name: "", role: "EMPLEADO", telefono: "", dni: "", cargo: "", departamento: "", tipoContrato: "indefinido", jornada: "completa", horario: "manana", sueldoBase: "", mensaje: "" })
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
      return
    }
    setAcceso(true)
    setMasterPassword(pinAcceso)
    cargar()
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
    setTimeout(() => window.location.reload(), 1500)
  }

  const set = (key, val) => setEmpresa(p => ({ ...p, [key]: val }))

  const abrirModal = (tipo, usuario = null) => {
    setModal({ tipo, usuario })
    setModalPin("")
    setTempPassword("")
    setForm(usuario ? { email: usuario.email, name: usuario.name || "", role: usuario.role } : { email: "", name: "", role: "EMPLEADO" })
  }

  const cerrarModal = () => { setModal(null); setModalPin(""); setTempPassword("") }

  const crearUsuario = async () => {
    if (!form.nombre || !form.apellidos || !form.email || !form.cargo || !form.telefono || !form.departamento || !form.sueldoBase) { mostrarMensaje("Todos los campos son obligatorios", "error"); return }
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
        nombre: (form.nombre + " " + form.apellidos).trim(),
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
        mensaje: form.mensaje || ""
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
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 20, padding: 40, width: 380, textAlign: "center", boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>
            🔒
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1e1b4b", margin: "0 0 6px" }}>Acceso restringido</h2>
          <p style={{ fontSize: 13, color: "#a0aec0", margin: "0 0 24px" }}>Esta sección requiere contraseña SUPER_ADMIN</p>
          <input type="password" value={pinAcceso} onChange={e => setPinAcceso(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verificarAcceso()}
            placeholder="Contraseña master"
            style={{ ...inputStyle, marginBottom: 12, textAlign: "center", fontSize: 16, letterSpacing: 4 }} />
          {errorAcceso && (
            <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{errorAcceso}</div>
          )}
          <button onClick={verificarAcceso} disabled={verificando || !pinAcceso}
            style={{ width: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: !pinAcceso ? 0.6 : 1 }}>
            {verificando ? "Verificando..." : "Acceder"}
          </button>
        </div>
      </div>
    )
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando configuración...</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {mensaje.texto && (
        <div style={{ padding: "10px 24px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46", borderBottom: "1px solid #E5E7EB" }}>
          {mensaje.texto}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", flex: 1, minHeight: 0, height: "100%" }}>
        <div style={{ background: "linear-gradient(180deg,#EDE9FE 0%,#E8E4FB 100%)", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", borderRight: "1px solid rgba(103,61,230,0.12)" }}>
          <div style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>


            <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, padding: "0 12px" }}>Empresa</div>
            {[
              { key: "identidad", label: "Identidad legal", p: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
              { key: "contacto", label: "Contacto", p: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 21 17z" },
              { key: "laboral", label: "Datos laborales", p: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
              { key: "apariencia", label: "Apariencia", p: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
            ].map(s => (
              <button key={s.key} onClick={() => setSeccion(s.key)}
                style={{ width: "100%", textAlign: "left", padding: "9px 12px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: seccion === s.key ? 600 : 400, color: seccion === s.key ? "#673DE6" : "#6B7280", background: seccion === s.key ? "#fff" : "transparent", cursor: "pointer", marginBottom: 2, borderLeft: seccion === s.key ? "3px solid #673DE6" : "3px solid transparent", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.p} /></svg>
                {s.label}
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(103,61,230,0.12)", margin: "10px 6px" }} />
            <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, padding: "0 12px" }}>Sistema</div>
            {[
              { key: "licencia", label: "Licencia", p: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
              { key: "inspeccion", label: "Inspeccion laboral", p: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
              { key: "usuarios", label: "Usuarios gerenciales", p: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
              { key: "imap", label: "Email IMAP", p: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" },
              { key: "demo", label: "Gestion de datos", p: "M21 5c0 1.66-4 3-9 3S3 6.66 3 5m18 0c0-1.66-4-3-9-3S3 3.34 3 5m18 0v14c0 1.66-4 3-9 3s-9-1.34-9-3V5m0 7c0 1.66 4 3 9 3s9-1.34 9-3" },
              { key: "seguridad", label: "Seguridad", p: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
            ].map(s => (
              <button key={s.key} onClick={() => setSeccion(s.key)}
                style={{ width: "100%", textAlign: "left", padding: "9px 12px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: seccion === s.key ? 600 : 400, color: seccion === s.key ? "#673DE6" : "#6B7280", background: seccion === s.key ? "#fff" : "transparent", cursor: "pointer", marginBottom: 2, borderLeft: seccion === s.key ? "3px solid #673DE6" : "3px solid transparent", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.p} /></svg>
                {s.label}
              </button>
            ))}
          </div>






        </div>
        <div style={{ background: "#FAFAFA", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>

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
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 24px" }}>Personaliza la identidad visual de Scheduleo para tu empresa</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Identidad de la empresa</div>
                    <label style={labelStyle}>Nombre de la empresa</label>
                    <input value={empresa.nombreComercial || empresa.nombre || ""} onChange={e => set("nombreComercial", e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 64, height: 64, borderRadius: 14, background: empresa.colorAccent || "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {empresa.logo ? <img src={empresa.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontSize: 26, fontWeight: 700 }}>{(empresa.nombreComercial || empresa.nombre || "E")[0]?.toUpperCase()}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label htmlFor="logoUpload" style={{ display: "block", border: "2px dashed #D1D5DB", borderRadius: 10, padding: 14, textAlign: "center", cursor: "pointer", background: "#FAFAFA" }}>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#4B5563" }}>Subir logo de la empresa</div>
                          <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>PNG o JPG - Max 2MB</div>
                        </label>
                        <input id="logoUpload" type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: "none" }}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (file.size > 2 * 1024 * 1024) { mostrarMensaje("La imagen no puede superar 2MB", "error"); return }
                            const reader = new FileReader()
                            reader.onload = () => set("logo", reader.result as string)
                            reader.readAsDataURL(file)
                          }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Paleta de colores</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Color barra lateral</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="color" value={empresa.colorSidebar || "#2d2b55"} onChange={e => set("colorSidebar", e.target.value)}
                            style={{ width: 44, height: 36, padding: 2, border: "1px solid #e8eaf0", borderRadius: 8, cursor: "pointer" }} />
                          <input value={empresa.colorSidebar || "#2d2b55"} onChange={e => set("colorSidebar", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Color de acento</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="color" value={empresa.colorAccent || "#6366f1"} onChange={e => set("colorAccent", e.target.value)}
                            style={{ width: 44, height: 36, padding: 2, border: "1px solid #e8eaf0", borderRadius: 8, cursor: "pointer" }} />
                          <input value={empresa.colorAccent || "#6366f1"} onChange={e => set("colorAccent", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Tema del sistema</div>
                    <SelectorTema toggleTemaActivo={toggleTemaActivo} setToggleTemaActivo={setToggleTemaActivo} />
                  </div>

                </div>

                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", height: "fit-content" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Vista previa</div>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                    <div style={{ background: empresa.colorSidebar || "#2d2b55", padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        {empresa.logo ? (
                          <img src={empresa.logo} alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: empresa.colorAccent || "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                            {(empresa.nombreComercial || empresa.nombre || "E")[0]?.toUpperCase()}
                          </div>
                        )}
                        <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{empresa.nombreComercial || empresa.nombre || "Empresa"}</span>
                      </div>
                      {["Dashboard", "Empleados", "Deudas"].map((item, i) => (
                        <div key={item} style={{ padding: "6px 8px", borderRadius: 6, color: i === 2 ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 2, background: i === 2 ? (empresa.colorAccent || "#6366f1") : "transparent", fontWeight: i === 2 ? 600 : 400 }}>{item}</div>
                      ))}
                    </div>
                    <div style={{ background: "#F8F9FA", padding: 16, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 11, color: "#D1D5DB" }}>Contenido de la app</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 10 }}>Asi se vera tu app con esta configuracion</div>
                </div>

              </div>
            </div>
          )}

          {seccion === "licencia" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Información de licencia</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Estado licencia", valor: empresa.licenciaActiva ? "Activa" : "Inactiva", color: empresa.licenciaActiva ? "#059669" : "#dc2626", bg: empresa.licenciaActiva ? "#d1fae5" : "#fee2e2" },
                  { label: "Expira el", valor: empresa.licenciaExpira ? new Date(empresa.licenciaExpira).toLocaleDateString("es-ES") : "Sin fecha", color: "#6366f1", bg: "#ede9fe" },
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
          {seccion === "usuarios" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Gestión de usuarios</h2>
                <button onClick={() => abrirModal("crear")} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  + Solicitar usuario gerencial
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
                              <button onClick={() => abrirModal("editar", u)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Editar</button>
                              <button onClick={() => abrirModal("reset", u)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Reset pwd</button>
                              <button onClick={() => abrirModal("cambiarEmail", u)} style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Email</button>
                              <button onClick={() => abrirModal(u.role === "PAUSADO" ? "reactivar" : "pausar", u)} style={{ background: u.role === "PAUSADO" ? "#059669" : "#d97706", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>
                                {u.role === "PAUSADO" ? "Activar" : "Pausar"}
                              </button>
                              <button onClick={() => abrirModal("borrar", u)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Borrar</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
          {seccion !== "usuarios" && seccion !== "inspeccion" && (
            <div style={{ background: "#fff", borderTop: "1px solid #E5E7EB", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Cambios pendientes de guardar</span>
              </div>
              <button onClick={guardar} disabled={guardando} style={{ background: "linear-gradient(135deg,#673DE6,#8B5CF6)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 26px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(103,61,230,0.3)" }}>
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
            <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 320 }}>La solicitud ha sido enviada al Super Admin para su revision.<br/>Pronto recibiras una notificacion con el acceso temporal.</div>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 10, letterSpacing: "0.05em" }}>DATOS PERSONALES</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: "#94a3b8" }}>Nombre: </span><strong>{form.nombre} {form.apellidos}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Email: </span><strong>{form.email}</strong></div>
                  {form.telefono && <div><span style={{ color: "#94a3b8" }}>Telefono: </span><strong>{form.telefono}</strong></div>}
                  {form.dni && <div><span style={{ color: "#94a3b8" }}>DNI/NIE: </span><strong>{form.dni}</strong></div>}
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 10, letterSpacing: "0.05em" }}>DATOS DEL PUESTO</div>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 10, letterSpacing: "0.05em" }}>ACCESO AL SISTEMA</div>
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 6 }}>NOTAS</div>
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
              <button onClick={enviarSolicitud} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em" }}>DATOS PERSONALES</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Nombre *</label><input value={form.nombre||""} onChange={e=>setForm((p:any)=>({...p,nombre:e.target.value.replace(/\b\w/g,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Carlos"/></div>
                  <div><label style={labelStyle}>Apellidos *</label><input value={form.apellidos||""} onChange={e=>setForm((p:any)=>({...p,apellidos:e.target.value.replace(/\b\w/g,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Garcia Lopez"/></div>
                  <div><label style={labelStyle}>Email *</label><input type="email" value={form.email||""} onChange={e=>setForm((p:any)=>({...p,email:e.target.value.toLowerCase()}))} style={{...inputStyle,borderColor:form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)?"#ef4444":"var(--border)"}} placeholder="Ej: correo@empresa.com"/>{form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)&&<div style={{fontSize:11,color:"#ef4444"}}>Email invalido</div>}</div>
                  <div><label style={labelStyle}>Telefono</label><input value={form.telefono||""} onChange={e=>setForm((p:any)=>({...p,telefono:e.target.value.replace(/[^0-9+\s]/g,"")}))} style={inputStyle} placeholder="Ej: 600 000 000" maxLength={15}/></div>
                  <div><label style={labelStyle}>DNI / NIE</label><input value={form.dni||""} onChange={e=>setForm((p:any)=>({...p,dni:e.target.value.toUpperCase()}))} style={{...inputStyle,borderColor:form.dni&&!/^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/.test(form.dni)?"#ef4444":"var(--border)"}} placeholder="Ej: 12345678A" maxLength={9}/>{form.dni&&!/^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/.test(form.dni)&&<div style={{fontSize:11,color:"#ef4444"}}>Formato invalido</div>}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", marginTop: 6 }}>DATOS DEL PUESTO</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Cargo / Puesto *</label><input value={form.cargo||""} onChange={e=>setForm((p:any)=>({...p,cargo:e.target.value.replace(/^\w/,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Director de area"/></div>
                  <div><label style={labelStyle}>Departamento *</label><input value={form.departamento||""} onChange={e=>setForm((p:any)=>({...p,departamento:e.target.value.replace(/^\w/,(c:string)=>c.toUpperCase())}))} style={inputStyle} placeholder="Ej: Recursos humanos"/></div>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", marginTop: 6 }}>ACCESO AL SISTEMA</div>
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
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: activo ? "#6366f1" : "#e2e8f0", flexShrink: 0 }} />
                          {p.modulo}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, padding: "6px 0" }}>
                          <input type="checkbox" checked={tieneVer} onChange={e=>setForm((prev:any)=>({...prev,permisos:{...prev.permisos,[p.ver]:e.target.checked}}))} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#6366f1" }} />
                          <span style={{ fontSize: 9, fontWeight: 700, color: tieneVer ? "#6366f1" : "#e2e8f0" }}>{tieneVer ? "ON" : "OFF"}</span>
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
                <label style={labelStyle}>Contraseña SUPER_ADMIN para confirmar</label>
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
                  style={{ background: modal.tipo === "borrar" ? "#dc2626" : "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
