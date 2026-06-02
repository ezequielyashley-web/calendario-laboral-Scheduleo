"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/providers/ThemeProvider"
import NotificationBell from "@/components/NotificationBell"

const Icons = {
  dashboard:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  empleados:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  calendario:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  notificaciones: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  reportes:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  vacaciones:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3a3 3 0 0 0-3 3l-7 3a3 3 0 0 0 0 6l7 3a3 3 0 1 0 3-3l-7-3 7-3A3 3 0 0 0 18 3z"/></svg>,
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

// ── Secciones del menú ────────────────────────────────────────
const menuSections = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard',         icon: Icons.dashboard,      label: 'Dashboard'      },
      { href: '/empleados',         icon: Icons.empleados,      label: 'Empleados'      },
      { href: '/calendario-global', icon: Icons.calendario,     label: 'Calendario'     },
      { href: '/fichajes',          icon: Icons.fichajes,       label: 'Fichajes'       },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { href: '/vacaciones',        icon: Icons.vacaciones,     label: 'Vacaciones'     },
      { href: '/cambios-turno',     icon: Icons.cambiosTurno,   label: 'Cambios turno'  },
      { href: '/bajas',             icon: Icons.bajas,          label: 'Bajas médicas'  },
      { href: '/chat',              icon: Icons.chat,           label: 'Chat'           },
      { href: '/deudas',            icon: Icons.deudas,         label: 'Deudas'         },
      { href: '/cobertura',         icon: Icons.cobertura,      label: 'Cobertura'      },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { href: '/reportes',          icon: Icons.reportes,       label: 'Reportes'       },
      { href: '/notificaciones',    icon: Icons.notificaciones, label: 'Notificaciones' },
      { href: '/configuracion',     icon: Icons.configuracion,  label: 'Configuración'  },
    ]
  },
]

const pageTitles: Record<string, string> = {
  '/dashboard':         'Dashboard',
  '/empleados':         'Empleados',
  '/calendario-global': 'Calendario Global',
  '/notificaciones':    'Notificaciones',
  '/reportes':          'Reportes',
  '/vacaciones':        'Vacaciones',
  '/fichajes':          'Fichajes',
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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 transition-all duration-200 overflow-hidden"
        style={{ width: open ? 220 : 56, background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(255,255,255,.06)' }}>

        {/* Logo */}
        <div className="flex items-center h-14 px-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div className="flex items-center justify-center w-7 h-7 flex-shrink-0" style={{ background: 'var(--accent)', borderRadius: 4 }}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {open && (
            <span className="ml-2.5 font-semibold text-sm tracking-wide whitespace-nowrap overflow-hidden" style={{ color: 'var(--sidebar-active)' }}>
              Scheduleo
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {menuSections.map((section, si) => (
            <div key={si} style={{ marginBottom: 8 }}>
              {/* Etiqueta de sección — solo visible cuando el sidebar está abierto */}
              {open && (
                <p style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.5)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'6px 8px 4px' }}>
                  {section.label}
                </p>
              )}
              {!open && si > 0 && (
                <div style={{ height:1, background:'rgba(255,255,255,.06)', margin:'6px 4px' }} />
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {section.items.map((item) => {
                  const active  = pathname === item.href
                  const hovered = hoveredItem === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!open ? item.label : undefined}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 8px', borderRadius: 4,
                        color:      active ? 'var(--sidebar-active)' : hovered ? '#e2e8f0' : 'var(--sidebar-text)',
                        background: active ? 'var(--sidebar-active-bg)' : hovered ? 'rgba(255,255,255,.08)' : 'transparent',
                        transform:  hovered && !active ? 'scale(1.04) translateX(2px)' : 'scale(1) translateX(0)',
                        transition: 'transform .15s cubic-bezier(.34,1.56,.64,1), background .15s ease, color .15s ease',
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
                      }}
                    >
                      <span style={{ flexShrink:0, opacity: active?1:hovered?1:0.65, transform: hovered&&!active?'scale(1.15)':'scale(1)', transition:'transform .15s cubic-bezier(.34,1.56,.64,1), opacity .15s ease', display:'flex' }}>
                        {item.icon}
                      </span>
                      {open && <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse */}
        <div className="px-2 pb-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12 }}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-full py-1.5 transition-colors duration-150"
            style={{ borderRadius: 4, color: 'var(--sidebar-text)', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {open ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between h-14 px-6 flex-shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {pageTitles[pathname] ?? 'Scheduleo'}
          </h1>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <div className="flex items-center gap-0.5 p-0.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4 }}>
              {([{ value: 'light' as const, icon: Icons.sun, title: 'Claro' },{ value: 'auto' as const, icon: Icons.auto, title: 'Auto' },{ value: 'dark' as const, icon: Icons.moon, title: 'Oscuro' }]).map(m => (
                <button key={m.value} onClick={() => setTheme(m.value)} title={m.title}
                  className="flex items-center justify-center w-7 h-6 transition-colors duration-150"
                  style={{ borderRadius: 3, background: theme === m.value ? 'var(--accent)' : 'transparent', color: theme === m.value ? '#fff' : 'var(--text-muted)' }}>
                  {m.icon}
                </button>
              ))}
            </div>

            <NotificationBell />

            <div className="flex items-center justify-center w-8 h-8 text-white font-bold text-xs cursor-pointer flex-shrink-0"
              style={{ background: 'var(--accent)', borderRadius: 4 }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
