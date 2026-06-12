"use client"
import { useState, useEffect } from "react"
import { usePushNotifications } from "@/hooks/usePushNotifications"

export default function InspectorBanner() {
  const [inspectorActivo, setInspectorActivo] = useState(false)
  const [ultimoAcceso, setUltimoAcceso] = useState<any>(null)
  const [accesosHoy, setAccesosHoy] = useState(0)
  const { suscrito, soportado, suscribirse, cargando } = usePushNotifications()
  const [suscritoLocal, setSuscritoLocal] = useState(false)
  const [bannerCerrado, setBannerCerrado] = useState(false)

  useEffect(() => {
    setSuscritoLocal(localStorage.getItem("push_suscrito") === "true")
    setBannerCerrado(localStorage.getItem("push_banner_cerrado") === "true")
    const handler = () => {
      setSuscritoLocal(localStorage.getItem("push_suscrito") === "true")
      setBannerCerrado(localStorage.getItem("push_banner_cerrado") === "true")
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const verificarInspector = async () => {
    try {
      const res = await fetch("/api/inspeccion/estado")
      const data = await res.json()
      setInspectorActivo(data.activo)
      setUltimoAcceso(data.ultimoAcceso)
      setAccesosHoy(data.accesosHoy)
    } catch (e) {}
  }

  useEffect(() => {
    verificarInspector()
    const interval = setInterval(verificarInspector, 30000)
    return () => clearInterval(interval)
  }, [])

  const cerrarBanner = () => {
    setBannerCerrado(true)
    localStorage.setItem("push_banner_cerrado", "true")
  }

  const handleSuscribirse = async () => {
    await suscribirse()
    localStorage.setItem("push_suscrito", "true")
    localStorage.setItem("push_banner_cerrado", "true")
    setSuscritoLocal(true)
    setBannerCerrado(true)
  }

  if (cargando) return null

  const mostrarBannerPush = soportado && !suscrito && !suscritoLocal && !bannerCerrado

  return (
    <div style={{ marginBottom: inspectorActivo || mostrarBannerPush ? 16 : 0 }}>
      {inspectorActivo && (
        <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }}></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>Inspector accediendo al sistema ahora mismo</div>
              <div style={{ fontSize: 11, color: "#d97706" }}>
                Ultimo acceso: {ultimoAcceso ? new Date(ultimoAcceso).toLocaleString("es-ES") : "—"} · {accesosHoy} accesos hoy
              </div>
            </div>
          </div>
          <a href="/configuracion" style={{ fontSize: 12, color: "#92400e", fontWeight: 500, textDecoration: "none", background: "rgba(245,158,11,0.15)", padding: "4px 10px", borderRadius: 6 }}>
            Ver log
          </a>
        </div>
      )}
      {mostrarBannerPush && (
        <div style={{ background: "#f0f4ff", border: "0.5px solid #c7d2fe", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#4338ca" }}>
            Activa las notificaciones para recibir alertas cuando Hacienda acceda al sistema
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={cerrarBanner}
              style={{ background: "transparent", color: "#6366f1", border: "1px solid #c7d2fe", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Ahora no
            </button>
            <button onClick={handleSuscribirse}
              style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Activar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}