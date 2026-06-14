'use client'
import { useState, useEffect } from 'react'

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
  const [showLoading, setShowLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userName, setUserName] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [show2FA, setShow2FA] = useState(false)
  const [userId2FA, setUserId2FA] = useState('')
  const [code2FA, setCode2FA] = useState('')
  const [error2FA, setError2FA] = useState('')
  const [verifying2FA, setVerifying2FA] = useState(false)

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
    setShowLoading(true)
    try {
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()
      const result = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        redirect: 'manual',
        body: new URLSearchParams({ email, password, csrfToken, redirect: 'false', callbackUrl: '/dashboard', json: 'true' })
      })
      setShowLoading(false)
      if (result.status === 302 || result.status === 200 || result.type === 'opaqueredirect') {
        // Verificar si necesita 2FA
        const twoFARes = await fetch('/api/auth/2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, action: 'send' })
        })
        const twoFAData = await twoFARes.json()
        if (twoFAData.skip) {
          // No es SUPER_ADMIN - acceso directo
          setUserName(email.split('@')[0])
          setSuccess(true)
          setTimeout(() => { router.push('/dashboard'); router.refresh() }, 5500)
        } else {
          // Es SUPER_ADMIN - mostrar 2FA
          setUserId2FA(twoFAData.userId)
          setShowLoading(false)
          setShow2FA(true)
        }
      } else {
        const newAttempts = attemptsLeft - 1
        setAttemptsLeft(Math.max(0, newAttempts))
        setError('Email o contrasena incorrectos')
        if (newAttempts <= 0) setBlockedUntil(Date.now() + 15 * 60 * 1000)
      }
    } catch {
      setShowLoading(false)
      setError('Error de conexion')
    } finally { setLoading(false) }
  }

  const isBlocked = !!(blockedUntil && Date.now() < blockedUntil)
  const dots = Array.from({length: 9}, (_, i) => i)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html,body{font-family:"Sora",system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
        @keyframes spin-orbit-1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes spin-orbit-2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes spin-orbit-3{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse-dot{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.5);opacity:1}}
        @keyframes float-up{0%{transform:translateY(0) translateX(0);opacity:0}50%{opacity:.8}100%{transform:translateY(-200px) translateX(var(--tx,0));opacity:0}}
        @keyframes float-blob-1{0%,100%{transform:translateY(0) translateX(0);opacity:.3}50%{transform:translateY(50px) translateX(30px);opacity:.6}}
        @keyframes float-blob-2{0%,100%{transform:translateY(0) translateX(0);opacity:.2}50%{transform:translateY(-40px) translateX(-30px);opacity:.5}}
        @keyframes checkmark-pop{0%{transform:scale(0) rotate(-180deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes scale-in{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes slide-in-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes logo-pulse{0%,100%{box-shadow:0 6px 20px rgba(59,130,246,0.5);transform:scale(1)}50%{box-shadow:0 12px 35px rgba(59,130,246,0.9);transform:scale(1.08)}}
        @keyframes dot-grid{0%,100%{transform:scale(0);opacity:0}50%{transform:scale(1);opacity:0.7}}
        @keyframes rotate-in-s{0%{opacity:0;transform:rotate(-180deg) scale(0)}35%,65%{opacity:1;transform:rotate(0deg) scale(1)}100%{opacity:0;transform:rotate(180deg) scale(0)}}
        @keyframes text-fade{0%,100%{opacity:0;transform:translateY(6px)}30%,70%{opacity:1;transform:translateY(0)}}
        @keyframes bg-shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .login-card{animation:scale-in 0.8s ease-out 0.3s both}
        .login-header{animation:slide-in-up 0.8s ease-out 0.4s both}
        .fg1{animation:slide-in-up 0.8s ease-out 0.5s both}
        .fg2{animation:slide-in-up 0.8s ease-out 0.6s both}
        .fg3{animation:slide-in-up 0.8s ease-out 0.7s both}
        .fg4{animation:slide-in-up 0.8s ease-out 0.8s both}
        .fg5{animation:slide-in-up 0.8s ease-out 0.9s both}
        .logo-s{animation:logo-pulse 2.5s ease-in-out infinite}
        .form-input:focus{outline:none!important;background:rgba(255,255,255,0.75)!important;border-color:rgba(59,130,246,0.7)!important;box-shadow:0 0 0 3px rgba(59,130,246,0.15)!important}
        .form-input::placeholder{color:rgba(100,116,139,0.5)}
        .login-btn{transition:all 0.3s ease;box-shadow:0 8px 20px rgba(59,130,246,0.4)}
        .login-btn:hover:not(:disabled){transform:scale(1.02);box-shadow:0 14px 30px rgba(59,130,246,0.55)!important}
        .login-btn:active:not(:disabled){transform:scale(0.98)}
        .login-btn:disabled{opacity:0.7;cursor:not-allowed}
        .pwd-toggle:hover{color:#1d4ed8!important}
        .forgot-link:hover{color:#1d4ed8!important}
      `}</style>

      {/* LOADING SCREEN */}
      {showLoading && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#1d4ed8 100%)',backgroundSize:'200% 200%',animation:'bg-shimmer 4s ease infinite',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24}}>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.4}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {dots.map(i=>(
                <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'rgba(191,219,254,0.9)',animation:`dot-grid 1.5s ease-in-out ${i*0.15}s infinite`}}/>
              ))}
            </div>
          </div>
          <div style={{position:'relative',width:120,height:120,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid transparent',borderTopColor:'#818cf8',borderRightColor:'#818cf8',animation:'spin-orbit-1 1.5s linear infinite'}}/>
            <div style={{position:'absolute',inset:14,borderRadius:'50%',border:'2px solid transparent',borderBottomColor:'#c4b5fd',borderLeftColor:'#c4b5fd',animation:'spin-orbit-2 2s linear infinite'}}/>
            <div style={{width:72,height:72,borderRadius:18,background:'linear-gradient(135deg,#60a5fa,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:2,boxShadow:'0 0 40px rgba(96,165,250,0.4)'}}>
              <span style={{fontSize:36,fontWeight:800,color:'#fff',fontFamily:'"Poppins",sans-serif',animation:'rotate-in-s 3s ease-in-out infinite',display:'inline-block'}}>S</span>
            </div>
          </div>
          <div style={{textAlign:'center',animation:'text-fade 3s ease-in-out infinite 0.3s'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:'"Poppins",sans-serif',marginBottom:8}}>Scheduleo</div>
            <div style={{fontSize:13,color:'#bfdbfe',letterSpacing:'2px',textTransform:'uppercase'}}>Verificando credenciales...</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#bfdbfe',animation:`pulse-dot 1.4s ease-in-out ${i*0.2}s infinite`}}/>
            ))}
          </div>
        </div>
      )}

      {/* SUCCESS SCREEN */}
      {success && (
        <div style={{position:'fixed',inset:0,background:'linear-gradient(135deg,#1e3a8a,#1e40af,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,overflow:'hidden'}}>
          <div style={{position:'absolute',top:'25%',left:'25%',width:384,height:384,background:'rgba(96,165,250,0.15)',borderRadius:'50%',filter:'blur(80px)',animation:'float-blob-1 8s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'25%',right:'25%',width:320,height:320,background:'rgba(96,165,250,0.1)',borderRadius:'50%',filter:'blur(80px)',animation:'float-blob-2 10s ease-in-out infinite 1s'}}/>
          {[0,1,2,3,4,5].map(i=>(
            <div key={i} style={{position:'absolute',left:`${20+i*13}%`,top:`${60+i*5}%`,width:4,height:4,background:'#fff',borderRadius:'50%',animation:`float-up 3s ease-in-out ${i*0.3}s infinite`,['--tx' as any]:`${Math.sin(i)*100}px`}}/>
          ))}
          <div style={{position:'relative',zIndex:10,textAlign:'center',maxWidth:448,margin:'0 auto',padding:24,animation:'scale-in 0.6s ease-out'}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:80,height:80,background:'#fff',borderRadius:'50%',marginBottom:24,boxShadow:'0 20px 50px rgba(0,0,0,0.3)',animation:'checkmark-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontSize:36,fontWeight:700,color:'#fff',marginBottom:8,fontFamily:'"Poppins",sans-serif'}}>Bienvenido!</h1>
            <p style={{fontSize:18,color:'#bfdbfe',marginBottom:32}}>Hola <strong style={{color:'#fff'}}>{userName}</strong>, sesion iniciada correctamente.</p>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:40}}>
              {[
                {icon:'M3 4h18v2H3zM3 9h12v2H3zM3 14h18v2H3zM3 19h12v2H3z', txt:'Gestion de Horarios'},
                {icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', txt:'Control de Personal'},
                {icon:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2', txt:'Registro de Fichajes'},
                {icon:'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', txt:'Reportes y Analisis'},
              ].map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',padding:'12px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.2)',color:'#fff',fontSize:14,fontWeight:500}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={f.icon}/></svg>
                  <span>{f.txt}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:24}}>
              {[0,1,2].map(i=><div key={i} style={{width:8,height:8,background:'#fff',borderRadius:'50%',animation:`pulse-dot 1.5s ease-in-out ${i*0.2}s infinite`}}/>)}
            </div>
            <p style={{color:'#bfdbfe',fontSize:14}}>Redirigiendo al panel principal...</p>
          </div>
        </div>
      )}

      {/* 2FA SCREEN */}
      {show2FA && !success && (
        <div style={{position:'fixed',inset:0,zIndex:150,background:'linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#1d4ed8 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:24,padding:'40px 36px',width:'100%',maxWidth:400,textAlign:'center'}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,#3b82f6,#1e40af)',marginBottom:20}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:8}}>Verificacion en 2 pasos</h2>
            <p style={{color:'#bfdbfe',fontSize:14,marginBottom:28}}>Hemos enviado un codigo de 6 digitos a tu email. Introducelo para continuar.</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:20}}>
              {[0,1,2,3,4,5].map(i => (
                <input key={i} type="text" maxLength={1}
                  value={code2FA[i] || ''}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g,'')
                    const arr = code2FA.split('')
                    arr[i] = val
                    setCode2FA(arr.join(''))
                    if (val && i < 5) {
                      const next = document.getElementById('tfa'+i+1)
                      if (next) (next as HTMLInputElement).focus()
                    }
                  }}
                  id={'tfa'+i}
                  style={{width:44,height:54,borderRadius:10,border:'2px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.1)',color:'#fff',fontSize:24,fontWeight:700,textAlign:'center',outline:'none'}}
                />
              ))}
            </div>
            {error2FA && <p style={{color:'#fca5a5',fontSize:13,marginBottom:12}}>{error2FA}</p>}
            <button disabled={verifying2FA}
              onClick={async () => {
                if (code2FA.length < 6) { setError2FA('Introduce los 6 digitos'); return }
                setVerifying2FA(true)
                setError2FA('')
                const res = await fetch('/api/auth/2fa', {
                  method:'POST',
                  headers:{'Content-Type':'application/json'},
                  body:JSON.stringify({action:'verify',userId:userId2FA,code:code2FA})
                })
                const data = await res.json()
                setVerifying2FA(false)
                if (data.ok) {
                  setShow2FA(false)
                  setUserName(email.split('@')[0])
                  setSuccess(true)
                  setTimeout(() => { router.push('/dashboard'); router.refresh() }, 5500)
                } else {
                  setError2FA(data.error || 'Codigo incorrecto')
                  setCode2FA('')
                }
              }}
              style={{width:'100%',height:46,background:'linear-gradient(135deg,#3b82f6,#1e40af)',color:'#fff',border:'none',borderRadius:10,fontSize:16,fontWeight:600,cursor:'pointer',marginBottom:14}}>
              {verifying2FA ? 'Verificando...' : 'Verificar codigo'}
            </button>
            <button onClick={async () => {
                setCode2FA('')
                setError2FA('')
                await fetch('/api/auth/2fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,action:'send'})})
              }}
              style={{background:'none',border:'none',color:'#bfdbfe',fontSize:13,cursor:'pointer',textDecoration:'underline'}}>
              Reenviar codigo
            </button>
          </div>
        </div>
      )}
      {/* MAIN LOGIN */}
      {!success && !showLoading && !show2FA && (
        <div style={{position:'relative',minHeight:'100vh',width:'100%',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {/* Imagen fondo */}
          <div style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
            <img src="/login-bg.png" alt="background" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}}/>
          </div>
          {/* Overlay */}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(30,58,138,0.15) 0%,rgba(30,88,146,0.08) 50%,rgba(15,23,42,0.1) 100%)'}}/>
          {/* Blobs */}
          <div style={{position:'absolute',top:'25%',left:'25%',width:384,height:384,background:'rgba(59,130,246,0.08)',borderRadius:'50%',filter:'blur(80px)',animation:'float-blob-1 8s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'25%',right:'25%',width:320,height:320,background:'rgba(59,130,246,0.06)',borderRadius:'50%',filter:'blur(80px)',animation:'float-blob-2 10s ease-in-out infinite 1s'}}/>

          {/* CARD */}
          <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:400,padding:'0 20px'}}>
            <div className="login-card" style={{backdropFilter:'blur(20px)',background:'rgba(255,255,255,0.13)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:24,padding:'40px 36px 28px',boxShadow:'0 25px 50px rgba(0,0,0,0.08)'}}>

              {/* Header */}
              <div className="login-header" style={{textAlign:'center',marginBottom:28}}>
                <div className="logo-s" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,#3b82f6,#1e40af)',marginBottom:14}}>
                  <span style={{fontSize:26,fontWeight:800,color:'#fff',fontFamily:'"Poppins",sans-serif'}}>S</span>
                </div>
                <h1 style={{fontSize:28,fontWeight:700,color:'#1e293b',marginBottom:5,fontFamily:'"Poppins",sans-serif'}}>Bienvenido</h1>
                <p style={{color:'#475569',fontSize:13}}>Gestion inteligente de personal</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="fg1" style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Correo Electronico</label>
                  <input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)}
                    disabled={isBlocked||loading} placeholder="tu@email.com" autoComplete="email" required
                    style={{width:'100%',height:44,padding:'0 14px',background:'rgba(255,255,255,0.6)',border:'1px solid rgba(147,197,253,0.5)',color:'#1e293b',borderRadius:10,fontSize:14,fontFamily:'"Sora",sans-serif',transition:'all 0.3s'}}/>
                </div>

                {/* Password */}
                <div className="fg2" style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <label style={{fontSize:13,fontWeight:600,color:'#374151'}}>Contrasena</label>
                    <Link href="/forgot-password" className="forgot-link" style={{color:'#3b82f6',fontSize:12,textDecoration:'none',fontWeight:500,transition:'color 0.3s'}}>Olvidaste?</Link>
                  </div>
                  <div style={{position:'relative'}}>
                    <input type={showPassword?'text':'password'} className="form-input" value={password} onChange={e=>setPassword(e.target.value)}
                      disabled={isBlocked||loading} placeholder="••••••••" autoComplete="current-password" required
                      style={{width:'100%',height:44,padding:'0 46px 0 14px',background:'rgba(255,255,255,0.6)',border:'1px solid rgba(147,197,253,0.5)',color:'#1e293b',borderRadius:10,fontSize:14,fontFamily:'"Sora",sans-serif',transition:'all 0.3s'}}/>
                    <button type="button" className="pwd-toggle" onClick={()=>setShowPassword(!showPassword)}
                      style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#94a3b8',cursor:'pointer',padding:4,transition:'color 0.3s'}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPassword
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                        }
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Error */}
                {(error||isBlocked) && (
                  <div className="fg3" style={{marginBottom:14,padding:'10px 14px',borderRadius:8,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)'}}>
                    <p style={{fontSize:13,color:'#dc2626',fontWeight:600}}>{error}</p>
                    {!isBlocked && attemptsLeft < 5 && <p style={{fontSize:11,color:'#f59e0b',marginTop:4}}>Intentos restantes: {attemptsLeft}</p>}
                  </div>
                )}

                {/* Button */}
                <div className="fg4" style={{marginBottom:14}}>
                  <button type="submit" className="login-btn" disabled={isBlocked||loading}
                    style={{width:'100%',height:46,background:'linear-gradient(135deg,#3b82f6,#1e40af)',color:'#fff',border:'none',borderRadius:10,fontSize:16,fontWeight:600,cursor:isBlocked||loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"Poppins",sans-serif',opacity:isBlocked?0.7:1}}>
                    {isBlocked ? 'Bloqueado' : 'Iniciar Sesion'}
                  </button>
                </div>

                {/* Register */}
                <div className="fg5" style={{textAlign:'center',color:'#64748b',fontSize:13}}>
                  No tienes cuenta? <a href="#" style={{color:'#2563eb',textDecoration:'none',fontWeight:600}}>Registrate aqui</a>
                </div>
              </form>

              {/* Footer */}
              <div style={{textAlign:'center',color:'#94a3b8',fontSize:11,marginTop:20,paddingTop:16,borderTop:'1px solid rgba(147,197,253,0.25)'}}>
                2026 Scheduleo. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}