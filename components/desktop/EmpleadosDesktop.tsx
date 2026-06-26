"use client"

import { useState } from "react"

// ── Tipos ─────────────────────────────────────────────────────
type Empleado = {
  id: number
  nombre: string
  email: string
  telefono: string
  sede: string
  grupo: string
  rol: string
  estado: 'activo' | 'vacaciones' | 'baja'
  negocio: string
  dni?: string
  fechaContratacion?: string
  puesto?: string
  gruposLibranza?: string[]
}

// ── Datos ─────────────────────────────────────────────────────
const empleadosData: Empleado[] = [
  { id:1, nombre:"Juan Pérez García",    email:"juan@empresa.com",   telefono:"+34 600 123 456", sede:"Madrid Centro", grupo:"G1A", rol:"EMPLEADO",    estado:"activo",     negocio:"Restaurante", dni:"12345678A", fechaContratacion:"2021-03-15", puesto:"Camarero",     gruposLibranza:["G1A","G2A"]       },
  { id:2, nombre:"María García López",   email:"maria@empresa.com",  telefono:"+34 611 234 567", sede:"Vallecas",      grupo:"G2A", rol:"EMPLEADO",    estado:"activo",     negocio:"Pescadería",  dni:"23456789B", fechaContratacion:"2020-07-01", puesto:"Dependienta",  gruposLibranza:["G2A"]             },
  { id:3, nombre:"Carlos López Martín",  email:"carlos@empresa.com", telefono:"+34 622 345 678", sede:"Madrid Centro", grupo:"G1B", rol:"ADMIN_SEDE",  estado:"activo",     negocio:"Hotel",       dni:"34567890C", fechaContratacion:"2019-01-10", puesto:"Recepcionista", gruposLibranza:["G1B","G3B"]      },
  { id:4, nombre:"Ana Martínez Sanz",    email:"ana@empresa.com",    telefono:"+34 633 456 789", sede:"Vallecas",      grupo:"G2B", rol:"EMPLEADO",    estado:"vacaciones", negocio:"Catering",    dni:"45678901D", fechaContratacion:"2022-05-20", puesto:"Cocinera",     gruposLibranza:["G2B"]             },
  { id:5, nombre:"Pedro Sánchez Ruiz",   email:"pedro@empresa.com",  telefono:"",               sede:"Madrid Centro", grupo:"G3A", rol:"EMPLEADO",    estado:"activo",     negocio:"Restaurante", dni:"56789012E", fechaContratacion:"2023-02-01", puesto:"Ayudante",     gruposLibranza:["G3A","G1A"]       },
  { id:6, nombre:"Laura Torres Vega",    email:"laura@empresa.com",  telefono:"+34 655 567 890", sede:"Vallecas",      grupo:"G3B", rol:"EMPLEADO",    estado:"baja",       negocio:"Bar",         dni:"67890123F", fechaContratacion:"2021-11-15", puesto:"Barista",      gruposLibranza:["G3B"]             },
]

// ── Paleta de grupos ──────────────────────────────────────────
const grupoColor: Record<string,string> = {
  G1A:'#6366f1', G1B:'#4f46e5', G2A:'#0891b2',
  G2B:'#0e7490', G3A:'#6366f1', G3B:'#4f46e5',
}

// ── Estado badge ──────────────────────────────────────────────
const estadoStyle: Record<string,{ bg:string, color:string, label:string }> = {
  activo:     { bg:'#dcfce7', color:'#15803d', label:'Activo'     },
  vacaciones: { bg:'#fef9c3', color:'#854d0e', label:'Vacaciones' },
  baja:       { bg:'#fee2e2', color:'#b91c1c', label:'Baja'       },
}

// ── Rol badge ─────────────────────────────────────────────────
const rolStyle: Record<string,{ bg:string, color:string, label:string }> = {
  EMPLEADO:   { bg:'#f1f5f9', color:'#475569', label:'Empleado'    },
  ADMIN_SEDE: { bg:'#dbeafe', color:'#1d4ed8', label:'Admin Sede'  },
  SUPER_ADMIN:{ bg:'#fce7f3', color:'#9d174d', label:'Super Admin' },
}

// ── Avatar iniciales ──────────────────────────────────────────
function Avatar({ nombre, size = 36 }: { nombre: string, size?: number }) {
  const initials = nombre.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
  const colors   = ['#6366f1','#4f46e5','#6366f1','#0891b2','#d97706','#16a34a']
  const color    = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:4, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', fontSize:size*0.36, fontWeight:700, letterSpacing:0.5 }}>
      {initials}
    </div>
  )
}

// ── Iconos SVG ────────────────────────────────────────────────
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const EditIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const TrashIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const EyeIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>

// ── Modal ficha empleado ──────────────────────────────────────
function FichaEmpleado({ emp, onClose }: { emp: Empleado, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'datos'|'contrato'|'historial'>('datos')

  const tabs = [
    { key:'datos',    label:'Datos personales' },
    { key:'contrato', label:'Contrato'          },
    { key:'historial',label:'Historial'         },
  ] as const

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:640, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
          {/* Foto / Avatar grande */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:64, height:64, borderRadius:6, background:'var(--surface-2)', border:'2px dashed var(--border-strong)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden' }}>
              <Avatar nombre={emp.nombre} size={64} />
            </div>
            <div style={{ position:'absolute', bottom:-4, right:-4, width:20, height:20, background:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid var(--surface)' }}>
              <UploadIcon />
            </div>
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.nombre}</h2>
            <div style={{ display:'flex', gap:6, marginTop:4, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#fff', background:grupoColor[emp.grupo], borderRadius:3, padding:'2px 8px' }}>{emp.grupo}</span>
              <span style={{ fontSize:11, fontWeight:600, color:rolStyle[emp.rol]?.color, background:rolStyle[emp.rol]?.bg, borderRadius:3, padding:'2px 8px' }}>{rolStyle[emp.rol]?.label}</span>
              <span style={{ fontSize:11, fontWeight:600, color:estadoStyle[emp.estado]?.color, background:estadoStyle[emp.estado]?.bg, borderRadius:3, padding:'2px 8px' }}>{estadoStyle[emp.estado]?.label}</span>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 20px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              style={{ padding:'10px 16px', fontSize:12, fontWeight:600, borderBottom:`2px solid ${activeTab===t.key?'var(--accent)':'transparent'}`, color:activeTab===t.key?'var(--accent)':'var(--text-muted)', background:'transparent', transition:'all .15s', marginBottom:-1 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>

          {activeTab === 'datos' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Foto upload area */}
              <div style={{ background:'var(--surface-2)', border:'2px dashed var(--border-strong)', borderRadius:6, padding:20, display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer' }}>
                <UploadIcon />
                <p style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)' }}>Subir foto de empleado</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>JPG, PNG o WebP · Máx. 2MB</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { label:'Nombre completo', value:emp.nombre,           full:true  },
                  { label:'Email',           value:emp.email,            full:true  },
                  { label:'Teléfono',        value:emp.telefono||'—'                },
                  { label:'DNI/NIE',         value:emp.dni||'—'                     },
                  { label:'Sede',            value:emp.sede                         },
                  { label:'Puesto',          value:emp.puesto||'—'                  },
                  { label:'Negocio',         value:emp.negocio                      },
                ].map(f => (
                  <div key={f.label} style={{ gridColumn: f.full?'1 / -1':'auto' }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>{f.label}</label>
                    <input className="input-base text-sm" defaultValue={f.value} />
                  </div>
                ))}
              </div>

              {/* Grupos de libranza */}
              <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4, padding:'12px 14px' }}>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:10 }}>Grupos de libranza asignados</p>
                {emp.gruposLibranza && emp.gruposLibranza.length > 0 ? (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {emp.gruposLibranza.map(g => (
                      <div key={g} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', background:'var(--surface)', border:`1px solid ${grupoColor[g]||'var(--border)'}`, borderRadius:4 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:grupoColor[g]||'#888', flexShrink:0 }} />
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{g}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>Sin grupos de libranza asignados</p>
                )}
                <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:8 }}>
                  Los grupos de libranza determinan los días de descanso de este empleado en el calendario.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'contrato' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Fecha contratación', value:emp.fechaContratacion||'—', type:'date' },
                { label:'Tipo de contrato',   value:'Indefinido',               type:'select', opts:['Indefinido','Temporal','Prácticas','Obra y servicio'] },
                { label:'Jornada',            value:'Completa',                 type:'select', opts:['Completa','Parcial 50%','Parcial 75%'] },
                { label:'Categoría profesional', value:'Nivel II',              type:'select', opts:['Nivel I','Nivel II','Nivel III','Nivel IV'] },
                { label:'Salario bruto anual', value:'22.000',                  type:'number' },
                { label:'Número de empleado',  value:`EMP-00${emp.id}`,        type:'text' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>{f.label}</label>
                  {f.type==='select'
                    ? <select className="input-base text-sm"><option>{f.value}</option>{f.opts?.filter(o=>o!==f.value).map(o=><option key={o}>{o}</option>)}</select>
                    : <input type={f.type} className="input-base text-sm" defaultValue={f.value} />
                  }
                </div>
              ))}
            </div>
          )}

          {activeTab === 'historial' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { accion:'Vacaciones aprobadas — 22 días',    fecha:'15/01/2026', tipo:'success' },
                { accion:'Cambio de turno G1A → G2A',         fecha:'03/12/2025', tipo:'info'    },
                { accion:'Actualización de datos personales',  fecha:'20/09/2025', tipo:'neutral' },
                { accion:'Baja médica IT — 3 días',           fecha:'07/08/2025', tipo:'warning' },
                { accion:'Contratación — inicio actividad',   fecha:'15/03/2021', tipo:'success' },
              ].map((h,i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 12px', background:'var(--surface-2)', borderRadius:4, border:'1px solid var(--border)' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background: h.tipo==='success'?'#16a34a':h.tipo==='info'?'#6366f1':h.tipo==='warning'?'#d97706':'#94a3b8', flexShrink:0, marginTop:4 }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)' }}>{h.accion}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{h.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
          <button onClick={onClose} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
          <button className="btn-primary flex-1 py-2 text-sm">Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function EmpleadosDesktop() {
  const [search,    setSearch]    = useState('')
  const [filterSede,setFilterSede]= useState('todas')
  const [filterGrupo,setFilterGrupo]=useState('todos')
  const [filterEstado,setFilterEstado]=useState('todos')
  const [fichaEmp,  setFichaEmp]  = useState<Empleado|null>(null)
  const [showNuevo, setShowNuevo] = useState(false)

  const lista = empleadosData.filter(e => {
    const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
    const matchSede   = filterSede   ==='todas' || e.sede.toLowerCase().includes(filterSede)
    const matchGrupo  = filterGrupo  ==='todos' || e.grupo===filterGrupo
    const matchEstado = filterEstado ==='todos' || e.estado===filterEstado
    return matchSearch && matchSede && matchGrupo && matchEstado
  })

  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total empleados', value:empleadosData.length,                                    color:'#6366f1' },
          { label:'Activos',         value:empleadosData.filter(e=>e.estado==='activo').length,     color:'#16a34a' },
          { label:'Vacaciones',      value:empleadosData.filter(e=>e.estado==='vacaciones').length, color:'#d97706' },
          { label:'De baja',         value:empleadosData.filter(e=>e.estado==='baja').length,       color:'#b91c1c' },
        ].map((k,i) => {
          const [hov, setHov] = useState(false)
          return (
            <div key={i} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
              style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'16px 20px', borderLeft:`3px solid ${k.color}`,
                boxShadow:hov?'var(--shadow-lg)':'var(--shadow-sm)', transform:hov?'scale(1.03) translateY(-2px)':'scale(1)', transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease' }}>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>{k.label}</p>
              <p style={{ fontSize:28, fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</p>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'14px 16px', boxShadow:'var(--shadow-sm)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        {/* Búsqueda */}
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}><SearchIcon/></span>
          <input className="input-base text-sm" style={{ paddingLeft:32 }} placeholder="Buscar por nombre o email..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        <select className="input-base text-sm w-auto" value={filterSede} onChange={e=>setFilterSede(e.target.value)}>
          <option value="todas">Todas las sedes</option>
          <option value="madrid">Madrid Centro</option>
          <option value="vallecas">Vallecas</option>
        </select>

        <select className="input-base text-sm w-auto" value={filterGrupo} onChange={e=>setFilterGrupo(e.target.value)}>
          <option value="todos">Todos los grupos</option>
          {Object.keys(grupoColor).map(g=><option key={g} value={g}>{g}</option>)}
        </select>

        <select className="input-base text-sm w-auto" value={filterEstado} onChange={e=>setFilterEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="vacaciones">Vacaciones</option>
          <option value="baja">Baja</option>
        </select>

        <button onClick={()=>setShowNuevo(true)} className="btn-primary text-sm px-4 py-2 whitespace-nowrap">+ Nuevo empleado</button>
      </div>

      {/* Tabla */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Empleados</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{lista.length} resultado{lista.length!==1?'s':''}</p>
          </div>
          <button className="btn-secondary text-xs px-3 py-1.5">Exportar</button>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface-2)' }}>
                {['Empleado','Grupo','Sede','Rol','Teléfono','Estado','Acciones'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((emp) => {
                const [rowHov, setRowHov] = useState(false)
                const es = estadoStyle[emp.estado]
                const rs = rolStyle[emp.rol]
                return (
                  <tr key={emp.id} onMouseEnter={()=>setRowHov(true)} onMouseLeave={()=>setRowHov(false)}
                    style={{ background:rowHov?'var(--surface-2)':'transparent', transition:'background .15s', borderBottom:'1px solid var(--border)', cursor:'default' }}>

                    {/* Empleado */}
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar nombre={emp.nombre} size={32} />
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{emp.nombre}</p>
                          <p style={{ fontSize:11, color:'var(--text-muted)' }}>{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Grupo */}
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:grupoColor[emp.grupo], borderRadius:3, padding:'2px 8px' }}>{emp.grupo}</span>
                    </td>

                    {/* Sede */}
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{emp.sede}</td>

                    {/* Rol */}
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:rs?.color, background:rs?.bg, borderRadius:3, padding:'2px 8px' }}>{rs?.label}</span>
                    </td>

                    {/* Teléfono */}
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                      {emp.telefono || <span style={{ color:'var(--text-muted)', fontStyle:'italic' }}>Sin teléfono</span>}
                    </td>

                    {/* Estado */}
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:es?.color, background:es?.bg, borderRadius:3, padding:'2px 8px' }}>{es?.label}</span>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={()=>setFichaEmp(emp)} title="Ver ficha"
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:4, background:'var(--surface-2)', border:'1px solid var(--border-strong)', color:'var(--text-secondary)', cursor:'pointer', transition:'all .15s' }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--accent)';(e.currentTarget as HTMLElement).style.color='var(--accent)'}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border-strong)';(e.currentTarget as HTMLElement).style.color='var(--text-secondary)'}}>
                          <EyeIcon/>
                        </button>
                        <button onClick={()=>setFichaEmp(emp)} title="Editar"
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:4, background:'var(--surface-2)', border:'1px solid var(--border-strong)', color:'var(--text-secondary)', cursor:'pointer', transition:'all .15s' }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--accent)';(e.currentTarget as HTMLElement).style.color='var(--accent)'}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border-strong)';(e.currentTarget as HTMLElement).style.color='var(--text-secondary)'}}>
                          <EditIcon/>
                        </button>
                        <button title="Eliminar"
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:4, background:'var(--surface-2)', border:'1px solid var(--border-strong)', color:'var(--text-secondary)', cursor:'pointer', transition:'all .15s' }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#b91c1c';(e.currentTarget as HTMLElement).style.color='#b91c1c'}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border-strong)';(e.currentTarget as HTMLElement).style.color='var(--text-secondary)'}}>
                          <TrashIcon/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Mostrando {lista.length} de 68 empleados</span>
          <div style={{ display:'flex', gap:4 }}>
            {['←','1','2','3','→'].map((p,i)=>(
              <button key={i} style={{ width:30, height:30, borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
                background: p==='1'?'var(--accent)':'var(--surface-2)',
                color:      p==='1'?'#fff':'var(--text-secondary)',
                border:     `1px solid ${p==='1'?'var(--accent)':'var(--border-strong)'}` }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ficha empleado modal */}
      {fichaEmp && <FichaEmpleado emp={fichaEmp} onClose={()=>setFichaEmp(null)} />}

      {/* Modal nuevo empleado */}
      {showNuevo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowNuevo(false) }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:520 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Nuevo empleado</p>
              <button onClick={()=>setShowNuevo(false)} className="btn-secondary w-8 h-8 flex items-center justify-center text-sm">✕</button>
            </div>
            <div style={{ padding:20 }} className="space-y-4">
              {[
                { label:'Nombre completo', type:'text',  placeholder:'Nombre y apellidos' },
                { label:'Email',           type:'email', placeholder:'correo@empresa.com'  },
                { label:'Teléfono',        type:'tel',   placeholder:'+34 600 000 000'     },
                { label:'DNI/NIE',         type:'text',  placeholder:'12345678A'            },
              ].map(f=>(
                <div key={f.label}>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="input-base text-sm" />
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Grupo</label>
                  <select className="input-base text-sm">
                    {Object.keys(grupoColor).map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Sede</label>
                  <select className="input-base text-sm">
                    <option>Madrid Centro</option>
                    <option>Vallecas</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, paddingTop:8 }}>
                <button onClick={()=>setShowNuevo(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button className="btn-primary flex-1 py-2 text-sm">Crear empleado</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

