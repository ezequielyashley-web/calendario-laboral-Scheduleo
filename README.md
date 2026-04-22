# 🚀 SCHEDULEO - SESIÓN 1: PROYECTO BASE

**Sistema completo de gestión laboral con 12 fases**

---

## ✅ **SESIÓN 1 COMPLETADA**

Esta es la base del proyecto con:
- ✅ Base de datos PostgreSQL (Prisma + Supabase)
- ✅ Autenticación NextAuth v5 + Seguridad Fase 6B
- ✅ 80 empleados de prueba
- ✅ 9 grupos de trabajo (G1A, G1B, G2A, G2B, G3A, G3B, L1, L2, L3)
- ✅ Rate limiting (5 intentos/15 min)
- ✅ Contraseñas robustas con bcrypt
- ✅ CSRF protection
- ✅ Sistema de auditoría

---

## 📋 **REQUISITOS**

- **Node.js:** 18 o superior
- **Cuenta Supabase:** Gratis en https://supabase.com

---

## 🔧 **INSTALACIÓN PASO A PASO**

### **1. Extraer el proyecto**

Extrae el ZIP en tu carpeta de proyectos:
```
D:\PROYECTOS\Calendario laboral scheduleo completo\scheduleo-sesion1\
```

### **2. Crear base de datos en Supabase**

1. Ve a https://supabase.com
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto:
   - Nombre: `scheduleo`
   - Password: `Scheduleo2024Abc` (guárdala)
   - Región: Europe West (London)
4. Espera 2 minutos a que se cree

### **3. Obtener la URL de conexión**

1. En Supabase, ve a: **Settings** → **Database**
2. Copia la **Connection string** (URI)
3. Reemplaza `[YOUR-PASSWORD]` con tu contraseña

Ejemplo:
```
postgresql://postgres.xxx:Scheduleo2024Abc@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

### **4. Configurar variables de entorno**

1. Copia `.env.example` y renómbralo a `.env`

```powershell
Copy-Item .env.example .env
```

2. Abre `.env` y edita:

```env
DATABASE_URL="tu-url-de-supabase-aqui"
NEXTAUTH_SECRET="scheduleo-secret-2024-muy-largo-aleatorio-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

**IMPORTANTE:** Cambia `NEXTAUTH_SECRET` por un texto aleatorio largo.

### **5. Instalar dependencias**

```powershell
cd scheduleo-sesion1
npm install
```

⏱️ Esto tardará **2-3 minutos**.

### **6. Crear tablas en la base de datos**

```powershell
npx prisma db push
```

Esto crea todas las tablas en Supabase.

### **7. Poblar con datos de prueba**

```powershell
npm run db:seed
```

Esto crea:
- 1 empresa
- 2 sedes (Madrid Centro, Vallecas)
- 80 empleados
- 9 grupos de trabajo
- 2 usuarios de prueba

### **8. Iniciar el proyecto**

```powershell
npm run dev
```

Abre http://localhost:3000

---

## 🔐 **CREDENCIALES DE PRUEBA**

### **Admin (Master Panel):**
- Email: `admin@empresa.com`
- Contraseña: `Scheduleo2024!`

### **Empleado:**
- Email: `empleado1@empresa.com`
- Contraseña: `Scheduleo2024!`

---

## ✅ **VERIFICACIÓN**

Si todo funcionó correctamente:

1. Abre http://localhost:3000
2. Te redirige a `/login`
3. Login con las credenciales de admin
4. Ves el dashboard con mensaje de bienvenida

---

## 📊 **LO QUE YA FUNCIONA**

✅ **Autenticación completa:**
- Login seguro con rate limiting
- Logout
- Protección de rutas
- Sesiones JWT

✅ **Seguridad (Fase 6B):**
- Contraseñas hasheadas con bcrypt
- Rate limiting (5 intentos/15 min)
- CSRF protection
- Headers de seguridad
- HTTPS forzado (producción)

✅ **Base de datos:**
- 80 empleados reales
- 9 grupos de trabajo
- 2 sedes
- Sistema de auditoría configurado

---

## 🔍 **ESTRUCTURA DEL PROYECTO**

```
scheduleo-sesion1/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth
│   │   └── csrf-token/            # CSRF tokens
│   ├── login/                     # Página de login
│   ├── master/dashboard/          # Dashboard master
│   ├── globals.css                # Estilos
│   ├── layout.tsx                 # Layout principal
│   └── page.tsx                   # Página de inicio
├── components/
│   └── SecureLoginForm.tsx        # Formulario login
├── lib/
│   ├── rate-limit.ts              # Rate limiting
│   ├── validation.ts              # Validación inputs
│   ├── csrf.ts                    # CSRF protection
│   └── security-middleware.ts     # Middleware seguridad
├── prisma/
│   ├── schema.prisma              # Modelos de datos
│   └── seed.ts                    # Datos de prueba
├── types/
│   └── next-auth.d.ts             # Tipos TypeScript
├── auth.ts                        # Configuración NextAuth
├── middleware.ts                  # Middleware Next.js
├── package.json                   # Dependencias
└── .env                           # Variables (TÚ CREAS ESTO)
```

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Error: "Cannot find module '@prisma/client'"**

```powershell
npx prisma generate
```

### **Error: "Invalid database connection"**

Verifica que:
1. La URL en `.env` sea correcta
2. Hayas copiado la contraseña correcta de Supabase
3. Supabase esté activo (no pausado)

### **Error: "NEXTAUTH_SECRET is not set"**

Asegúrate de tener `.env` con `NEXTAUTH_SECRET` configurado.

### **La página no carga**

1. Verifica que `npm run dev` esté corriendo
2. Abre http://localhost:3000 (no https)
3. Revisa la consola de PowerShell por errores

---

## 📱 **PRÓXIMA SESIÓN 2**

En la Sesión 2 crearemos:
- ✅ Dashboard con gráficos (Chart.js)
- ✅ Tabla de empleados con filtros
- ✅ **Tu calendario integrado** (el que ya hicimos)
- ✅ Perfil de empleado

**Tiempo:** ~1 hora

---

## 🎯 **COMANDOS ÚTILES**

```powershell
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Base de datos
npx prisma studio        # Ver datos en navegador
npx prisma db push       # Actualizar esquema
npm run db:seed          # Poblar con datos

# Producción
npm run build            # Compilar para producción
npm start                # Servidor de producción
```

---

## 📞 **SOPORTE**

Si algo no funciona:
1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que npm funcione: `npm --version`
3. Revisa los logs en PowerShell
4. Asegúrate de que `.env` esté configurado

---

## 🎉 **¡FELICIDADES!**

Si llegaste hasta aquí, tienes la base completa funcionando.

**Siguiente paso:** Sesión 2 (Dashboard + Calendario)

---

**Scheduleo v1.0 - Sesión 1 Base del Proyecto** ✅
