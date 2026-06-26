"use client"

import { useState } from "react"

type DayConfig = {
  day: number; tipo: string; grupos: string[]; date: Date
  libranzas: { grupo: string; empleados: string[]; tipo: 'completa' | 'media' }[]
  esFestivo: boolean; esEspecial: boolean
}

const grupoColors: Record<string,{ solid:string }> = {
  G1A:{solid:'#6366f1'}, G1B:{solid:'#4f46e5'}, G2A:{solid:'#0891b2'}, G2B:{solid:'#0e7490'},
  G3A:{solid:'#16a34a'}, G3B:{solid:'#15803d'}, L1:{solid:'#d97706'}, L2:{solid:'#ca8a04'}, L3:{solid:'#dc2626'},
}

const todosLosGrupos = ['G1A','G1B','G2A','G2B','G3A','G3B','L1','L2','L3']
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const diasCortos = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

const DOMINGOS_LABORABLES_2026 = ["2026-12-20", "2026-12-27"]

const FESTIVOS_NACIONALES: Record<number, number[]> = {
  0: [1, 6],
  3: [2, 3],
  4: [1],
  5: [24],
  6: [25],
  7: [15],
  8: [12],
  9: [12],
  10: [1, 2, 9],
  11: [6, 8, 25],
}

function getDaysInMonth(year: number, month: number): (DayConfig | null)[] {
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
    const esFestNacional = FESTIVOS_NACIONALES[month]?.includes(day) ?? false
    const fechaStr2 = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
    if (dow === 0 && DOMINGOS_LABORABLES_2026.includes(fechaStr2)) {
      tipo = 'trabajo'
    } else if (dow === 0) {
      tipo = 'domingo'
    } else if (dow === 1) { grupos = ['L1','L2','L3']
    } else if ([2,3,4,5,6].includes(dow)) {
        if (day%6===0||day%6===1)      grupos = ['G1A','G2A','G3A']
        else if (day%6===2||day%6===3) grupos = ['G1B','G2B','G3B']
        else grupos = ['G1A','G2B','G3A']
    }

    days.push({ day, tipo, grupos, date, libranzas:[], esFestivo, esEspecial:false })
  }
  return days
}

function getDayBg(tipo: string) {
  if (tipo === 'festivo') return '#f5f3ff'
  if (tipo === 'domingo') return '#fff5f5'
  return '#fff'
}

function getDayColor(tipo: string) {
  if (tipo === 'festivo') return '#7c3aed'
  if (tipo === 'domingo') return '#dc2626'
  return '#1e1b4b'
}

function getDaysInMonthCount(year: number, month: number) {
  const days = getDaysInMonth(year, month)
  return {
    laborales: days.filter(d => d?.tipo === 'trabajo').length,
    festivos: days.filter(d => d?.tipo === 'festivo').length,
    domingos: days.filter(d => d?.tipo === 'domingo').length,
  }
}

type Vista = 'anual' | 'mensual' | 'agenda'

export default function CalendarioGlobalDesktop() {
  const hoy = new Date()
  const [vista, setVista] = useState<Vista>('anual')
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [diaSeleccionado, setDiaSeleccionado] = useState<DayConfig | null>(null)
  const [filterGrupo, setFilterGrupo] = useState('todos')
  const [filterSede, setFilterSede] = useState('todas')

  const irAMes = (m: number) => { setMes(m); setVista('mensual') }
  const irADia = (d: DayConfig) => { setDiaSeleccionado(d); setVista('agenda') }
  const volverAAnual = () => setVista('anual')
  const volverAMensual = () => setVista('mensual')
  const daysMes = getDaysInMonth(anio, mes)

  const inputStyle = { padding: '7px 12px', border: '1px solid #e8eaf0', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1e1b4b', outline: 'none' }

  const esHoyCheck = (d: DayConfig | null, m: number) =>
    d !== null && hoy.getDate() === d.day && hoy.getMonth() === m && hoy.getFullYear() === anio

  return (
    <div style={{ padding: 0, maxWidth: '100%', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={volverAAnual} style={{ background: vista === 'anual' ? '#6366f1' : '#f0f4ff', color: vista === 'anual' ? '#fff' : '#6366f1', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{anio}</button>
          {(vista === 'mensual' || vista === 'agenda') && (
            <><span style={{ color: '#a0aec0', fontSize: 14 }}>›</span>
            <button onClick={volverAMensual} style={{ background: vista === 'mensual' ? '#6366f1' : '#f0f4ff', color: vista === 'mensual' ? '#fff' : '#6366f1', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{meses[mes]}</button></>
          )}
          {vista === 'agenda' && diaSeleccionado && (
            <><span style={{ color: '#a0aec0', fontSize: 14 }}>›</span>
            <span style={{ background: '#6366f1', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500 }}>{diaSeleccionado.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</span></>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {vista === 'anual' && (<>
            <button onClick={() => setAnio(a => a - 1)} style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 14, cursor: 'pointer' }}>←</button>
            <button onClick={() => setAnio(a => a + 1)} style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 14, cursor: 'pointer' }}>→</button>
          </>)}
          {vista === 'mensual' && (<>
            <button onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a-1) } else setMes(m => m-1) }} style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 14, cursor: 'pointer' }}>←</button>
            <button onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a+1) } else setMes(m => m+1) }} style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 14, cursor: 'pointer' }}>→</button>
          </>)}
          <select value={filterSede} onChange={e => setFilterSede(e.target.value)} style={inputStyle}>
            <option value="todas">Todas las sedes</option>
            <option value="madrid">Madrid Centro</option>
            <option value="vallecas">Vallecas</option>
          </select>
          <select value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)} style={inputStyle}>
            <option value="todos">Todos los grupos</option>
            {todosLosGrupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* VISTA ANUAL */}
      {vista === 'anual' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {Array.from({ length: 12 }, (_, m) => {
            const stats = getDaysInMonthCount(anio, m)
            const esMesHoy = hoy.getFullYear() === anio && hoy.getMonth() === m
            return (
              <div key={m} onClick={() => irAMes(m)}
                style={{ background: '#fff', border: esMesHoy ? '1.5px solid #6366f1' : '0.5px solid #e8eaf0', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.15)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: esMesHoy ? '#6366f1' : '#1e1b4b' }}>{meses[m]}</div>
                  {esMesHoy && <span style={{ background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>Hoy</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 10 }}>
                  {['L','M','X','J','V','S','D'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 9, color: '#64748b', fontWeight: 700, padding: '2px 0', background: '#e8eaf4', borderRadius: 2 }}>{d}</div>
                  ))}
                  {getDaysInMonth(anio, m).map((d, i) => {
                    const esHoyDia = esHoyCheck(d, m)
                    const bg = esHoyDia ? '#6366f1' : d?.tipo === 'domingo' ? '#fff5f5' : d?.tipo === 'festivo' ? '#f5f3ff' : 'transparent'
                    const col = !d ? 'transparent' : esHoyDia ? '#fff' : d.tipo === 'domingo' ? '#dc2626' : d.tipo === 'festivo' ? '#7c3aed' : '#374151'
                    return (
                      <div key={i} style={{ textAlign: 'center', fontSize: 12, padding: '3px 1px', borderRadius: esHoyDia ? '50%' : 2, background: bg, color: col, fontWeight: esHoyDia ? 700 : 400 }}>
                        {d ? d.day : ''}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 6, borderTop: '0.5px solid #e8eaf0', paddingTop: 8 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 15, fontWeight: 600, color: '#6366f1' }}>{stats.laborales}</div><div style={{ fontSize: 9, color: '#a0aec0' }}>Labor.</div></div>
                  <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 15, fontWeight: 600, color: '#7c3aed' }}>{stats.festivos}</div><div style={{ fontSize: 9, color: '#a0aec0' }}>Festiv.</div></div>
                  <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 15, fontWeight: 600, color: '#dc2626' }}>{stats.domingos}</div><div style={{ fontSize: 9, color: '#a0aec0' }}>Dom.</div></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VISTA MENSUAL */}
      {vista === 'mensual' && (
        <div>
          <div style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '0.5px solid #e8eaf0' }}>
              {diasCortos.map((d, i) => (
                <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600, color: i === 5 ? '#6366f1' : i === 6 ? '#dc2626' : '#718096', borderRight: i < 6 ? '0.5px solid #e8eaf0' : 'none' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {daysMes.map((d, i) => {
                const esHoyDia = esHoyCheck(d, mes)
                const gruposFiltrados = d ? (filterGrupo === 'todos' ? d.grupos : d.grupos.filter(g => g === filterGrupo)) : []
                return (
                  <div key={i} onClick={() => d && irADia(d)}
                    style={{ minHeight: 110, padding: '10px 8px', background: !d ? '#f8f9ff' : esHoyDia ? '#ede9fe' : getDayBg(d.tipo), border: `0.5px solid ${esHoyDia ? '#6366f1' : d?.tipo === 'domingo' ? '#fca5a5' : d?.tipo === 'festivo' ? '#c4b5fd' : '#e8eaf0'}`, cursor: d ? 'pointer' : 'default', position: 'relative', transition: 'all 0.12s' }}
                    onMouseEnter={e => { if (d) (e.currentTarget as HTMLDivElement).style.filter = 'brightness(0.96)' }}
                    onMouseLeave={e => { if (d) (e.currentTarget as HTMLDivElement).style.filter = 'none' }}
                  >
                    {d && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ width: esHoyDia ? 32 : 'auto', height: esHoyDia ? 32 : 'auto', background: esHoyDia ? '#6366f1' : 'transparent', borderRadius: esHoyDia ? '50%' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: esHoyDia ? 700 : 400, color: esHoyDia ? '#fff' : getDayColor(d.tipo) }}>
                            {d.day}
                          </div>
                          {d.tipo === 'festivo' && <span style={{ fontSize: 9, background: '#ede9fe', color: '#6366f1', padding: '1px 5px', borderRadius: 10, fontWeight: 600 }}>Festivo</span>}
                          {d.tipo === 'domingo' && <span style={{ fontSize: 9, background: '#fff5f5', color: '#dc2626', padding: '1px 5px', borderRadius: 10, fontWeight: 600 }}>Dom</span>}
                        </div>
                        {gruposFiltrados.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {gruposFiltrados.map(g => (
                              <span key={g} style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: grupoColors[g]?.solid, borderRadius: 3, padding: '1px 4px' }}>{g}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: d.tipo === 'festivo' ? '#7c3aed' : d.tipo === 'domingo' ? '#dc2626' : '#6366f1', opacity: 0.25 }} />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, padding: '14px 20px', background: '#fff', borderRadius: 10, border: '0.5px solid #e8eaf0', alignItems: 'center' }}>
            {Object.entries(grupoColors).map(([g, v]) => (
              <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: v.solid }} />
                <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>{g}</span>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
              {[{ label: 'Laboral', color: '#6366f1' }, { label: 'Festivo', color: '#7c3aed' }, { label: 'Domingo', color: '#dc2626' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 4, borderRadius: 2, background: l.color, opacity: 0.4 }} />
                  <span style={{ fontSize: 12, color: '#718096' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, background: '#f8f9ff', border: '0.5px solid #e8eaf0', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 16 }}>¿Qué puedes hacer en esta vista?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: '📅', titulo: 'Navegar por días', desc: 'Haz click en cualquier día para ver el detalle completo de grupos, turnos y empleados asignados.' },
                { icon: '👥', titulo: 'Ver grupos activos', desc: 'Cada chip de color representa un grupo de trabajo activo ese día. Los colores identifican cada grupo.' },
                { icon: '🎉', titulo: 'Festivos y domingos', desc: 'Los días en morado son festivos nacionales. Los domingos aparecen en rojo. Los laborales en blanco.' },
                { icon: '🔍', titulo: 'Filtrar por grupo', desc: 'Usa el selector de grupos arriba para ver solo los días en que trabaja un grupo específico.' },
                { icon: '🏢', titulo: 'Filtrar por sede', desc: 'Filtra por Madrid Centro o Vallecas para ver la distribución de cada sede por separado.' },
                { icon: '📊', titulo: 'Vista agenda', desc: 'Al hacer click en un día accedes a la vista agenda con KPIs, detalle de turnos y navegación día a día.' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 4 }}>{item.titulo}</div>
                    <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISTA AGENDA */}
      {vista === 'agenda' && diaSeleccionado && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 16, height: 'fit-content' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', marginBottom: 12 }}>{meses[mes]} {anio}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 8 }}>
              {['L','M','X','J','V','S','D'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 9, color: '#64748b', fontWeight: 700, padding: '2px 0', background: '#e8eaf4', borderRadius: 2 }}>{d}</div>
              ))}
              {daysMes.map((d, i) => (
                <div key={i} onClick={() => d && irADia(d)}
                  style={{ textAlign: 'center', fontSize: 11, padding: '4px 2px', borderRadius: 4, cursor: d ? 'pointer' : 'default', background: d && diaSeleccionado.day === d.day ? '#6366f1' : d?.tipo === 'festivo' ? '#f5f3ff' : d?.tipo === 'domingo' ? '#fff5f5' : 'transparent', color: d && diaSeleccionado.day === d.day ? '#fff' : d?.tipo === 'domingo' ? '#dc2626' : d?.tipo === 'festivo' ? '#7c3aed' : '#718096', fontWeight: d && diaSeleccionado.day === d.day ? 700 : 400 }}>
                  {d ? d.day : ''}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '0.5px solid #e8eaf0', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Días laborales', valor: daysMes.filter(d => d?.tipo === 'trabajo').length, color: '#6366f1' },
                { label: 'Festivos', valor: daysMes.filter(d => d?.tipo === 'festivo').length, color: '#7c3aed' },
                { label: 'Domingos', valor: daysMes.filter(d => d?.tipo === 'domingo').length, color: '#dc2626' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#a0aec0' }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.valor}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1e1b4b', textTransform: 'capitalize' }}>{diaSeleccionado.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                  <div style={{ fontSize: 13, color: '#a0aec0', marginTop: 2 }}>{diaSeleccionado.tipo === 'festivo' ? '🎉 Día festivo' : diaSeleccionado.tipo === 'domingo' ? '📅 Domingo' : '💼 Día laboral'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { const dias = daysMes.filter(d => d !== null) as DayConfig[]; const idx = dias.findIndex(d => d.day === diaSeleccionado.day); if (idx > 0) setDiaSeleccionado(dias[idx - 1]) }} style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>← Anterior</button>
                  <button onClick={() => { const dias = daysMes.filter(d => d !== null) as DayConfig[]; const idx = dias.findIndex(d => d.day === diaSeleccionado.day); if (idx < dias.length - 1) setDiaSeleccionado(dias[idx + 1]) }} style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>Siguiente →</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Grupos activos', valor: diaSeleccionado.grupos.length, color: '#6366f1', bg: '#ede9fe' },
                  { label: 'Empleados est.', valor: diaSeleccionado.grupos.length * 12, color: '#059669', bg: '#d1fae5' },
                  { label: 'Libranzas', valor: diaSeleccionado.libranzas.length, color: '#d97706', bg: '#fef9c3' },
                ].map(k => (
                  <div key={k.label} style={{ background: k.bg, borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.valor}</div>
                    <div style={{ fontSize: 11, color: k.color, opacity: 0.7, marginTop: 2 }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {diaSeleccionado.grupos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {diaSeleccionado.grupos.map(g => (
                  <div key={g} style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 4, height: 48, background: grupoColors[g]?.solid, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b', marginBottom: 4 }}>{g}</div>
                      <div style={{ fontSize: 12, color: '#a0aec0' }}>Turno asignado · 12 empleados estimados</div>
                    </div>
                    <span style={{ background: grupoColors[g]?.solid + '20', color: grupoColors[g]?.solid, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>Activo</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 12, padding: 40, textAlign: 'center', color: '#a0aec0', fontSize: 14 }}>
                {diaSeleccionado.tipo === 'domingo' ? 'Domingo — sin grupos asignados' : diaSeleccionado.tipo === 'festivo' ? 'Día festivo — sin grupos asignados' : 'Sin grupos asignados para este día'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
