"use client"

import { useNotifications } from "@/components/providers/NotificationProvider"
import { useRouter } from "next/navigation"

export default function NotificationBell() {
  const { noLeidas } = useNotifications()
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/notificaciones')}
      className="relative px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-300 shadow-lg group"
    >
      <span className={`text-2xl ${noLeidas > 0 ? 'animate-bellRing' : ''}`}>
        🔔
      </span>
      
      {noLeidas > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white dark:border-gray-700">
          {noLeidas > 9 ? '9+' : noLeidas}
        </span>
      )}
    </button>
  )
}
