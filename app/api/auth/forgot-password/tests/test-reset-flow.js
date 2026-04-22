// tests/test-reset-flow.js
// Test del flujo completo de restablecimiento de contraseña

const baseUrl = "http://localhost:3000"

console.log("🧪 INICIANDO PRUEBAS DE RESTABLECIMIENTO DE CONTRASEÑA\n")

async function test() {
  try {
    // TEST 1: Solicitar restablecimiento
    console.log("📧 TEST 1: Solicit ando restablecimiento...")
    const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@empresa.com" }),
    })

    const forgotData = await forgotRes.json()
    
    if (!forgotRes.ok) {
      console.error("❌ Error en forgot-password:", forgotData.error)
      return
    }

    console.log("✅ Solicitud exitosa")
    console.log("   Mensaje:", forgotData.message)

    if (!forgotData.resetUrl) {
      console.log("⚠️  No hay resetUrl (normal en producción)")
      console.log("   Revisa los logs del servidor para el token")
      return
    }

    // Extraer token de la URL
    const token = new URL(forgotData.resetUrl).searchParams.get("token")
    console.log("   Token generado:", token.substring(0, 10) + "...")

    // TEST 2: Intentar con token inválido
    console.log("\n🔒 TEST 2: Probando token inválido...")
    const invalidRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "token-invalido-123",
        password: "nueva123",
      }),
    })

    const invalidData = await invalidRes.json()
    
    if (invalidRes.ok) {
      console.error("❌ ERROR: Token inválido fue aceptado!")
      return
    }

    console.log("✅ Token inválido rechazado correctamente")
    console.log("   Error:", invalidData.error)

    // TEST 3: Restablecer con token válido
    console.log("\n🔑 TEST 3: Restableciendo contraseña...")
    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token,
        password: "1234",
      }),
    })

    const resetData = await resetRes.json()

    if (!resetRes.ok) {
      console.error("❌ Error al restablecer:", resetData.error)
      return
    }

    console.log("✅ Contraseña restablecida exitosamente")
    console.log("   Mensaje:", resetData.message)

    // TEST 4: Intentar reusar el mismo token
    console.log("\n♻️  TEST 4: Intentando reusar token...")
    const reuseRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token,
        password: "otra123",
      }),
    })

    const reuseData = await reuseRes.json()

    if (reuseRes.ok) {
      console.error("❌ ERROR: Token usado fue aceptado de nuevo!")
      return
    }

    console.log("✅ Token usado rechazado correctamente")
    console.log("   Error:", reuseData.error)

    // RESUMEN
    console.log("\n" + "=".repeat(50))
    console.log("✨ TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
    console.log("=".repeat(50))
    console.log("\n📋 Resumen:")
    console.log("  ✅ Generación de token")
    console.log("  ✅ Validación de token inválido")
    console.log("  ✅ Restablecimiento de contraseña")
    console.log("  ✅ Prevención de reuso de token")
    console.log("\n🎉 Sistema de restablecimiento funcionando correctamente!")
    console.log("\n💡 Ahora puedes hacer login con:")
    console.log("   Email: admin@empresa.com")
    console.log("   Contraseña: 1234")

  } catch (error) {
    console.error("\n❌ ERROR EN PRUEBAS:", error.message)
    console.error("\n💡 Asegúrate de que:")
    console.error("   1. El servidor está corriendo (npm run dev)")
    console.error("   2. La migración fue aplicada")
    console.error("   3. Los archivos están en las carpetas correctas")
  }
}

test()
