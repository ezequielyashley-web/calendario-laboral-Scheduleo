"use client"
import { useEffect, useState } from "react"

export default function SelloBeta() {
  const [modoBeta, setModoBeta] = useState(false)
  const [animado, setAnimado] = useState(false)

  useEffect(() => {
    fetch("/api/config/modo-beta")
      .then(r => r.json())
      .then(d => {
        if (d.modoBeta) {
          setModoBeta(true)
          setTimeout(() => setAnimado(true), 800)
        }
      })
      .catch(() => {})
  }, [])

  if (!modoBeta) return null

  return (
    <>
      <style>{`
        @keyframes sellazo {
          0%   { transform: rotate(12deg) translateY(-120px) scale(1.3); opacity: 0; }
          60%  { transform: rotate(12deg) translateY(4px) scale(0.97); opacity: 1; }
          75%  { transform: rotate(12deg) translateY(-6px) scale(1.01); opacity: 1; }
          88%  { transform: rotate(12deg) translateY(2px) scale(0.99); opacity: 1; }
          100% { transform: rotate(12deg) translateY(0px) scale(1); opacity: 1; }
        }
        @keyframes impacto {
          0%   { opacity: 0; transform: rotate(12deg) scale(0.5); }
          60%  { opacity: 0.3; transform: rotate(12deg) scale(1.1); }
          100% { opacity: 0; transform: rotate(12deg) scale(1.4); }
        }
        .sello-stamp { animation: sellazo 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }
        .sello-impacto { animation: impacto 0.4s ease-out 0.45s forwards; }
      `}</style>

      <div style={{ position: "absolute", top: -20, right: -20, width: 110, height: 110, zIndex: 10, pointerEvents: "none" }}>
        <div className="sello-impacto" style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid #dc2626", opacity: 0 }} />
        <div className={animado ? "sello-stamp" : ""} style={{ width: "100%", height: "100%", opacity: animado ? 1 : 0 }}>
          <img src="/sello-beta.png" alt="BETA" width={110} height={110} style={{ mixBlendMode: "multiply" }} />
        </div>
      </div>
    </>
  )
}