"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ReportarFalloButton({ userName }: { userName?: string }) {
  const [activo, setActivo] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [descripcion, setDescripcion] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const cargar = () => {
      fetch("/api/config/modo-pruebas").then(r => r.json()).then(d => setActivo(!!d.modoPruebas)).catch(() => {})
    }
    cargar()
    window.addEventListener("modoPruebasChange", cargar)
    return () => window.removeEventListener("modoPruebasChange", cargar)
  }, [])

  const enviar = async () => {
    if (!descripcion.trim()) return
    setEnviando(true)
    try {
      await fetch("/api/reportes-fallo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion,
          pagina: pathname,
          reportadoPor: userName || "Desconocido",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
        })
      })
      setEnviado(true)
      setDescripcion("")
      setTimeout(() => { setEnviado(false); setAbierto(false) }, 1800)
    } catch {}
    setEnviando(false)
  }

  if (!activo) return null

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        title="Reportar un fallo"
        style={{ position: "fixed", bottom: 24, left: 24, width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#DC2626)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(220,38,38,0.4)", cursor: "pointer", zIndex: 998 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </button>

      {abierto && (
        <div onClick={() => !enviando && setAbierto(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 }}>
            {enviado ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Fallo reportado, gracias</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>🐞 Reportar un fallo</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 14 }}>Describe qué esperabas que pasara y qué pasó en su lugar. Se guarda automáticamente en qué página estás.</div>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: Al pulsar Guardar en Apariencia, no pasa nada..."
                  autoFocus
                  style={{ width: "100%", minHeight: 100, padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
                  <button onClick={() => setAbierto(false)} disabled={enviando} style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                  <button onClick={enviar} disabled={enviando || !descripcion.trim()} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: (!descripcion.trim() || enviando) ? 0.5 : 1 }}>
                    {enviando ? "Enviando..." : "Enviar reporte"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}