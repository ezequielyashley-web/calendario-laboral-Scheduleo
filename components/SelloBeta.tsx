"use client"
import { useEffect, useState } from "react"

export default function SelloBeta() {
  const [modoBeta, setModoBeta] = useState(false)
  const [fase, setFase] = useState<"espera"|"bajando"|"sellado">("espera")

  useEffect(() => {
    fetch("/api/config/modo-beta")
      .then(r => r.json())
      .then(d => {
        if (d.modoBeta) {
          setModoBeta(true)
          setTimeout(() => setFase("bajando"), 600)
          setTimeout(() => setFase("sellado"), 1100)
        }
      })
      .catch(() => {})
  }, [])

  if (!modoBeta) return null

  return (
    <>
      <style>{`
        @keyframes tampon-baja {
          0%   { transform: translateY(-160px); opacity: 0; }
          60%  { transform: translateY(8px);    opacity: 1; }
          75%  { transform: translateY(-4px);   opacity: 1; }
          88%  { transform: translateY(3px);    opacity: 1; }
          100% { transform: translateY(-80px);  opacity: 1; }
        }
        @keyframes sello-aparece {
          0%   { opacity: 0; transform: rotate(15deg) scale(0.85); }
          30%  { opacity: 1; transform: rotate(15deg) scale(1.05); }
          60%  { transform: rotate(15deg) scale(0.98); }
          100% { opacity: 1; transform: rotate(15deg) scale(1); }
        }
        @keyframes impacto-onda {
          0%   { opacity: 0.4; transform: rotate(15deg) scale(0.8); }
          100% { opacity: 0;   transform: rotate(15deg) scale(1.5); }
        }
        @keyframes tinta-splash {
          0%   { opacity: 0.6; transform: rotate(15deg) scale(0.9); }
          100% { opacity: 0;   transform: rotate(15deg) scale(1.3); }
        }
        .tampon-anim { animation: tampon-baja 0.5s cubic-bezier(0.22,0.61,0.36,1) forwards; }
        .sello-anim  { animation: sello-aparece 0.35s ease-out forwards; }
        .onda-anim   { animation: impacto-onda 0.4s ease-out forwards; }
        .tinta-anim  { animation: tinta-splash 0.3s ease-out 0.05s forwards; }
      `}</style>

      <div style={{ position: "absolute", top: -30, right: -30, width: 240, height: 280, zIndex: 10, pointerEvents: "none" }}>

        {/* TAMPON - mango + cabezal */}
        {fase === "bajando" && (
          <div className="tampon-anim" style={{ position: "absolute", top: 0, right: 20, width: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Mango */}
            <div style={{ width: 18, height: 70, background: "linear-gradient(180deg,#7C3AED,#5B21B6)", borderRadius: "6px 6px 2px 2px", boxShadow: "2px 2px 6px rgba(0,0,0,0.3)" }} />
            {/* Union */}
            <div style={{ width: 30, height: 10, background: "#4C1D95", borderRadius: 2 }} />
            {/* Cabezal rojo */}
            <div style={{ width: 60, height: 20, background: "linear-gradient(180deg,#DC2626,#B91C1C)", borderRadius: "2px 2px 4px 4px", boxShadow: "0 4px 8px rgba(220,38,38,0.4)" }} />
            {/* Tinta */}
            <div style={{ width: 60, height: 6, background: "rgba(220,38,38,0.6)", borderRadius: "0 0 4px 4px", filter: "blur(2px)" }} />
          </div>
        )}

        {/* ONDA DE IMPACTO */}
        {fase === "sellado" && (
          <div className="onda-anim" style={{ position: "absolute", top: 90, right: 0, width: 240, height: 240, borderRadius: "50%", border: "3px solid rgba(220,38,38,0.5)", opacity: 0 }} />
        )}

        {/* SPLASH DE TINTA */}
        {fase === "sellado" && (
          <div className="tinta-anim" style={{ position: "absolute", top: 100, right: 10, width: 220, height: 220, borderRadius: "50%", border: "2px solid rgba(220,38,38,0.3)", opacity: 0 }} />
        )}

        {/* SELLO IMPRESO */}
        {fase === "sellado" && (
          <div className="sello-anim" style={{ position: "absolute", top: 30, right: 0, width: 240, height: 240, opacity: 0 }}>
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="240" height="240">
              <circle cx="40" cy="40" r="37" fill="rgba(220,38,38,0.04)" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 2"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#dc2626" strokeWidth="1.2"/>
              <circle cx="40" cy="40" r="24" fill="none" stroke="rgba(220,38,38,0.3)" strokeWidth="0.5"/>
              <path id="arcTop2" d="M 13,40 A 27,27 0 0,1 67,40" fill="none"/>
              <text fontSize="7" fontWeight="800" fill="#dc2626" letterSpacing="3.5" fontFamily="sans-serif">
                <textPath href="#arcTop2" startOffset="8%">VERSION BETA</textPath>
              </text>
              <text x="40" y="38" textAnchor="middle" fontSize="18" fontWeight="900" fill="#dc2626" letterSpacing="2" fontFamily="sans-serif">BETA</text>
              <text x="40" y="52" textAnchor="middle" fontSize="7" fontWeight="700" fill="rgba(220,38,38,0.8)" letterSpacing="1" fontFamily="sans-serif">SCHEDULEO</text>
              <path id="arcBottom2" d="M 13,40 A 27,27 0 0,0 67,40" fill="none"/>
              <text fontSize="6.5" fontWeight="700" fill="#dc2626" letterSpacing="2.5" fontFamily="sans-serif">
                <textPath href="#arcBottom2" startOffset="18%">2026 · ESPAÑA</textPath>
              </text>
            </svg>
          </div>
        )}

      </div>
    </>
  )
}