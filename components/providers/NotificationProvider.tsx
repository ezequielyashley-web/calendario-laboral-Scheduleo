"use client"
import { createContext, useContext, useState, useEffect } from "react"

type Notification = {
  id: string
  titulo: string
  mensaje: string
  leida: boolean
  tipo: string
  creadoEn: string
}

const NotificationContext = createContext<{
  notificaciones: Notification[]
  noLeidas: number
  marcarComoLeida: (id: string) => void
  marcarTodasComoLeidas: () => void
  recargar: () => void
}>({
  notificaciones: [],
  noLeidas: 0,
  marcarComoLeida: () => {},
  marcarTodasComoLeidas: () => {},
  recargar: () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<Notification[]>([])

  const cargar = async () => {
    try {
      const res = await fetch("/api/notificaciones")
      const data = await res.json()
      setNotificaciones(Array.isArray(data) ? data : [])
    } catch (e) {}
  }

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 30000)
    return () => clearInterval(interval)
  }, [])

  const noLeidas = notificaciones.filter(n => !n.leida).length

  const marcarComoLeida = async (id: string) => {
    await fetch(`/api/notificaciones?id=${id}`, { method: "PATCH" })
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  const marcarTodasComoLeidas = async () => {
    await fetch("/api/notificaciones", { method: "PATCH" })
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  return (
    <NotificationContext.Provider value={{ notificaciones, noLeidas, marcarComoLeida, marcarTodasComoLeidas, recargar: cargar }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
