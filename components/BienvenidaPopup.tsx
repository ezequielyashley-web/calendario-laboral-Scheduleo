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

function getSaludo() {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 12) return { texto: "Buenos dias", emoji: "🌅" }
  if (hora >= 12 && hora < 20) return { texto: "Buenas tardes", emoji: "☀️" }
  return { texto: "Buenas noches", emoji: "🌙" }
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

  const saludo = getSaludo()
  const permisos = datos.permisos || {}
  const permisosActivos = Object.keys(permisos).filter(k => permisos[k])
  const nombre = datos.nombre?.split(" ")[0] || datos.nombre

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      opacity: saliendo ? 0 : 1, transition: "opacity 0.4s ease"
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, width: 500, maxWidth: "95vw", maxHeight: "90vh",
        overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
        transform: saliendo ? "scale(0.95)" : "scale(1)", transition: "transform 0.4s ease"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          padding: "32px 28px 28px", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{saludo.emoji}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              {saludo.texto}, {nombre}
            </div>
            {datos.cargo && (
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                {datos.cargo}{datos.departamento ? ` · ${datos.departamento}` : ""}
              </div>
            )}
            {datos.role === "SUPER_ADMIN" && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px" }}>
                <span>👑</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Super Administrador</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "50vh" }}>
          {datos.notificaciones > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>📬</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>
                  {datos.notificaciones} notificacion{datos.notificaciones > 1 ? "es" : ""} pendiente{datos.notificaciones > 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 12, color: "#b45309" }}>Revisa tu bandeja al entrar</div>
              </div>
            </div>
          )}

          {permisosActivos.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10 }}>TUS ACCESOS AL SISTEMA</div>
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
              <div style={{ fontSize: 13, color: "#5b21b6", fontWeight: 500 }}>Tienes acceso total a todas las funciones del sistema.</div>
            </div>
          )}

          {datos.ultimoLogin && (
            <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
              Ultimo acceso: {new Date(datos.ultimoLogin).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 28px 28px" }}>
          <button onClick={cerrar} style={{
            width: "100%", background: "linear-gradient(135deg, #4338ca, #6366f1)",
            color: "#fff", border: "none", borderRadius: 14, padding: "14px",
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