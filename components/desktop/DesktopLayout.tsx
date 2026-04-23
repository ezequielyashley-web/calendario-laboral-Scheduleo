"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/providers/ThemeProvider"
import NotificationBell from "@/components/NotificationBell"

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, setTheme } = useTheme()

  const menuItems = [
    { href: "/dashboard", icon: "📊", label: "Dashboard", color: "from-[#7BA8A8] to-[#00A896]" },
    { href: "/empleados", icon: "👥", label: "Empleados", color: "from-[#00A896] to-[#008B8B]" },
    { href: "/calendario-global", icon: "📅", label: "Calendario", color: "from-[#6B9999] to-[#7BA8A8]" },
    { href: "/notificaciones", icon: "🔔", label: "Notificaciones", color: "from-[#7BA8A8] to-[#00A896]" },
    { href: "/reportes", icon: "📈", label: "Reportes", color: "from-[#7BA8A8] to-[#6B9999]" },
    { href: "/vacaciones", icon: "🏖️", label: "Vacaciones", color: "from-[#00A896] to-[#7BA8A8]" },
    { href: "/fichajes", icon: "⏰", label: "Fichajes", color: "from-[#008B8B] to-[#00A896]" },
    { href: "/configuracion", icon: "⚙️", label: "Configuración", color: "from-[#6B9999] to-[#7BA8A8]" },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <aside className={`backdrop-blur-xl bg-gradient-to-b from-[#7BA8A8]/90 to-[#6B9999]/90 dark:from-[#1a3a3a]/95 dark:to-[#0f2626]/95 text-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} border-r border-white/20 dark:border-white/10 shadow-2xl`}>
        <div className="p-4 border-b border-white/20 dark:border-white/10 backdrop-blur-sm">
          <h1 className={`font-bold text-2xl bg-gradient-to-r from-white to-[#F0EEE9] bg-clip-text text-transparent ${!sidebarOpen && "text-center"}`}>
            {sidebarOpen ? "Scheduleo" : "S"}
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                pathname === item.href
                  ? "bg-white/25 dark:bg-white/15 shadow-lg backdrop-blur-md"
                  : "hover:bg-white/15 dark:hover:bg-white/10"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              <span className="text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              {sidebarOpen && <span className="relative z-10 font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 left-4 bg-white/20 dark:bg-white/10 backdrop-blur-md p-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4 sticky top-0 z-10 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] dark:from-[#7BA8A8] dark:to-[#00A896] bg-clip-text text-transparent">
              {menuItems.find(i => i.href === pathname)?.label || "Scheduleo"}
            </h2>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle - 20% más pequeño */}
              <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md rounded-xl p-1 shadow-lg">
                {[
                  { value: "light" as const, icon: "☀️" },
                  { value: "auto" as const, icon: "🌓" },
                  { value: "dark" as const, icon: "🌙" },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setTheme(mode.value)}
                    className={`px-2 py-1.5 rounded-lg transition-all duration-300 ${
                      theme === mode.value
                        ? "bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white shadow-lg scale-105"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                    }`}
                  >
                    <span className="text-base">{mode.icon}</span>
                  </button>
                ))}
              </div>

              {/* Notification Bell */}
              <NotificationBell />
              
              <div className="w-10 h-10 bg-gradient-to-br from-[#7BA8A8] to-[#00A896] rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
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
