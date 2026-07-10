"use client"
import { useState, useEffect } from "react"

const violeta = "#673DE6"
const gris = "#6B7280"
const grisClaro = "#E5E7EB"
const verde = "#16A34A"
const verdePale = "#ECFDF3"

export default function Configuracion2FA() {
  const [cargando, setCargando] = useState(true)
  const [totpEnabled, setTotpEnabled] = useState(false)

  const [vista, setVista] = useState<"card" | "modal" | "app" | "qr" | "backup" | "exito">("card")
  const [metodo, setMetodo] = useState<"totp" | "email">("totp")

  const [qr, setQr] = useState("")
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState("")
  const [verificando, setVerificando] = useState(false)
  const [codigosBackup, setCodigosBackup] = useState<string[]>([])
  const [apagando, setApagando] = useState(false)

  useEffect(() => {
    fetch("/api/session-info").then(r => r.json()).then(d => {
      setTotpEnabled(!!d.totpEnabled)
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])

  const iniciarSetup = async () => {
    setError("")
    try {
      const res = await fetch("/api/2fa/setup", { method: "POST" })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setQr(data.qr)
      setVista("qr")
    } catch {
      setError("Error de red al iniciar la configuracion")
    }
  }

  const verificarCodigo = async () => {
    if (!codigo.trim()) { setError("Introduce el codigo de 6 digitos"); return }
    setVerificando(true)
    setError("")
    try {
      const res = await fetch("/api/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo })
      })
      const data = await res.json()
      setVerificando(false)
      if (data.error) { setError(data.error); return }
      setCodigosBackup(data.codigosBackup || [])
      setVista("backup")
    } catch {
      setVerificando(false)
      setError("Error de red al verificar el codigo")
    }
  }

  const finalizarConfiguracion = () => {
    setTotpEnabled(true)
    setVista("exito")
  }

  const apagar = async () => {
    setApagando(true)
    try {
      await fetch("/api/2fa/disable", { method: "POST" })
      setTotpEnabled(false)
      setVista("card")
      setCodigo("")
      setQr("")
    } catch {}
    setApagando(false)
  }

  const descargarBackup = () => {
    const texto = codigosBackup.join("\n")
    const blob = new Blob([texto], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "scheduleo-codigos-backup.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff", border: `1px solid ${grisClaro}`, borderRadius: 12, padding: "20px 22px"
  }
  const btnPrimario: React.CSSProperties = {
    background: violeta, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer"
  }
  const btnSecundario: React.CSSProperties = {
    background: "#fff", color: violeta, border: `1px solid ${violeta}`, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer"
  }
  const inputCodigo: React.CSSProperties = {
    width: "100%", maxWidth: 220, display: "block", margin: "14px auto 0", padding: "10px 12px",
    border: `1px solid ${grisClaro}`, borderRadius: 8, fontSize: 15, textAlign: "center", letterSpacing: 3, outline: "none"
  }

  if (cargando) return <div style={{ ...cardStyle, textAlign: "center", color: gris, fontSize: 13 }}>Cargando...</div>

  return (
    <div style={cardStyle}>

      {/* TARJETA PRINCIPAL: desactivada o activa */}
      {vista === "card" && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#F4F4F4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>Autenticación de dos factores</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: totpEnabled ? "#ECECEC" : "#FFE6EA", color: totpEnabled ? "#666" : "#D84B5F" }}>
                {totpEnabled ? "Activa" : "Desactivada"}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: gris }}>
              {totpEnabled
                ? "Tienes la autenticación móvil vinculada a tu cuenta de Scheduleo."
                : "Añade una capa extra de protección a tu cuenta. Puedes usar una app de autenticación o email. Solo un método puede estar activo a la vez."}
            </div>
          </div>
          {totpEnabled ? (
            <button style={btnSecundario} onClick={apagar} disabled={apagando}>{apagando ? "Apagando..." : "Apagar"}</button>
          ) : (
            <button style={btnPrimario} onClick={() => setVista("modal")}>Activar</button>
          )}
        </div>
      )}

      {/* MODAL: elegir metodo */}
      {vista === "modal" && (
        <div onClick={() => setVista("card")} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 460 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#222", marginBottom: 6 }}>Elige tu método de autenticación</div>
            <div style={{ fontSize: 13, color: gris, marginBottom: 20, lineHeight: 1.5 }}>Cada vez que inicies sesión, deberás introducir un código de un solo uso.</div>

            <div onClick={() => setMetodo("totp")} style={{ border: `1.5px solid ${metodo === "totp" ? violeta : grisClaro}`, borderRadius: 10, padding: 14, marginBottom: 10, cursor: "pointer", display: "flex", gap: 12 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${metodo === "totp" ? violeta : grisClaro}`, marginTop: 2, flexShrink: 0, position: "relative" }}>
                {metodo === "totp" && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: violeta }} />}
              </div>
              <div>
                <b style={{ fontSize: 13.5, color: "#222" }}>App de autenticación</b>
                <div style={{ fontSize: 12, color: gris, marginTop: 2 }}>Usa Google Authenticator o Authy para obtener un código temporal en tu móvil.</div>
              </div>
            </div>

            <div onClick={() => setMetodo("email")} style={{ border: `1.5px solid ${metodo === "email" ? violeta : grisClaro}`, borderRadius: 10, padding: 14, marginBottom: 20, cursor: "pointer", display: "flex", gap: 12 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${metodo === "email" ? violeta : grisClaro}`, marginTop: 2, flexShrink: 0, position: "relative" }}>
                {metodo === "email" && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: violeta }} />}
              </div>
              <div>
                <b style={{ fontSize: 13.5, color: "#222" }}>Email</b>
                <div style={{ fontSize: 12, color: gris, marginTop: 2 }}>Te enviaremos el código a tu dirección de correo cada vez que inicies sesión.</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button style={{ background: "none", border: "none", color: gris, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "9px 6px" }} onClick={() => setVista("card")}>Cancelar</button>
              <button style={btnPrimario} onClick={async () => {
                if (metodo === "email") {
                  await fetch("/api/2fa/disable", { method: "POST" })
                  setTotpEnabled(false)
                  setVista("card")
                  return
                }
                setVista("app")
              }}>Seleccionar</button>
            </div>
          </div>
        </div>
      )}

      {/* PASO: elegir/descargar app */}
      {vista === "app" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#222", marginBottom: 6 }}>Descarga la app de autenticación</div>
          <div style={{ fontSize: 12.5, color: gris, marginBottom: 16 }}>Puedes elegir tu app de autenticación entre las siguientes sugerencias:</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {["Google Authenticator", "Authy"].map(app => (
              <div key={app} style={{ flex: 1, border: `1px solid ${grisClaro}`, borderRadius: 8, padding: "14px 10px", textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "#222" }}>{app}</div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={btnPrimario} onClick={iniciarSetup}>Continuar</button>
          </div>
          {error && <div style={{ color: "#DC2626", fontSize: 12.5, marginTop: 10 }}>{error}</div>}
        </div>
      )}

      {/* PASO: escanear QR + verificar */}
      {vista === "qr" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#222", marginBottom: 6 }}>Escanea el código QR</div>
          <div style={{ fontSize: 12.5, color: gris, marginBottom: 16, lineHeight: 1.5 }}>
            Escanea el código con tu app de autenticación preferida e introduce el código de 6 dígitos que genera.
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            {qr && <img src={qr} alt="Codigo QR" width={160} height={160} style={{ borderRadius: 8 }} />}
          </div>
          <input
            value={codigo}
            onChange={e => setCodigo(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="000000"
            style={inputCodigo}
          />
          {error && <div style={{ color: "#DC2626", fontSize: 12.5, marginTop: 10, textAlign: "center" }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button style={btnPrimario} onClick={verificarCodigo} disabled={verificando}>{verificando ? "Verificando..." : "Verificar"}</button>
          </div>
        </div>
      )}

      {/* PASO: guardar codigos de backup */}
      {vista === "backup" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#222", marginBottom: 6 }}>Guarda tus códigos de backup</div>
          <div style={{ fontSize: 12.5, color: gris, marginBottom: 16, lineHeight: 1.5 }}>
            Serán visibles solo <b style={{ color: "#222" }}>una vez</b>. Guárdalos en un lugar seguro al que solo tú puedas acceder.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px 18px", background: "#FAFAFA", border: `1px solid ${grisClaro}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            {codigosBackup.map(c => (
              <span key={c} style={{ fontFamily: "monospace", fontSize: 12.5, color: "#222" }}>{c}</span>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={{ background: "none", border: "none", color: gris, fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={descargarBackup}>Descargar</button>
            <button style={btnPrimario} onClick={finalizarConfiguracion}>Finalizar configuración</button>
          </div>
        </div>
      )}

      {/* CONFIRMACION FINAL */}
      {vista === "exito" && (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={verde} strokeWidth="2" style={{ marginBottom: 12 }}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#222", marginBottom: 8 }}>¡Has configurado la autenticación móvil!</div>
          <div style={{ fontSize: 12.5, color: gris, maxWidth: 380, margin: "0 auto 18px", lineHeight: 1.5 }}>
            Cada vez que accedas a tu cuenta, tendrás que introducir un código generado desde tu app móvil. Si pierdes acceso a tu dispositivo, usa los códigos de backup.
          </div>
          <button style={btnPrimario} onClick={() => setVista("card")}>Ir a ajustes de autenticación</button>
        </div>
      )}
    </div>
  )
}