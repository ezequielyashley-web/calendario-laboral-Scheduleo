"use client"

import BetaBanner from "@/components/BetaBanner"
import ScheduleoAIChat from "@/components/ScheduleoAIChat"
import ReportarFalloButton from "@/components/ReportarFalloButton"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/providers/ThemeProvider"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { useNotifications } from "@/components/providers/NotificationProvider"
import { useNotificaciones } from "@/hooks/useNotificaciones"
import { useApariencia } from "@/components/providers/AparienciaProvider"
import { getPaleta } from "@/lib/paletas"

const Icons = {
  dashboard:      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  empleados:      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  calendario:     <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="21" height="21" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  notificaciones: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  reportes:       <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  vacaciones:     <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3a3 3 0 0 0-3 3l-7 3a3 3 0 0 0 0 6l7 3a3 3 0 1 0 3-3l-7-3 7-3A3 3 0 0 0 18 3z"/></svg>,
  grupos:        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="17" cy="11" r="3"/><path d="M21 21v-1a3 3 0 0 0-3-3h-2"/></svg>,
  fichajes:       <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  cambiosTurno:   <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  bajas:          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  chat:           <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  deudas:         <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  cobertura:      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  configuracion:  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  sun:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  auto: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none"/></svg>,
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const bigint = parseInt(full, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r},${g},${b},${alpha})`
}

function ClimaWidget() {
  const [hora, setHora] = useState('')
  const [fecha, setFecha] = useState('')
  const [temp, setTemp] = useState<number|null>(null)
  const [ciudad, setCiudad] = useState('')
  const [icono, setIcono] = useState('')
  useEffect(() => {
    // Detectar restauracion desde bfcache (boton atras)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted || !sessionStorage.getItem('2fa_verified')) {
        window.location.replace('/login')
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    if (!sessionStorage.getItem('2fa_verified')) { window.location.replace('/login'); return }
    return () => window.removeEventListener('pageshow', handlePageShow)
    if (typeof window !== "undefined" && !sessionStorage.getItem("2fa_verified")) {
      window.location.href = "/login"
      return
    }
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
    <div style={{ margin:'8px 6px', padding:'10px 14px', background:'rgba(255,255,255,0.07)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)' }}>
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

// Mapa de permisos requeridos por ruta
const PERMISOS_RUTA: Record<string, string> = {
  "/empleados":         "empleados_ver",
  "/calendario-global": "calendario_ver",
  "/fichajes":          "fichajes_ver",
  "/grupos":            "grupos_ver",
  "/libranzas":         "libranzas_ver",
  "/cobertura":         "minimos_ver",
  "/vacaciones":        "vacaciones_ver",
  "/cambios-turno":     "cambios_ver",
  "/bajas":             "bajas_ver",
  "/deudas":            "deudas_ver",
  "/reportes":          "reportes_ver",
  "/configuracion":     "config_ver",
}

const menuSections = [
  { label: 'Principal', items: [
    { href: '/dashboard',         icon: Icons.dashboard,      label: 'Dashboard'      },
    { href: '/empleados',         icon: Icons.empleados,      label: 'Empleados'      },
    { href: '/calendario-global', icon: Icons.calendario,     label: 'Calendario'     },
    { href: '/fichajes',          icon: Icons.fichajes,       label: 'Fichajes'       },
    { href: '/grupos',            icon: Icons.grupos,         label: 'Grupos'         },
    { href: '/libranzas',         icon: Icons.grupos,         label: 'Libranzas'      },
    { href: '/cobertura',         icon: Icons.cobertura,      label: 'Minimos por puesto' },
  ]},
  { label: 'Gestión', items: [
    { href: '/vacaciones',        icon: Icons.vacaciones,     label: 'Vacaciones'     },
    { href: '/cambios-turno',     icon: Icons.cambiosTurno,   label: 'Cambios turno'  },
    { href: '/bajas',             icon: Icons.bajas,          label: 'Bajas médicas'  },
    { href: '/chat',              icon: Icons.chat,           label: 'Chat y Notificaciones' },
    { href: '/deudas',            icon: Icons.deudas,         label: 'Deudas'         },
  ]},
  { label: 'Sistema', items: [
    { href: '/reportes',          icon: Icons.reportes,       label: 'Reportes'       },
    { href: '/configuracion',     icon: Icons.configuracion,  label: 'Configuración'  },
  ]},
]

function IconoMenuSidebar({ href, size = 26 }: { href: string, size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 64 64", fill: "none" as const, stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (href) {
    case '/dashboard': return <svg {...p}><rect x="10" y="10" width="16" height="16" rx="2"/><rect x="38" y="10" width="16" height="16" rx="2"/><rect x="10" y="38" width="16" height="16" rx="2"/><rect x="38" y="38" width="16" height="16" rx="2"/></svg>
    case '/empleados': return <svg {...p}><circle cx="25" cy="22" r="7"/><circle cx="42" cy="25" r="6"/><path d="M10 48c2-8 7-12 15-12s13 4 15 12M36 38c7 0 11 4 13 10"/></svg>
    case '/calendario-global': return <svg {...p}><rect x="12" y="16" width="40" height="36" rx="5"/><path d="M12 26h40M22 10v12M42 10v12"/></svg>
    case '/fichajes': return <svg {...p}><circle cx="32" cy="32" r="22"/><path d="M32 18v15l10 6"/></svg>
    case '/grupos': return <svg {...p}><circle cx="24" cy="23" r="6"/><circle cx="42" cy="25" r="5"/><path d="M11 47c2-7 6-10 13-10s11 3 13 10M37 38c6 0 10 3 12 9"/></svg>
    case '/libranzas': return <svg {...p}><rect x="12" y="16" width="36" height="34" rx="5"/><path d="M12 25h36M21 10v11M39 10v11M38 42h12M44 36l6 6-6 6"/></svg>
    case '/cobertura': return <svg {...p}><path d="M32 7 49 14v14c0 12-7 22-17 28-10-6-17-16-17-28V14L32 7Z"/></svg>
    case '/vacaciones': return <svg {...p}><path d="M12 38 50 18M18 16l6 8M29 12l4 7M13 40l8 6M44 20l8 6M23 33 14 50"/></svg>
    case '/cambios-turno': return <svg {...p}><path d="M16 22h30l-7-7M48 42H18l7 7M48 22V14M16 42v8"/></svg>
    case '/bajas': return <svg {...p}><path d="M8 34h11l5-14 8 28 6-14h18"/></svg>
    case '/chat': return <svg {...p}><path d="M12 14h40v28H25L14 51V42h-2V14Z"/></svg>
    case '/deudas': return <svg {...p}><path d="M32 10v44M43 18H27a8 8 0 0 0 0 16h10a8 8 0 0 1 0 16H21"/></svg>
    case '/reportes': return <svg {...p} strokeWidth={3}><path d="M16 50V34M28 50V24M40 50V14M52 50V30"/></svg>
    case '/configuracion': return <svg {...p}><circle cx="32" cy="32" r="8"/><path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5"/></svg>
    default: return null
  }
}

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
  '/cobertura':         'Minimos por puesto de trabajo',
  '/configuracion':     'Configuración',
  '/panel-ejecutivo':   'Panel Ejecutivo',
}

function ClimaHeaderPill() {
  const [temp, setTemp] = useState<number|null>(null)
  const [icono, setIcono] = useState("")
  const [hora, setHora] = useState("")
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setHora(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }))
    }
    tick()
    const iv = setInterval(tick, 1000)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + pos.coords.latitude + "&longitude=" + pos.coords.longitude + "&current=temperature_2m,weathercode&timezone=auto")
          const d = await r.json()
          setTemp(Math.round(d.current.temperature_2m))
          const code = d.current.weathercode
          setIcono(code===0?"Sol":code<=3?"Nublado":code<=48?"Niebla":code<=67?"Lluvia":code<=77?"Nieve":"Tormenta")
        } catch {}
      }, () => {})
    }
    return () => clearInterval(iv)
  }, [])
  if (!hora) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, background:"#673DE6", borderRadius:8, padding:"6px 12px", flexShrink:0 }}>
      {temp !== null && <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{temp}C</span>}
      {temp !== null && <div style={{ width:1, height:12, background:"rgba(255,255,255,0.3)" }} />}
      <span style={{ fontSize:12, color:"rgba(255,255,255,0.9)", fontWeight:500 }}>{hora}</span>
    </div>
  )
}
const pageInfo: Record<string, { desc: string; tips: string[] }> = {
  "/dashboard": { desc: "Resumen general de la actividad laboral de tu empresa.", tips: ["Revisa los KPIs diarios: empleados activos, vacaciones y solicitudes pendientes.", "La seccion Actividad reciente muestra los ultimos cambios en tiempo real.", "Usa los accesos rapidos para aprobar solicitudes o gestionar turnos."] },
  "/empleados": { desc: "Gestion completa del equipo de trabajo.", tips: ["Haz clic en un empleado para ver su perfil completo.", "Usa los filtros por grupo o estado para encontrar empleados rapidamente.", "Desde el perfil puedes editar datos, ver historial y gestionar accesos."] },
  "/calendario-global": { desc: "Vista anual del calendario laboral.", tips: ["Haz clic en un mes para ver la vista mensual detallada.", "Los dias en rojo son domingos, en morado festivos.", "Desde la vista mensual puedes ver y gestionar los turnos del equipo."] },
  "/fichajes": { desc: "Control de entradas y salidas del personal.", tips: ["Filtra por fecha, grupo o estado para localizar fichajes concretos.", "Los fichajes tardios aparecen marcados en naranja.", "Puedes exportar el historial completo en CSV desde el boton de exportar."] },
  "/vacaciones": { desc: "Gestion de solicitudes de vacaciones.", tips: ["Las solicitudes pendientes aparecen destacadas en amarillo.", "Aprueba o rechaza solicitudes con un solo clic desde la tabla.", "Cada empleado tiene un contador de dias disponibles segun convenio."] },
  "/cambios-turno": { desc: "Control de cambios de turno entre empleados.", tips: ["Revisa los cambios pendientes de aprobacion en la parte superior.", "Los cambios requieren que ambos empleados sean del mismo puesto.", "Un cambio aprobado actualiza automaticamente el calendario de ambos."] },
  "/bajas": { desc: "Seguimiento de bajas medicas del personal.", tips: ["Las bajas activas se sincronizan con el sistema de la Seguridad Social.", "Puedes marcar una baja como resuelta cuando el empleado se reincorpore.", "El modulo genera alertas automaticas si la baja supera los plazos legales."] },
  "/grupos": { desc: "Organizacion del personal por grupos de trabajo.", tips: ["Arrastra empleados entre grupos para reorganizar el equipo.", "Cada grupo tiene su propio color para identificarlo en el calendario.", "Los grupos determinan los turnos y libranzas de cada empleado."] },
  "/gestion-grupos": { desc: "Gestion avanzada de puestos de trabajo.", tips: ["Asigna empleados a puestos arrastrando o usando el selector.", "Crea nuevos puestos con el boton Nuevo puesto.", "Los puestos definen las coberturas minimas requeridas por turno."] },
  "/libranzas": { desc: "Gestion de dias libres y libranzas del personal.", tips: ["Consulta las libranzas asignadas por grupo y semana.", "Las libranzas se calculan segun el convenio colectivo.", "Puedes ajustar libranzas manualmente desde el panel de grupos."] },
  "/cobertura": { desc: "Control de cobertura minima por puesto.", tips: ["Define el minimo de empleados requeridos por puesto y turno.", "El sistema alerta cuando la cobertura baja del minimo.", "Revisa el estado diario de cobertura en el dashboard."] },
  "/deudas": { desc: "Control de anticipos y deudas del personal.", tips: ["Registra anticipos salariales o compras que se descontaran de nomina.", "El saldo se actualiza automaticamente con cada pago parcial.", "Haz clic en un empleado para ver su historial completo de transacciones."] },
  "/reportes": { desc: "Informes y estadisticas de la empresa.", tips: ["Selecciona el mes y ano para filtrar los datos del informe.", "Navega entre las pestanas para ver fichajes, vacaciones, bajas y grupos.", "Los datos se exportan en PDF o CSV desde el boton de exportar."] },
  "/configuracion": { desc: "Ajustes generales del sistema.", tips: ["Configura los datos legales de la empresa en Identidad.", "Personaliza los colores de la app en Apariencia.", "Gestiona usuarios y roles desde la seccion Usuarios."] },
}

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const [solicitudesBadge, setSolicitudesBadge] = useState(0)
  const [userPermisos, setUserPermisos] = useState<Record<string,boolean> | null>(null)
  const [userRole, setUserRole] = useState<string>("")

  // Verificacion real de sesion 2FA: vive en el layout principal (se monta en
  // TODAS las paginas protegidas), y se ejecuta al montar, al restaurar la
  // pagina desde bfcache (boton atras) y al recuperar visibilidad de la pestana.
  useEffect(() => {
    const verificarSesion2FA = () => {
      if (typeof window === "undefined") return
      if (!sessionStorage.getItem("2fa_verified")) {
        window.location.replace("/login")
      }
    }
    verificarSesion2FA()
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) verificarSesion2FA()
    }
    window.addEventListener("pageshow", handlePageShow)
    document.addEventListener("visibilitychange", verificarSesion2FA)
    return () => {
      window.removeEventListener("pageshow", handlePageShow)
      document.removeEventListener("visibilitychange", verificarSesion2FA)
    }
  }, [])

  // Forzar que el navegador NO guarde una "foto congelada" de esta pagina en
  // bfcache. Un listener vacio en "unload" hace que la mayoria de navegadores
  // (Chrome, Edge) excluyan la pagina de bfcache, evitando el parpadeo donde
  // se ve el contenido protegido un instante antes de redirigir a /login.
  useEffect(() => {
    const noop = () => {}
    window.addEventListener("unload", noop)
    return () => window.removeEventListener("unload", noop)
  }, [])
  useEffect(() => {
    const cargar = () => fetch("/api/solicitudes-gerenciales").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setSolicitudesBadge(d.filter((s:any) => s.estado === "pendiente").length)
    }).catch(() => {})
    cargar()
    const interval = setInterval(cargar, 60000)
    return () => clearInterval(interval)
  }, [])
  const pathname = usePathname()
  if (typeof window !== "undefined") console.log("PATHNAME:", pathname)
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (pathname && pathname !== "/login" && pathname !== "/") {
      localStorage.setItem("scheduleo_ultima_ruta", JSON.stringify({ ruta: pathname, tiempo: Date.now() }))
    }
  }, [pathname])

  // Verificacion de sesion en CADA cambio de ruta (incluye boton atras/adelante).
  // Necesaria porque DesktopLayout no se remonta al navegar entre paginas.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (pathname === "/login") return
    if (!sessionStorage.getItem("2fa_verified")) {
      window.location.replace("/login")
    }
  }, [pathname])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const check = () => setIsMobile(mql.matches)
    check()
    mql.addEventListener('change', check)
    return () => mql.removeEventListener('change', check)
  }, [])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { theme, setTheme, effectiveTheme } = useTheme()
  const isLight = effectiveTheme === "light"
  const { noLeidas } = useNotifications()
  const chatNotifs = useNotificaciones(10000)
  const { suscrito, soportado, suscribirse } = usePushNotifications()
  const { apariencia: empresa } = useApariencia()
  const [cerrandoSesion, setCerrandoSesion] = useState(false)
  const [usuarioActual, setUsuarioActual] = useState<{name:string; id?:string; username?:string}|null>(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  useEffect(() => {
    fetch("/api/session-info").then(r=>r.json()).then(d=>{
      if(d?.name) setUsuarioActual({name:d.name, id:d.id, username:d.username})
    }).catch(()=>{})
  }, [])

  useEffect(() => {
    
  }, [])

  const handleSignOut = async () => {
    sessionStorage.removeItem('2fa_verified')
    setCerrandoSesion(true)
    await new Promise(r => setTimeout(r, 5500))
    await signOut({ callbackUrl: '/login' })
  }

  const sidebarBg = empresa?.colorSidebar || (isLight ? '#ffffff' : '#2d2b55')
  const sidebarPersonalizado = !!empresa?.colorSidebar
  
  const accentColor = empresa?.colorAccent || '#6366f1'
  const empresaNombre = empresa?.nombre || 'Mi Empresa'
  const empresaLogo = empresa?.logo || null
  const fondoMenu = empresa?.fondoMenu || null
  const fondoMenuOpacidad = empresa?.fondoMenuOpacidad ?? 80
  const fondoMenuBrillo = empresa?.fondoMenuBrillo ?? 100
  const fondoWorkspace = empresa?.fondoWorkspace || "/design-system/00-global/backgrounds/workspace-background-default.png"
  const fondoOpacidad = empresa?.fondoOpacidad ?? 88
  const fondoBrillo = empresa?.fondoBrillo ?? 100
  const paleta = getPaleta(empresa?.paletaColor)
  return (
    <div className={`flex h-screen overflow-hidden${isLight ? " bg-gray-50" : ""}`} style={{ background: isLight ? undefined : "#1E1B2E", '--sidebar-bg': sidebarBg, '--paleta-acento': paleta.acento, '--paleta-grad-inicio': paleta.gradInicio, '--paleta-grad-fin': paleta.gradFin, '--paleta-fondo': paleta.fondo, '--paleta-texto': paleta.texto, '--accent': paleta.acento, '--accent-hover': paleta.gradFin, '--accent-dim': paleta.acento + '1a', '--chat-propio': empresa?.chatColorPropio || paleta.acento, '--chat-ajeno': empresa?.chatColorAjeno || '#ffffff' } as React.CSSProperties}>
      <style>{`
        :root { --sidebar-text: rgba(255,255,255,0.82); --sidebar-text-muted: rgba(255,255,255,0.4); --sidebar-hover: rgba(255,255,255,0.07); --sidebar-active: rgba(255,255,255,0.13); }
        ${!sidebarPersonalizado ? `.light-mode .nav-item { color: #111827 !important; font-weight: 600 !important; font-size: 14px !important; }` : ``}
        .light-mode .nav-item:hover { background: #F3F4F6 !important; }
        .light-mode .nav-item.active { background: #F0EDFF !important; color: #673DE6 !important; font-weight: 700 !important; }
        
        .light-mode .nav-item:hover { background: #F3F4F6 !important; color: #111827 !important; }
        .light-mode .nav-item.active { background: #F0EDFF !important; color: #673DE6 !important; font-weight: 700 !important; }
        .light-mode .nav-section-label { color: #9CA3AF !important; }
        .nav-item { display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:6px; text-decoration:none; font-size:13px; font-weight:400; color:var(--sidebar-text); transition:background 0.15s; cursor:pointer; }
        .nav-item { display:flex; align-items:center; gap:12px; height:48px; padding:0 20px; border-radius:0; text-decoration:none; font-size:15px; font-weight:600; color:#1E1B4B; transition:all 0.2s ease; cursor:pointer; position:relative; }
        .nav-item:hover { background:var(--paleta-fondo); color:var(--paleta-acento); }
        .nav-item.active { background:var(--paleta-fondo); color:var(--paleta-acento); font-weight:700; }
        .nav-item.active::before { content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--paleta-acento); border-radius:0 4px 4px 0; }
        @media (max-width: 1024px) and (min-width: 768px) { .sidebar-nuevo { width:288px !important; } }
        .nav-label { white-space:nowrap; overflow:hidden; transition:opacity 0.2s, width 0.2s; }
      `}</style>

      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40 }} />
      )}
      <aside style={{ width: 320, background: 'transparent', display:'flex', flexDirection:'column', flexShrink:0, transition:'transform 0.25s', overflow:'hidden', margin: isMobile ? 0 : '12px 0 12px 12px', borderRadius: isMobile ? 0 : 24,
          boxShadow: '15px 0 45px rgba(79,70,229,0.35), 6px 0 15px rgba(79,70,229,0.2)', position: isMobile ? 'fixed' : 'relative', top: isMobile ? 0 : 'auto', left: isMobile ? 0 : 'auto', height: isMobile ? '100vh' : '100vh', zIndex: isMobile ? 50 : 'auto', transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none' }}
          className={`sidebar-nuevo ${isLight ? 'light-mode' : ''}`}>
          <div style={{ position:'absolute', inset:0, background: 'linear-gradient(180deg, #ffffff, var(--paleta-fondo))', zIndex:0 }} />
          <svg style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }} width="100%" height="100%" viewBox="0 0 360 1200" preserveAspectRatio="none"><defs><radialGradient id="sbGlow"><stop stopColor="#fff" stopOpacity=".8"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs><ellipse cx="300" cy="220" rx="260" ry="300" fill="url(#sbGlow)" /><path d="M-30 390C80 320 160 500 390 400" stroke="#fff" strokeOpacity=".18" strokeWidth="50" fill="none" /><path d="M-20 720C120 640 220 830 390 740" stroke="#fff" strokeOpacity=".12" strokeWidth="44" fill="none" /></svg>
          <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', height:'100%', width:'100%' }}>

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
            <span style={{ color: isLight ? '#111827' : '#fff', fontWeight: isLight ? 700 : 600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {empresaNombre}
            </span>
          )}
        </div>

        {/* Panel Ejecutivo - acceso destacado */}
        <div style={{ padding: "16px 20px 8px" }}>
          <Link href="/panel-ejecutivo" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", height: 64, boxSizing: "border-box",
            borderRadius: 18, textDecoration: "none",
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
            border: "none",
            boxShadow: "0 8px 20px rgba(79,70,229,.18), 0 2px 6px rgba(79,70,229,.10)"
          }}>
            <img src="/design-system/sidebar/icons/panel-executive.svg" alt="" style={{ width: 26, height: 26, flexShrink: 0 }} />
            <span style={{ fontSize: 15, color: "var(--paleta-acento)", fontWeight: 600 }}>Panel ejecutivo</span>
          </Link>
        </div>


        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'0 8px 8px', scrollbarWidth:'none', paddingBottom:'0' }}>
          {menuSections.map(section => ({
            ...section,
            items: section.items.filter(item => {
              // SUPER_ADMIN y ADMIN ven todo
              if (!userPermisos || userRole === "SUPER_ADMIN" || userRole === "ADMIN") return true
              // Dashboard siempre visible
              if (item.href === "/dashboard") return true
              // Verificar permiso especifico
              const permisoReq = PERMISOS_RUTA[item.href]
              if (!permisoReq) return true
              return userPermisos[permisoReq] === true
            })
          })).filter(section => section.items.length > 0).map(section => (
            <div key={section.label} style={{ marginBottom:10 }}>
              {open && (
                <div style={{ fontSize:11, fontWeight:700, color: isLight ? '#6B7280' : 'var(--sidebar-text-muted)', letterSpacing:'0.08em', padding:'0 6px', marginBottom:4, textTransform:'uppercase' as const }}>
                  {section.label}
                </div>
              )}
              {section.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href}
                    className={`nav-item${isActive ? ' active' : ''}`}
                    style={{ justifyContent: open ? 'flex-start' : 'center', color: isLight ? '#111827' : 'var(--sidebar-text)', fontWeight: isLight ? 600 : 400, fontSize: isLight ? '14px' : '13px' }}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span style={{ flexShrink:0, color: isActive ? "var(--paleta-acento)" : "#6B7280", display:"flex" }}><IconoMenuSidebar href={item.href} /></span>
                    {open && <span className="nav-label">{item.label}</span>}
                    {item.href === '/notificaciones' && noLeidas > 0 && (
                      <span style={{ marginLeft:'auto', background:'#dc2626', color:'#fff', borderRadius:'50%', fontSize:10, fontWeight:700, minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
                        {noLeidas > 9 ? '9+' : noLeidas}
                      </span>
                    )}
                    {item.href === '/chat' && chatNotifs.total > 0 && (
                      <span style={{ position: 'relative', marginLeft: 'auto' }}>
                        <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '2px solid var(--sidebar-bg)' }} />
                      </span>
                    )}
                    {item.href === '/configuracion' && solicitudesBadge > 0 && open && (
                      <span style={{ marginLeft:'auto', background:'#dc2626', color:'#fff', borderRadius:'50%', fontSize:10, fontWeight:700, minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
                        {solicitudesBadge > 9 ? '9+' : solicitudesBadge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Perfil de usuario (footer) */}
        <div style={{ padding: "12px 14px", flexShrink: 0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,0.9)", backdropFilter:"blur(12px)", borderRadius:14, border:"none", boxShadow:"0 8px 20px rgba(79,70,229,.18), 0 2px 6px rgba(79,70,229,.10)" }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:accentColor, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700 }}>
                {(usuarioActual?.name || "U")[0]?.toUpperCase()}
              </div>
              <div style={{ position:"absolute", bottom:-1, right:-1, width:9, height:9, borderRadius:"50%", background:"#10B981", border:"2px solid #fff" }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#1E1B4B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{usuarioActual?.name || "Usuario"}</div>
              <div style={{ fontSize:12, color:"#10B981" }}>● En linea</div>
            </div>
            <button onClick={() => setShowSignOutModal(true)} title="Cerrar sesion"
              style={{ width:36, height:36, background:"rgba(255,255,255,0.6)", border:"none", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, boxShadow:"0 4px 10px rgba(79,70,229,.15)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--paleta-acento)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>

        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      {isMobile && (
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ position:'fixed', top:12, left:12, zIndex:60, background: sidebarBg, border: isLight ? '1px solid #E5E7EB' : 'none', borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.3)' }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={isLight ? "#111827" : "white"} strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      )}
        <header className={`flex items-center justify-between h-14 px-6 flex-shrink-0${isLight ? " bg-white border-b border-gray-200 shadow-sm" : ""}`}
          style={{ background: pathname === "/panel-ejecutivo" ? "#0b0e1a" : "var(--surface)", borderBottom: pathname === "/panel-ejecutivo" ? "1px solid #2a2f45" : "1px solid var(--border)", boxShadow:"var(--shadow-sm)", position: "relative", zIndex: 20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft: isMobile ? 44 : 0 }}>
            <h1 className="text-base font-semibold tracking-tight" style={{ color: pathname === "/panel-ejecutivo" ? "#f1ecdd" : "var(--text-primary)", margin:0 }}>{pageTitles[pathname] ?? empresaNombre}</h1>
            <div style={{ position:"relative" }}>
              <button onClick={() => setShowInfo(!showInfo)} style={{ width:28, height:28, borderRadius:"50%", background: showInfo ? "rgba(217,70,239,0.15)" : "transparent", border:"2px solid #d946ef", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#d946ef", lineHeight:1 }}>?</span>
              </button>
              {showInfo && (
                <div onClick={() => setShowInfo(false)} style={{ position:"absolute", top:36, left:0, zIndex:200, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:16, width:280, boxShadow:"0 8px 24px rgba(0,0,0,0.15)" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:6 }}>{pageTitles[pathname] ?? "Esta seccion"}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6, marginBottom:10 }}>{pageInfo[pathname]?.desc ?? "Informacion no disponible."}</div>
                  {(pageInfo[pathname]?.tips ?? []).length > 0 && (
                    <ul style={{ margin:0, padding:"0 0 0 14px" }}>
                      {(pageInfo[pathname]?.tips ?? []).map((tip: string, i: number) => (
                        <li key={i} style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.6, marginBottom:4 }}>{tip}</li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => setShowInfo(false)} style={{ marginTop:10, fontSize:11, color:"#d946ef", background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:600 }}>Cerrar</button>
                </div>
                )}
              </div>
          </div>
          <div className="flex items-center gap-2">
            {false && soportado && !suscrito && (
              <button onClick={suscribirse} title="Activar notificaciones push"
                className="flex items-center justify-center w-8 h-8 transition-colors duration-150"
                style={{ borderRadius:4, background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text-muted)", cursor:"pointer" }}>
                🔔
              </button>
            )}
            {false && suscrito && (
              <div title="Notificaciones activadas"
                className="flex items-center justify-center w-8 h-8"
                style={{ borderRadius:4, background:"#dcfce7", border:"1px solid #86efac", fontSize:14 }}>
                🔔
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <img src="/design-system/sidebar/icons/scheduleo-logo.svg" alt="" style={{ width:34, height:34 }} />
              <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
                <span style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>Scheduleo</span>
                <span style={{ fontSize:10, color:"var(--text-muted)" }}>v2.0</span>
              </div>
          </div>
          </div>
        </header>
        <BetaBanner />
        <main className={`flex-1 main-responsive-padding${isLight ? " bg-gray-50" : ""}`} style={{ background: fondoWorkspace ? undefined : "var(--bg)", position: "relative", padding: (pathname === "/chat" || pathname === "/panel-ejecutivo" || pathname === "/configuracion") ? 0 : 24, overflow: (pathname === "/chat" || pathname === "/configuracion") ? "hidden" : "auto", height: (pathname === "/chat" || pathname === "/configuracion") ? "100%" : "auto", display: "flex", flexDirection: "column" }}>
          {fondoWorkspace && (
            <>
              <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${fondoWorkspace})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", filter: `brightness(${fondoBrillo}%)`, zIndex: 0 }} />
              <div style={{ position: "fixed", inset: 0, background: `rgba(249,250,251,${fondoOpacidad / 100})`, zIndex: 0 }} />
            </>
          )}
          <style>{`
            @media (max-width: 640px) {
              .main-responsive-padding { padding: 12px !important; }
            }
          `}</style>
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            {children}
          </div>
        </main>
      </div>
      <ScheduleoAIChat userId={usuarioActual?.id || ""} />
      <ReportarFalloButton userName={usuarioActual?.name} />

      {cerrandoSesion && (
        <div style={{ position:"fixed", inset:0, background:"linear-gradient(135deg,#1e3a8a,#1e40af,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, overflow:"hidden" }}>
          <style>{`
            @keyframes girar-anillo { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes despedida-pulso { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
            @keyframes despedida-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
          <div style={{ position:"absolute", top:"25%", left:"25%", width:384, height:384, background:"rgba(96,165,250,0.15)", borderRadius:"50%", filter:"blur(80px)" }} />
          <div style={{ position:"absolute", bottom:"25%", right:"25%", width:320, height:320, background:"rgba(96,165,250,0.1)", borderRadius:"50%", filter:"blur(80px)" }} />
          <div style={{ position:"relative", zIndex:10, textAlign:"center", animation:"despedida-fade 0.5s ease-out" }}>
            <div style={{ position:"relative", width:100, height:100, margin:"0 auto 28px" }}>
              <div style={{ position:"absolute", inset:0, border:"2px solid rgba(255,255,255,0.25)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"girar-anillo 1.4s linear infinite" }} />
              <div style={{ position:"absolute", inset:14, borderRadius:16, background:"linear-gradient(135deg,#3b82f6,#1e40af)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 10px 30px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize:28, fontWeight:800, color:"#fff", fontFamily:'"Poppins",sans-serif' }}>S</span>
              </div>
            </div>
            <h1 style={{ fontSize:26, fontWeight:700, color:"#fff", marginBottom:8, fontFamily:'"Poppins",sans-serif' }}>
              ¡Hasta pronto{usuarioActual?.name ? `, ${usuarioActual.name.split(" ")[0]}` : ""}!
            </h1>
            <p style={{ color:"#bfdbfe", fontSize:14, marginBottom:24 }}>Cerrando tu sesion de forma segura...</p>
            <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, background:"#fff", borderRadius:"50%", animation:`despedida-pulso 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}
      {showSignOutModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:28, width:400, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Cerrar sesion</div>
                <div style={{ fontSize:12, color:"#6B7280" }}>Tu sesion se cerrara inmediatamente</div>
              </div>
            </div>
            <div style={{ background:"#FEF9C3", border:"1px solid #FDE68A", borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#92400E" }}>
              ⚠ Asegurate de guardar cualquier cambio antes de salir.
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setShowSignOutModal(false)} style={{ background:"#F3F4F6", color:"#374151", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancelar</button>
              <button onClick={handleSignOut} style={{ background:"#DC2626", color:"#fff", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cerrar sesion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}