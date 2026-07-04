"use client"
import { useState, useEffect, useRef } from "react"

interface Mensaje {
  rol: "user" | "assistant"
  contenido: string
  tiempo?: string
}

export default function ScheduleoAIChat({ userId }: { userId: string }) {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: "assistant", contenido: "Hola! Soy ScheduleoAI. Puedo ayudarte con turnos, empleados, vacaciones, grupos y mucho mas. En que te puedo ayudar?", tiempo: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) }
  ])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [activo, setActivo] = useState(false)
  const mensajesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/ai/config").then(r => r.json()).then(d => setActivo(d.activo)).catch(() => {})
  }, [])

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const enviar = async () => {
    if (!input.trim() || cargando) return
    const texto = input.trim()
    const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    setInput("")
    setMensajes(prev => [...prev, { rol: "user", contenido: texto, tiempo: hora }])
    setCargando(true)

    try {
      const historial = mensajes.map(m => ({ rol: m.rol, contenido: m.contenido }))
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensajes: [...historial, { rol: "user", contenido: texto }],
          userId
        })
      })
      const data = await res.json()
      if (data.error) {
        setMensajes(prev => [...prev, { rol: "assistant", contenido: data.error, tiempo: hora }])
      } else {
        setMensajes(prev => [...prev, { rol: "assistant", contenido: data.respuesta, tiempo: hora }])
      }
    } catch {
      setMensajes(prev => [...prev, { rol: "assistant", contenido: "Error de conexion. Intentalo de nuevo.", tiempo: hora }])
    }
    setCargando(false)
  }

  if (!activo) return null

  return (
    <>
      {/* Boton flotante */}
      <div onClick={() => setAbierto(!abierto)}
        style={{ position: "fixed", bottom: 24, right: 24, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#673DE6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(103,61,230,0.4)", zIndex: 1000, transition: "transform 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
        {abierto ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
        )}
      </div>

      {/* Panel chat */}
      {abierto && (
        <div style={{ position: "fixed", bottom: 88, right: 24, width: 360, height: 480, background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", zIndex: 999, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#673DE6,#8B5CF6)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>ScheduleoAI</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>● Activo · Responde en segundos</div>
            </div>
            <button onClick={() => setMensajes([{ rol: "assistant", contenido: "Chat reiniciado. En que te puedo ayudar?", tiempo: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) }])}
              style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", fontSize: 10, cursor: "pointer" }}>
              Limpiar
            </button>
          </div>

          {/* Mensajes */}
          <div ref={mensajesRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "#FAFAFA" }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.rol === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", background: m.rol === "user" ? "linear-gradient(135deg,#673DE6,#8B5CF6)" : "#fff", border: m.rol === "user" ? "none" : "1px solid #E5E7EB", borderRadius: m.rol === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "9px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 13, color: m.rol === "user" ? "#fff" : "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.contenido}</div>
                  {m.tiempo && <div style={{ fontSize: 9, color: m.rol === "user" ? "rgba(255,255,255,0.6)" : "#9CA3AF", marginTop: 4, textAlign: "right" }}>{m.tiempo}</div>}
                </div>
              </div>
            ))}
            {cargando && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px 12px 12px 2px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#673DE6", animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, background: "#fff" }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
              placeholder="Escribe tu consulta..."
              disabled={cargando}
              style={{ flex: 1, padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 9, fontSize: 13, color: "#374151", outline: "none", background: "#F9FAFB" }} />
            <button onClick={enviar} disabled={cargando || !input.trim()}
              style={{ width: 36, height: 36, background: "linear-gradient(135deg,#673DE6,#8B5CF6)", border: "none", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: !input.trim() ? 0.5 : 1, flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>

          <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)}40%{transform:scale(1)} }`}</style>
        </div>
      )}
    </>
  )
}