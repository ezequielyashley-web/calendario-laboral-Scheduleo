'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  
  const links = [
    { href: '/master', label: 'Dashboard', icon: '📊' },
    { href: '/master/empleados', label: 'Empleados', icon: '👥' },
    { href: '/master/grupos', label: 'Grupos', icon: '🏷️' },
    { href: '/master/calendario', label: 'Calendario', icon: '📅' },
    { href: '/master/aprobaciones', label: 'Aprobaciones', icon: '✅' },
    { href: '/master/ajustes', label: 'Ajustes', icon: '⚙️' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-sky-600">Scheduleo</h1>
        <p className="text-sm text-gray-500">Panel Master</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-sky-50 text-sky-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        Scheduleo v2.0 - Fase 2
      </div>
    </aside>
  )
}
