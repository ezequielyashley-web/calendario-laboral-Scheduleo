// Agregar este código en app/login/page.tsx
// Después del botón de "Iniciar Sesión", agregar:

<div className="text-center mt-4">
  <Link
    href="/forgot-password"
    className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
  >
    ¿Olvidaste tu contraseña?
  </Link>
</div>

// No olvides importar Link al inicio del archivo:
// import Link from "next/link"
