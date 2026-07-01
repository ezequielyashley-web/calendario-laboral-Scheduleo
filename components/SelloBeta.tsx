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
          0%   { transform: rotate(15deg) translateY(-120px) scale(1.3); opacity: 0; }
          60%  { transform: rotate(15deg) translateY(4px) scale(0.97); opacity: 1; }
          75%  { transform: rotate(15deg) translateY(-6px) scale(1.01); opacity: 1; }
          88%  { transform: rotate(15deg) translateY(2px) scale(0.99); opacity: 1; }
          100% { transform: rotate(15deg) translateY(0px) scale(1); opacity: 1; }
        }
        @keyframes impacto {
          0%   { opacity: 0; transform: scale(0.5); }
          60%  { opacity: 0.25; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.4); }
        }
        .sello-stamp {
          animation: sellazo 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .sello-impacto {
          animation: impacto 0.4s ease-out 0.45s forwards;
        }
      `}</style>

      <div style={{ position: "absolute", top: -18, right: -18, width: 80, height: 80, zIndex: 10, pointerEvents: "none" }}>
        {/* Onda de impacto */}
        <div className="sello-impacto" style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "3px solid #dc2626", opacity: 0 }} />

        {/* Sello */}
        <div className={animado ? "sello-stamp" : ""} style={{ width: "100%", height: "100%", opacity: animado ? undefined : 0 }}>
          <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="37" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="4 2"/>
            <circle cx="40" cy="40" r="30" fill="none" stroke="#dc2626" strokeWidth="1.5"/>
            <path id="arcTop" d="M 15,40 A 25,25 0 0,1 65,40" fill="none"/>
            <text fontSize="9" fontWeight="800" fill="#dc2626" letterSpacing="3" fontFamily="sans-serif">
              <textPath href="#arcTop" startOffset="12%">VERSION</textPath>
            </text>
            <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="900" fill="#dc2626" letterSpacing="2" fontFamily="sans-serif">BETA</text>
            <path id="arcBottom" d="M 15,40 A 25,25 0 0,0 65,40" fill="none"/>
            <text fontSize="8" fontWeight="700" fill="#dc2626" letterSpacing="2" fontFamily="sans-serif">
              <textPath href="#arcBottom" startOffset="15%">2026 ES</textPath>
            </text>
          </svg>
        </div>
      </div>
    </>
  )
}