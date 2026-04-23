"use client"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  titulo: string
  mensaje: string
  remitente: string
  tipo: "info" | "success" | "warning" | "error"
  leida: boolean
  timestamp: Date
}

const NotificationContext = createContext<{
  notificaciones: Notification[]
  noLeidas: number
  agregarNotificacion: (notif: Omit<Notification, "id" | "leida" | "timestamp">) => void
  marcarComoLeida: (id: string) => void
  marcarTodasComoLeidas: () => void
}>({
  notificaciones: [],
  noLeidas: 0,
  agregarNotificacion: () => {},
  marcarComoLeida: () => {},
  marcarTodasComoLeidas: () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<Notification[]>([])
  const [pendingToast, setPendingToast] = useState<number>(0)
  const router = useRouter()

  const noLeidas = notificaciones.filter(n => !n.leida).length

  const agregarNotificacion = (notif: Omit<Notification, "id" | "leida" | "timestamp">) => {
    const nuevaNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      leida: false,
      timestamp: new Date(),
    }
    
    setNotificaciones(prev => [nuevaNotif, ...prev])
    setPendingToast(prev => prev + 1)
    
    // Auto-ocultar toast después de 10 segundos
    setTimeout(() => {
      setPendingToast(prev => Math.max(0, prev - 1))
    }, 10000)
  }

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    )
  }

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  const handleToastClick = () => {
    setPendingToast(0)
    router.push('/notificaciones')
  }

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        noLeidas,
        agregarNotificacion,
        marcarComoLeida,
        marcarTodasComoLeidas,
      }}
    >
      {children}

      {/* Toast emergente - aparece en TODAS las pantallas */}
      {pendingToast > 0 && (
        <div
          onClick={handleToastClick}
          className="fixed top-24 right-6 z-[100] animate-slideInRight cursor-pointer"
        >
          <div className="backdrop-blur-2xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-5 border border-gray-200/30 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 max-w-sm min-w-[300px]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7BA8A8] to-[#00A896] rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-pulse">
                🔔
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                  {pendingToast === 1 ? 'Nueva notificación' : `${pendingToast} nuevas notificaciones`}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Click para ver detalles
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPendingToast(0)
                }}
                className="w-8 h-8 rounded-full bg-gray-200/50 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-500/50 transition-colors flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
