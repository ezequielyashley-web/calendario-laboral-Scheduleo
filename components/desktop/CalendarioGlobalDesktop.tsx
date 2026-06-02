"use client"

import { useState } from "react"

type DayConfig = {
  day: number; tipo: string; grupos: string[]; date: Date
  libranzas: { grupo: string; empleados: string[]; tipo: 'completa' | 'media' }[]
  esFestivo: boolean; esEspecial: boolean; notaEspecial?: string
}

const grupoColors: Record<string,{ solid:string }> = {
  G1A:{solid:'#0284c7'}, G1B:{solid:'#0369a1'}, G2A:{solid:'#0891b2'}, G2B:{solid:'#0e7490'},
  G3A:{solid:'#6366f1'}, G3B:{solid:'#4f46e5'}, L1:{solid:'#d97706'}, L2:{solid:'#ca8a04'}, L3:{solid:'#16a34a'},
}

const todosLosGrupos = ['G1A','G1B','G2A','G2B','G3A','G3B','L1','L2','L3']
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const diasCortos = ['dom','lun','mar','mié','jue','vie','sáb']

function getDaysInMonth(currentMonth: Date) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let startDow = firstDay.getDay() - 1
  if (startDow === -1) startDow = 6
  const days: (DayConfig | null)[] = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dow = date.getDay()
    let tipo = 'trabajo', grupos: string[] = [], esFestivo = false
    if (dow === 0) { tipo = 'domingo' }
    else if ([1, 15].includes(day)) { tipo = 'festivo'; esFestivo = true }
    else {
      if (dow === 1) grupos = ['L1','L2','L3']
      else if ([2,3,4,5,6].includes(dow)) {
        if (day%6===0||day%6===1)      grupos = ['G1A','G2A','G3A']
        else if (day%6===2||day%6===3) grupos = ['G1B','G2B','G3B']
        else grupos = ['G1A','G2B','G3A']
      }
    }
    days.push({ day, tipo, grupos, date, libranzas:[], esFestivo, esEspecial:false })
  }
  return days
}

function chunkWeeks(days: (DayConfig|null)[]): (DayConfig|null)[][] {
  const weeks: (DayConfig|null)[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i+7))
  while (weeks[weeks.length-1].length < 7) weeks[weeks.length-1].push(null)
  return weeks
}

export default function CalendarioGlobalDesktop() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4))
  const [filterGrupo, setFilterGrupo]   = useState('todos')
  const [filterSede, setFilterSede]     = useState('todas')
  const [vistaDetallada, setVistaDetallada] = useState(false)
  const [selectedDay, setSelectedDay]   = useState<DayConfig|null>(null)
  const [hoveredDay, setHoveredDay]     = useState<string|null>(null)
  const [hoveredWeek, setHoveredWeek]   = useState<number|null>(null)

  const days  = getDaysInMonth(currentMonth)
  const weeks = chunkWeeks(days)

  const toggleGrupo = (grupo: string) => {
    if (!selectedDay) return
    const grupos = [...selectedDay.grupos]
    const idx = grupos.indexOf(grupo)
    idx > -1 ? grupos.splice(idx, 1) : grupos.push(grupo)
    setSelectedDay({ ...selectedDay, grupos })
  }

  const toggleLibranza = (grupo: string, tipo: 'completa'|'media') => {
    if (!selectedDay) return
    const libranzas = [...selectedDay.libranzas]
    const idx = libranzas.findIndex(l => l.grupo === grupo)
    idx > -1 ? libranzas.splice(idx, 1) : libranzas.push({ grupo, empleados:[], tipo })
    setSelectedDay({ ...selectedDay, libranzas })
  }

  // Colores por tipo — light y dark
  const getCellBg    = (tipo:string) => tipo==='festivo' ? '#f5f3ff' : tipo==='domingo' ? '#fff1f2' : 'var(--surface)'
  const getCellBorder= (tipo:string) => tipo==='festivo' ? '#c4b5fd' : tipo==='domingo' ? '#fca5a5' : 'var(--border-strong)'
  const getNumColor  = (tipo:string) => tipo==='festivo' ? '#a78bfa' : tipo==='domingo' ? '#f87171' : 'var(--text-muted)'
  const getDiaColor  = (tipo:string) => tipo==='festivo' ? '#c4b5fd' : tipo==='domingo' ? '#fca5a5' : 'var(--text-muted)'

  return (
    <div className="space-y-4">

      {/* Banner */}
      <div style={{ display:'flex', gap:10, alignItems:'flex-start', background:'var(--surface)', borderLeft:'3px solid #0284c7', borderRadius:'0 4px 4px 0', padding:'10px 14px', border:'1px solid var(--border)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:'#1e40af' }}>Calendario de asignación de grupos</p>
          <p style={{ fontSize:12, color:'#3b82f6', marginTop:2 }}>Haz clic en cualquier día para asignar grupos de trabajo, añadir libranzas o marcar festivos especiales.</p>
        </div>
      </div>

      {/* Controles */}
      <div className="card p-4 flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1))}
            className="btn-secondary w-9 h-9 flex items-center justify-center">←</button>
          <div className="text-center min-w-[160px]">
            <p style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', lineHeight:1.1 }}>{meses[currentMonth.getMonth()]}</p>
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text-secondary)', marginTop:2 }}>{currentMonth.getFullYear()}</p>
          </div>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1))}
            className="btn-secondary w-9 h-9 flex items-center justify-center">→</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterSede} onChange={e=>setFilterSede(e.target.value)}>
            <option value="todas">Todas las sedes</option>
            <option value="madrid">Madrid Centro</option>
            <option value="vallecas">Vallecas</option>
          </select>
          <select value={filterGrupo} onChange={e=>setFilterGrupo(e.target.value)}>
            <option value="todos">Todos los grupos</option>
            {todosLosGrupos.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
          <button onClick={()=>setVistaDetallada(!vistaDetallada)} className="btn-secondary text-xs px-3 py-1.5">
            {vistaDetallada ? 'Vista compacta' : 'Vista detallada'}
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="card px-4 py-2.5 flex flex-wrap gap-4 items-center">
        {[
          { label:'Laboral', bg:'var(--surface)', border:'var(--border-strong)' },
          { label:'Festivo', bg:'#f5f3ff', border:'#c4b5fd' },
          { label:'Domingo', bg:'#fff1f2', border:'#fca5a5' },
        ].map(l=>(
          <div key={l.label} className="flex items-center gap-1.5">
            <div style={{ width:14, height:14, background:l.bg, border:`1px solid ${l.border}`, borderRadius:2 }} />
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          {Object.entries(grupoColors).map(([key,val])=>(
            <div key={key} className="flex items-center gap-1">
              <div style={{ width:8, height:8, background:val.solid, borderRadius:2 }} />
              <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Semanas flotantes — sin cabecera, días dentro de cada celda */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {weeks.map((week, wi) => {
          const isWeekHov = hoveredWeek === wi
          const hasHoveredDay = hoveredDay?.startsWith(`${wi}-`) ?? false
          return (
            <div key={wi}
              onMouseEnter={()=>setHoveredWeek(wi)}
              onMouseLeave={()=>setHoveredWeek(null)}
              style={{
                display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:5, padding:'6px',
                borderRadius:6, position:'relative',
                background: isWeekHov ? 'rgba(2,132,199,0.08)' : 'rgba(2,132,199,0.04)',
                border:`1px solid ${isWeekHov ? 'rgba(2,132,199,0.4)' : 'rgba(2,132,199,0.15)'}`,
                boxShadow: isWeekHov ? '0 4px 16px rgba(2,132,199,.15)' : '0 1px 3px rgba(0,0,0,.06)',
                transform: isWeekHov ? 'translateY(-2px)' : 'translateY(0)',
                transition:'all .2s ease',
              }}
            >
              {week.map((dayData, di) => {
                if (!dayData) return (
                  <div key={di} style={{
                    aspectRatio: vistaDetallada ? 'auto' : '1 / 1',
                    minHeight: vistaDetallada ? 88 : undefined,
                    borderRadius:4, border:'1px dashed rgba(2,132,199,0.12)', background:'transparent',
                    opacity: hasHoveredDay ? 0.35 : 1,
                    transition:'opacity .18s ease',
                  }} />
                )

                const { day, tipo, grupos, libranzas, date } = dayData
                const key  = `${wi}-${di}`
                const isHov = hoveredDay === key
                const diaNombre = diasCortos[date.getDay()]

                return (
                  <div key={di}
                    onMouseEnter={()=>setHoveredDay(key)}
                    onMouseLeave={()=>setHoveredDay(null)}
                    style={{
                      position:'relative',
                      zIndex: isHov ? 20 : 1,
                      opacity: hasHoveredDay && !isHov ? 0.3 : 1,
                      transition:'opacity .18s ease',
                    }}
                  >
                    {/* Panel izquierdo — letras de grupos */}
                    {isHov && grupos.length > 0 && (
                      <div style={{
                        position:'absolute', right:'calc(100% + 6px)', top:'50%', transform:'translateY(-50%)',
                        display:'flex', flexDirection:'column', gap:3, alignItems:'flex-end',
                        zIndex:30, pointerEvents:'none',
                      }}>
                        {grupos.map(g=>(
                          <span key={g} style={{
                            fontSize:10, fontWeight:700, color:'#fff',
                            background:grupoColors[g]?.solid,
                            borderRadius:3, padding:'2px 6px',
                            whiteSpace:'nowrap',
                            boxShadow:'0 1px 4px rgba(0,0,0,.2)',
                          }}>{g}</span>
                        ))}
                      </div>
                    )}

                    {/* Panel derecho — dots de color */}
                    {isHov && grupos.length > 0 && (
                      <div style={{
                        position:'absolute', left:'calc(100% + 6px)', top:'50%', transform:'translateY(-50%)',
                        display:'flex', flexDirection:'column', gap:4, alignItems:'flex-start',
                        zIndex:30, pointerEvents:'none',
                      }}>
                        {grupos.map(g=>(
                          <div key={g} style={{
                            width:10, height:10, borderRadius:'50%',
                            background:grupoColors[g]?.solid,
                            boxShadow:`0 0 0 2px var(--surface), 0 0 0 3px ${grupoColors[g]?.solid}40`,
                          }} />
                        ))}
                      </div>
                    )}

                    {/* Celda */}
                    <div
                      onClick={()=>setSelectedDay({...dayData})}
                      className={`day-cell day-cell--${tipo}`}
                      style={{
                        aspectRatio: vistaDetallada ? 'auto' : '1 / 1',
                        minHeight: vistaDetallada ? 88 : undefined,
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        borderRadius:4, cursor:'pointer', position:'relative',
                        border:`${isHov?'2px':'1px'} solid ${isHov?'#22d3ee':getCellBorder(tipo)}`,
                        transform: isHov ? 'scale(1.16)' : 'scale(1)',
                        boxShadow: isHov ? '0 6px 20px rgba(34,211,238,.18), 0 2px 6px rgba(0,0,0,.1)' : '0 1px 2px rgba(0,0,0,.06)',
                        transition:'all .18s cubic-bezier(.34,1.56,.64,1)',
                        userSelect:'none', padding:'4px 4px 6px', overflow:'hidden', gap:2,
                      }}
                    >
                      {isHov && <div style={{ position:'absolute', inset:-4, borderRadius:6, border:'2px solid rgba(34,211,238,.18)', pointerEvents:'none' }} />}

                      {/* Día de la semana — mismo tamaño que el número */}
                      <span
                        className={`day-dia--${tipo}`}
                        style={{
                          fontSize: isHov ? 20 : 15,
                          fontWeight: 400,
                          lineHeight: 1,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          transition:'font-size .18s cubic-bezier(.34,1.56,.64,1)',
                          display:'block',
                          opacity: 0.7,
                        }}
                      >
                        {diaNombre}
                      </span>

                      {/* Número del día — 30% más grande que antes (17px → 22px) */}
                      <span
                        className={`day-num--${tipo}`}
                        style={{
                          fontSize: isHov ? 30 : 22,
                          fontWeight: 600,
                          lineHeight: 1,
                          textShadow: '0 1px 3px rgba(0,0,0,0.12)',
                          transition:'font-size .18s cubic-bezier(.34,1.56,.64,1)',
                          display:'block',
                        }}
                      >
                        {day}
                      </span>

                      {/* Dots grupos */}
                      {grupos.length>0 && !vistaDetallada && (
                        <div style={{ display:'flex', gap:2.5, flexWrap:'wrap', justifyContent:'center', marginTop:3, maxWidth:40, opacity:isHov?0.7:1, transition:'opacity .18s' }}>
                          {grupos.slice(0,4).map((g,idx)=>(
                            <div key={idx} style={{ width:5, height:5, borderRadius:'50%', background:grupoColors[g]?.solid, flexShrink:0 }} />
                          ))}
                        </div>
                      )}

                      {/* Badges vista detallada */}
                      {vistaDetallada && grupos.length>0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:2, marginTop:4, justifyContent:'center' }}>
                          {grupos.map((g,idx)=>(
                            <span key={idx} style={{ fontSize:9, fontWeight:600, color:'#fff', background:grupoColors[g]?.solid, borderRadius:2, padding:'1px 3px' }}>{g}</span>
                          ))}
                        </div>
                      )}

                      {/* Barra libranzas */}
                      {libranzas.length>0 && (
                        <div style={{
                          position:'absolute', bottom:0, left:0, right:0, height:isHov?4:3,
                          borderRadius:'0 0 4px 4px', transition:'height .18s',
                          background: libranzas.length===1 ? grupoColors[libranzas[0].grupo]?.solid
                            : `linear-gradient(90deg, ${libranzas.map((l,i)=>`${grupoColors[l.grupo]?.solid} ${i*(100/libranzas.length)}% ${(i+1)*(100/libranzas.length)}%`).join(', ')})`,
                        }} />
                      )}
                    </div>

                    {/* CSS por tipo */}
                    <style>{`
                      .day-cell--trabajo { background: var(--surface); }
                      .day-cell--festivo { background: #f5f3ff; }
                      .day-cell--domingo { background: #fff1f2; }
                      .day-num--trabajo  { color: var(--text-muted); }
                      .day-num--festivo  { color: #a78bfa; }
                      .day-num--domingo  { color: #f87171; }
                      .day-dia--trabajo  { color: var(--text-muted); }
                      .day-dia--festivo  { color: #c4b5fd; }
                      .day-dia--domingo  { color: #fca5a5; }
                      html.dark .day-cell--trabajo { background: #1e2a3a; border-color: #2d3f52 !important; }
                      html.dark .day-cell--festivo { background: #2e1f4a; border-color: #5b3d8a !important; }
                      html.dark .day-cell--domingo { background: #3b1a20; border-color: #7f3040 !important; }
                      html.dark .day-num--trabajo  { color: #6b8aaa; }
                      html.dark .day-num--festivo  { color: #a78bfa; }
                      html.dark .day-num--domingo  { color: #f87171; }
                      html.dark .day-dia--trabajo  { color: #3d5570; }
                      html.dark .day-dia--festivo  { color: #7c5cbf; }
                      html.dark .day-dia--domingo  { color: #8b3a45; }
                    `}</style>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Días laborales', value:days.filter(d=>d?.tipo==='trabajo').length, color:'#0284c7', bg:'#eff6ff' },
          { label:'Festivos',       value:days.filter(d=>d?.tipo==='festivo').length, color:'#7c3aed', bg:'#f5f3ff' },
          { label:'Domingos',       value:days.filter(d=>d?.tipo==='domingo').length, color:'#b91c1c', bg:'#fff1f2' },
        ].map(s=>(
          <div key={s.label} className="flex items-center justify-between px-4 py-3"
            style={{ background:s.bg, border:'1px solid var(--border)', borderRadius:4 }}>
            <span style={{ fontSize:12, color:s.color, fontWeight:500 }}>{s.label}</span>
            <span style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedDay && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e=>{ if(e.target===e.currentTarget) setSelectedDay(null) }}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)' }}>

            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Configurar día</h2>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2, textTransform:'capitalize' }}>
                  {selectedDay.date.toLocaleDateString('es-ES',{ weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                </p>
              </div>
              <button onClick={()=>setSelectedDay(null)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:'Tipo',    value:selectedDay.tipo.charAt(0).toUpperCase()+selectedDay.tipo.slice(1) },
                  { label:'Grupos',  value:String(selectedDay.grupos.length) },
                  { label:'Libranzas', value:String(selectedDay.libranzas.length) },
                ].map(info=>(
                  <div key={info.label} className="px-4 py-3" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4 }}>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{info.label}</p>
                    <p style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)', marginTop:2 }}>{info.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>Grupos asignados</p>
                <div className="flex flex-wrap gap-2">
                  {todosLosGrupos.map(grupo=>{
                    const sel = selectedDay.grupos.includes(grupo)
                    return (
                      <button key={grupo} onClick={()=>toggleGrupo(grupo)}
                        style={{ padding:'6px 12px', fontSize:12, fontWeight:700, borderRadius:4, transition:'all .15s',
                          background:sel?grupoColors[grupo]?.solid:'var(--surface-2)',
                          color:sel?'#fff':'var(--text-secondary)',
                          border:`1px solid ${sel?grupoColors[grupo]?.solid:'var(--border-strong)'}` }}>{grupo}</button>
                    )
                  })}
                </div>
              </div>

              {selectedDay.grupos.length>0 && (
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>Libranzas</p>
                  <div className="space-y-2">
                    {selectedDay.grupos.map(grupo=>{
                      const lib = selectedDay.libranzas.find(l=>l.grupo===grupo)
                      return (
                        <div key={grupo} className="flex items-center justify-between px-4 py-3"
                          style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4 }}>
                          <div className="flex items-center gap-2">
                            <div style={{ width:8, height:8, background:grupoColors[grupo]?.solid, borderRadius:2 }} />
                            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{grupo}</span>
                          </div>
                          <div className="flex gap-2">
                            {(['completa','media'] as const).map(t=>(
                              <button key={t} onClick={()=>toggleLibranza(grupo,t)}
                                style={{ padding:'4px 12px', fontSize:12, fontWeight:500, borderRadius:3, transition:'all .15s',
                                  background:lib?.tipo===t?'#0284c7':'var(--surface)',
                                  color:lib?.tipo===t?'#fff':'var(--text-secondary)',
                                  border:`1px solid ${lib?.tipo===t?'#0284c7':'var(--border-strong)'}` }}>
                                {t==='completa'?'Completa':'Media jornada'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>Marcas especiales</p>
                <div className="flex gap-2">
                  {[{ key:'esFestivo', label:'Festivo', color:'#7c3aed' },{ key:'esEspecial', label:'Día especial', color:'#d97706' }].map(m=>{
                    const active = selectedDay[m.key as keyof DayConfig] as boolean
                    return (
                      <button key={m.key} onClick={()=>setSelectedDay({...selectedDay,[m.key]:!active})}
                        style={{ padding:'6px 16px', fontSize:12, fontWeight:600, borderRadius:4, transition:'all .15s',
                          background:active?m.color:'var(--surface-2)', color:active?'#fff':'var(--text-secondary)',
                          border:`1px solid ${active?m.color:'var(--border-strong)'}` }}>{m.label}</button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
                <button onClick={()=>setSelectedDay(null)} className="btn-secondary flex-1 py-2">Cancelar</button>
                <button onClick={()=>{ console.log('Guardado:',selectedDay); setSelectedDay(null) }} className="btn-primary flex-1 py-2">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
