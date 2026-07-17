"use client"
import { useState, useEffect } from "react"

const violeta = "#673DE6"

const ICONOS: Record<string, JSX.Element> = {
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
}

const ICONOS_FLOTANTES = [
  { icono: "calendar", size: 34, top: "10%", left: "8%", anim: "float1 7s ease-in-out infinite" },
  { icono: "clock", size: 30, top: "14%", right: "10%", anim: "float2 9s ease-in-out infinite 1s" },
  { icono: "shield", size: 38, bottom: "12%", left: "10%", anim: "float1 8s ease-in-out infinite 2s" },
  { icono: "users", size: 32, bottom: "10%", right: "8%", anim: "float2 10s ease-in-out infinite 0.5s" },
  { icono: "chart", size: 26, top: "42%", left: "4%", anim: "float1 6s ease-in-out infinite 1.5s" },
  { icono: "lock", size: 28, top: "46%", right: "5%", anim: "float2 8s ease-in-out infinite 3s" },
]

const MARCAS_FLOTANTES = [
  { top: "5%", left: "36%", size: 15, anim: "fadeInOut1 6s ease-in-out infinite 0s" },
  { top: "16%", right: "22%", size: 11, anim: "fadeInOut2 7s ease-in-out infinite 1.5s" },
  { bottom: "5%", left: "28%", size: 14, anim: "fadeInOut1 8s ease-in-out infinite 3s" },
  { top: "60%", left: "6%", size: 11, anim: "fadeInOut2 6.5s ease-in-out infinite 4.5s" },
  { top: "64%", right: "10%", size: 13, anim: "fadeInOut1 7.5s ease-in-out infinite 2.2s" },
  { bottom: "35%", right: "30%", size: 10, anim: "fadeInOut2 6s ease-in-out infinite 5.5s" },
  { top: "2%", right: "3%", size: 12, anim: "fadeInOut1 7s ease-in-out infinite 0.7s" },
  { top: "35%", left: "1%", size: 10, anim: "fadeInOut2 6.8s ease-in-out infinite 3.8s" },
  { bottom: "2%", right: "2%", size: 13, anim: "fadeInOut1 8.5s ease-in-out infinite 1.1s" },
  { top: "75%", left: "35%", size: 11, anim: "fadeInOut2 7.2s ease-in-out infinite 6s" },
  { top: "25%", left: "42%", size: 9, anim: "fadeInOut1 6.3s ease-in-out infinite 2.8s" },
  { bottom: "20%", left: "2%", size: 12, anim: "fadeInOut2 7.8s ease-in-out infinite 4.2s" },
]

type Paso = {
  badge: string
  titulo: string
  intro: string
  funciones: { icono: string; titulo: string; texto: string }[]
}

const PASOS_POR_ROL: Record<string, Paso[]> = {
  SUPER_ADMIN: [
    {
      badge: "Tu rol: Super Admin",
      titulo: "Control total del sistema",
      intro: "Como Super Admin tienes control total del sistema. Estas son tus funciones principales:",
      funciones: [
        { icono: "users", titulo: "Aprobar y gestionar agentes gerenciales", texto: "revisar solicitudes, asignar permisos" },
        { icono: "building", titulo: "Configurar la empresa", texto: "datos fiscales, puestos, grupos de trabajo" },
        { icono: "chart", titulo: "Ver todos los reportes", texto: "fichajes, vacaciones, bajas de toda la empresa" },
        { icono: "lock", titulo: "Acciones protegidas", texto: "cambios sensibles piden tu contrasena master" },
      ]
    },
    {
      badge: "Los agentes gerenciales",
      titulo: "Quienes te ayudan en el dia a dia",
      intro: "Puedes invitar a agentes gerenciales para que gestionen partes del sistema segun los permisos que les asignes:",
      funciones: [
        { icono: "users", titulo: "Gestionar empleados", texto: "de su equipo o departamento" },
        { icono: "calendar", titulo: "Aprobar vacaciones y bajas", texto: "de su equipo, si tienen el permiso activado" },
        { icono: "clock", titulo: "Revisar fichajes y cambios de turno", texto: "segun los modulos que les habilites" },
      ]
    },
    {
      badge: "Los empleados",
      titulo: "El equipo que usa Scheduleo cada dia",
      intro: "Los empleados usan Scheduleo para lo esencial de su dia a dia:",
      funciones: [
        { icono: "clock", titulo: "Fichar entrada y salida", texto: "de forma sencilla desde su cuenta" },
        { icono: "calendar", titulo: "Solicitar vacaciones", texto: "y ver el estado de sus solicitudes" },
        { icono: "shield", titulo: "Ver su calendario y datos", texto: "siempre protegidos y cifrados" },
      ]
    },
  ],
  GERENCIAL: [
    {
      badge: "Tu rol: Agente gerencial",
      titulo: "Tus funciones en Scheduleo",
      intro: "Como agente gerencial, gestionas el dia a dia segun los permisos que se te asignaron:",
      funciones: [
        { icono: "users", titulo: "Gestionar empleados", texto: "de tu equipo o departamento" },
        { icono: "calendar", titulo: "Aprobar vacaciones y bajas", texto: "si tienes el permiso activado" },
        { icono: "clock", titulo: "Revisar fichajes", texto: "y cambios de turno de tu equipo" },
        { icono: "shield", titulo: "Datos protegidos", texto: "toda la informacion sensible va cifrada" },
      ]
    },
  ],
}

export default function TourBienvenida() {
  const [mostrar, setMostrar] = useState(false)
  const [role, setRole] = useState<string>("GERENCIAL")
  const [paso, setPaso] = useState(0)

  useEffect(() => {
    fetch("/api/tour-bienvenida").then(r => r.json()).then(data => {
      if (data?.mostrar) {
        setRole(data.role || "GERENCIAL")
        setMostrar(true)
      }
    }).catch(() => {})
  }, [])

  const completar = () => {
    fetch("/api/tour-bienvenida", { method: "POST" }).catch(() => {})
    setMostrar(false)
  }

  if (!mostrar) return null

  const pasos = PASOS_POR_ROL[role] || PASOS_POR_ROL.GERENCIAL
  const esUltimo = paso === pasos.length - 1
  const actual = pasos[paso]

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#3C3489 0%,#534AB7 50%,#673DE6 100%)" }} />
      {ICONOS_FLOTANTES.map((f, i) => (
        <div key={i} style={{ position: "absolute", top: f.top, left: f.left, right: (f as any).right, bottom: (f as any).bottom, color: "rgba(255,255,255,0.15)", animation: f.anim, fontSize: f.size }}>
          {ICONOS[f.icono]}
        </div>
      ))}
      {MARCAS_FLOTANTES.map((m, i) => (
        <span key={i} style={{ position: "absolute", top: m.top, left: (m as any).left, right: (m as any).right, bottom: (m as any).bottom, fontSize: m.size, fontWeight: 600, animation: m.anim }}>
          Scheduleo 2.0
        </span>
      ))}
      <div style={{ position: "absolute", top: "20%", left: "20%", width: 200, height: 200, background: "rgba(255,255,255,0.06)", borderRadius: "50%", filter: "blur(50px)", animation: "blob1 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "15%", width: 170, height: 170, background: "rgba(255,255,255,0.05)", borderRadius: "50%", filter: "blur(50px)", animation: "blob2 11s ease-in-out infinite 1s" }} />

      <div style={{ position: "relative", zIndex: 10, background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ background: violeta, padding: "28px 28px 22px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.15)", marginBottom: 12 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>S</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Bienvenido a Scheduleo 2.0</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Tu sistema de gestion laboral</div>
        </div>
        <div style={{ padding: "24px 26px" }}>
          <div style={{ display: "inline-block", background: "#EEEDFE", color: "#3C3489", fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 12 }}>
            {actual.badge}
          </div>
          <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55, margin: "0 0 16px" }}>{actual.intro}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
            {actual.funciones.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{ color: violeta, marginTop: 1, flexShrink: 0 }}>{ICONOS[f.icono]}</div>
                <span style={{ fontSize: 12.5, color: "#374151" }}><strong style={{ fontWeight: 700 }}>{f.titulo}</strong> — {f.texto}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {pasos.map((_, i) => (
              <div key={i} style={{ width: i === paso ? 20 : 6, height: 6, borderRadius: 3, background: i === paso ? violeta : "#E5E7EB", transition: "width 0.3s" }} />
            ))}
          </div>
          <button
            onClick={() => esUltimo ? completar() : setPaso(p => p + 1)}
            style={{ width: "100%", height: 42, background: violeta, color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            {esUltimo ? "Entendido, empezar a usar Scheduleo" : `Siguiente: ${pasos[paso + 1]?.badge.toLowerCase()}`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}
        @keyframes blob1{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        @keyframes blob2{0%,100%{transform:translate(0,0)}50%{transform:translate(-15px,10px)}}
        @keyframes fadeInOut1{0%,100%{color:rgba(255,255,255,0)}50%{color:rgba(255,255,255,0.16)}}
        @keyframes fadeInOut2{0%,100%{color:rgba(255,255,255,0)}50%{color:rgba(255,255,255,0.13)}}
      `}</style>
    </div>
  )
}