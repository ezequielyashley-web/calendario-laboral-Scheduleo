"use client"

import { useNotifications } from "@/components/providers/NotificationProvider"
import DesktopLayout from "@/components/desktop/DesktopLayout"

export default function NotificacionesPage() {
  const { notificaciones, marcarComoLeida, marcarTodasComoLeidas } = useNotifications()

  const tipoIcons: any = {
    info: "📬",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  }

  const tipoColors: any = {
    info: "from-blue-400 to-cyan-400",
    success: "from-green-400 to-emerald-400",
    warning: "from-yellow-400 to-amber-400",
    error: "from-red-400 to-pink-400",
  }

  return (
    <DesktopLayout>
      <div className="min-h-screen space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
                Notificaciones
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {notificaciones.filter(n => !n.leida).length} sin leer de {notificaciones.length} totales
              </p>
            </div>
            
            {notificaciones.some(n => !n.leida) && (
              <button
                onClick={marcarTodasComoLeidas}
                className="px-6 py-3 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                ✓ Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="space-y-3">
          {notificaciones.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                No tienes notificaciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cuando recibas notificaciones, aparecerán aquí
              </p>
            </div>
          ) : (
            notificaciones.map((notif) => (
              <div
                key={notif.id}
                onClick={() => marcarComoLeida(notif.id)}
                className={`glass-card p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                  !notif.leida ? "border-l-4 border-[#00A896]" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tipoColors[notif.tipo]} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
                    {tipoIcons[notif.tipo]}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {notif.remitente}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(notif.timestamp).toLocaleString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {!notif.leida && (
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full">
                          NUEVO
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                      {notif.titulo}
                    </h4>
                    
                    <p className="text-gray-700 dark:text-gray-300">
                      {notif.mensaje}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DesktopLayout>
  )
}
