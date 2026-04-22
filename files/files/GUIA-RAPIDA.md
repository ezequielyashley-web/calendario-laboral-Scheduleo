# 🚀 GUÍA DE INSTALACIÓN RÁPIDA

## ⏱️ TIEMPO ESTIMADO: 10 minutos

### PASO 1: Extraer ZIP (1 min)
1. Descarga el ZIP
2. Extráelo en una carpeta temporal

### PASO 2: Actualizar Schema (2 min)
1. Abre: `D:\PROYECTOS\Calendario laboral scheduleo completo\proyecto calendario\prisma\schema.prisma`
2. Busca el modelo `User`
3. Agrega al final del modelo User:
   ```prisma
   passwordResetTokens PasswordResetToken[]
   ```
4. Al final del archivo, agrega el modelo completo de `reset-password-system/prisma/schema-addition.prisma`

### PASO 3: Aplicar Migración (2 min)
```powershell
cd "D:\PROYECTOS\Calendario laboral scheduleo completo\proyecto calendario"
npx prisma db push
```

### PASO 4: Copiar Archivos (3 min)
Copia los siguientes archivos desde el ZIP a tu proyecto:

```
reset-password-system/app/api/auth/forgot-password/route.ts
  ↓
D:\PROYECTOS\...\app\api\auth\forgot-password\route.ts

reset-password-system/app/api/auth/reset-password/route.ts
  ↓
D:\PROYECTOS\...\app\api\auth\reset-password\route.ts

reset-password-system/app/forgot-password/page.tsx
  ↓
D:\PROYECTOS\...\app\forgot-password\page.tsx

reset-password-system/app/reset-password/page.tsx
  ↓
D:\PROYECTOS\...\app\reset-password\page.tsx
```

### PASO 5: Actualizar Login (1 min)
Abre: `app/login/page.tsx`

Agrega al inicio:
```tsx
import Link from "next/link"
```

Después del botón "Iniciar Sesión", agrega:
```tsx
<div className="text-center mt-4">
  <Link
    href="/forgot-password"
    className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
  >
    ¿Olvidaste tu contraseña?
  </Link>
</div>
```

### PASO 6: Probar (1 min)
```powershell
npm run dev
```

Ve a: http://localhost:3000/login
Click en "¿Olvidaste tu contraseña?"

## ✅ LISTO!

El sistema está funcionando cuando:
- ✅ Puedes acceder a `/forgot-password`
- ✅ Ingresas email y recibes confirmación
- ✅ Se muestra URL de reset (solo desarrollo)
- ✅ Puedes cambiar contraseña
- ✅ Login funciona con nueva contraseña

## 🐛 Si algo falla:

1. Verifica que el servidor esté corriendo
2. Revisa la consola del servidor por errores
3. Ejecuta: `npx prisma generate`
4. Reinicia el servidor

## 📞 SOPORTE

Si tienes problemas:
1. Lee el README.md del ZIP
2. Ejecuta el test: `node tests/test-reset-flow.js`
3. Revisa los logs del servidor
