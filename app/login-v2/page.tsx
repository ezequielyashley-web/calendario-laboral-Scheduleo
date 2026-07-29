"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

function validarEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function LoginV2Page() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [show2FA, setShow2FA] = useState(false)
  const [code2FA, setCode2FA] = useState("")
  const [error2FA, setError2FA] = useState("")
  const [verifying2FA, setVerifying2FA] = useState(false)

  const [show2FATotp, setShow2FATotp] = useState(false)
  const [codigoTotp, setCodigoTotp] = useState("")
  const [errorTotp, setErrorTotp] = useState("")
  const [verifyingTotp, setVerifyingTotp] = useState(false)

  const [userId2FA, setUserId2FA] = useState("")

  const completarSesion = async (sessionGrant?: string) => {
    const csrfRes = await fetch("/api/auth/csrf")
    const { csrfToken } = await csrfRes.json()
    await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      redirect: "manual",
      body: new URLSearchParams({ email, password, sessionGrant: sessionGrant || "", csrfToken, redirect: "false", callbackUrl: "/dashboard", json: "true" })
    })
    sessionStorage.setItem("2fa_verified", "true")
    router.push("/dashboard")
    router.refresh()
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    if (!validarEmail(email)) { setError("Email invalido"); return }
    if (!password) { setError("Ingresa tu contrasena"); return }
    setLoading(true)
    try {
      const checkRes = await fetch("/api/auth/login-custom", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const checkData = await checkRes.json()
      setLoading(false)
      if (!checkRes.ok) { setError(checkData.error || "Email o contrasena incorrectos"); return }
      if (checkData.needsTwoFA && checkData.metodo2FA === "totp") {
        setUserId2FA(checkData.userId)
        setShow2FATotp(true)
        return
      }
      if (checkData.needsTwoFA) {
        const twoFARes = await fetch("/api/verificacion", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, action: "send" })
        })
        const twoFAData = await twoFARes.json()
        setUserId2FA(twoFAData.userId)
        setShow2FA(true)
        return
      }
      await completarSesion()
    } catch {
      setLoading(false)
      setError("Error de conexion")
    }
  }

  const verificarCodigo2FA = async () => {
    setVerifying2FA(true); setError2FA("")
    const res = await fetch("/api/verificacion", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", userId: userId2FA, code: code2FA })
    })
    const data = await res.json()
    setVerifying2FA(false)
    if (data.ok) { await completarSesion(data.sessionGrant) }
    else { setError2FA(data.error || "Codigo incorrecto"); setCode2FA("") }
  }

  const verificarTotp = async () => {
    setVerifyingTotp(true); setErrorTotp("")
    const res = await fetch("/api/2fa/verify-login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId2FA, codigo: codigoTotp })
    })
    const data = await res.json()
    setVerifyingTotp(false)
    if (data.ok) { await completarSesion(data.sessionGrant) }
    else { setErrorTotp(data.error || "Codigo incorrecto"); setCodigoTotp("") }
  }

  const inputBase: React.CSSProperties = { width: "100%", height: 46, padding: "0 14px 0 42px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, color: "#0F172A", outline: "none", background: "#fff", boxSizing: "border-box" }

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img src="/login-bg.png" alt="background" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(30,58,138,0.15) 0%,rgba(30,88,146,0.08) 50%,rgba(15,23,42,0.1) 100%)" }} />
      <div style={{ position: "absolute", top: "25%", left: "25%", width: 384, height: 384, background: "rgba(59,130,246,0.08)", borderRadius: "50%", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "25%", right: "25%", width: 320, height: 320, background: "rgba(59,130,246,0.06)", borderRadius: "50%", filter: "blur(80px)" }} />

      <style>{`
        @keyframes logo-pulse-v2 { 0%,100% { box-shadow: 0 6px 20px rgba(59,130,246,0.5); transform: scale(1); } 50% { box-shadow: 0 12px 35px rgba(59,130,246,0.9); transform: scale(1.08); } }
        .logo-v2 { animation: logo-pulse-v2 2.5s ease-in-out infinite; }
      `}</style>
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1040, minHeight: 760, margin: 20, display: "grid", gridTemplateColumns: "1fr 1.08fr", borderRadius: 28, overflow: "hidden", background: "rgba(255,255,255,0.90)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.72)", boxShadow: "0 40px 100px rgba(23,67,151,0.28), 0 15px 40px rgba(23,67,151,0.18)" }}>

        <div style={{ padding: "42px 42px 36px", background: "linear-gradient(180deg, rgba(248,251,255,.96), rgba(240,246,255,.94))", borderRight: "1px solid rgba(47,99,244,.10)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <img src="/design-system/login/scheduleo-logo.svg" alt="Scheduleo" className="logo-v2" style={{ width: 56, height: 56, borderRadius: 14 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Scheduleo</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Gestion inteligente de personal</div>
            </div>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>Bienvenido</h1>
          <div style={{ width: 40, height: 4, background: "#2F63F4", borderRadius: 2, marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
            La plataforma completa para el control de asistencia, horarios, grupos laborales y cumplimiento normativo.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            {[
              { title: "Control de Asistencia", text: "Registra y controla la jornada laboral en tiempo real.", icon: "icon-control-asistencia.svg" },
              { title: "Gestion de Horarios", text: "Planifica turnos y coberturas de forma inteligente.", icon: "icon-gestion-horarios.svg" },
              { title: "Grupos Laborales", text: "Organiza equipos por departamentos, centros y turnos.", icon: "icon-grupos-laborales.svg" },
              { title: "Asistencia de Hacienda", text: "Genera informes y reportes para cumplir con la normativa.", icon: "icon-asistencia-hacienda.svg" },
            ].map(f => (
              <div key={f.title} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <img src={"/design-system/login/" + f.icon} alt="" style={{ width: 34, height: 34 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{f.text}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", background: "#2F63F4", borderRadius: 14, padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <img src="/design-system/login/icon-security-shield.svg" alt="" style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Seguro, confiable y siempre disponible</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Tus datos y los de tu empresa estan protegidos con los mas altos estandares de seguridad.</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "48px 42px 34px", background: "rgba(255,255,255,.92)", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {!show2FA && !show2FATotp && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>Iniciar sesion</h2>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Accede a tu cuenta para continuar</p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#B91C1C" }}>{error}</div>}

                <label style={{ fontSize: 12, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Correo electronico</label>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <img src="/design-system/login/icon-email.svg" alt="" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16 }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" style={inputBase} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>Contrasena</label>
                  <a href="#" style={{ fontSize: 12, color: "#2F63F4", textDecoration: "none" }}>Olvidaste tu contrasena?</a>
                </div>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <img src="/design-system/login/icon-lock.svg" alt="" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16 }} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="********" style={{ ...inputBase, paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }} aria-label="Mostrar contrasena">
                    <img src="/design-system/login/icon-eye.svg" alt="" style={{ width: 16, height: 16 }} />
                  </button>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", marginBottom: 20, cursor: "pointer" }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Recordarme en este dispositivo
                </label>

                <button type="submit" disabled={loading} style={{ width: "100%", height: 48, background: "linear-gradient(135deg,#3b82f6,#1e40af)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                  <img src="/design-system/login/icon-login.svg" alt="" style={{ width: 16, height: 16 }} />
                  {loading ? "Accediendo..." : "Acceder"}
                </button>
              </form>

              <div style={{ position: "relative", textAlign: "center", marginBottom: 12 }}>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#E2E8F0" }} />
                <span style={{ position: "relative", background: "rgba(255,255,255,0.92)", padding: "0 12px", fontSize: 12, color: "#94A3B8" }}>o continua con</span>
              </div>
              <div style={{ textAlign: "center", fontSize: 10.5, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 8 }}>Proximamente</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20, opacity: 0.5 }}>
                {[
                  { id: "google", label: "Google", icon: "icon-google.svg" },
                  { id: "microsoft", label: "Microsoft", icon: "icon-microsoft.svg" },
                  { id: "sso", label: "SSO Empresarial", icon: "icon-sso-enterprise.svg" },
                  { id: "apple", label: "Apple", icon: "icon-apple.svg" },
                ].map(p => (
                  <button key={p.id} type="button" disabled title="Proveedor no configurado todavia" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 700, color: "#1E293B", cursor: "not-allowed" }}>
                    <img src={"/design-system/login/" + p.icon} alt="" style={{ width: 22, height: 22 }} />
                    {p.label}
                  </button>
                ))}
              </div>

              <div style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginBottom: 16 }}>
                No tienes cuenta? <a href="#" style={{ color: "#2F63F4", textDecoration: "none", fontWeight: 600 }}>Solicita acceso</a>
              </div>

              <div style={{ background: "#EFF4FF", border: "1px solid #DBE6FF", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <img src="/design-system/login/icon-autenticacion-segura.svg" alt="" style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1E3A8A" }}>Autenticacion segura</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>Tus datos estan protegidos con cifrado de extremo a extremo.</div>
                </div>
              </div>
            </>
          )}

          {show2FA && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 8, textAlign: "center" }}>Verificacion en dos pasos</h2>
              <p style={{ fontSize: 13, color: "#64748B", textAlign: "center", marginBottom: 20 }}>Te enviamos un codigo a {email}</p>
              {error2FA && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#B91C1C" }}>{error2FA}</div>}
              <input value={code2FA} onChange={e => setCode2FA(e.target.value)} maxLength={6} placeholder="000000" style={{ ...inputBase, textAlign: "center", fontSize: 20, letterSpacing: 6, paddingLeft: 14, marginBottom: 16 }} />
              <button onClick={verificarCodigo2FA} disabled={verifying2FA || code2FA.length < 6} style={{ width: "100%", height: 46, background: "linear-gradient(135deg,#3b82f6,#1e40af)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: (verifying2FA || code2FA.length < 6) ? 0.6 : 1 }}>
                {verifying2FA ? "Verificando..." : "Verificar codigo"}
              </button>
            </div>
          )}

          {show2FATotp && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 8, textAlign: "center" }}>Codigo de tu app de autenticacion</h2>
              <p style={{ fontSize: 13, color: "#64748B", textAlign: "center", marginBottom: 20 }}>Introduce el codigo de 6 digitos</p>
              {errorTotp && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#B91C1C" }}>{errorTotp}</div>}
              <input value={codigoTotp} onChange={e => setCodigoTotp(e.target.value)} maxLength={6} placeholder="000000" style={{ ...inputBase, textAlign: "center", fontSize: 20, letterSpacing: 6, paddingLeft: 14, marginBottom: 16 }} />
              <button onClick={verificarTotp} disabled={verifyingTotp || codigoTotp.length < 6} style={{ width: "100%", height: 46, background: "linear-gradient(135deg,#3b82f6,#1e40af)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: (verifyingTotp || codigoTotp.length < 6) ? 0.6 : 1 }}>
                {verifyingTotp ? "Verificando..." : "Verificar codigo"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}