"use client"
import { useState } from "react"

const azulPrimario = "#0D47A1"
const azulSecundario = "#1976D2"
const azulAcento = "#42A5F5"

const Icons = {
  reloj: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  usuarios: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  sombrilla: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2zM12 12v9M9 21h6"/></svg>,
  maletin: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  grafico: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>,
  chispas: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  escudoCheck: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  candado: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  escudo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  nube: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  correo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>,
  ojo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  flecha: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  edificio: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01M9 18h6"/></svg>,
  ventana: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>,
  escaner: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>,
  huella: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 11a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5M8 14a4 4 0 0 1 4-4"/><path d="M6 18a8 8 0 0 1-1-5 7 7 0 0 1 14 0"/><path d="M4 9a10 10 0 0 1 17 5"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
}

const FEATURES = [
  { icono: Icons.reloj, titulo: "Registro horario obligatorio", texto: "Cumple con el RD-Ley 8/2019 y la normativa vigente." },
  { icono: Icons.usuarios, titulo: "Gestion de turnos y coberturas", texto: "Planifica, organiza y asegura las coberturas minimas." },
  { icono: Icons.sombrilla, titulo: "Vacaciones y permisos", texto: "Control total de ausencias, vacaciones y libranzas." },
  { icono: Icons.maletin, titulo: "Bajas medicas automatizadas", texto: "Recepcion automatica de partes del INSS, sin intervencion manual." },
  { icono: Icons.grafico, titulo: "Reportes ejecutivos", texto: "Dashboards y reportes avanzados para decidir con datos reales." },
  { icono: Icons.chispas, titulo: "IA integrada", texto: "Tu asistente inteligente para la gestion diaria." },
]

const BADGES = [
  { icono: Icons.escudoCheck, titulo: "AES-256-GCM", sub: "Cifrado bancario" },
  { icono: Icons.candado, titulo: "2FA Obligatorio", sub: "Para todos" },
  { icono: Icons.escudo, titulo: "RGPD", sub: "Cumplimiento total" },
  { icono: Icons.chispas, titulo: "IA Segura", sub: "Privada y confiable" },
  { icono: Icons.nube, titulo: "100% Cloud", sub: "Alta disponibilidad" },
]

const PASOS_VERIFICACION = ["Validando credenciales", "Verificando permisos", "Sincronizando informacion", "Cargando tu espacio de trabajo"]

export default function LoginV2Page() {
  const [estado, setEstado] = useState<"login" | "verificando" | "bienvenido">("login")
  const [pasoActual, setPasoActual] = useState(0)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [featureHover, setFeatureHover] = useState<number | null>(null)

  const iniciarSesion = () => {
    setEstado("verificando")
    setPasoActual(0)
    let i = 0
    const intervalo = setInterval(() => {
      i++
      setPasoActual(i)
      if (i >= PASOS_VERIFICACION.length) {
        clearInterval(intervalo)
        setTimeout(() => setEstado("bienvenido"), 500)
      }
    }, 700)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 40px 10px 38px", border: "1px solid #E2E8F0", borderRadius: 12,
    fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s, box-shadow 0.2s"
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img src="/login-bg.png" alt="background" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(13,71,161,0.1) 0%,rgba(25,118,210,0.05) 50%,rgba(15,23,42,0.08) 100%)" }} />
      <div style={{ position: "absolute", top: "18%", left: "8%", width: 340, height: 340, background: "rgba(66,165,245,0.16)", borderRadius: "50%", filter: "blur(90px)", animation: "loginv2-blob-1 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "12%", right: "10%", width: 300, height: 300, background: "rgba(25,118,210,0.14)", borderRadius: "50%", filter: "blur(90px)", animation: "loginv2-blob-2 11s ease-in-out infinite 1s" }} />
      <style>{`
        @keyframes loginv2-blob-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.08); } }
        @keyframes loginv2-blob-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,20px) scale(1.05); } }
        @keyframes loginv2-entrada { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes loginv2-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .loginv2-feature { transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; cursor: default; }
        .loginv2-feature:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(13,71,161,0.1); border-color: ${azulAcento} !important; }
        .loginv2-badge { transition: transform 0.18s; }
        .loginv2-badge:hover { transform: translateY(-1px) scale(1.02); }
        .loginv2-btn-social { transition: all 0.18s; }
        .loginv2-btn-social:hover { background: #F8FAFC !important; border-color: ${azulSecundario} !important; }
        .loginv2-btn-principal { transition: all 0.2s; }
        .loginv2-btn-principal:hover { filter: brightness(1.08); box-shadow: 0 10px 24px rgba(13,71,161,0.35); }
        .loginv2-input:focus { border-color: ${azulSecundario} !important; box-shadow: 0 0 0 3px rgba(25,118,210,0.12); }
        .loginv2-barra { background: linear-gradient(90deg, ${azulSecundario} 0%, ${azulAcento} 50%, ${azulSecundario} 100%); background-size: 200% 100%; animation: loginv2-shimmer 1.6s linear infinite; }
      `}</style>

      {estado === "login" && (
        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1100, display: "flex", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 24, boxShadow: "0 25px 60px rgba(13,71,161,0.15)", overflow: "hidden", animation: "loginv2-entrada 0.5s ease-out" }}>

          <div style={{ flex: 1.15, padding: "36px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${azulSecundario},${azulPrimario})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(13,71,161,0.35)" }}>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>S</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Scheduleo <span style={{ color: azulSecundario }}>2.0</span></span>
            </div>
            <p style={{ fontSize: 14, color: "#334155", margin: "0 0 6px", lineHeight: 1.5 }}>
              La plataforma de gestion laboral en la que las <strong style={{ color: azulSecundario }}>empresas espanolas</strong> confian su dia a dia.
            </p>
            <p style={{ fontSize: 12.5, color: "#64748B", margin: "0 0 20px", lineHeight: 1.5 }}>
              Todo lo que necesitas para cumplir la ley, automatizar procesos y tomar mejores decisiones con la ayuda de la inteligencia artificial.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="loginv2-feature"
                  onMouseEnter={() => setFeatureHover(i)} onMouseLeave={() => setFeatureHover(null)}
                  style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(226,232,240,0.8)", borderRadius: 12, padding: 10, animation: `loginv2-entrada 0.4s ease-out ${i * 0.05}s both` }}>
                  <div style={{ color: azulSecundario, marginBottom: 6, transform: featureHover === i ? "scale(1.1)" : "scale(1)", transition: "transform 0.18s" }}>{f.icono}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>{f.titulo}</div>
                  <div style={{ fontSize: 9.5, color: "#64748B", marginTop: 3, lineHeight: 1.3 }}>{f.texto}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
              {BADGES.map((b, i) => (
                <div key={i} className="loginv2-badge" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(226,232,240,0.7)", borderRadius: 10, padding: 8, display: "flex", alignItems: "center", gap: 6, animation: `loginv2-entrada 0.4s ease-out ${0.3 + i * 0.05}s both` }}>
                  <div style={{ color: azulAcento, flexShrink: 0 }}>{b.icono}</div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#0F172A" }}>{b.titulo}</div>
                    <div style={{ fontSize: 8, color: "#64748B" }}>{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, background: "rgba(255,255,255,0.92)", padding: "36px 32px", textAlign: "center" as const }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Bienvenido de nuevo</div>
            <div style={{ fontSize: 12.5, color: "#64748B", marginBottom: 22 }}>Inicia sesion para continuar</div>

            <div style={{ textAlign: "left" as const, marginBottom: 12 }}>
              <label style={{ fontSize: 11.5, color: "#334155", fontWeight: 600, display: "block", marginBottom: 4 }}>Correo electronico</label>
              <div style={{ position: "relative" as const }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>{Icons.correo}</span>
                <input className="loginv2-input" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="tu@empresa.com" />
              </div>
            </div>

            <div style={{ textAlign: "left" as const, marginBottom: 10 }}>
              <label style={{ fontSize: 11.5, color: "#334155", fontWeight: 600, display: "block", marginBottom: 4 }}>Contrasena</label>
              <div style={{ position: "relative" as const }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>{Icons.candado}</span>
                <input className="loginv2-input" type={mostrarPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="Ingresa tu contrasena" />
                <span onClick={() => setMostrarPassword(!mostrarPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", cursor: "pointer" }}>{Icons.ojo}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, fontSize: 11.5 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569" }}><input type="checkbox" style={{ margin: 0 }} />Mantener sesion iniciada</label>
              <a style={{ color: azulSecundario, cursor: "pointer" }}>Olvidaste tu contrasena?</a>
            </div>

            <button onClick={iniciarSesion} className="loginv2-btn-principal" style={{ width: "100%", background: `linear-gradient(135deg,${azulSecundario},${azulPrimario})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18, boxShadow: "0 6px 16px rgba(13,71,161,0.25)" }}>
              Iniciar sesion {Icons.flecha}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 10.5, color: "#94A3B8" }}>o continua con</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 16 }}>
              <button className="loginv2-btn-social" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 0", fontSize: 10, color: "#475569", cursor: "pointer" }}>Google</button>
              <button className="loginv2-btn-social" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 0", fontSize: 10, color: "#475569", cursor: "pointer" }}>Microsoft</button>
              <button className="loginv2-btn-social" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 0", fontSize: 10, color: "#475569", cursor: "pointer" }}>Apple</button>
              <button className="loginv2-btn-social" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 0", fontSize: 10, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{Icons.edificio} SSO</button>
            </div>

            <div style={{ fontSize: 10.5, color: "#94A3B8", marginBottom: 8 }}>Entrar con Passkey</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 18 }}>
              <button className="loginv2-btn-social" style={{ background: "#fff", border: "1px dashed #CBD5E1", borderRadius: 10, padding: "7px 0", fontSize: 9.5, color: azulSecundario, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{Icons.ventana} Windows Hello</button>
              <button className="loginv2-btn-social" style={{ background: "#fff", border: "1px dashed #CBD5E1", borderRadius: 10, padding: "7px 0", fontSize: 9.5, color: azulSecundario, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{Icons.escaner} Face ID</button>
              <button className="loginv2-btn-social" style={{ background: "#fff", border: "1px dashed #CBD5E1", borderRadius: 10, padding: "7px 0", fontSize: 9.5, color: azulSecundario, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{Icons.huella} Touch ID</button>
            </div>

            <div style={{ fontSize: 11, color: "#64748B" }}>No tienes cuenta? <a style={{ color: azulSecundario, fontWeight: 600 }}>Solicita una demostracion</a></div>
          </div>
        </div>
      )}

      {estado === "verificando" && (
        <div style={{ position: "relative", zIndex: 10, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderRadius: 24, padding: "40px 48px", textAlign: "center" as const, maxWidth: 380, boxShadow: "0 25px 60px rgba(13,71,161,0.15)", animation: "loginv2-entrada 0.4s ease-out" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg,${azulSecundario},${azulPrimario})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 24px rgba(13,71,161,0.35)" }}>
            <span style={{ color: "#fff", fontSize: 26, fontWeight: 700 }}>S</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>Verificando tu identidad...</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 20, textAlign: "left" as const }}>
            {PASOS_VERIFICACION.map((paso, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: i < pasoActual ? 1 : 0.35, transform: i < pasoActual ? "translateX(0)" : "translateX(-4px)", transition: "opacity 0.3s, transform 0.3s" }}>
                {i < pasoActual ? Icons.check : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #CBD5E1" }} />}
                <span style={{ fontSize: 13, color: "#334155" }}>{paso}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 4, background: "#E2E8F0", borderRadius: 999, overflow: "hidden" }}>
            <div className="loginv2-barra" style={{ width: `${(pasoActual / PASOS_VERIFICACION.length) * 100}%`, height: "100%", borderRadius: 999, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {estado === "bienvenido" && (
        <div style={{ position: "relative", zIndex: 10, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderRadius: 24, padding: "48px", textAlign: "center" as const, maxWidth: 380, boxShadow: "0 25px 60px rgba(13,71,161,0.15)", animation: "loginv2-entrada 0.5s ease-out" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg,${azulSecundario},${azulPrimario})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 0 8px rgba(66,165,245,0.15), 0 10px 28px rgba(13,71,161,0.35)" }}>
            <span style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>S</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Bienvenido a Scheduleo!</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Preparando tu espacio de trabajo...</div>
          <div style={{ height: 4, background: "#E2E8F0", borderRadius: 999, overflow: "hidden" }}>
            <div className="loginv2-barra" style={{ width: "70%", height: "100%", borderRadius: 999 }} />
          </div>
        </div>
      )}
    </div>
  )
}