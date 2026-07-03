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
          setTimeout(() => setFase("sellado"), 1050)
        }
      })
      .catch(() => {})
  }, [])

  if (!modoBeta) return null

  return (
    <>
      <style>{`
        @keyframes tampon-baja {
          0%   { transform: translateY(-140px); opacity: 0; }
          55%  { transform: translateY(6px);    opacity: 1; }
          70%  { transform: translateY(-3px);   opacity: 1; }
          85%  { transform: translateY(2px);    opacity: 1; }
          100% { transform: translateY(-70px);  opacity: 0.7; }
        }
        @keyframes sello-aparece {
          0%   { opacity: 0; transform: rotate(12deg) scale(0.7); }
          40%  { opacity: 1; transform: rotate(12deg) scale(1.04); }
          70%  { transform: rotate(12deg) scale(0.98); }
          100% { opacity: 1; transform: rotate(12deg) scale(1); }
        }
        @keyframes onda-impacto {
          0%   { opacity: 0.5; transform: rotate(12deg) scale(0.85); }
          100% { opacity: 0;   transform: rotate(12deg) scale(1.4); }
        }
        .tampon-anim { animation: tampon-baja 0.5s cubic-bezier(0.22,0.61,0.36,1) forwards; }
        .sello-anim  { animation: sello-aparece 0.3s ease-out forwards; }
        .onda-anim   { animation: onda-impacto 0.35s ease-out forwards; }
      `}</style>

      <div style={{ position: "absolute", top: -20, right: -20, width: 160, height: 220, zIndex: 10, pointerEvents: "none" }}>

        {/* TAMPON */}
        {fase === "bajando" && (
          <div className="tampon-anim" style={{ position: "absolute", top: 0, right: 15, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 14, height: 55, background: "linear-gradient(180deg,#7C3AED,#4C1D95)", borderRadius: "5px 5px 2px 2px", boxShadow: "2px 2px 5px rgba(0,0,0,0.35)" }} />
            <div style={{ width: 24, height: 8, background: "#4C1D95", borderRadius: 2 }} />
            <div style={{ width: 50, height: 14, background: "linear-gradient(180deg,#DC2626,#B91C1C)", borderRadius: "2px 2px 3px 3px", boxShadow: "0 3px 6px rgba(220,38,38,0.5)" }} />
          </div>
        )}

        {/* ONDA */}
        {fase === "sellado" && (
          <div className="onda-anim" style={{ position: "absolute", top: 20, right: 0, width: 160, height: 160, borderRadius: "50%", border: "2px solid rgba(220,38,38,0.4)", opacity: 0 }} />
        )}

        {/* SELLO IMAGEN */}
        {fase === "sellado" && (
          <div className="sello-anim" style={{ position: "absolute", top: 10, right: 0, opacity: 0 }}>
            <img src="/sello-beta.webp" alt="BETA" width={130} height={130}
              style={{ transform: "rotate(12deg)", opacity: 0.88, mixBlendMode: "multiply" }} />
          </div>
        )}

      </div>
    </>
  )
}