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
        setUserName(email.split('@')[0])
        setSuccess(true)
        setTimeout(() => { router.push('/dashboard'); router.refresh() }, 5500)
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

        @keyframes ring1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ring2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes rotateIn{0%{opacity:0;transform:rotate(-180deg) scale(0)}35%,65%{opacity:1;transform:rotate(0deg) scale(1)}100%{opacity:0;transform:rotate(180deg) scale(0)}}
        @keyframes dotPulse{0%,100%{transform:scale(0);opacity:0}50%{transform:scale(1);opacity:0.7}}
        @keyframes textFade{0%,100%{opacity:0;transform:translateY(6px)}30%,70%{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes logoPulse{0%,100%{box-shadow:0 6px 20px rgba(59,130,246,0.5);transform:scale(1)}50%{box-shadow:0 12px 35px rgba(59,130,246,0.85);transform:scale(1.08)}}
        @keyframes checkPop{0%{transform:scale(0) rotate(-180deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.5);opacity:1}}
        @keyframes floatUp{0%{transform:translateY(0) translateX(0);opacity:0}50%{opacity:.8}100%{transform:translateY(-200px) translateX(var(--tx,0));opacity:0}}
        @keyframes blob1{0%,100%{transform:translateY(0) translateX(0);opacity:.3}50%{transform:translateY(50px) translateX(30px);opacity:.6}}
        @keyframes blob2{0%,100%{transform:translateY(0) translateX(0);opacity:.2}50%{transform:translateY(-40px) translateX(-30px);opacity:.5}}
        @keyframes bgShimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

        .login-card{animation:scaleIn 0.8s ease-out 0.3s both}
        .logo-anim{animation:logoPulse 2.5s ease-in-out infinite}
        .fg1{animation:slideUp 0.8s ease-out 0.5s both}
        .fg2{animation:slideUp 0.8s ease-out 0.6s both}
        .fg3{animation:slideUp 0.8s ease-out 0.7s both}
        .fg4{animation:slideUp 0.8s ease-out 0.8s both}
        .fg5{animation:slideUp 0.8s ease-out 0.9s both}
        .form-input:focus{outline:none!important;background:rgba(255,255,255,0.75)!important;border-color:rgba(59,130,246,0.7)!important;box-shadow:0 0 0 3px rgba(59,130,246,0.15)!important}
        .form-input::placeholder{color:rgba(100,116,139,0.5)}
        .login-btn{transition:all 0.3s ease}
        .login-btn:hover:not(:disabled){transform:scale(1.02);box-shadow:0 14px 30px rgba(59,130,246,0.5)!important}
        .login-btn:active:not(:disabled){transform:scale(0.98)}
        .login-btn:disabled{opacity:0.7;cursor:not-allowed}
        .pwd-toggle:hover{color:#1d4ed8!important}
      `}</style>

      {/* LOADING SCREEN - Estilo 2+6 */}
      {showLoading && (
        <div style={{
          position:'fixed',inset:0,zIndex:200,
          background:'linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#1d4ed8 100%)',
          backgroundSize:'200% 200%',
          animation:'bgShimmer 4s ease infinite',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24
        }}>
          {/* Dot grid background */}
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.4}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {dots.map(i=>(
                <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'rgba(191,219,254,0.8)',animation:`dotPulse 1.5s ease-in-out ${i*0.15}s infinite`}}/>
              ))}
            </div>
          </div>

          {/* Logo con anillos giratorios y S con fade */}
          <div style={{position:'relative',width:120,height:120,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {/* Anillo exterior */}
            <div style={{
              position:'absolute',inset:0,borderRadius:'50%',
              border:'2px solid transparent',
              borderTopColor:'#818cf8',borderRightColor:'#818cf8',
              animation:'ring1 1.5s linear infinite'
            }}/>
            {/* Anillo interior */}
            <div style={{
              position:'absolute',inset:14,borderRadius:'50%',
              border:'2px solid transparent',
              borderBottomColor:'#c4b5fd',borderLeftColor:'#c4b5fd',
              animation:'ring2 2s linear infinite'
            }}/>
            {/* Logo box */}
            <div style={{
              width:72,height:72,borderRadius:18,
              background:'linear-gradient(135deg,#60a5fa,#2563eb)',
              display:'flex',alignItems:'center',justifyContent:'center',
              position:'relative',zIndex:2,
              boxShadow:'0 0 40px rgba(96,165,250,0.4)'
            }}>
              {/* S con fade + rotate */}
              <span style={{
                fontSize:36,fontWeight:800,color:'#fff',
                fontFamily:'"Poppins",sans-serif',
                animation:'rotateIn 3s ease-in-out infinite',
                display:'inline-block'
              }}>S</span>
            </div>
          </div>

          {/* Texto animado */}
          <div style={{textAlign:'center',animation:'textFade 3s ease-in-out infinite 0.3s'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:'"Poppins",sans-serif',marginBottom:8}}>
              Scheduleo
            </div>
            <div style={{fontSize:13,color:'#bfdbfe',letterSpacing:'2px',textTransform:'uppercase'}}>
              Verificando credenciales...
            </div>
          </div>

          {/* Dots loader */}
          <div style={{display:'flex',gap:8}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{
                width:8,height:8,borderRadius:'50%',background:'#bfdbfe',
                animation:`pulseDot 1.4s ease-in-out ${i*0.2}s infinite`
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div style={{position:'fixed',inset:0,background:'linear-gradient(135deg,#1e3a8a,#1e40af,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,overflow:'hidden'}}>
          <div style={{position:'absolute',top:'25%',left:'25%',width:384,height:384,background:'rgba(96,165,250,0.15)',borderRadius:'50%',filter:'blur(80px)',animation:'blob1 8s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'25%',right:'25%',width:320,height:320,background:'rgba(96,165,250,0.1)',borderRadius:'50%',filter:'blur(80px)',animation:'blob2 10s ease-in-out infinite 1s'}}/>
          {[0,1,2,3,4,5].map(i=>(
            <div key={i} style={{position:'absolute',left:`${20+i*13}%`,top:`${60+i*5}%`,width:4,height:4,background:'#fff',borderRadius:'50%',animation:`floatUp 3s ease-in-out ${i*0.3}s infinite`,['--tx' as any]:`${Math.sin(i)*100}px`}}/>
          ))}
          <div style={{position:'relative',zIndex:10,textAlign:'center',maxWidth:448,margin:'0 auto',padding:24,animation:'scaleIn 0.6s ease-out'}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:80,height:80,background:'#fff',borderRadius:'50%',marginBottom:24,boxShadow:'0 20px 50px rgba(0,0,0,0.3)',animation:'checkPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontSize:36,fontWeight:700,color:'#fff',marginBottom:8,fontFamily:'"Poppins",sans-serif'}}>Bienvenido!</h1>
            <p style={{fontSize:18,color:'#bfdbfe',marginBottom:32}}>Hola <strong style={{color:'#fff'}}>{userName}</strong>, sesion iniciada correctamente.</p>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:40}}>
              {['Gestion de Horarios','Control de Personal','Registro de Fichajes','Reportes y Analisis'].map(label=>(
                <div key={label} style={{display:'flex',alignItems:'center',gap:12,background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',padding:'12px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.2)',color:'#fff',fontSize:14,fontWeight:500}}>
                  <span>✓</span><span>{label}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:24}}>
              {[0,1,2].map(i=><div key={i} style={{width:8,height:8,background:'#fff',borderRadius:'50%',animation:`pulseDot 1.5s ease-in-out ${i*0.2}s infinite`}}/>)}
            </div>
            <p style={{color:'#bfdbfe',fontSize:14}}>Redirigiendo al panel principal...</p>
          </div>
        </div>
      )}

      {/* MAIN LOGIN */}
      {!success && (
        <div style={{position:'relative',minHeight:'100vh',width:'100%',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
            <img src="/login-bg.png" alt="background" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}}/>
          </div>
          <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.03)'}}/>

          <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:380,marginLeft:'-8%',padding:'0 20px'}}>
            <div className="login-card" style={{backdropFilter:'blur(20px)',background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:24,padding:'40px 36px 28px',boxShadow:'0 25px 50px rgba(37,99,235,0.12)'}}>

              <div style={{textAlign:'center',marginBottom:24}}>
                <div className="logo-anim" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:62,height:62,borderRadius:16,background:'linear-gradient(135deg,#3b82f6,#1e40af)',marginBottom:14}}>
                  <span style={{fontSize:24,fontWeight:800,color:'#fff',fontFamily:'"Poppins",sans-serif'}}>S</span>
                </div>
                <h1 style={{fontSize:26,fontWeight:700,color:'#1e293b',marginBottom:5,fontFamily:'"Poppins",sans-serif'}}>Bienvenido</h1>
                <p style={{color:'#64748b',fontSize:13}}>Gestion inteligente de personal</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="fg1" style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Correo Electronico</label>
                  <input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)}
                    disabled={isBlocked||loading} placeholder="tu@email.com" autoComplete="email" required
                    style={{width:'100%',height:44,padding:'0 14px',background:'rgba(255,255,255,0.55)',border:'1px solid rgba(147,197,253,0.5)',color:'#1e293b',borderRadius:10,fontSize:14,fontFamily:'"Sora",sans-serif',transition:'all 0.3s'}}/>
                </div>

                <div className="fg2" style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <label style={{fontSize:13,fontWeight:600,color:'#374151'}}>Contrasena</label>
                    <Link href="/forgot-password" style={{color:'#3b82f6',fontSize:12,textDecoration:'none',fontWeight:500}}>Olvidaste?</Link>
                  </div>
                  <div style={{position:'relative'}}>
                    <input type={showPassword?'text':'password'} className="form-input" value={password} onChange={e=>setPassword(e.target.value)}
                      disabled={isBlocked||loading} placeholder="••••••••" autoComplete="current-password" required
                      style={{width:'100%',height:44,padding:'0 46px 0 14px',background:'rgba(255,255,255,0.55)',border:'1px solid rgba(147,197,253,0.5)',color:'#1e293b',borderRadius:10,fontSize:14,fontFamily:'"Sora",sans-serif',transition:'all 0.3s'}}/>
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

                {(error||isBlocked) && (
                  <div className="fg3" style={{marginBottom:14,padding:'10px 14px',borderRadius:8,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)'}}>
                    <p style={{fontSize:13,color:'#dc2626',fontWeight:600}}>{error}</p>
                    {!isBlocked && attemptsLeft < 5 && <p style={{fontSize:11,color:'#f59e0b',marginTop:4}}>Intentos restantes: {attemptsLeft}</p>}
                  </div>
                )}

                <div className="fg4" style={{marginBottom:14}}>
                  <button type="submit" className="login-btn" disabled={isBlocked||loading}
                    style={{width:'100%',height:46,background:'linear-gradient(135deg,#3b82f6,#1e40af)',color:'#fff',border:'none',borderRadius:10,fontSize:16,fontWeight:600,cursor:isBlocked||loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'"Poppins",sans-serif',boxShadow:'0 8px 20px rgba(59,130,246,0.4)',opacity:isBlocked?0.7:1}}>
                    <span>{isBlocked ? 'Bloqueado' : 'Iniciar Sesion'}</span>
                  </button>
                </div>

                <div className="fg5" style={{textAlign:'center',color:'#64748b',fontSize:13}}>
                  No tienes cuenta? <a href="#" style={{color:'#2563eb',textDecoration:'none',fontWeight:600}}>Registrate aqui</a>
                </div>
              </form>

              <div style={{textAlign:'center',color:'#94a3b8',fontSize:11,marginTop:20,paddingTop:18,borderTop:'1px solid rgba(147,197,253,0.25)'}}>
                2026 Scheduleo. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}