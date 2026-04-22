"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [resetUrl, setResetUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    setResetUrl("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al procesar solicitud")
        return
      }

      setMessage(data.message)
      
      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
      }

      setEmail("")
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-600">Scheduleo</h1>
          <p className="text-gray-600 mt-2">Restablecer Contraseña</p>
        </div>

        {message ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>

            {resetUrl && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  🔧 MODO DESARROLLO:
                </p>
                <p className="text-xs text-yellow-700 mb-2">
                  Copia este link para restablecer tu contraseña:
                </p>
                <input
                  type="text"
                  readOnly
                  value={resetUrl}
                  className="w-full p-2 text-xs bg-white border rounded font-mono"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMessage("")
                  setResetUrl("")
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
              >
                Enviar otro
              </button>
              <Link
                href="/login"
                className="flex-1 bg-cyan-600 text-white py-2 px-4 rounded hover:bg-cyan-700 transition text-center"
              >
                Ir al login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-cyan-600 hover:text-cyan-700"
              >
                ← Volver al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
