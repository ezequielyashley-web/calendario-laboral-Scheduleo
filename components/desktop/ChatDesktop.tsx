"use client"
import { useState, useEffect, useRef } from "react"

type Mensaje = { id: string; autorId: string; autorNombre: string; autorRol: string; contenido: string; tipo: string; creadoEn: string }
type Conversacion = { id: string; nombre: string; tipo: string; participantes: any[]; ultimoMensaje: string; ultimoMensajeEn: string }

const COLORS = [
  { bg: "#7c3aed", text: "#fff" }, { bg: "#0891b2", text: "#fff" },
  { bg: "#059669", text: "#fff" }, { bg: "#d97706", text: "#fff" },
  { bg: "#db2777", text: "#fff" },
]
function getColor(s: string) { return COLORS[s.charCodeAt(0) % COLORS.length] }

function Avatar({ nombre, size = 36 }: { nombre: string; size?: number }) {
  const c = getColor(nombre)
  const initials = nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
  return <div style={{ width: size, height: size, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
}

export default function ChatDesktop() {
  const [tab, setTab] = useState<"mensajes" | "comunicados">("mensajes")
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [convActiva, setConvActiva] = useState<Conversacion | null>(null)
  const [texto, setTexto] = useState("")
  const [comunicados, setComunicados] = useState<any[]>([])
  const [nuevaConv, setNuevaConv] = useState(false)
  const [nuevaCom, setNuevaCom] = useState(false)
  const [nombreConv, setNombreConv] = useState("")
  const [tipoConv, setTipoConv] = useState("individual")
  const [formCom, setFormCom] = useState({ titulo: "", contenido: "", urgente: false })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const usuario = { id: "admin-001", nombre: "Administrador", rol: "SUPER_ADMIN" }

  const cargarConvs = async () => {
    const r = await fetch("/api/mensajes").catch(() => null)
    if (r) { const d = await r.json(); if (Array.isArray(d)) setConversaciones(d) }
  }
  const cargarMsgs = async (id: string) => {
    const r = await fetch(`/api/mensajes?conversacionId=${id}`).catch(() => null)
    if (r) { const d = await r.json(); if (Array.isArray(d)) setMensajes(d) }
  }
  const cargarComs = async () => {
    const r = await fetch("/api/comunicados").catch(() => null)
    if (r) { const d = await r.json(); if (Array.isArray(d)) setComunicados(d) }
  }

  useEffect(() => { cargarConvs(); cargarComs() }, [])
  useEffect(() => {
    if (!convActiva) return
    cargarMsgs(convActiva.id)
    const t = setInterval(() => cargarMsgs(convActiva.id), 5000)
    return () => clearInterval(t)
  }, [convActiva])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [mensajes])

  const enviar = async () => {
    if (!texto.trim() || !convActiva) return
    const t = texto; setTexto("")
    await fetch("/api/mensajes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversacionId: convActiva.id, autorId: usuario.id, autorNombre: usuario.nombre, autorRol: usuario.rol, contenido: t, tipo: "texto" }) })
    await cargarMsgs(convActiva.id)
    await cargarConvs()
  }

  const crearConv = async () => {
    if (!nombreConv.trim()) return
    await fetch("/api/conversaciones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: nombreConv, tipo: tipoConv, participantes: [] }) })
    await cargarConvs(); setNuevaConv(false); setNombreConv("")
  }

  const publicarCom = async () => {
    if (!formCom.titulo || !formCom.contenido) return
    await fetch("/api/comunicados", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formCom, autorId: usuario.id, autorNombre: usuario.nombre }) })
    await cargarComs(); setNuevaCom(false); setFormCom({ titulo: "", contenido: "", urgente: false })
  }

  const S = { sidebar: { width: 280, background: "#1e1b4b", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex" as const, flexDirection: "column" as const, flexShrink: 0 } }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 57px)", background: "#fff", border: "none", borderRadius: 0, overflow: "hidden", position: "relative" as const }}>

      {/* SIDEBAR OSCURO */}
      <div style={S.sidebar}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Mensajes</span>
          <button onClick={() => setNuevaConv(true)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, cursor: "pointer", color: "#fff", width: 28, height: 28, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {[{ k: "mensajes", l: "Mensajes" }, { k: "comunicados", l: "Comunicados" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as any)} style={{ flex: 1, padding: "10px 0", fontSize: 12, border: "none", background: "none", cursor: "pointer", color: tab === t.k ? "#a5b4fc" : "rgba(255,255,255,0.45)", borderBottom: tab === t.k ? "2px solid #a5b4fc" : "2px solid transparent", fontWeight: tab === t.k ? 600 : 400 }}>{t.l}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" as const }}>
          {tab === "mensajes" && (
            conversaciones.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                No hay conversaciones
              </div>
            ) : conversaciones.map(conv => (
              <div key={conv.id} onClick={() => setConvActiva(conv)} style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", background: convActiva?.id === conv.id ? "rgba(255,255,255,0.1)" : "transparent" }}>
                <Avatar nombre={conv.nombre || "?"} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.nombre}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{conv.ultimoMensaje || "Sin mensajes"}</div>
                </div>
                {conv.ultimoMensajeEn && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{new Date(conv.ultimoMensajeEn).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>}
              </div>
            ))
          )}
          {tab === "comunicados" && (
            <>
              <div style={{ padding: "10px 14px" }}>
                <button onClick={() => setNuevaCom(true)} style={{ width: "100%", padding: "8px", background: "rgba(165,180,252,0.15)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.2)", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>+ Nuevo comunicado</button>
              </div>
              {comunicados.map(com => (
                <div key={com.id} style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
                    {com.urgente && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", display: "inline-block", flexShrink: 0 }} />}
                    {com.titulo}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{new Date(com.creadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* AREA PRINCIPAL */}
      {tab === "mensajes" && (
        convActiva ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#f0f2f5" }}>
            <div style={{ padding: "12px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar nombre={convActiva.nombre || "?"} size={36} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{convActiva.nombre}</div>
                <div style={{ fontSize: 11, color: "#1D9E75", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} />
                  {convActiva.tipo === "grupo" ? "Grupo" : "En linea"}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
              {mensajes.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
                  <div><div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>Ningún mensaje aún</div>
                </div>
              ) : mensajes.map(m => {
                const esMio = m.autorId === usuario.id
                return (
                  <div key={m.id} style={{ display: "flex", gap: 6, maxWidth: "72%", alignSelf: esMio ? "flex-end" : "flex-start", flexDirection: esMio ? "row-reverse" : "row" }}>
                    {!esMio && <Avatar nombre={m.autorNombre} size={28} />}
                    <div>
                      {!esMio && <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2, marginLeft: 4 }}>{m.autorNombre}</div>}
                      <div style={{ padding: "8px 12px", borderRadius: esMio ? "12px 2px 12px 12px" : "2px 12px 12px 12px", background: esMio ? "#1e1b4b" : "#fff", color: esMio ? "#fff" : "#111827", fontSize: 13, lineHeight: 1.5, boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
                        {m.contenido}
                      </div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3, textAlign: esMio ? "right" : "left" }}>
                        {new Date(m.creadoEn).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}{esMio && " ✓✓"}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: "10px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, alignItems: "center" }}>
              <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()} placeholder="Escribe un mensaje..." autoComplete="off"
                style={{ flex: 1, padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 24, fontSize: 13, background: "#f9fafb", color: "#111827", outline: "none" }} />
              <button onClick={enviar} disabled={!texto.trim()}
                style={{ width: 38, height: 38, borderRadius: "50%", background: texto.trim() ? "#1e1b4b" : "#e2e8f0", border: "none", cursor: texto.trim() ? "pointer" : "default", color: texto.trim() ? "#fff" : "#9ca3af", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                ➤
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f2f5", color: "#9ca3af" }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.5 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Selecciona una conversacion</div>
            <div style={{ fontSize: 13 }}>o crea una nueva con el boton +</div>
          </div>
        )
      )}

      {tab === "comunicados" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#f9fafb" }}>
          {comunicados.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Sin comunicados</div>
              <div style={{ fontSize: 13 }}>Publica el primer comunicado oficial</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {comunicados.map(com => (
                <div key={com.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: com.urgente ? "4px solid #ef4444" : "4px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {com.urgente && <span style={{ fontSize: 10, background: "#fef2f2", color: "#dc2626", padding: "2px 8px", borderRadius: 20, fontWeight: 600, border: "1px solid #fecaca" }}>URGENTE</span>}
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{com.titulo}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, marginBottom: 10 }}>{com.contenido}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{com.autorNombre} · {new Date(com.creadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL NUEVA CONVERSACION */}
      {nuevaConv && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 380, maxWidth: "95vw" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Nueva conversacion</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5 }}>Nombre</label>
              <input value={nombreConv} onChange={e => setNombreConv(e.target.value)} placeholder="Ej: Ana Garcia o Grupo G1A"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5 }}>Tipo</label>
              <select value={tipoConv} onChange={e => setTipoConv(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}>
                <option value="individual">Individual</option>
                <option value="grupo">Grupo</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setNuevaConv(false)} style={{ padding: "8px 16px", background: "#f9fafb", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={crearConv} style={{ padding: "8px 16px", background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO COMUNICADO */}
      {nuevaCom && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 460, maxWidth: "95vw" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Nuevo comunicado oficial</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5 }}>Titulo *</label>
              <input value={formCom.titulo} onChange={e => setFormCom(p => ({ ...p, titulo: e.target.value }))} placeholder="Titulo del comunicado"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5 }}>Mensaje *</label>
              <textarea value={formCom.contenido} onChange={e => setFormCom(p => ({ ...p, contenido: e.target.value }))} placeholder="Escribe el comunicado..."
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" as const, height: 100, resize: "none" as const }} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 16, cursor: "pointer" }}>
              <input type="checkbox" checked={formCom.urgente} onChange={e => setFormCom(p => ({ ...p, urgente: e.target.checked }))} />
              Marcar como urgente
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setNuevaCom(false)} style={{ padding: "8px 16px", background: "#f9fafb", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={publicarCom} style={{ padding: "8px 16px", background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
