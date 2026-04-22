# 🔐 Sistema de Restablecimiento de Contraseña - Scheduleo

Sistema completo para restablecer contraseñas con tokens seguros y expiración automática.

## 📦 CONTENIDO

```
reset-password-system/
├── prisma/
│   ├── migration.sql              # SQL para crear tabla en Supabase
│   └── schema-addition.prisma     # Modelo Prisma para agregar
├── app/
│   ├── api/auth/
│   │   ├── forgot-password/route.ts   # API: solicitar reset
│   │   └── reset-password/route.ts     # API: cambiar contraseña
│   ├── forgot-password/page.tsx        # UI: solicitar reset
│   └── reset-password/page.tsx         # UI: nueva contraseña
├── login-update.tsx                # Link para agregar al login
├── tests/
│   └── test-reset-flow.js         # Script de prueba
└── README.md                      # Este archivo
```

## 🚀 INSTALACIÓN

### PASO 1: Actualizar Prisma Schema

Abre `prisma/schema.prisma` y:

1. **Agregar el modelo PasswordResetToken:**
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires   DateTime
  createdAt DateTime @default(now())
  used      Boolean  @default(false)

  @@index([userId])
}
```

2. **Actualizar el modelo User para agregar la relación:**
```prisma
model User {
  // ... campos existentes ...
  passwordResetTokens PasswordResetToken[]
}
```

### PASO 2: Aplicar Migración en Supabase

**Opción A - Desde Supabase SQL Editor:**
1. Ve a: https://supabase.com/dashboard/project/ndqgmiutwzchanmclqxs/sql/new
2. Copia y pega el contenido de `prisma/migration.sql`
3. Click en "Run"

**Opción B - Desde Prisma (RECOMENDADO):**
```bash
cd "D:\PROYECTOS\Calendario laboral scheduleo completo\proyecto calendario"
npx prisma db push
```

### PASO 3: Copiar Archivos

Copia los archivos a tu proyecto:

```bash
# APIs
cp app/api/auth/forgot-password/route.ts → tu-proyecto/app/api/auth/forgot-password/route.ts
cp app/api/auth/reset-password/route.ts → tu-proyecto/app/api/auth/reset-password/route.ts

# Páginas
cp app/forgot-password/page.tsx → tu-proyecto/app/forgot-password/page.tsx
cp app/reset-password/page.tsx → tu-proyecto/app/reset-password/page.tsx
```

### PASO 4: Actualizar Login

Abre `app/login/page.tsx` y agrega el link de "¿Olvidaste tu contraseña?":

```tsx
// Importar Link
import Link from "next/link"

// Agregar después del botón de login:
<div className="text-center mt-4">
  <Link
    href="/forgot-password"
    className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
  >
    ¿Olvidaste tu contraseña?
  </Link>
</div>
```

### PASO 5: Verificar Variables de Entorno

Asegúrate de tener en `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="tu-conexion-supabase"
NEXTAUTH_SECRET="tu-secret"
```

## ✅ PRUEBA DEL SISTEMA

### Test Manual:

1. **Inicia el servidor:**
```bash
npm run dev
```

2. **Ve a la página de reset:**
```
http://localhost:3000/forgot-password
```

3. **Ingresa el email:**
```
admin@empresa.com
```

4. **Copia la URL que aparece** (solo en desarrollo)

5. **Pégala en el navegador** y establece nueva contraseña

6. **Prueba login** con la nueva contraseña

### Test Automatizado:

```bash
cd tests
node test-reset-flow.js
```

## 🔒 SEGURIDAD

✅ Tokens únicos de 32 bytes (crypto)
✅ Expiración automática (1 hora)
✅ Un solo uso por token
✅ Hashing bcrypt para contraseñas
✅ No revela si el email existe
✅ Invalidación de tokens anteriores

## 📧 ENVÍO DE EMAILS (TODO)

Actualmente el sistema muestra la URL en desarrollo. Para producción:

1. Instala servicio de email (ej: Resend, SendGrid)
2. Configura en `forgot-password/route.ts`
3. Remover la línea que retorna `resetUrl`

## 🐛 TROUBLESHOOTING

**Error: "Token inválido o expirado"**
- El token ya fue usado o expiró (1 hora)
- Solicita un nuevo reset

**Error: "No rows returned" en migration**
- Ejecuta `npx prisma db push` en lugar del SQL manual

**Error: "Module not found: PrismaClient"**
- Ejecuta `npx prisma generate`

## 📝 NOTAS

- Los tokens expiran en 1 hora
- Un token solo puede usarse una vez
- Las contraseñas deben tener mínimo 4 caracteres
- En desarrollo se muestra la URL de reset (remover en producción)

## ✨ FUNCIONALIDADES

- ✅ Solicitar restablecimiento por email
- ✅ Generar token seguro
- ✅ Validar token y expiración
- ✅ Cambiar contraseña
- ✅ Invalidar tokens usados
- ✅ UI completa y responsive
- ✅ Manejo de errores robusto

---

**Creado para Scheduleo v2.0 - Fase 6**
