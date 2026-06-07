"use client"
import { useState, useEffect } from "react"

const grupoColors: Record<string, { bg: string; color: string; border: string }> = {
  G1A: { bg: '#ede9fe', color: '#6366f1', border: '#c4b5fd' },
  G1B: { bg: '#e0e7ff', color: '#4f46e5', border: '#a5b4fc' },
  G2A: { bg: '#e0f2fe', color: '#0891b2', border: '#7dd3fc' },
  G2B: { bg: '#cffafe', color: '#0e7490', border: '#67e8f9' },
  G3A: { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
  G3B: { bg: '#d1fae5', color: '#15803d', border: '#6ee7b7' },
  L1:  { bg: '#fef9c3', color: '#d97706', border: '#fde68a' },
  L2:  { bg: '#fef3c7', color: '#ca8a04', border: '#fcd34d' },
  L3:  { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
}

const GRUPOS_BASE = ['G1A','G1B','G2A','G2B','G3A','G3B','L1','L2','L3']

export default function GruposDesktop() {
  const [grupos, setGrupos] = useState<any[]>([])
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/empleados?empresaId=empresa-001").then(r => r.json()),
    ]).then(([emps]) => {
      const empsArr = Array.isArray(emps) ? emps : []
      setEmpleados(empsArr)
      const gruposData = GRUPOS_BASE.map(g => ({
        nombre: g,
        empleados: empsArr.filter((e: any) => e.grupo === g || e.grupoTrabajo === g),
        ...grupoColors[g]
      }))
      setGrupos(gruposData)
      setLoading(false)
    })
  }, [])

  const grupoActual = grupos.find(g => g.nombre === grupoSeleccionado)
  const empleadosFiltrados = grupoActual?.empleados.filter((e: any) =>
    `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  ) || []

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Cargando grupos...</div>

  return (
    <div style={{ padding: 0, maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1e1b4b', margin: 0 }}>Grupos de trabajo</h1>
        <p style={{ fontSize: 13, color: '#a0aec0', marginTop: 4 }}>Gestiona los grupos y consulta los empleados asignados a cada uno</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total grupos', valor: GRUPOS_BASE.length, color: '#6366f1', bg: '#ede9fe' },
          { label: 'Total empleados', valor: empleados.length, color: '#059669', bg: '#d1fae5' },
          { label: 'Grupos con empleados', valor: grupos.filter(g => g.empleados.length > 0).length, color: '#d97706', bg: '#fef9c3' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: k.color, fontWeight: 500 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.valor}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: grupoSeleccionado ? '280px 1fr' : '1fr', gap: 16 }}>

        {/* Grid de grupos */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: grupoSeleccionado ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
            {grupos.map(g => (
              <div key={g.nombre} onClick={() => setGrupoSeleccionado(grupoSeleccionado === g.nombre ? null : g.nombre)}
                style={{ background: grupoSeleccionado === g.nombre ? g.color : '#fff', border: `1.5px solid ${grupoSeleccionado === g.nombre ? g.color : g.border}`, borderRadius: 14, padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (grupoSeleccionado !== g.nombre) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: grupoSeleccionado ? 0 : 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: grupoSeleccionado === g.nombre ? '#fff' : g.color }}>{g.nombre}</div>
                  <span style={{ background: grupoSeleccionado === g.nombre ? 'rgba(255,255,255,0.2)' : g.bg, color: grupoSeleccionado === g.nombre ? '#fff' : g.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                    {g.empleados.length} emp.
                  </span>
                </div>
                {!grupoSeleccionado && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {g.empleados.slice(0, 4).map((e: any, i: number) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: g.bg, border: `1px solid ${g.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: g.color }}>
                        {e.nombre?.[0]}{e.apellidos?.[0]}
                      </div>
                    ))}
                    {g.empleados.length > 4 && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: g.bg, border: `1px solid ${g.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: g.color }}>
                        +{g.empleados.length - 4}
                      </div>
                    )}
                    {g.empleados.length === 0 && (
                      <div style={{ fontSize: 11, color: '#a0aec0' }}>Sin empleados asignados</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panel detalle grupo */}
        {grupoSeleccionado && grupoActual && (
          <div style={{ background: '#fff', border: '0.5px solid #e8eaf0', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '0.5px solid #e8eaf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: grupoActual.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: grupoActual.color, border: `1px solid ${grupoActual.border}` }}>
                  {grupoActual.nombre}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b' }}>Grupo {grupoActual.nombre}</div>
                  <div style={{ fontSize: 12, color: '#a0aec0' }}>{grupoActual.empleados.length} empleados asignados</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar empleado..."
                  style={{ padding: '7px 12px', border: '0.5px solid #e8eaf0', borderRadius: 8, fontSize: 13, outline: 'none', width: 180 }} />
                <button onClick={() => setGrupoSeleccionado(null)}
                  style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
                  Cerrar
                </button>
              </div>
            </div>

            {empleadosFiltrados.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#a0aec0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Sin empleados asignados a este grupo</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Asigna empleados desde el perfil de cada empleado</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9ff' }}>
                    {['Nº Emp.', 'Nombre', 'Apellidos', 'DNI', 'Sede', 'Rol'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#718096', borderBottom: '0.5px solid #e8eaf0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empleadosFiltrados.map((e: any, i: number) => (
                    <tr key={e.id} style={{ borderBottom: '0.5px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#718096' }}>{e.numeroEmpleado || e.numeroempleado || '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: grupoActual.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: grupoActual.color, flexShrink: 0 }}>
                            {e.nombre?.[0]}{e.apellidos?.[0]}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#1e1b4b' }}>{e.nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.apellidos}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#718096' }}>{e.dni || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12 }}>{e.sede || e.ubicacion || '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ background: grupoActual.bg, color: grupoActual.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, border: `0.5px solid ${grupoActual.border}` }}>
                          {e.rol || 'EMPLEADO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
