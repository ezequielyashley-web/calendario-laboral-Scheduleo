"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/providers/ThemeProvider"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { useNotifications } from "@/components/providers/NotificationProvider"

const Icons = {
  dashboard:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  empleados:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  calendario:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  notificaciones: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  reportes:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  vacaciones:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3a3 3 0 0 0-3 3l-7 3a3 3 0 0 0 0 6l7 3a3 3 0 1 0 3-3l-7-3 7-3A3 3 0 0 0 18 3z"/></svg>,
  grupos:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="17" cy="11" r="3"/><path d="M21 21v-1a3 3 0 0 0-3-3h-2"/></svg>,
  fichajes:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  cambiosTurno:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  bajas:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  chat:           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  deudas:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  cobertura:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  configuracion:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  sun:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  auto: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none"/></svg>,
}

function ClimaWidget() {
  const [hora, setHora] = useState('')
  const [fecha, setFecha] = useState('')
  const [temp, setTemp] = useState<number|null>(null)
  const [ciudad, setCiudad] = useState('')
  const [icono, setIcono] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setHora(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
      setFecha(now.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }))
    }
    tick()
    const iv = setInterval(tick, 1000)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&current=temperature_2m,weathercode&timezone=auto')
          const d = await r.json()
          setTemp(Math.round(d.current.temperature_2m))
          const code = d.current.weathercode
          setIcono(code===0?'☀️':code<=3?'⛅':code<=48?'🌫️':code<=67?'🌧️':code<=77?'❄️':'⛈️')
          const g = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + latitude + '&lon=' + longitude + '&format=json')
          const gd = await g.json()
          setCiudad(gd.address?.city||gd.address?.town||gd.address?.village||'')
        } catch(e){}
      }, ()=>{})
    }
    return () => clearInterval(iv)
  }, [])
  return (
    <div style={{ margin:'8px', padding:'10px 12px', background:'rgba(255,255,255,0.07)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ color:'#fff', fontSize:20, fontWeight:700, lineHeight:1 }}>{hora}</div>
          <div style={{ color:'rgba(255,255,255,0.45)', fontSize:10, marginTop:2, textTransform:'capitalize' }}>{fecha}</div>
          {ciudad && <div style={{ color:'rgba(255,255,255,0.3)', fontSize:9, marginTop:1 }}>📍 {ciudad}</div>}
        </div>
        {temp !== null && (
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:22 }}>{icono}</div>
            <div style={{ color:'#fff', fontSize:16, fontWeight:700 }}>{temp}°C</div>
          </div>
        )}
      </div>
    </div>
  )
}

function LogoAnimado({ accentColor }: { accentColor: string }) {
  const [hover, setHover] = useState(false)
  const dur = hover ? '1s' : '3s'
  const ampC = hover ? '-3px' : '-1.5px'
  const ampS = hover ? '-2px' : '-1px'
  const keyframes = `
    @keyframes lfC${hover?'H':''} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(${ampC})} }
    @keyframes lfL${hover?'H':''} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(${ampS})} }
    @keyframes lfR${hover?'H':''} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(${ampS})} }
    @keyframes lfP { 0%,100%{opacity:0.08} 50%{opacity:0.2} }
  `
  const animC = `lfC${hover?'H':''} ${dur} ease-in-out infinite`
  const animL = `lfL${hover?'H':''} ${dur} ease-in-out infinite 0.8s`
  const animR = `lfR${hover?'H':''} ${dur} ease-in-out infinite 1.6s`
  const animP = `lfP 3s ease-in-out infinite`
  return (
    <div style={{ flexShrink:0, width:54, height:54, position:'relative', cursor:'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <style>{keyframes}</style>
      <svg width="54" height="54" viewBox="0 0 48 48" fill="none" style={{ position:'absolute', top:0, left:0 }}>
        <rect width="48" height="48" rx="12" fill={accentColor}/>
        <rect x="1.5" y="1.5" width="45" height="45" rx="11" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        <rect x="10" y="10" width="28" height="28" rx="6" fill="rgba(255,255,255,0.1)" style={{ animation: animP }}/>
      </svg>
      <svg width="54" height="54" viewBox="0 0 48 48" fill="none" style={{ position:'absolute', top:0, left:0, animation: animC }}>
        <circle cx="24" cy="16" r="5" fill="white"/>
        <path d="M14 34C14 29 18.5 26 24 26C29.5 26 34 29 34 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
      <svg width="54" height="54" viewBox="0 0 48 48" fill="none" style={{ position:'absolute', top:0, left:0, animation: animL }}>
        <circle cx="14" cy="20" r="3.5" fill="rgba(255,255,255,0.6)"/>
        <path d="M7 32C7 28.5 10 27 14 27" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
      <svg width="54" height="54" viewBox="0 0 48 48" fill="none" style={{ position:'absolute', top:0, left:0, animation: animR }}>
        <circle cx="34" cy="20" r="3.5" fill="rgba(255,255,255,0.6)"/>
        <path d="M41 32C41 28.5 38 27 34 27" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    </div>
  )
}

const menuSections = [
  { label: 'Principal', items: [
    { href: '/dashboard',         icon: Icons.dashboard,      label: 'Dashboard'      },
    { href: '/empleados',         icon: Icons.empleados,      label: 'Empleados'      },
    { href: '/calendario-global', icon: Icons.calendario,     label: 'Calendario'     },
    { href: '/fichajes',          icon: Icons.fichajes,       label: 'Fichajes'       },
    { href: '/grupos',            icon: Icons.grupos,         label: 'Grupos'         },
    { href: '/libranzas',         icon: Icons.grupos,         label: 'Libranzas'      },
  ]},
  { label: 'Gestión', items: [
    { href: '/vacaciones',        icon: Icons.vacaciones,     label: 'Vacaciones'     },
    { href: '/cambios-turno',     icon: Icons.cambiosTurno,   label: 'Cambios turno'  },
    { href: '/bajas',             icon: Icons.bajas,          label: 'Bajas médicas'  },
    { href: '/chat',              icon: Icons.chat,           label: 'Chat'           },
    { href: '/notificaciones',    icon: Icons.notificaciones, label: 'Notificaciones' },
    { href: '/deudas',            icon: Icons.deudas,         label: 'Deudas'         },
  ]},
  { label: 'Sistema', items: [
    { href: '/reportes',          icon: Icons.reportes,       label: 'Reportes'       },
    { href: '/cobertura',         icon: Icons.cobertura,      label: 'Cobertura'      },
    { href: '/configuracion',     icon: Icons.configuracion,  label: 'Configuración'  },
  ]},
]

const pageTitles: Record<string, string> = {
  '/dashboard':         'Dashboard',
  '/empleados':         'Empleados',
  '/calendario-global': 'Calendario Global',
  '/notificaciones':    'Notificaciones',
  '/reportes':          'Reportes',
  '/vacaciones':        'Vacaciones',
  '/fichajes':          'Fichajes',
  '/grupos':            'Grupos',
  '/cambios-turno':     'Cambios de Turno',
  '/bajas':             'Bajas Médicas',
  '/chat':              'Chat',
  '/deudas':            'Deudas y Anticipos',
  '/cobertura':         'Cobertura Mínima',
  '/configuracion':     'Configuración',
}

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { noLeidas } = useNotifications()
  const { suscrito, soportado, suscribirse } = usePushNotifications()
  const [empresa, setEmpresa] = useState<{ nombre?: string; logo?: string; colorSidebar?: string; colorAccent?: string } | null>(null)
  const [cerrandoSesion, setCerrandoSesion] = useState(false)

  useEffect(() => {
    fetch("/api/empresa").then(r => r.json()).then(data => setEmpresa(data)).catch(() => {})
  }, [])

  const handleSignOut = async () => {
    setCerrandoSesion(true)
    await new Promise(r => setTimeout(r, 5500))
    await signOut({ callbackUrl: '/login' })
  }

  const sidebarBg = empresa?.colorSidebar || '#2d2b55'
  const accentColor = empresa?.colorAccent || '#6366f1'
  const empresaNombre = empresa?.nombre || 'Mi Empresa'
  const empresaLogo = empresa?.logo || null

  return (
    <div className="flex h-screen overflow-hidden" style={{ '--sidebar-bg': sidebarBg, '--accent': accentColor } as React.CSSProperties}>
      <style>{`
        :root { --sidebar-text: rgba(255,255,255,0.82); --sidebar-text-muted: rgba(255,255,255,0.4); --sidebar-hover: rgba(255,255,255,0.07); --sidebar-active: rgba(255,255,255,0.13); }
        .nav-item { display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:6px; text-decoration:none; font-size:13px; font-weight:400; color:var(--sidebar-text); transition:background 0.15s; cursor:pointer; }
        .nav-item:hover { background:var(--sidebar-hover); }
        .nav-item.active { background:var(--sidebar-active); font-weight:500; }
        .nav-label { white-space:nowrap; overflow:hidden; transition:opacity 0.2s, width 0.2s; }
      `}</style>

      <aside style={{ width: open ? 200 : 52, background: sidebarBg, display:'flex', flexDirection:'column', flexShrink:0, transition:'width 0.2s', overflow:'hidden', borderRight:'1px solid rgba(255,255,255,0.06)' }}>

        {/* Nombre empresa */}
        <div style={{ padding: open ? '18px 14px 12px' : '18px 0 12px', display:'flex', alignItems:'center', gap:10, justifyContent: open ? 'flex-start' : 'center', flexShrink:0 }}>
          {empresaLogo ? (
            <img src={empresaLogo} alt="logo" style={{ width:28, height:28, borderRadius:6, objectFit:'cover', flexShrink:0 }} />
          ) : (
            <div style={{ width:28, height:28, borderRadius:6, background: accentColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700, flexShrink:0 }}>
              {empresaNombre[0]?.toUpperCase()}
            </div>
          )}
          {open && (
            <span style={{ color:'#fff', fontWeight:600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {empresaNombre}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'0 8px', scrollbarWidth:'none' }}>
          {menuSections.map(section => (
            <div key={section.label} style={{ marginBottom:16 }}>
              {open && (
                <div style={{ fontSize:10, fontWeight:600, color:'var(--sidebar-text-muted)', letterSpacing:'0.08em', padding:'0 6px', marginBottom:4, textTransform:'uppercase' }}>
                  {section.label}
                </div>
              )}
              {section.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href}
                    className={`nav-item${isActive ? ' active' : ''}`}
                    style={{ justifyContent: open ? 'flex-start' : 'center', color: 'var(--sidebar-text)' }}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span style={{ flexShrink:0, opacity: isActive ? 1 : 0.75 }}>{item.icon}</span>
                    {open && <span className="nav-label">{item.label}</span>}
                    {item.href === '/notificaciones' && noLeidas > 0 && (
                      <span style={{ marginLeft:'auto', background:'#dc2626', color:'#fff', borderRadius:'50%', fontSize:10, fontWeight:700, minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
                        {noLeidas > 9 ? '9+' : noLeidas}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* CLIMA WIDGET */}
        {open && <ClimaWidget />}

        {/* LOGO FULL — logo Scheduleo + nombre + version */}
        {open && (
          <div style={{ padding:'16px 14px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <LogoAnimado accentColor={accentColor} />
              <div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:17, letterSpacing:'-0.3px', lineHeight:1.1 }}>Scheduleo</div>
                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:3 }}>v2.0</div>
              </div>
            </div>
          </div>
        )}
        {!open && (
          <div style={{ padding:'12px 0', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'center' }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill={accentColor}/>
              <rect x="1.5" y="1.5" width="45" height="45" rx="11" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <circle cx="24" cy="16" r="5" fill="white"/>
              <path d="M14 34C14 29 18.5 26 24 26C29.5 26 34 29 34 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <circle cx="14" cy="20" r="3.5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="34" cy="20" r="3.5" fill="rgba(255,255,255,0.6)"/>
            </svg>
          </div>
        )}

        {/* BOTON CERRAR SESION */}
        {open && (
          <div style={{ padding:'0 10px 10px' }}>
            <button onClick={handleSignOut}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:400, cursor:'pointer', transition:'all 0.25s', letterSpacing:'0.01em' }}
              onMouseEnter={e => {
                e.currentTarget.style.background='rgba(255,255,255,0.1)'
                e.currentTarget.style.color='rgba(255,255,255,0.9)'
                e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background='rgba(255,255,255,0.05)'
                e.currentTarget.style.color='rgba(255,255,255,0.55)'
                e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.7 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Cerrar sesion</span>
            </button>
          </div>
        )}
        {!open && (
          <div style={{ padding:'0 8px 10px', display:'flex', justifyContent:'center' }}>
            <button onClick={handleSignOut} title="Cerrar sesion"
              style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.5)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        )}

        {/* Collapse btn */}
        <div style={{ padding:'8px', flexShrink:0 }}>
          <button onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-full py-1.5 transition-colors duration-150"
            style={{ borderRadius:4, color:'var(--sidebar-text)', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {open ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
            </svg>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-6 flex-shrink-0"
          style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
          <h1 className="text-base font-semibold tracking-tight" style={{ color:'var(--text-primary)' }}>
            {pageTitles[pathname] ?? empresaNombre}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-0.5" style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:4 }}>
              {([{ value:'light' as const, icon:Icons.sun, title:'Claro' },{ value:'auto' as const, icon:Icons.auto, title:'Auto' },{ value:'dark' as const, icon:Icons.moon, title:'Oscuro' }]).map(m => (
                <button key={m.value} onClick={() => setTheme(m.value)} title={m.title}
                  className="flex items-center justify-center w-7 h-6 transition-colors duration-150"
                  style={{ borderRadius:3, background:theme === m.value ? accentColor : 'transparent', color:theme === m.value ? '#fff' : 'var(--text-muted)' }}>
                  {m.icon}
                </button>
              ))}
            </div>
            {soportado && !suscrito && (
              <button onClick={suscribirse} title="Activar notificaciones push"
                className="flex items-center justify-center w-8 h-8 transition-colors duration-150"
                style={{ borderRadius:4, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text-muted)', cursor:'pointer' }}>
                🔔
              </button>
            )}
            {suscrito && (
              <div title="Notificaciones activadas"
                className="flex items-center justify-center w-8 h-8"
                style={{ borderRadius:4, background:'#dcfce7', border:'1px solid #86efac', fontSize:14 }}>
                🔔
              </div>
            )}
            <div className="flex items-center justify-center w-8 h-8 text-white font-bold text-xs cursor-pointer flex-shrink-0"
              style={{ background:accentColor, borderRadius:4 }}>
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6" style={{ background:'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}