"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { href: "/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/empleados", icon: "👥", label: "Empleados" },
    { href: "/calendario-global", icon: "📅", label: "Calendario" },
    { href: "/reportes", icon: "📈", label: "Reportes" },
    { href: "/vacaciones", icon: "🏖️", label: "Vacaciones" },
    { href: "/fichajes", icon: "⏰", label: "Fichajes" },
    { href: "/configuracion", icon: "⚙️", label: "Configuración" },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-cyan-700 text-white transition-all ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="p-4 border-b border-cyan-600">
          <h1 className={`font-bold text-xl ${!sidebarOpen && "text-center"}`}>
            {sidebarOpen ? "Scheduleo" : "S"}
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === item.href
                  ? "bg-cyan-600"
                  : "hover:bg-cyan-600/50"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 left-4 bg-cyan-600 p-2 rounded"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(i => i.href === pathname)?.label || "Scheduleo"}
            </h2>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                Notificaciones
              </button>
              <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
