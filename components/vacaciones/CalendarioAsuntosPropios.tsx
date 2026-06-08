"use client"
import { useState, useEffect } from "react"

interface Props {
  empleadoId: string
  grupoTrabajoId?: string
  fechaNacimiento?: string
  diasDisponibles: number
  onConfirmar: (dias: string[], observaciones: string) => void
  onCancelar: () => void
}

interface DiaInfo {
  fecha: string
  bloqueado: boolean
  motivo?: string
  seleccionado: boolean
  esFestivo: boolean
  esLibranza: boolean
  esCumple: boolean
  esFinde: boolean
  esSinAntelacion: boolean
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DIAS_SEMANA = ["L","M","X","J","V","S","D"]

export default function CalendarioAsuntosPropios({ empleadoId, grupoTrabajoId, fechaNacimiento, diasDisponibles, onConfirmar, onCancelar }: Props) {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [año, setAño] = useState(hoy.getFullYear())
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([])
  const [festivos, setFestivos] = useState<string[]>([])
  const [libranzas, setLibranzas] = useState<string[]>([])
  const [popup, setPopup] = useState<{ msg: string; reglas: string[] } | null>(null)
  const [observaciones, setObservaciones] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarFestivos = async () => {
      try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${año}/ES`)
        const data = await res.json()
        const fechas = data
          .filter((f: any) => !f.counties || f.counties.includes("ES-MD") || f.counties.length === 0)
          .map((f: any) => f.date)
        setFestivos(fechas)
      } catch {
        setFestivos([
          "2026-01-01","2026-01-06","2026-03-19","2026-04-02","2026-04-03",
          "2026-05-01","2026-05-02","2026-05-15","2026-08-15","2026-10-12",
          "2026-11-01","2026-11-09","2026-12-07","2026-12-08","2026-12-25",
        ])
      }
    }
    cargarFestivos()
  }, [año])

  useEffect(() => {
    if (!grupoTrabajoId) { setLoading(false); return }
    const inicio = new Date(año, mes, 1).toISOString().split("T")[0]
    const fin = new Date(año, mes + 1, 0).toISOString().split("T")[0]
    fetch(`/api/libranzas?grupoTrabajoId=${grupoTrabajoId}&fechaInicio=${inicio}&fechaFin=${fin}`)
      .then(r => r.json())
      .then(data => {
        setLibranzas(Array.isArray(data) ? data.map((l: any) => l.fecha.split("T")[0]) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [grupoTrabajoId, mes, año])

  const addDias = (fecha: Date, dias: number): string => {
    const d = new Date(fecha)
    d.setDate(d.getDate() + dias)
    return d.toISOString().split("T")[0]
  }

  const getInfoDia = (fechaStr: string): DiaInfo => {
    const fecha = new Date(fechaStr + "T12:00:00")
    const dow = fecha.getDay()

    // Fin de semana
    const esFinde = dow === 0 || dow === 6

    // Antelación mínima 48h
    const limite = new Date()
    limite.setHours(0, 0, 0, 0)
    limite.setDate(limite.getDate() + 2)
    const esSinAntelacion = fecha < limite

    // Cumpleaños
    let esCumple = false
    if (fechaNacimiento) {
      const fn = new Date(fechaNacimiento)
      const cumple = new Date(fecha.getFullYear(), fn.getMonth(), fn.getDate()).toISOString().split("T")[0]
      const cumpleAnt = addDias(new Date(cumple + "T12:00:00"), -1)
      const cumplePost = addDias(new Date(cumple + "T12:00:00"), 1)
      esCumple = [cumple, cumpleAnt, cumplePost].includes(fechaStr)
    }

    // Festivos
    const esFestivo = festivos.includes(fechaStr)
    const diaAnterior = addDias(fecha, -1)
    const diaSiguiente = addDias(fecha, 1)
    const esFestivoAdyacente = festivos.includes(diaAnterior) || festivos.includes(diaSiguiente)

    // Libranzas
    const esLibranza = libranzas.includes(fechaStr)
    const esLibranzaAdyacente = libranzas.includes(diaAnterior) || libranzas.includes(diaSiguiente)

    const seleccionado = diasSeleccionados.includes(fechaStr)
    const bloqueado = esFinde || esSinAntelacion || esFestivo || esFestivoAdyacente || esCumple || esLibranza || esLibranzaAdyacente

    let motivo = ""
    if (esFinde) motivo = "Fin de semana — no permitido"
    else if (esSinAntelacion) motivo = "Mínimo 48 horas de antelación requeridas (según convenio colectivo)"
    else if (esFestivo) motivo = "Día festivo"
    else if (festivos.includes(diaSiguiente)) motivo = `Día anterior al festivo del ${new Date(diaSiguiente+"T12:00:00").toLocaleDateString("es-ES")}`
    else if (festivos.includes(diaAnterior)) motivo = `Día posterior al festivo del ${new Date(diaAnterior+"T12:00:00").toLocaleDateString("es-ES")}`
    else if (esLibranza) motivo = "Día de libranza del grupo"
    else if (libranzas.includes(diaSiguiente)) motivo = "Día anterior a una libranza"
    else if (libranzas.includes(diaAnterior)) motivo = "Día posterior a una libranza"
    else if (esCumple) motivo = "Día relacionado con cumpleaños (día, anterior o posterior)"

    return { fecha: fechaStr, bloqueado, motivo, seleccionado, esFestivo, esLibranza, esCumple, esFinde, esSinAntelacion }
  }

  const getDiasDelMes = (): (string | null)[] => {
    const primerDia = new Date(año, mes, 1).getDay()
    const offset = primerDia === 0 ? 6 : primerDia - 1
    const totalDias = new Date(año, mes + 1, 0).getDate()
    const celdas: (string | null)[] = Array(offset).fill(null)
    for (let d = 1; d <= totalDias; d++) {
      celdas.push(new Date(año, mes, d).toISOString().split("T")[0])
    }
    return celdas
  }

  const REGLAS = [
    "⏰ Mínimo 48 horas de antelación (según convenio colectivo)",
    "🚫 No se permiten fines de semana (sábados y domingos)",
    "🚫 No se permiten días festivos nacionales ni locales (Madrid)",
    "🚫 No se permite el día anterior ni posterior a un festivo",
    "🚫 No se permite el día anterior ni posterior a una libranza",
    "🚫 No se permite el día del cumpleaños ni el anterior ni posterior",
    "📋 Art. 37.3 ET · Máximo 6 días de asuntos propios al año · No acumulables",
  ]

  const handleClickDia = (fechaStr: string) => {
    const info = getInfoDia(fechaStr)

    if (info.bloqueado) {
      setPopup({ msg: `No puedes seleccionar este día: ${info.motivo}`, reglas: REGLAS })
      return
    }

    if (info.seleccionado) {
      setDiasSeleccionados(prev => prev.filter(d => d !== fechaStr))
      return
    }

    if (diasSeleccionados.length >= diasDisponibles) {
      setPopup({ msg: `No puedes seleccionar más días. Máximo: ${diasDisponibles} días disponibles.`, reglas: REGLAS })
      return
    }

    setDiasSeleccionados(prev => [...prev, fechaStr].sort())
  }

  const celdas = getDiasDelMes()

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)", padding:"20px 24px", borderRadius:"16px 16px 0 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ color:"#fff", fontSize:16, fontWeight:700, margin:0 }}>📋 Asuntos Propios</p>
              <p style={{ color:"rgba(255,255,255,0.8)", fontSize:12, margin:"4px 0 0" }}>Art. 37.3 ET · Selecciona días sueltos · Mín. 48h antelación</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
              <p style={{ color:"#fff", fontSize:22, fontWeight:700, margin:0 }}>{diasSeleccionados.length}<span style={{ fontSize:14, fontWeight:400 }}>/{diasDisponibles}</span></p>
              <p style={{ color:"rgba(255,255,255,0.8)", fontSize:10, margin:0 }}>días seleccionados</p>
            </div>
          </div>
        </div>

        {/* Navegación mes */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid #f3f4f6" }}>
          <button onClick={() => { if(mes===0){setMes(11);setAño(a=>a-1)}else setMes(m=>m-1) }}
            style={{ background:"#f3f4f6", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16 }}>‹</button>
          <p style={{ fontSize:15, fontWeight:600, color:"#1e1b4b", margin:0 }}>{MESES[mes]} {año}</p>
          <button onClick={() => { if(mes===11){setMes(0);setAño(a=>a+1)}else setMes(m=>m+1) }}
            style={{ background:"#f3f4f6", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16 }}>›</button>
        </div>

        {/* Leyenda */}
        <div style={{ display:"flex", gap:12, padding:"10px 24px", flexWrap:"wrap", borderBottom:"1px solid #f3f4f6" }}>
          {[
            { color:"#ede9fe", border:"#7c3aed", label:"Seleccionado" },
            { color:"#fee2e2", border:"#fca5a5", label:"Bloqueado" },
            { color:"#fef9c3", border:"#fcd34d", label:"Festivo" },
            { color:"#dbeafe", border:"#93c5fd", label:"Libranza" },
          ].map(l => (
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:l.color, border:`1px solid ${l.border}` }} />
              <span style={{ fontSize:10, color:"#6b7280" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div style={{ padding:"16px 24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:8 }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:600, color:"#9ca3af", padding:"4px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
            {celdas.map((fechaStr, i) => {
              if (!fechaStr) return <div key={i} />
              const info = getInfoDia(fechaStr)
              const dia = new Date(fechaStr + "T12:00:00").getDate()
              const esHoy = fechaStr === hoy.toISOString().split("T")[0]

              let bg = "#fff"
              let border = "1px solid #e5e7eb"
              let color = "#1f2937"
              let cursor = "pointer"

              if (info.esFinde || info.esSinAntelacion) { bg="#f9fafb"; color="#d1d5db"; cursor="not-allowed" }
              if (info.esFestivo) { bg="#fef9c3"; border="1px solid #fcd34d"; color="#92400e" }
              if (info.esLibranza) { bg="#dbeafe"; border="1px solid #93c5fd"; color="#1e40af" }
              if (info.bloqueado && !info.esFinde && !info.esSinAntelacion && !info.esFestivo && !info.esLibranza) { bg="#fee2e2"; border="1px solid #fca5a5"; color="#991b1b" }
              if (info.seleccionado) { bg="#7c3aed"; border="1px solid #6d28d9"; color="#fff" }
              if (esHoy && !info.seleccionado) { border="2px solid #7c3aed" }

              return (
                <div key={fechaStr} onClick={() => handleClickDia(fechaStr)}
                  title={info.motivo || ""}
                  style={{ background:bg, border, borderRadius:8, padding:"8px 4px", textAlign:"center", cursor, fontSize:13, fontWeight:esHoy?700:500, color, transition:"all .15s",
                    opacity: info.bloqueado && !info.seleccionado ? 0.7 : 1 }}>
                  {dia}
                  {info.esFestivo && !info.seleccionado && <div style={{ fontSize:7, marginTop:1 }}>fest.</div>}
                  {info.esLibranza && !info.seleccionado && <div style={{ fontSize:7, marginTop:1 }}>lib.</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Días seleccionados */}
        {diasSeleccionados.length > 0 && (
          <div style={{ padding:"0 24px 16px" }}>
            <p style={{ fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:8 }}>DÍAS SELECCIONADOS:</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {diasSeleccionados.map(d => (
                <span key={d} style={{ background:"#ede9fe", color:"#6d28d9", fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, border:"1px solid #c4b5fd" }}>
                  {new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"})}
                  <button onClick={()=>setDiasSeleccionados(prev=>prev.filter(x=>x!==d))}
                    style={{ background:"none", border:"none", color:"#7c3aed", cursor:"pointer", marginLeft:4, fontWeight:700 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div style={{ padding:"0 24px 16px" }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Observaciones (opcional)</label>
          <textarea value={observaciones} onChange={e=>setObservaciones(e.target.value)} rows={2}
            placeholder="Motivo de los asuntos propios..."
            style={{ width:"100%", padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, resize:"none", boxSizing:"border-box" as "border-box" }} />
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 24px", borderTop:"1px solid #f3f4f6", display:"flex", gap:8 }}>
          <button onClick={onCancelar}
            style={{ flex:1, padding:"10px", background:"#f3f4f6", color:"#374151", border:"none", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>
            Cancelar
          </button>
          <button onClick={()=>{ if(diasSeleccionados.length>0) onConfirmar(diasSeleccionados, observaciones) }}
            disabled={diasSeleccionados.length===0}
            style={{ flex:2, padding:"10px", background: diasSeleccionados.length>0?"#7c3aed":"#e5e7eb", color: diasSeleccionados.length>0?"#fff":"#9ca3af", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor: diasSeleccionados.length>0?"pointer":"not-allowed" }}>
            Solicitar {diasSeleccionados.length} día{diasSeleccionados.length!==1?"s":""} de asuntos propios
          </button>
        </div>
      </div>

      {/* Popup restricción */}
      {popup && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:420, padding:28, boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🚫</div>
              <p style={{ fontSize:15, fontWeight:700, color:"#1e1b4b", margin:0 }}>Día no disponible</p>
              <p style={{ fontSize:13, color:"#6b7280", marginTop:6 }}>{popup.msg}</p>
            </div>
            <div style={{ background:"#faf5ff", border:"1px solid #e9d5ff", borderRadius:10, padding:16, marginBottom:20 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#6d28d9", marginBottom:8 }}>NORMAS DE ASUNTOS PROPIOS:</p>
              {popup.reglas.map((r,i) => (
                <p key={i} style={{ fontSize:11, color:"#4b5563", margin:"4px 0", lineHeight:1.5 }}>{r}</p>
              ))}
            </div>
            <button onClick={()=>setPopup(null)}
              style={{ width:"100%", padding:"10px", background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
