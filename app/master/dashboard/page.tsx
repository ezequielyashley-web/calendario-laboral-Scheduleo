// SCHEDULEO - DASHBOARD MASTER (Placeholder para Sesión 2)

import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function MasterDashboard() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  if (session.user.rol === 'EMPLEADO') {
    redirect('/empleado/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cyan-600">Scheduleo</h1>
              <p className="text-gray-600 mt-2">Panel de Control Master</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Bienvenido,</p>
              <p className="text-xl font-semibold text-gray-800">{session.user.nombre}</p>
              <p className="text-sm text-cyan-600">{session.user.rol}</p>
            </div>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Proyecto Base Instalado!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              SESIÓN 1 completada - Autenticación funcionando
            </p>
            
            <div className="max-w-2xl mx-auto text-left bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4">✅ Lo que ya funciona:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Base de datos con 80 empleados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Autenticación NextAuth + Seguridad Fase 6B</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Rate limiting (5 intentos/15 min)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Contraseñas robustas con bcrypt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>CSRF protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>9 grupos de trabajo configurados</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <h4 className="font-bold text-cyan-800 mb-2">📋 Próxima Sesión 2:</h4>
                <p className="text-cyan-700 text-sm">
                  Dashboard con gráficos, tabla de empleados, tu calendario integrado, perfil de empleado
                </p>
              </div>
            </div>
            
            <form action="/api/auth/signout" method="POST" className="mt-8">
              <button 
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
