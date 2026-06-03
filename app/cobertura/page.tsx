"use client"
import { useState, useEffect } from "react"

const DIAS = [
  { key: "coberturaMinimaL", label: "Lun" },
  { key: "coberturaMinimaM", label: "Mar" },
  { key: "coberturaMinimaX", label: "Mié" },
  { key: "coberturaMinimaJ", label: "Jue" },
  { key: "coberturaMinimaV", label: "Vie" },
  { key: "coberturaMinimaS", label: "Sáb" },
  { key: "coberturaMinimaD", label: "Dom" },
]

export default function CoberturaPage() {
  const [puestos, setPuestos] = useState<any[]>([])
  const [guardando, setGuardando] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    fetch("/api/cobertura?empresaId=empresa-001")
      .then(r => r.json())
      .then(setPuestos)
  }, [])

  const actualizar = (puestoId: string, dia: string, valor: number) => {
    setPuestos(prev => prev.map(p => {
      if (p.id !== puestoId) return p
      const config = p.configuracionesCobertura[0] || {}
      return {
        ...p,
        configuracionesCobertura: [{ ...config, [dia]: valor }]
      }
    }))
  }

  const guardar = async (puesto: any) => {
    setGuardando(puesto.id)
    setMensaje("")
    const config = puesto.configuracionesCobertura[0] || {}
    const coberturas: any = {}
    DIAS.forEach(d => { coberturas[d.key] = config[d.key] || 0 })

    const res = await fetch("/api/cobertura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresaId: "empresa-001",
        puestoDeTrabajoId: puesto.id,
        coberturas,
      }),
    })
    setGuardando(null)
    setMensaje(res.ok ? "✅ Guardado correctamente" : "❌ Error al guardar")
    setTimeout(() => setMensaje(""), 3000)
  }

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#0284c7" }}>
        Cobertura mínima por puesto
      </h1>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
        Define el número mínimo de empleados requeridos por día para cada puesto de trabajo.
      </p>

      {mensaje && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 4, fontSize: 14 }}>
          {mensaje}
        </div>
      )}

      {puestos.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280", background: "#fff", border: "1px solid #b8c4d8", borderRadius: 6 }}>
          No hay puestos de trabajo configurados
        </div>
      ) : (
        puestos.map(puesto => {
          const config = puesto.configuracionesCobertura[0] || {}
          return (
            <div key={puesto.id} style={{ background: "#fff", border: "1px solid #b8c4d8", borderRadius: 6, padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>
                {puesto.nombre}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, marginBottom: 16 }}>
                {DIAS.map(dia => (
                  <div key={dia.key} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                      {dia.label}
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={config[dia.key] || 0}
                      onChange={e => actualizar(puesto.id, dia.key, Number(e.target.value))}
                      style={{
                        width: "100%", padding: "8px 4px", textAlign: "center",
                        border: "1px solid #b8c4d8", borderRadius: 4, fontSize: 16,
                        fontWeight: 600, outline: "none"
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => guardar(puesto)}
                disabled={guardando === puesto.id}
                style={{
                  background: "#0369a1", color: "#fff", border: "none",
                  borderRadius: 4, padding: "8px 20px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer"
                }}
              >
                {guardando === puesto.id ? "Guardando..." : "Guardar"}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
