"use client"

import { useState, useEffect } from "react"

const ROLES = ["SUPER_ADMIN", "ADMIN_SEDE", "EMPLEADO"]

const SECCIONES = [
  { key: "identidad", label: "Identidad legal" },
  { key: "contacto", label: "Contacto" },
  { key: "laboral", label: "Datos laborales" },
  { key: "apariencia", label: "Apariencia" },
  { key: "licencia", label: "Licencia" },
  { key: "inspeccion", label: "Inspección laboral" },
  { key: "usuarios", label: "Usuarios" },
  { key: "demo", label: "Base de datos demo" },
  { key: "imap", label: "Email IMAP (Bajas IT)" },
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
          pass: data.imap_pass || "",
          folder: data.imap_folder || "INBOX",
        })
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  const guardar = async () => {
    setLoading(true)
    const res = await fetch("/api/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imap_host: form.host,
        imap_port: parseInt(form.port),
        imap_tls: form.tls,
        imap_user: form.user,
        imap_pass: form.pass,
        imap_folder: form.folder,
      }),
    })
    setLoading(false)
    if (res.ok) setMensaje({ texto: "Configuracion IMAP guardada correctamente", tipo: "ok" })
    else setMensaje({ texto: "Error al guardar", tipo: "error" })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
  }

  const testConexion = async () => {
    setTestando(true)
    try {
      const res = await fetch("/api/configuracion/imap-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) setMensaje({ texto: `Conexion exitosa. ${data.mensajes} mensajes en bandeja.`, tipo: "ok" })
      else setMensaje({ texto: data.error || "Error de conexion", tipo: "error" })
    } catch {
      setMensaje({ texto: "Error de red al conectar", tipo: "error" })
    }
    setTestando(false)
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 5000)
  }

  if (cargando) return <div style={{ padding: 40, textAlign: "center", color: "#a0aec0" }}>Cargando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 10, padding: "12px 16px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", margin: "0 0 4px" }}>Email IMAP para bajas IT</p>
        <p style={{ fontSize: 12, color: "#1d4ed8", margin: 0 }}>Configura el buzon de correo donde el INSS envia los partes de baja telematicos. RD 1060/2022.</p>
      </div>
      {mensaje.texto && (
        <div style={{ background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2", border: `1px solid ${mensaje.tipo === "ok" ? "#86efac" : "#fca5a5"}`, borderRadius: 8, padding: "10px 16px", fontSize: 13, color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b" }}>
          {mensaje.texto}
        </div>
      )}
      <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: "0 0 16px" }}>Servidor IMAP</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Servidor IMAP</label>
            <input value={form.host} onChange={e => setForm(p => ({ ...p, host: e.target.value }))} placeholder="mail.tuempresa.com"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Puerto</label>
            <input value={form.port} onChange={e => setForm(p => ({ ...p, port: e.target.value }))} placeholder="993"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Usuario (email)</label>
            <input value={form.user} onChange={e => setForm(p => ({ ...p, user: e.target.value }))} placeholder="bajas@empresa.com"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Contrasena</label>
            <input type="password" value={form.pass} onChange={e => setForm(p => ({ ...p, pass: e.target.value }))} placeholder="••••••••"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>Carpeta</label>
            <input value={form.folder} onChange={e => setForm(p => ({ ...p, folder: e.target.value }))} placeholder="INBOX"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as "border-box" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20 }}>
            <input type="checkbox" id="tls" checked={form.tls} onChange={e => setForm(p => ({ ...p, tls: e.target.checked }))} />
            <label htmlFor="tls" style={{ fontSize: 13, color: "#1e1b4b", cursor: "pointer" }}>Usar TLS/SSL</label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={testConexion} disabled={testando || !form.host || !form.user}
            style={{ background: "#f0f4ff", color: "#6366f1", border: "1px solid #c7d2fe", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {testando ? "Probando..." : "Probar conexion"}
          </button>
          <button onClick={guardar} disabled={loading}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {loading ? "Guardando..." : "Guardar configuracion"}
          </button>
        </div>
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: "0 0 8px" }}>Como funciona</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { paso: "1", txt: "El medico emite el parte de baja y lo envia al INSS telematicamente (RD 1060/2022)" },
            { paso: "2", txt: "El INSS envia un email automatico a tu buzon con los datos del parte" },
            { paso: "3", txt: "Scheduleo lee el email cada 30 minutos y registra la baja automaticamente" },
            { paso: "4", txt: "El admin recibe una notificacion push y confirma los datos economicos al INSS en 3 dias habiles" },
          ].map(p => (
            <div key={p.paso} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#6366f1", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.paso}</div>
              <p style={{ fontSize: 13, color: "#718096", margin: 0, paddingTop: 3 }}>{p.txt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SeccionDemo() {
  const [modoDemo, setModoDemo] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    fetch('/api/config/modo-demo').then(r => r.json()).then(d => {
      setModoDemo(d.modoDemo)
      setCargando(false)
    })
  }, [])

  const toggleDemo = async () => {
    setGuardando(true)
    const nuevo = !modoDemo
    await fetch('/api/config/modo-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modoDemo: nuevo })
    })
    setModoDemo(nuevo)
    setGuardando(false)
  }

  if (cargando) return <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Cargando...</div>

  return (
    <div>
      <div style={{ background: modoDemo ? '#fef3c7' : '#f0f4ff', border: `1px solid ${modoDemo ? '#f59e0b' : '#c7d2fe'}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: modoDemo ? '#92400e' : '#1e1b4b', marginBottom: 4 }}>
              {modoDemo ? '⚠️ Modo demostración ACTIVO' : '🔒 Modo demostración INACTIVO'}
            </div>
            <div style={{ fontSize: 13, color: modoDemo ? '#d97706' : '#718096' }}>
              {modoDemo ? 'El sistema muestra 50 empleados ficticios. Los datos reales están ocultos.' : 'El sistema muestra los datos reales de la empresa.'}
            </div>
          </div>
          <button onClick={toggleDemo} disabled={guardando}
            style={{ background: modoDemo ? '#f59e0b' : '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minWidth: 140 }}>
            {guardando ? 'Guardando...' : modoDemo ? 'Desactivar demo' : 'Activar demo'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: '50 empleados ficticios', icon: '👥', desc: 'Nombres, DNIs, fechas y sueldos realistas' },
            { label: 'Datos separados', icon: '🔒', desc: 'Los datos demo nunca se mezclan con los reales' },
            { label: 'Un click para limpiar', icon: '🧹', desc: 'Desactiva el modo demo para volver a datos reales' },
          ].map(item => (
            <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '0.5px solid #e8eaf0' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#a0aec0' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {modoDemo && (
        <div style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', marginBottom: 12 }}>Datos de demostración incluidos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {[
              '50 empleados con datos completos',
              '6 grupos de trabajo con empleados asignados',
              'DNIs, teléfonos y fechas ficticias',
              'Sueldos base entre 1.700 y 2.200',
              'Fechas de contratación entre 2017 y 2022',
              'Distribución equitativa entre grupos',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#718096' }}>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


export default function ConfiguracionPage() {
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
  const [modal, setModal] = useState<any>(null)
  const [tempPassword, setTempPassword] = useState("")
  const [form, setForm] = useState({ email: "", name: "", role: "EMPLEADO" })
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
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, masterPassword: modalPin, empresaId: "empresa-001" })
    })
    const data = await res.json()
    if (data.error) { mostrarMensaje(data.error, "error"); return }
    setTempPassword(data.tempPassword)
    cargar()
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

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const, color: "#1e1b4b", outline: "none" }
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
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Configuración del sistema</h1>
          <p style={{ fontSize: 13, color: "#a0aec0", margin: "4px 0 0" }}>Gestión completa de la empresa y accesos</p>
        </div>
        {seccion !== "usuarios" && seccion !== "inspeccion" && (
          <button onClick={guardar} disabled={guardando}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </div>

      {mensaje.texto && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: mensaje.tipo === "error" ? "#fee2e2" : "#d1fae5", borderRadius: 8, fontSize: 13, color: mensaje.tipo === "error" ? "#991b1b" : "#065f46" }}>
          {mensaje.texto}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 12, height: "fit-content" }}>
          {SECCIONES.map(s => (
            <button key={s.key} onClick={() => setSeccion(s.key)}
              style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: seccion === s.key ? 600 : 400, color: seccion === s.key ? "#6366f1" : "#718096", background: seccion === s.key ? "#ede9fe" : "transparent", cursor: "pointer", marginBottom: 2 }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "0.5px solid #e8eaf0", borderRadius: 16, padding: 28 }}>

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
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 20px" }}>Apariencia de la aplicación</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>URL del logo</label>
                  <input value={empresa.logo || ""} onChange={e => set("logo", e.target.value)} placeholder="https://..." style={inputStyle} />
                  {empresa.logo && <img src={empresa.logo} alt="logo" style={{ marginTop: 8, height: 48, borderRadius: 8, border: "1px solid #e8eaf0" }} />}
                </div>
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
              <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 10, fontWeight: 500 }}>Vista previa</div>
              <div style={{ width: 200, background: empresa.colorSidebar || "#2d2b55", borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  {empresa.logo ? (
                    <img src={empresa.logo} alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: empresa.colorAccent || "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      {(empresa.nombreComercial || empresa.nombre || "E")[0]?.toUpperCase()}
                    </div>
                  )}
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{empresa.nombreComercial || empresa.nombre || "Empresa"}</span>
                </div>
                {["Dashboard", "Empleados", "Deudas"].map((item, i) => (
                  <div key={item} style={{ padding: "7px 10px", borderRadius: 7, color: i === 2 ? "#fff" : "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 3, background: i === 2 ? (empresa.colorAccent || "#6366f1") : "transparent", fontWeight: i === 2 ? 500 : 400 }}>{item}</div>
                ))}
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
          {seccion === "demo" && <SeccionDemo />}
          {seccion === "imap" && <SeccionIMAP />}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: 0 }}>Gestión de usuarios</h2>
                <button onClick={() => abrirModal("crear")} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  + Nuevo usuario
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
                              <button onClick={() => abrirModal("reset", u)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Reset</button>
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
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: "#1e1b4b" }}>
              {modal.tipo === "crear" && "Crear nuevo usuario"}
              {modal.tipo === "editar" && `Editar: ${modal.usuario.email}`}
              {modal.tipo === "borrar" && `Borrar: ${modal.usuario.email}`}
              {modal.tipo === "pausar" && `Pausar: ${modal.usuario.email}`}
              {modal.tipo === "reactivar" && `Activar: ${modal.usuario.email}`}
              {modal.tipo === "reset" && `Reset contraseña: ${modal.usuario.email}`}
            </h2>
            {(modal.tipo === "crear" || modal.tipo === "editar") && (
              <div style={{ marginBottom: 16 }}>
                {[{ label: "Nombre", key: "name", type: "text" }, { label: "Email", key: "email", type: "email" }].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Rol</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
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




