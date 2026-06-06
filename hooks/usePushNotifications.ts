"use client"
import { useEffect, useState } from "react"

export function usePushNotifications() {
  const [suscrito, setSuscrito] = useState(false)
  const [soportado, setSoportado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const yaActivado = localStorage.getItem("push_suscrito") === "true"
    if (yaActivado) { setSuscrito(true); setCargando(false); return }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSoportado(true)
      registrarSW()
    } else {
      setCargando(false)
    }
  }, [])

  const registrarSW = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js")
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        setSuscrito(true)
        localStorage.setItem("push_suscrito", "true")
      }
    } catch (e) {
      console.log("SW error:", e)
    } finally {
      setCargando(false)
    }
  }

  const suscribirse = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BIbYwIv8byy4FbdtqJYhj7qeSxRt2t2OO-cJFJ8eMnM_DsnGS9mi1gfgU0PU3PkYgFeRT85a0xOVXvi9KVb8kfw"
      })
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, userId: "admin-001" })
      })
      setSuscrito(true)
      setSoportado(true)
      localStorage.setItem("push_suscrito", "true")
    } catch (e) {
      console.log("Suscripcion error:", e)
    }
  }

  return { suscrito, soportado, suscribirse, cargando }
}
