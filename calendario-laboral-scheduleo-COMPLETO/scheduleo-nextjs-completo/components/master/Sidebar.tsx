'use client';

// components/master/Sidebar.tsx
// Navegación lateral profesional corporativa

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckCircle, 
  FolderKanban,
  FileText,
  Shield,
  Settings
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_SECTIONS = [
  {
    title: 'ANÁLISIS',
    items: [
      { label: 'Dashboard', href: '/master', icon: LayoutDashboard },
    ]
  },
  {
    title: 'GESTIÓN',
    items: [
      { label: 'Personal', href: '/master/empleados', icon: Users },
      { label: 'Calendario', href: '/master/calendario', icon: Calendar },
      { label: 'Grupos y Turnos', href: '/master/grupos', icon: FolderKanban },
    ]
  },
  {
    title: 'OPERACIONES',
    items: [
      { label: 'Aprobaciones', href: '/master/aprobaciones', icon: CheckCircle, badge: 7 },
      { label: 'Informes', href: '/master/reportes', icon: FileText },
      { label: 'Auditoría', href: '/master/auditoria', icon: Shield },
    ]
  },
  {
    title: 'SISTEMA',
    items: [
      { label: 'Configuración', href: '/master/ajustes', icon: Settings },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 overflow-y-auto border-r border-slate-700">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-lg">S</span>
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">Scheduleo</div>
            <div className="text-xs text-slate-400 font-medium">Control Ejecutivo</div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || 
                               (item.href !== '/master' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                      transition-all duration-150
                      ${isActive 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 rounded-md border border-blue-800/50">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
            Consola Principal
          </span>
        </div>
      </div>
    </aside>
  );
}
