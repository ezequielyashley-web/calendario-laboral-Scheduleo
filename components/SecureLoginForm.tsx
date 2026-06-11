'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { validateEmail } from '@/lib/validation'

export default function SecureLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userName, setUserName] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)

  useEffect(() => {
    if (!blockedUntil) return
    const timer = setInterval(() => {
      if (Date.now() >= blockedUntil) { setBlockedUntil(null); setError('') }
    }, 1000)
    return () => clearInterval(timer)
  }, [blockedUntil])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    if (blockedUntil && Date.now() < blockedUntil) {
      setError(`Bloqueado. Intenta en ${Math.ceil((blockedUntil - Date.now()) / 60000)} min`)
      return
    }
    if (!validateEmail(email)) { setError('Email invalido'); return }
    if (!password) { setError('Ingresa tu contrasena'); return }
    setLoading(true)
    try {
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()
      const result = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        redirect: 'manual',
        body: new URLSearchParams({ email, password, csrfToken, redirect: 'false', callbackUrl: '/dashboard', json: 'true' })
      })
      if (result.status === 302 || result.status === 200 || result.type === 'opaqueredirect') {
        setUserName(email.split('@')[0])
        setSuccess(true)
        setTimeout(() => { router.push('/dashboard'); router.refresh() }, 3000)
      } else {
        const newAttempts = attemptsLeft - 1
        setAttemptsLeft(Math.max(0, newAttempts))
        setError('Email o contrasena incorrectos')
        if (newAttempts <= 0) setBlockedUntil(Date.now() + 15 * 60 * 1000)
      }
    } catch { setError('Error de conexion') }
    finally { setLoading(false) }
  }

  const isBlocked = !!(blockedUntil && Date.now() < blockedUntil)

  if (success) return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg,#2563eb,#1e40af,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflow: 'hidden', fontFamily: '"Sora",system-ui,sans-serif' }}>
      <div style={{ position: 'absolute', top: '25%', left: '25%', width: 384, height: 384, background: 'rgba(96,165,250,0.2)', borderRadius: '50%', filter: 'blur(80px)', animation: 'blob1 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: 320, height: 320, background: 'rgba(96,165,250,0.1)', borderRadius: '50%', filter: 'blur(80px)', animation: 'blob2 10s ease-in-out infinite 1s' }} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 448, padding: 24, animation: 'scaleIn 0.6s ease-out' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: '#fff', borderRadius: '50%', marginBottom: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'checkPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: '"Poppins",sans-serif' }}>Bienvenido!</h1>
        <p style={{ fontSize: 18, color: '#bfdbfe', marginBottom: 32 }}>Hola <strong style={{ color: '#fff' }}>{userName}</strong>, tu sesion ha sido iniciada correctamente.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {[['📅','Gestion de Horarios'],['👥','Control de Personal'],['⏱','Registro de Fichajes'],['📊','Reportes y Analisis']].map(([icon,label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, fontWeight: 500 }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%', animation: `pulseDot 1.5s ease-in-out ${i*0.2}s infinite` }} />)}
        </div>
        <p style={{ color: '#bfdbfe', fontSize: 14 }}>Redirigiendo al panel principal...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes blob1{0%,100%{transform:translateY(0) translateX(0);opacity:.3}50%{transform:translateY(50px) translateX(30px);opacity:.6}}
        @keyframes blob2{0%,100%{transform:translateY(0) translateX(0);opacity:.2}50%{transform:translateY(-40px) translateX(-30px);opacity:.5}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes rotateSlowR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes checkPop{0%{transform:scale(0) rotate(-180deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.5);opacity:1}}
        @keyframes floatIcon1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes floatIcon2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes floatIcon3{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        @keyframes spin1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes spin2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes spin3{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .login-card{animation:scaleIn 0.8s ease-out 0.3s both}
        .login-header{animation:slideUp 0.8s ease-out 0.4s both}
        .form-g1{animation:slideUp 0.8s ease-out 0.5s both}
        .form-g2{animation:slideUp 0.8s ease-out 0.6s both}
        .form-g3{animation:slideUp 0.8s ease-out 0.7s both}
        .form-g4{animation:slideUp 0.8s ease-out 0.8s both}
        .form-g5{animation:slideUp 0.8s ease-out 0.9s both}
        .login-btn:hover:not(:disabled){transform:scale(1.02);box-shadow:0 15px 35px rgba(59,130,246,0.5)}
        .login-btn:active:not(:disabled){transform:scale(0.98)}
        .form-input:focus{outline:none;background:rgba(255,255,255,0.15);border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,0.3)}
        .form-input::placeholder{color:rgba(255,255,255,0.5)}
        .pwd-toggle:hover{color:#fff}
        .success-feat:hover{background:rgba(255,255,255,0.15);transform:translateX(10px)}
        @media(max-width:768px){.illus-panel{display:none!important}.login-wrapper{max-width:420px!important}}
      `}</style>

      <div style={{ minHeight: '100vh', width: '100%', display: 'flex', fontFamily: '"Sora",system-ui,sans-serif', background: '#e8f0fe' }}>

        {/* LEFT — Illustration panel */}
        <div className="illus-panel" style={{ flex: 1, position: 'relative', background: 'linear-gradient(135deg,#dbeafe 0%,#bfdbfe 40%,#93c5fd 70%,#60a5fa 100%)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>

          {/* Background blobs */}
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, background: 'rgba(59,130,246,0.2)', borderRadius: '50%', filter: 'blur(60px)', animation: 'blob1 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250, background: 'rgba(37,99,235,0.15)', borderRadius: '50%', filter: 'blur(60px)', animation: 'blob2 10s ease-in-out infinite 1s' }} />

          {/* Floating icons */}
          <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 40 }}>
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', animation: 'floatIcon1 3s ease-in-out infinite' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1e40af' }}>Fichaje</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', animation: 'floatIcon2 4s ease-in-out infinite 0.5s' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1e40af' }}>Personal</span>
            </div>
          </div>

          {/* Main SVG illustration */}
          <svg width="520" height="420" viewBox="0 0 520 420" style={{ position: 'relative', zIndex: 5 }}>
            {/* Sky gradient */}
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.1"/>
              </linearGradient>
              <linearGradient id="bldg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8"/>
                <stop offset="100%" stopColor="#1e3a8a"/>
              </linearGradient>
              <linearGradient id="bldg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb"/>
                <stop offset="100%" stopColor="#1d4ed8"/>
              </linearGradient>
              <linearGradient id="bldg3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
            </defs>

            {/* Ground */}
            <rect x="0" y="350" width="520" height="70" fill="#1e3a8a" opacity="0.3" rx="4"/>
            <rect x="0" y="360" width="520" height="60" fill="#1d4ed8" opacity="0.2"/>

            {/* Building 1 - tall left */}
            <rect x="30" y="120" width="90" height="240" fill="url(#bldg1)" rx="4"/>
            <rect x="32" y="122" width="86" height="236" fill="none" stroke="rgba(147,197,253,0.3)" strokeWidth="0.5" rx="3"/>
            {[140,160,180,200,220,240,260,280,300,320].map((y,i) => (
              <g key={y}>
                <rect x="38" y={y} width="18" height="12" fill="rgba(147,197,253,0.5)" rx="1"/>
                <rect x="62" y={y} width="18" height="12" fill="rgba(147,197,253,0.3)" rx="1"/>
                <rect x="86" y={y} width="18" height="12" fill="rgba(147,197,253,0.6)" rx="1"/>
              </g>
            ))}

            {/* Building 2 - tallest center-left */}
            <rect x="140" y="60" width="110" height="300" fill="url(#bldg2)" rx="4"/>
            <rect x="142" y="62" width="106" height="296" fill="none" stroke="rgba(147,197,253,0.3)" strokeWidth="0.5" rx="3"/>
            {[80,100,120,140,160,180,200,220,240,260,280,300,320].map((y) => (
              <g key={y}>
                <rect x="148" y={y} width="20" height="13" fill="rgba(147,197,253,0.5)" rx="1"/>
                <rect x="174" y={y} width="20" height="13" fill="rgba(147,197,253,0.6)" rx="1"/>
                <rect x="200" y={y} width="20" height="13" fill="rgba(147,197,253,0.3)" rx="1"/>
                <rect x="226" y={y} width="14" height="13" fill="rgba(147,197,253,0.4)" rx="1"/>
              </g>
            ))}
            {/* Antenna */}
            <rect x="192" y="40" width="4" height="22" fill="#60a5fa"/>
            <circle cx="194" cy="38" r="3" fill="#93c5fd"/>

            {/* Building 3 - right */}
            <rect x="270" y="150" width="80" height="210" fill="url(#bldg3)" rx="4"/>
            {[168,188,208,228,248,268,288,308,328].map((y) => (
              <g key={y}>
                <rect x="276" y={y} width="16" height="11" fill="rgba(147,197,253,0.5)" rx="1"/>
                <rect x="298" y={y} width="16" height="11" fill="rgba(147,197,253,0.3)" rx="1"/>
                <rect x="320" y={y} width="16" height="11" fill="rgba(147,197,253,0.6)" rx="1"/>
              </g>
            ))}

            {/* Building 4 - far right small */}
            <rect x="370" y="200" width="60" height="160" fill="url(#bldg1)" rx="3"/>
            {[216,232,248,264,280,296,312,328].map((y) => (
              <g key={y}>
                <rect x="376" y={y} width="12" height="9" fill="rgba(147,197,253,0.4)" rx="1"/>
                <rect x="394" y={y} width="12" height="9" fill="rgba(147,197,253,0.3)" rx="1"/>
                <rect x="412" y={y} width="10" height="9" fill="rgba(147,197,253,0.5)" rx="1"/>
              </g>
            ))}

            {/* Road */}
            <rect x="0" y="355" width="520" height="15" fill="#1e40af" opacity="0.4"/>
            <rect x="40" y="360" width="30" height="3" fill="rgba(255,255,255,0.4)" rx="1"/>
            <rect x="140" y="360" width="30" height="3" fill="rgba(255,255,255,0.4)" rx="1"/>
            <rect x="240" y="360" width="30" height="3" fill="rgba(255,255,255,0.4)" rx="1"/>
            <rect x="340" y="360" width="30" height="3" fill="rgba(255,255,255,0.4)" rx="1"/>
            <rect x="440" y="360" width="30" height="3" fill="rgba(255,255,255,0.4)" rx="1"/>

            {/* People - Person 1 */}
            <g transform="translate(360,290)">
              <ellipse cx="0" cy="60" rx="14" ry="5" fill="rgba(0,0,0,0.1)"/>
              <rect x="-10" y="25" width="20" height="35" fill="#1d4ed8" rx="3"/>
              <rect x="-8" y="40" width="6" height="20" fill="#1e3a8a" rx="2"/>
              <rect x="2" y="40" width="6" height="20" fill="#1e3a8a" rx="2"/>
              <circle cx="0" cy="16" r="10" fill="#fbbf24"/>
              <rect x="-12" y="28" width="8" height="18" fill="#2563eb" rx="2"/>
              <rect x="4" y="28" width="8" height="18" fill="#2563eb" rx="2"/>
              {/* Tablet */}
              <rect x="6" y="30" width="14" height="10" fill="#93c5fd" rx="1"/>
              <rect x="7" y="31" width="12" height="8" fill="#dbeafe" rx="1"/>
            </g>

            {/* People - Person 2 */}
            <g transform="translate(420,300)">
              <ellipse cx="0" cy="55" rx="12" ry="4" fill="rgba(0,0,0,0.1)"/>
              <rect x="-9" y="22" width="18" height="33" fill="#1e40af" rx="3"/>
              <rect x="-7" y="36" width="5" height="19" fill="#1e3a8a" rx="2"/>
              <rect x="2" y="36" width="5" height="19" fill="#1e3a8a" rx="2"/>
              <circle cx="0" cy="14" r="9" fill="#f9a8d4"/>
              <rect x="-11" y="24" width="7" height="16" fill="#2563eb" rx="2"/>
              <rect x="4" y="24" width="7" height="16" fill="#2563eb" rx="2"/>
            </g>

            {/* Person 3 - far left */}
            <g transform="translate(460,305)">
              <ellipse cx="0" cy="50" rx="10" ry="4" fill="rgba(0,0,0,0.1)"/>
              <rect x="-8" y="20" width="16" height="30" fill="#3b82f6" rx="3"/>
              <rect x="-6" y="32" width="5" height="18" fill="#1d4ed8" rx="2"/>
              <rect x="1" y="32" width="5" height="18" fill="#1d4ed8" rx="2"/>
              <circle cx="0" cy="12" r="8" fill="#86efac"/>
              <rect x="-10" y="22" width="6" height="14" fill="#2563eb" rx="2"/>
              <rect x="4" y="22" width="6" height="14" fill="#2563eb" rx="2"/>
            </g>

            {/* Connection lines / network dots */}
            <circle cx="194" cy="100" r="3" fill="#93c5fd" opacity="0.8"/>
            <line x1="194" y1="103" x2="360" y2="310" stroke="rgba(147,197,253,0.3)" strokeWidth="1" strokeDasharray="4,4"/>
            <line x1="194" y1="103" x2="420" y2="315" stroke="rgba(147,197,253,0.2)" strokeWidth="1" strokeDasharray="4,4"/>
          </svg>

          {/* Bottom floating badges */}
          <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, animation: 'floatIcon3 5s ease-in-out infinite' }}>
            {['RDL 8/2019','Art. 34 ET','RGPD'].map(b => (
              <div key={b} style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#1e40af', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{b}</div>
            ))}
          </div>

          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: 40, right: 40, width: 128, height: 128, border: '2px solid rgba(147,197,253,0.3)', borderRadius: '50%', animation: 'rotateSlow 20s linear infinite' }} />
          <div style={{ position: 'absolute', bottom: 40, left: 40, width: 96, height: 96, border: '2px solid rgba(147,197,253,0.2)', borderRadius: '50%', animation: 'rotateSlowR 15s linear infinite' }} />
        </div>

        {/* RIGHT — Login card */}
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'linear-gradient(135deg,#e0f2fe 0%,#bfdbfe 50%,#1e3a8a 100%)', position: 'relative', overflow: 'hidden' }} className="login-wrapper">
          <div style={{ position: 'absolute', top: '25%', left: '25%', width: 384, height: 384, background: 'rgba(59,130,246,0.15)', borderRadius: '50%', filter: 'blur(80px)', animation: 'blob1 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: 320, height: 320, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', filter: 'blur(80px)', animation: 'blob2 10s ease-in-out infinite 1s' }} />

          <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 400 }}>
            <div className="login-card" style={{ backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: 40, boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>

              <div className="login-header" style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#3b82f6,#1e40af)', marginBottom: 16, boxShadow: '0 10px 25px rgba(59,130,246,0.4)' }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: '"Poppins",sans-serif' }}>S</span>
                </div>
                <h1 style={{ fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: '"Poppins",sans-serif' }}>Bienvenido</h1>
                <p style={{ color: '#e0e7ff', fontSize: 14 }}>Gestion inteligente de personal</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-g1" style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Correo Electronico</label>
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} disabled={isBlocked || loading}
                    placeholder="tu@email.com" autoComplete="email" required
                    style={{ width: '100%', height: 44, padding: '0 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, fontSize: 14, fontFamily: '"Sora",sans-serif', transition: 'all 0.3s ease' }} />
                </div>

                <div className="form-g2" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Contrasena</label>
                    <Link href="/forgot-password" style={{ color: '#bfdbfe', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>Olvidaste?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} disabled={isBlocked || loading}
                      placeholder="••••••••" autoComplete="current-password" required
                      style={{ width: '100%', height: 44, padding: '0 48px 0 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, fontSize: 14, fontFamily: '"Sora",sans-serif', transition: 'all 0.3s ease' }} />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, transition: 'color 0.3s' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPassword ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>
                </div>

                {(error || isBlocked) && (
                  <div className="form-g3" style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                    <p style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>{error}</p>
                    {!isBlocked && attemptsLeft < 5 && <p style={{ fontSize: 11, color: '#fcd34d', marginTop: 4 }}>Intentos restantes: {attemptsLeft}</p>}
                  </div>
                )}

                <div className="form-g4" style={{ marginBottom: 16 }}>
                  <button type="submit" disabled={isBlocked || loading} className="login-btn"
                    style={{ width: '100%', height: 44, background: 'linear-gradient(135deg,#3b82f6,#1e40af)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: isBlocked || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: '"Poppins",sans-serif', boxShadow: '0 10px 25px rgba(59,130,246,0.4)', transition: 'all 0.3s ease', opacity: isBlocked ? 0.7 : 1 }}>
                    {loading ? (
                      <><div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin1 0.8s linear infinite' }} />Verificando...</>
                    ) : isBlocked ? 'Bloqueado' : 'Iniciar Sesion'}
                  </button>
                </div>

                <div className="form-g5" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 0 }}>
                  <span>No tienes cuenta? </span>
                  <a href="#" style={{ color: '#bfdbfe', textDecoration: 'none', fontWeight: 600 }}>Registrate aqui</a>
                </div>
              </form>

              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p>2026 Scheduleo. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>

          {/* Decorative circles right side */}
          <div style={{ position: 'absolute', top: 40, right: 40, width: 128, height: 128, border: '2px solid rgba(147,197,253,0.2)', borderRadius: '50%', animation: 'rotateSlow 20s linear infinite' }} />
          <div style={{ position: 'absolute', bottom: 40, left: 40, width: 96, height: 96, border: '2px solid rgba(147,197,253,0.2)', borderRadius: '50%', animation: 'rotateSlowR 15s linear infinite' }} />
        </div>
      </div>
    </>
  )
}