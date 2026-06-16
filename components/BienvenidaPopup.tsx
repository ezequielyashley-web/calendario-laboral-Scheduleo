"use client"
import { useState, useEffect } from "react"

const MODULOS: Record<string, string> = {
  empleados_ver: "Ver empleados",
  empleados_mod: "Gestionar empleados",
  vacaciones_ver: "Ver vacaciones",
  vacaciones_mod: "Aprobar vacaciones",
  fichajes_ver: "Ver fichajes",
  fichajes_mod: "Gestionar fichajes",
  reportes_ver: "Ver reportes",
  reportes_mod: "Exportar reportes",
  bajas_ver: "Ver bajas medicas",
  bajas_mod: "Gestionar bajas",
  cambios_ver: "Ver cambios de turno",
  cambios_mod: "Aprobar cambios de turno",
  deudas_ver: "Ver deudas",
  deudas_mod: "Gestionar deudas",
  grupos_ver: "Ver grupos",
  grupos_mod: "Gestionar grupos",
  libranzas_ver: "Ver libranzas",
  libranzas_mod: "Gestionar libranzas",
  minimos_ver: "Ver minimos por puesto",
  minimos_mod: "Modificar minimos",
  calendario_ver: "Ver calendario",
  calendario_mod: "Modificar calendario",
  config_ver: "Ver configuracion",
  config_mod: "Modificar configuracion",
}

function getSaludo(genero?: string) {
  const hora = new Date().getHours()
  const esFemenino = genero === "femenino"
  if (hora >= 6 && hora < 12) return { texto: esFemenino ? "Bienvenida" : "Bienvenido", saludo: "Buenos dias", emoji: "🌅" }
  if (hora >= 12 && hora < 20) return { texto: esFemenino ? "Bienvenida" : "Bienvenido", saludo: "Buenas tardes", emoji: "☀️" }
  return { texto: esFemenino ? "Bienvenida" : "Bienvenido", saludo: "Buenas noches", emoji: "🌙" }
}

function getRolLabel(role: string) {
  if (role === "SUPER_ADMIN") return { icon: "👑", label: "Super Administrador" }
  if (role === "ADMIN") return { icon: "💼", label: "Usuario gerencial" }
  return { icon: "👤", label: "Empleado" }
}

export default function BienvenidaPopup({ email }: { email?: string }) {
  const [datos, setDatos] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  useEffect(() => {
    if (!email) return
    const yaVisto = sessionStorage.getItem("bienvenida_" + email)
    if (yaVisto) return

    fetch(`/api/bienvenida?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setDatos(data)
          setTimeout(() => setVisible(true), 400)
        }
      }).catch(() => {})
  }, [email])

  const cerrar = () => {
    setSaliendo(true)
    if (email) sessionStorage.setItem("bienvenida_" + email, "1")
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible || !datos) return null

  const { texto, saludo, emoji } = getSaludo(datos.genero)
  const permisos = datos.permisos || {}
  const permisosActivos = Object.keys(permisos).filter(k => permisos[k])
  const nombre = datos.nombre?.split(" ")[0] || datos.nombre
  const rol = getRolLabel(datos.role)

  const headerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
    padding: "26px 28px 22px",
    position: "relative",
    overflow: "hidden"
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      opacity: saliendo ? 0 : 1, transition: "opacity 0.4s ease"
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, width: 560, maxWidth: "95vw", maxHeight: "92vh",
        overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
        transform: saliendo ? "scale(0.95)" : "scale(1)", transition: "transform 0.4s ease"
      }}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -30, left: -30, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          {/* Top bar - Logo + Empresa */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "0.5px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.95"/>
                  <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.65"/>
                  <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.65"/>
                  <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.35"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.95)" }}>
                Scheduleo<span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 2 }}>v2.0</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 12px" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                {datos.empresa ? datos.empresa[0] : "E"}
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{datos.empresa || "Mi Empresa S.L."}</span>
            </div>
          </div>

          {/* Greeting */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 42, lineHeight: 1, flexShrink: 0 }}>{emoji}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                {texto}, {nombre}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                {saludo} · {datos.cargo || ""}{datos.departamento ? ` · ${datos.departamento}` : ""}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 13px", fontSize: 11, color: "rgba(255,255,255,0.9)" }}>
                <span>{rol.icon}</span>
                <span>{rol.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

        {/* BODY */}
        <div style={{ padding: "20px 28px 24px", overflowY: "auto", maxHeight: "55vh" }}>

          {/* Notificaciones */}
          {datos.notificaciones > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "11px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 22 }}>📬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                  {datos.notificaciones} notificacion{datos.notificaciones > 1 ? "es" : ""} pendiente{datos.notificaciones > 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 11, color: "#b45309" }}>Revisa tu bandeja al entrar</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, background: "#f59e0b", color: "#fff", borderRadius: 12, padding: "2px 9px" }}>
                {datos.notificaciones}
              </div>
            </div>
          )}

          {/* Permisos */}
          {permisosActivos.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10 }}>
                TUS ACCESOS AL SISTEMA
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {permisosActivos.map(k => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, background: k.endsWith("_mod") ? "#eff6ff" : "#f0fdf4", borderRadius: 10, padding: "8px 12px", border: `1px solid ${k.endsWith("_mod") ? "#bfdbfe" : "#bbf7d0"}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: k.endsWith("_mod") ? "#3b82f6" : "#22c55e", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: k.endsWith("_mod") ? "#1e40af" : "#15803d" }}>
                      {MODULOS[k] || k}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {datos.role === "SUPER_ADMIN" && permisosActivos.length === 0 && (
            <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#5b21b6", fontWeight: 500 }}>
                Tienes acceso total a todas las funciones del sistema.
              </div>
            </div>
          )}

          {/* Cambios de permisos */}
          {datos.cambiosPermisos && datos.cambiosPermisos.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                ✅ Cambios en tu acceso desde tu ultimo ingreso
              </div>
              {datos.cambiosPermisos[0].added?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginBottom: 5 }}>NUEVOS PERMISOS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {datos.cambiosPermisos[0].added.map((k: string) => (
                      <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#15803d", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: "1px solid #86efac" }}>
                        ✓ NUEVO · {MODULOS[k] || k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {datos.cambiosPermisos[0].removed?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#dc2626", fontWeight: 700, marginBottom: 5 }}>PERMISOS RETIRADOS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {datos.cambiosPermisos[0].removed.map((k: string) => (
                      <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fee2e2", color: "#991b1b", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: "1px solid #fca5a5" }}>
                        ✕ {MODULOS[k] || k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ultimo login */}
          {datos.ultimoLogin && (
            <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", paddingTop: 10, borderTop: "0.5px solid #f3f4f6", marginTop: 4 }}>
              Ultimo acceso: {new Date(datos.ultimoLogin).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding: "0 28px 28px" }}>
          <button onClick={cerrar} style={{
            width: "100%",
            background: "linear-gradient(135deg, #4338ca, #6366f1)",
            color: "#fff", border: "none", borderRadius: 12, padding: "14px",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 15px rgba(99,102,241,0.35)"
          }}>
            Entrar al sistema →
          </button>
        </div>
      </div>
    </div>
  )
}