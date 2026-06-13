"use client"
import InfoPanel from "@/components/InfoPanel"
import { useState, useEffect } from "react"

const grupoColor: Record<string,string> = {
  G1A:'#6366f1', G1B:'#4f46e5', G2A:'#0891b2',
  G2B:'#0e7490', G3A:'#6366f1', G3B:'#4f46e5',
}

const estadoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  correcto:   { bg:'#dcfce7', color:'#15803d', label:'Correcto'   },
  tardio:     { bg:'#fef9c3', color:'#854d0e', label:'Tardio'     },
  sin_salida: { bg:'#fee2e2', color:'#b91c1c', label:'Sin salida' },
  ausente:    { bg:'#f1f5f9', color:'#475569', label:'Ausente'    },
}

const tipoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  normal:  { bg:'#f1f5f9', color:'#475569', label:'Normal'  },
  extra:   { bg:'#fef9c3', color:'#854d0e', label:'Extra'   },
  festivo: { bg:'#f5f3ff', color:'#6d28d9', label:'Festivo' },
}

function Avatar({ nombre, size=30 }: { nombre:string, size?:number }) {
  const initials = (nombre||'?').split(' ').slice(0,2).map((n:string)=>n[0]).join('').toUpperCase()
  const colors = ['#6366f1','#4f46e5','#0891b2','#d97706','#16a34a']
  const color = colors[(nombre||'').charCodeAt(0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:4, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontSize:size*0.36, fontWeight:700 }}>
      {initials}
    </div>
  )
}

function FilaFichaje({ f }: { f: any }) {
  const [hov, setHov] = useState(false)
  const nombre = f.nombre && f.apellidos ? `${f.nombre} ${f.apellidos}` : f.empleado || 'Empleado'
  const grupo = f.grupo || f.grupoTrabajo?.nombre || '—'
  const entrada = f.horaEntrada || f.horaentrada ? new Date(f.horaEntrada || f.horaentrada).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }) : ''
  const salida = f.horaSalida || f.horasalida ? new Date(f.horaSalida || f.horasalida).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }) : ''
  const tipo = f.tipo || 'normal'
  const estado = f.estado || (entrada && salida ? 'correcto' : entrada ? 'sin_salida' : 'ausente')
  const es = estadoStyle[estado] || estadoStyle.ausente
  const ts = tipoStyle[tipo] || tipoStyle.normal

  return (
    <tr onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:hov?'var(--surface-2)':'transparent', transition:'background .15s', borderBottom:'1px solid var(--border)' }}>
      <td style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar nombre={nombre} size={30}/>
          <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{nombre}</span>
        </div>
      </td>
      <td style={{ padding:'12px 16px' }}>
        <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:grupoColor[grupo]||'#6366f1', borderRadius:3, padding:'2px 8px' }}>{grupo}</span>
      </td>
      <td style={{ padding:'12px 16px' }}>
        {entrada ? <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{entrada}</span>
                 : <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>—</span>}
      </td>
      <td style={{ padding:'12px 16px' }}>
        {salida ? <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{salida}</span>
                : <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>—</span>}
      </td>
      <td style={{ padding:'12px 16px' }}>
        <span style={{ fontSize:11, fontWeight:600, color:ts.color, background:ts.bg, borderRadius:3, padding:'2px 8px' }}>{ts.label}</span>
      </td>
      <td style={{ padding:'12px 16px' }}>
        <span style={{ fontSize:11, fontWeight:600, color:es.color, background:es.bg, borderRadius:3, padding:'2px 8px' }}>{es.label}</span>
      </td>
    </tr>
  )
}

export default function FichajesDesktop() {
  const [fichajes, setFichajes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [filterGrupo, setFilterGrupo] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetch('/api/fichajes')
      .then(r => r.json())
      .then(d => { setFichajes(Array.isArray(d) ? d : []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const lista = fichajes.filter(f => {
    const nombre = f.nombre && f.apellidos ? `${f.nombre} ${f.apellidos}` : f.empleado || ''
    const grupo = f.grupo || f.grupoTrabajo?.nombre || ''
    const estado = f.estado || (f.horaEntrada && f.horaSalida ? 'correcto' : f.horaEntrada ? 'sin_salida' : 'ausente')
    return (
      (filterGrupo === 'todos' || grupo === filterGrupo) &&
      (filterEstado === 'todos' || estado === filterEstado) &&
      (!busqueda || nombre.toLowerCase().includes(busqueda.toLowerCase()))
    )
  })

  const correctos = lista.filter(f => (f.estado || 'correcto') === 'correcto').length
  const tardios   = lista.filter(f => f.estado === 'tardio').length
  const sinSalida = lista.filter(f => !f.horaSalida && !f.horasalida && (f.horaEntrada || f.horaentrada)).length
  const ausentes  = lista.filter(f => !f.horaEntrada && !f.horaentrada).length

  return (
    <div className="space-y-4">
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
        <InfoPanel titulo="Como usar Fichajes" color="#16a34a" bg="#f0fdf4" border="#bbf7d0" items={[
          { icon:"⏰", titulo:"Registro horario", desc:"Todos los fichajes aparecen aqui. Cumple con el RDL 8/2019." },
          { icon:"✅", titulo:"Estados", desc:"Verde: correcto. Amarillo: tardio. Rojo: sin salida o ausente." },
          { icon:"📊", titulo:"KPIs", desc:"Resumen de correctos, tardios, sin salida y ausentes." },
          { icon:"🔍", titulo:"Filtros", desc:"Filtra por grupo, estado o busca por nombre." },
        ]} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Correctos',  value: cargando ? '...' : correctos, color:'#16a34a' },
          { label:'Tardios',    value: cargando ? '...' : tardios,   color:'#d97706' },
          { label:'Sin salida', value: cargando ? '...' : sinSalida, color:'#b91c1c' },
          { label:'Ausentes',   value: cargando ? '...' : ausentes,  color:'#6366f1' },
        ].map((k,i) => (
          <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'16px 20px', borderLeft:`3px solid ${k.color}`, boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>{k.label}</p>
            <p style={{ fontSize:28, fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'14px 16px', boxShadow:'var(--shadow-sm)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar empleado..."
          className="input-base text-sm" style={{ width:180 }}/>
        <select className="input-base text-sm w-auto" value={filterGrupo} onChange={e=>setFilterGrupo(e.target.value)}>
          <option value="todos">Todos los grupos</option>
          {Object.keys(grupoColor).map(g=><option key={g} value={g}>{g}</option>)}
        </select>
        <select className="input-base text-sm w-auto" value={filterEstado} onChange={e=>setFilterEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="correcto">Correcto</option>
          <option value="tardio">Tardio</option>
          <option value="sin_salida">Sin salida</option>
          <option value="ausente">Ausente</option>
        </select>
        <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-muted)' }}>{lista.length} registros</span>
      </div>

      {/* Tabla */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface-2)' }}>
                {['Empleado','Grupo','Entrada','Salida','Tipo','Estado'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Cargando...</td></tr>
              ) : lista.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
                  No hay fichajes registrados
                </td></tr>
              ) : (
                lista.map((f,i) => <FilaFichaje key={f.id || i} f={f}/>)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}