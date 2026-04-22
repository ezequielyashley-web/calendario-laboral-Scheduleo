'use client'
/**
 * SCHEDULEO - FASE 6: LOGIN MEJORADO
 * Contraseñas robustas, rate limiting, CSRF protection
 */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { validateEmail, validatePassword } from '@/lib/validation'
import type { PasswordValidation } from '@/lib/validation'
export default function SecureLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [csrfToken, setCsrfToken] = useState('')
  // Obtener token CSRF al cargar
  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token))
  }, [])
  // Countdown si está bloqueado
  useEffect(() => {
    if (!blockedUntil) return
    const timer = setInterval(() => {
      const now = Date.now()
      if (now >= blockedUntil) {
        setBlockedUntil(null)
        setError('')
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [blockedUntil])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    // Verificar si está bloqueado
    if (blockedUntil && Date.now() < blockedUntil) {
      const minutesLeft = Math.ceil((blockedUntil - Date.now()) / 60000)
      setError(`Demasiados intentos. Intenta en ${minutesLeft} minutos`)
      return
    }
    // Validar email
    if (!validateEmail(email)) {
      setError('Email inválido')
      return
    }
    // Validar contraseña
    if (!password) {
      setError('Ingresa tu contraseña')
      return
    }
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false
      })
      if (result?.error) {
        // Manejar rate limiting
        if (result.status === 429) {
          const data = JSON.parse(result.error)
          setBlockedUntil(data.resetTime)
          setError(data.message)
        } else {
          setAttemptsLeft(prev => Math.max(0, prev - 1))
          setError(result.error)
          
          if (attemptsLeft <= 1) {
            setBlockedUntil(Date.now() + 15 * 60 * 1000)
          }
        }
      } else {
        // Login exitoso
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }
  const getBlockedMessage = () => {
    if (!blockedUntil) return null
    const minutesLeft = Math.ceil((blockedUntil - Date.now()) / 60000)
    return `Bloqueado. Intenta en ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''}`
  }
  const isBlocked = blockedUntil && Date.now() < blockedUntil
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-600">Scheduleo</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión Laboral</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBlocked || loading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
              placeholder="correo@empresa.com"
              autoComplete="email"
              required
            />
          </div>
          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBlocked || loading}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isBlocked}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {/* Error o mensaje de bloqueo */}
          {(error || isBlocked) && (
            <div className={`p-4 rounded-lg ${isBlocked ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
              <p className={`text-sm font-medium ${isBlocked ? 'text-red-800' : 'text-orange-800'}`}>
                {isBlocked ? getBlockedMessage() : error}
              </p>
              {!isBlocked && attemptsLeft < 5 && (
                <p className="text-xs text-orange-600 mt-1">
                  Intentos restantes: {attemptsLeft}
                </p>
              )}
            </div>
          )}
          {/* Botón de login */}
          <button
            type="submit"
            disabled={isBlocked || loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verificando...
              </span>
            ) : isBlocked ? (
              'Bloqueado'
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Link de ¿Olvidaste tu contraseña? */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Conexión segura con cifrado de extremo a extremo
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Scheduleo v2.0 - Fase 6 (Seguridad Reforzada)
          </p>
        </div>
      </div>
    </div>
  )
}
