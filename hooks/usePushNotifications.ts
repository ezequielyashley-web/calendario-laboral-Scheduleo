"use client"
import { useEffect, useState } from "react"

export function usePushNotifications() {
  const [suscrito, setSuscrito] = useState(false)
  const [soportado, setSoportado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setCargando(false)
      return
    }
    setSoportado(true)
    const verificar = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js")
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          setSuscrito(true)
          localStorage.setItem("push_suscrito", "true")
        } else {
          const yaActivado = localStorage.getItem("push_suscrito") === "true"
          setSuscrito(yaActivado)
        }
      } catch (e) {
        console.log("SW error:", e)
      } finally {
        setCargando(false)
      }
    }
    verificar()
  }, [])

  const suscribirse = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BDsfQ0ZrvNnIVUCGCudXC5eW_aITMq36_ej1onc0-qrxajAuTaiNeOfK7cc1D_SftfXbbJNuo5eM-1rOyn6nPJc"
      })
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub })
      })
      setSuscrito(true)
      setSoportado(true)
      localStorage.setItem("push_suscrito", "true")
      window.dispatchEvent(new Event("storage"))
    } catch (e) {
      console.log("Suscripcion error:", e)
    }
  }

  return { suscrito, soportado, suscribirse, cargando }
}



