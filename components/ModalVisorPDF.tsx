"use client"
import { useState } from "react"

export function useVisorPDF() {
  const [url, setUrl] = useState<string | null>(null)

  const abrir = (u: string) => setUrl(u)
  const cerrar = () => setUrl(null)

  const modal = url ? (
    <div onClick={cerrar} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 900, height: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #E5E7EB" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Documento PDF</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href={url} download style={{ fontSize: 12, color: "#673DE6", fontWeight: 600, textDecoration: "none" }}>Descargar</a>
            <button onClick={cerrar} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6B7280", lineHeight: 1 }}>×</button>
          </div>
        </div>
        <iframe src={url} style={{ flex: 1, border: "none", width: "100%" }} title="Vista previa PDF" />
      </div>
    </div>
  ) : null

  return { abrir, cerrar, modal }
}