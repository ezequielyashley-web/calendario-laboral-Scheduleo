"use client"
import { useState } from "react"

interface Props {
  titulo?: string
  items: { icon: string; titulo: string; desc: string }[]
  color?: string
  bg?: string
  border?: string
}

export default function InfoPanel({ titulo = "Como funciona", items, color = "#0891b2", bg = "#f0f9ff", border = "#bae6fd" }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setVisible(!visible)}
        title={visible ? "Cerrar ayuda" : "Ver instrucciones"}
        style={{ background: visible ? "#f59e0b" : "#fef9c3", color: "#92400e", border: "2px solid #f59e0b", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, fontWeight: 900, transition: "all .2s", flexShrink: 0, boxShadow: "0 2px 8px rgba(245,158,11,0.4)" }}>
        ℹ
      </button>
      {visible && (
        <div style={{ position: "fixed", top: 80, right: 20, zIndex: 9999, background: "#fff", border: `1px solid ${border}`, borderRadius: 12, padding: "14px 16px", width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", borderTop: `3px solid #f59e0b` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", margin: 0 }}>{titulo}</p>
            </div>
            <button onClick={() => setVisible(false)} style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 12, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", background: "#f8f9ff", borderRadius: 8, border: "1px solid #e8eaf0" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", margin: 0 }}>{item.titulo}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", margin: "3px 0 0", lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
