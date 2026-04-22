const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "TU_EMAIL_AQUI@gmail.com",  // <-- CAMBIA ESTO
      subject: "Test Scheduleo",
      html: "<h1>Funciona!</h1>"
    });
    
    console.log("✅ EMAIL ENVIADO:", data);
  } catch (error) {
    console.log("❌ ERROR:", error);
  }
}

test();
