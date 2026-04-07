import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Scheduleo Desktop</h1>
        <p className="text-xl mb-8">Sistema de Gestión de Personal - Fase 2</p>
        <p className="text-sm opacity-75 mb-8">✅ Panel Master con navegación completa</p>
        
        <Link 
          href="/master"
          className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
        >
          Acceder al Panel Master
        </Link>
      </div>
    </div>
  )
}
