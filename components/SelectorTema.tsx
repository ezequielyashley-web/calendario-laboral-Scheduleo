"use client"
import { useTheme } from "@/components/providers/ThemeProvider"

export default function SelectorTema({ toggleTemaActivo, setToggleTemaActivo }: { toggleTemaActivo: boolean, setToggleTemaActivo: (v: boolean) => void }) {
  const { theme, setTheme } = useTheme()

  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #e8eaf0" }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1e1b4b", margin: "0 0 16px" }}>Tema de la aplicacion</h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "14px 16px", background: "#f8f9fa", borderRadius: 10, border: "1px solid #e8eaf0" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Permitir cambio de tema en el header</div>
          <div style={{ fontSize: 12, color: "#a0aec0", marginTop: 2 }}>Activa o desactiva el selector de tema visible para los usuarios</div>
        </div>
        <button onClick={() => setToggleTemaActivo(!toggleTemaActivo)}
          style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: toggleTemaActivo ? "#6366f1" : "#cbd5e1", position: "relative", transition: "background 0.2s" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: toggleTemaActivo ? 23 : 3, transition: "left 0.2s" }} />
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 10, fontWeight: 500 }}>Tema actual del sistema</div>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ value: "light", label: "Claro" }, { value: "auto", label: "Automatico" }, { value: "dark", label: "Oscuro" }].map(t => (
          <button key={t.value} onClick={() => setTheme(t.value as any)}
            style={{ padding: "8px 18px", borderRadius: 8, border: theme === t.value ? "2px solid #6366f1" : "1px solid #e8eaf0", background: theme === t.value ? "#f0edff" : "#fff", color: theme === t.value ? "#6366f1" : "#4a5568", fontSize: 13, fontWeight: theme === t.value ? 600 : 400, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
