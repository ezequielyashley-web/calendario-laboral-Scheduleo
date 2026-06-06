"use client"
import { useEffect, useState } from "react"

export function usePushNotifications() {
  const [suscrito, setSuscrito] = useState(false)
  const [soportado, setSoportado] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSoportado(true)
      registrarSW()
    }
  }, [])

  const registrarSW = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js")
      const sub = await reg.pushManager.getSubscription()
      if (sub) setSuscrito(true)
    } catch (e) {
      console.log("SW error:", e)
    }
  }

  const suscribirse = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, userId: "admin-001" })
      })
      setSuscrito(true)
    } catch (e) {
      console.log("Suscripcion error:", e)
    }
  }

  return { suscrito, soportado, suscribirse }
}
