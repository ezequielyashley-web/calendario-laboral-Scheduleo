'use client';

// components/master/Header.tsx
// Header superior profesional corporativo (SIN AUTENTICACIÓN)

import { Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="fixed left-64 top-0 right-0 h-16 bg-white border-b border-slate-200 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Título */}
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Controles derecha */}
        <div className="flex items-center gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notificaciones */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Usuario */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                Admin Master
              </div>
              <div className="text-xs text-slate-500">
                Super Administrador
              </div>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
