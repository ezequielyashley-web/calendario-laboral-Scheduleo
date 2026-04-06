// app/page.tsx
// Página de inicio con acceso directo al panel master

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Scheduleo Desktop</h1>
        <p className="text-xl mb-8">Sistema de Gestión de Personal</p>
        <Link 
          href="/master"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Acceder al Panel Master
        </Link>
      </div>
    </div>
  )
}
