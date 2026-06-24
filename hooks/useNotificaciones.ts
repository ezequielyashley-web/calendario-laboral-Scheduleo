import { useEffect, useState, useCallback } from 'react'

export interface Notificaciones {
  mensajesNoLeidos: number
  solicitudesPendientes: number
  total: number
}

export function useNotificaciones(intervalo = 10000) {
  const [notifs, setNotifs] = useState<Notificaciones>({ mensajesNoLeidos: 0, solicitudesPendientes: 0, total: 0 })

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notificaciones')
      if (res.ok) setNotifs(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifs()
    const t = setInterval(fetchNotifs, intervalo)
    return () => clearInterval(t)
  }, [fetchNotifs, intervalo])

  return notifs
}