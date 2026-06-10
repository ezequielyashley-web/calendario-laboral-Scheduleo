"use client"
import InfoPanel from "@/components/InfoPanel"
import { useState, useEffect } from "react"

const DIAS = [
  { key: "coberturaMinimaL", label: "Lunes",    short: "L", color: "#6366f1" },
  { key: "coberturaMinimaM", label: "Martes",   short: "M", color: "#6366f1" },
  { key: "coberturaMinimaX", label: "Miercoles",short: "X", color: "#6366f1" },
  { key: "coberturaMinimaJ", label: "Jueves",   short: "J", color: "#6366f1" },
  { key: "coberturaMinimaV", label: "Viernes",  short: "V", color: "#6366f1" },
  { key: "coberturaMinimaS", label: "Sabado",   short: "S", color: "#9ca3af" },
  { key: "coberturaMinimaD", label: "Domingo",  short: "D", color: "#ef4444" },
]

export default function CoberturaPage() {
  const [puestos, setPuestos] = useState<any[]>([])
  const [guardando, setGuardando] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "error" } | null>(null)
  const [loading, setLoading] = useState(true)

  const mostrarToast = (msg: string, tipo: "ok" | "error") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch("/api/cobertura?empresaId=empresa-001")
      .then(r => r.json())
      .then(data => { setPuestos(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const actualizar = (puestoId: string, dia: string, valor: number) => {
    setPuestos(prev => prev.map(p => {
      if (p.id !== puestoId) return p
      const config = p.configuracionesCobertura?.[0] || {}
      return { ...p, configuracionesCobertura: [{ ...config, [dia]: valor }] }
    }))
  }

  const guardar = async (puesto: any) => {
    setGuardando(puesto.id)
    const config = puesto.configuracionesCobertura?.[0] || {}
    const coberturas: any = {}
    DIAS.forEach(d => { coberturas[d.key] = config[d.key] || 0 })
    const res = await fetch("/api/cobertura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresaId: "empresa-001", puestoDeTrabajoId: puesto.id, coberturas }),
    })
    setGuardando(null)
    mostrarToast(res.ok ? `✅ ${puesto.nombre} guardado` : "❌ Error al guardar", res.ok ? "ok" : "error")
  }

  const getTotalSemana = (config: any) => DIAS.slice(0, 6).reduce((s, d) => s + (config[d.key] || 0), 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <InfoPanel titulo="Como usar Cobertura" color="#6366f1" bg="#f5f3ff" border="#ddd6fe" items={[
        { icon: "👥", titulo: "Minimos por puesto", desc: "Define cuantos empleados como minimo deben estar trabajando cada dia en cada puesto de trabajo." },
        { icon: "⚠️", titulo: "Alertas automaticas", desc: "El sistema avisa cuando hay menos empleados de los requeridos por vacaciones, bajas o cambios de turno." },
        { icon: "💾", titulo: "Guardar cambios", desc: "Pulsa Guardar en cada puesto para aplicar los minimos. Los cambios se aplican inmediatamente." },
        { icon: "📊", titulo: "Total semanal", desc: "El numero total de empleados requeridos por semana se calcula automaticamente." },
      ]} />

      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 20px", borderRadius: 10, background: toast.tipo === "ok" ? "#16a34a" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Cobertura mínima</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>Define los empleados mínimos requeridos por puesto y día</p>
        </div>
        <div style={{ background: "#ede9fe", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#6d28d9" }}>
          {puestos.length} puestos configurados
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Cargando...</div>
      ) : puestos.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>No hay puestos configurados</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>Crea puestos de trabajo en la sección de Empleados</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {puestos.map(puesto => {
            const config = puesto.configuracionesCobertura?.[0] || {}
            const total = getTotalSemana(config)
            return (
              <div key={puesto.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                {/* Header puesto */}
                <div style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{puesto.nombre}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
                      {puesto.empleados?.length || 0} empleados asignados
                    </p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0 }}>{total}</p>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", margin: 0 }}>min/semana</p>
                  </div>
                </div>

                {/* Grid días */}
                <div style={{ padding: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10, marginBottom: 16 }}>
                    {DIAS.map(dia => (
                      <div key={dia.key} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: dia.color, marginBottom: 6, background: dia.color + "15", borderRadius: 4, padding: "3px 0" }}>
                          {dia.short}
                        </div>
                        <input type="number" min={0} max={99}
                          value={config[dia.key] || 0}
                          onChange={e => actualizar(puesto.id, dia.key, Number(e.target.value))}
                          style={{ width: "100%", padding: "10px 4px", textAlign: "center", border: `1.5px solid ${(config[dia.key] || 0) > 0 ? dia.color + "60" : "var(--border-strong)"}`, borderRadius: 8, fontSize: 18, fontWeight: 700, color: (config[dia.key] || 0) > 0 ? dia.color : "var(--text-muted)", background: (config[dia.key] || 0) > 0 ? dia.color + "08" : "var(--surface)", outline: "none", boxSizing: "border-box" as "border-box" }}
                        />
                        <p style={{ fontSize: 9, color: "var(--text-muted)", margin: "4px 0 0" }}>{dia.label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        { label: "L-V", valor: DIAS.slice(0,5).reduce((s,d) => s + (config[d.key]||0), 0), color: "#6366f1" },
                        { label: "Sáb", valor: config[DIAS[5].key] || 0, color: "#9ca3af" },
                        { label: "Dom", valor: config[DIAS[6].key] || 0, color: "#ef4444" },
                      ].map(r => (
                        <div key={r.label} style={{ background: r.color + "15", border: `1px solid ${r.color}30`, borderRadius: 6, padding: "4px 10px", textAlign: "center" }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: r.color, margin: 0 }}>{r.valor}</p>
                          <p style={{ fontSize: 9, color: r.color, opacity: 0.7, margin: 0 }}>{r.label}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => guardar(puesto)} disabled={guardando === puesto.id}
                      style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: guardando === puesto.id ? 0.6 : 1 }}>
                      {guardando === puesto.id ? "Guardando..." : "💾 Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
