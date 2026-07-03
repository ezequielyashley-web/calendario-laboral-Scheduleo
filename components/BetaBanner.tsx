"use client"
import { useEffect, useState } from "react"

export default function BetaBanner() {
  const [modoBeta, setModoBeta] = useState(false)
  const [cargado, setCargado] = useState(false)

  const cargar = () => {
    fetch("/api/config/modo-beta")
      .then(r => r.json())
      .then(d => { setModoBeta(d.modoBeta ?? false); setCargado(true) })
      .catch(() => setCargado(true))
  }

  useEffect(() => {
    cargar()
    window.addEventListener("modoBetaChange", cargar)
    return () => window.removeEventListener("modoBetaChange", cargar)
  }, [])

  if (!cargado || !modoBeta) return null

  return (
    <div style={{ background: "linear-gradient(90deg,#F59E0B,#FBBF24)", padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexShrink: 0, zIndex: 50 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: "#0b0e1a", letterSpacing: ".04em" }}>⚡ BETA</span>
      <span style={{ width: 1, height: 12, background: "rgba(0,0,0,0.2)", display: "inline-block" }}></span>
      <span style={{ fontSize: 12, color: "#0b0e1a", opacity: 0.75 }}>Esta version esta en fase beta. Reporta cualquier problema a tu administrador.</span>
    </div>
  )
}