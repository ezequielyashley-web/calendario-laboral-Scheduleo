'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Panel de Control</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">Master</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-semibold">
            M
          </div>
        </div>
        
        <Link 
          href="/"
          className="ml-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Salir
        </Link>
      </div>
    </header>
  )
}
