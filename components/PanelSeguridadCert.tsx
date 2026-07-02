export default function PanelSeguridadCert() {
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(240,253,244,0.97),rgba(236,253,245,0.95))", border: "1px solid #A7F3D0", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(16,185,129,0.1)", maxWidth: 460 }}>
      <div style={{ background: "linear-gradient(90deg,#059669,#10B981)", padding: "6px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: ".08em", textTransform: "uppercase" as const }}>Certificado de seguridad</span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>AES-256-GCM · Grado A</span>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#065F46", textTransform: "uppercase" as const, letterSpacing: ".06em", marginBottom: 3 }}>Nivel de proteccion global</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", letterSpacing: "-.02em" }}>Grado A · Alta seguridad</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Equivalente a sistemas bancarios europeos</div>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#059669", lineHeight: 1 }}>95%</div>
            <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" as const }}>Proteccion</div>
          </div>
        </div>
        <div style={{ height: 4, background: "rgba(167,243,208,0.4)", borderRadius: 999, marginBottom: 14 }}>
          <div style={{ width: "95%", height: "100%", background: "linear-gradient(90deg,#059669,#34D399)", borderRadius: 999 }} />
        </div>
        <div style={{ border: "1px solid rgba(167,243,208,0.6)", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ background: "rgba(167,243,208,0.2)", padding: "6px 12px", display: "grid", gridTemplateColumns: "1fr auto", borderBottom: "1px solid rgba(167,243,208,0.4)" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#065F46", textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Capa de proteccion</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#065F46", textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Estado</span>
          </div>
          <div style={{ padding: "0 12px" }}>
            {[
              { label: "Cifrado en transito", desc: "TLS 1.3 · HTTPS forzado", max: false },
              { label: "Cifrado en reposo", desc: "AES-256 · Supabase", max: false },
              { label: "Cifrado por campo AES-256-GCM", desc: "DNI · IBAN · NAF · Salario", max: true },
              { label: "Control de acceso por roles", desc: "RLS · NextAuth v5", max: false },
              { label: "2FA en inicio de sesion", desc: "Codigo por email en cada login", max: false },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(167,243,208,0.2)" : "none", background: item.max ? "rgba(16,185,129,0.04)" : "transparent" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: item.max ? 700 : 600, color: item.max ? "#064E3B" : "#1e1b4b" }}>{item.label}</span>
                    {item.max && <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 3 }}>MAX</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>{item.desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#059669" }}>Activo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12 }}>🇪🇺</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#065F46" }}>RGPD · Ley Organica 3/2018</div>
              <div style={{ fontSize: 9, color: "#6B7280" }}>Art. 32 · Medidas tecnicas de seguridad</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.7)", border: "1px solid #6EE7B7", borderRadius: 20, padding: "3px 10px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 4px #10B981" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#059669" }}>COMPLIANT</span>
          </div>
        </div>
      </div>
    </div>
  )
}