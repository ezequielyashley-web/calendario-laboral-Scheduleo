"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface Mensaje {
  rol: "user" | "assistant"
  contenido: string
  tiempo?: string
}

export default function ScheduleoAIChat({ userId }: { userId: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: "assistant", contenido: "Hola! Soy ScheduleoAI. Puedo ayudarte con turnos, empleados, vacaciones, grupos y mucho mas. En que te puedo ayudar?", tiempo: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) }
  ])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [activo, setActivo] = useState(false)
  const mensajesRef = useRef<HTMLDivElement>(null)

  // Arrastrable
  const [pos, setPos] = useState({ x: 24, y: 24 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  const [resolvedUserId, setResolvedUserId] = useState(userId)

  useEffect(() => {
    fetch("/api/ai/config").then(r => r.json()).then(d => setActivo(d.activo)).catch(() => {})
    if (!userId) {
      fetch("/api/session-info").then(r => r.json()).then(d => { if(d?.id) setResolvedUserId(d.id) }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (mensajesRef.current) mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
  }, [mensajes])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      setPos({ x: Math.max(8, dragStart.current.px - dx), y: Math.max(8, dragStart.current.py - dy) })
    }
    const onUp = () => setDragging(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [dragging])

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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: [...historial, { rol: "user", contenido: texto }], userId: resolvedUserId })
      })
      const data = await res.json()
      setMensajes(prev => [...prev, { rol: "assistant", contenido: data.error || data.respuesta || "Sin respuesta", tiempo: hora }])
    } catch {
      setMensajes(prev => [...prev, { rol: "assistant", contenido: "Error de conexion. Intentalo de nuevo.", tiempo: hora }])
    }
    setCargando(false)
  }

  if (!activo) return null

  return (
    <>
      <style>{`
        @keyframes bounce-dot { 0%,80%,100%{transform:scale(0)}40%{transform:scale(1)} }
        @keyframes pulse-ai { 0%,100%{box-shadow:0 0 0 0 rgba(103,61,230,0.4)} 50%{box-shadow:0 0 0 8px rgba(103,61,230,0)} }
      `}</style>

      {/* Boton flotante arrastrable */}
      <div
        onMouseDown={onMouseDown}
        onClick={() => !dragging && setAbierto(!abierto)}
        style={{ position: "fixed", bottom: pos.y, right: pos.x, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#673DE6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: dragging ? "grabbing" : "grab", boxShadow: "0 4px 20px rgba(103,61,230,0.45)", zIndex: 1000, animation: "pulse-ai 2.5s ease-in-out infinite", userSelect: "none" }}>
        {/* Icono S de Scheduleo con rayo AI */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="5" y="20" fontFamily="Arial Black, sans-serif" fontSize="18" fontWeight="900" fill="white">S</text>
          <circle cx="22" cy="8" r="6" fill="#FBBF24"/>
          <text x="19" y="12" fontFamily="Arial" fontSize="9" fontWeight="900" fill="#0f0c29">AI</text>
        </svg>
      </div>

      {/* Panel chat */}
      {abierto && (
        <div style={{ position: "fixed", bottom: pos.y + 64, right: pos.x, width: 360, height: 480, background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", zIndex: 999, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#673DE6,#8B5CF6)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <text x="3" y="18" fontFamily="Arial Black, sans-serif" fontSize="16" fontWeight="900" fill="white">S</text>
                <circle cx="22" cy="7" r="5" fill="#FBBF24"/>
                <text x="19.5" y="10.5" fontFamily="Arial" fontSize="7" fontWeight="900" fill="#0f0c29">AI</text>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>ScheduleoAI</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>● Activo · Responde en segundos</div>
            </div>
            <button onClick={() => setMensajes([{ rol: "assistant", contenido: "Chat reiniciado. En que te puedo ayudar?", tiempo: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) }])}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", fontSize: 10, cursor: "pointer", marginRight: 4 }}>
              Limpiar
            </button>
            <button onClick={() => setAbierto(false)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Mensajes */}
          <div ref={mensajesRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "#FAFAFA" }}>
            {mensajes.map((m, i) => {
              const navMatch = m.contenido.match(/\[NAVEGAR:([^\|]+)\|([^\]]+)\]/)
              const textoLimpio = m.contenido.replace(/\[NAVEGAR:[^\]]+\]/g, "").trim()
              const navRuta = navMatch?.[1]
              const navTexto = navMatch?.[2]
              return (
              <div key={i} style={{ display: "flex", justifyContent: m.rol === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", background: m.rol === "user" ? "linear-gradient(135deg,#673DE6,#8B5CF6)" : "#fff", border: m.rol === "user" ? "none" : "1px solid #E5E7EB", borderRadius: m.rol === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "9px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 13, color: m.rol === "user" ? "#fff" : "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word" }}>{textoLimpio}</div>
                  {navRuta && navTexto && (
                    <button onClick={() => { if(navRuta) window.history.pushState({}, "", navRuta); window.dispatchEvent(new PopStateEvent("popstate")) }}
                      style={{ marginTop: 8, background: "linear-gradient(135deg,#673DE6,#8B5CF6)", color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, width: "100%" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      {navTexto}
                    </button>
                  )}
                  {m.tiempo && <div style={{ fontSize: 9, color: m.rol === "user" ? "rgba(255,255,255,0.6)" : "#9CA3AF", marginTop: 4, textAlign: "right" }}>{m.tiempo}</div>}
                </div>
              </div>
            )})}
            {cargando && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px 12px 12px 2px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#673DE6", animation: `bounce-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
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
        </div>
      )}
    </>
  )
}