# 📦 SCHEDULEO V2 - CONTENIDO COMPLETO

## 🎯 **LO QUE TIENES:**

### **SESIÓN 1 - Proyecto Base** ✅
- ✅ Autenticación NextAuth v5
- ✅ Seguridad Fase 6B (rate limiting, CSRF, headers)
- ✅ Base de datos Prisma + Supabase
- ✅ 80 empleados de prueba
- ✅ 2 sedes: Madrid Centro (45), Vallecas (35)
- ✅ 9 grupos: G1A/G1B (azul), G2A/G2B (rojo), G3A/G3B (verde), L1/L2/L3 (lunes)

### **SESIÓN 2 - Dashboard + Gestión** ✅
- ✅ Dashboard con 4 KPIs (Total empleados, Activos hoy, Solicitudes pendientes, Fichajes)
- ✅ Gráfico de líneas (Fichajes últimos 7 días)
- ✅ Gráfico de barras (Empleados por sede)
- ✅ Gráfico de dona (Distribución por grupos)
- ✅ Tabla de empleados con filtros (búsqueda, sede, grupo, estado)
- ✅ Paginación (10 por página)

---

## 📁 **ESTRUCTURA DEL PROYECTO:**

```
scheduleo-v2/
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── signin/
│   │           └── page.tsx          # Página de login
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard principal
│   │   └── empleados/
│   │       └── page.tsx              # Gestión de empleados
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # API NextAuth
│   ├── layout.tsx
│   └── page.tsx                      # Redirección a dashboard
│
├── components/
│   ├── DashboardMaster.tsx           # Dashboard con KPIs y gráficos
│   ├── TablaEmpleados.tsx            # Tabla con filtros
│   └── SecureLoginForm.tsx           # Formulario de login
│
├── lib/
│   ├── rate-limit.ts                 # Rate limiting
│   ├── validation.ts                 # Validaciones
│   ├── csrf.ts                       # Tokens CSRF
│   └── security-middleware.ts        # Middleware de seguridad
│
├── prisma/
│   ├── schema.prisma                 # 14 modelos de BD
│   └── seed.ts                       # Seed con 80 empleados
│
├── auth.ts                           # Configuración NextAuth
├── middleware.ts                     # Middleware global
├── package.json                      # Dependencias corregidas
├── .env.example                      # Template de variables
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🔑 **CREDENCIALES DE PRUEBA:**

### **Administrador:**
- Email: `admin@empresa.com`
- Contraseña: `Scheduleo2024!`
- Rol: SUPER_ADMIN

### **Empleado:**
- Email: `empleado1@empresa.com`
- Contraseña: `Scheduleo2024!`
- Rol: EMPLEADO

---

## 🎨 **PALETA DE COLORES:**

### **Grupos de trabajo:**
- **G1A/G1B:** Azul (`#3b82f6`, `#60a5fa`)
- **G2A/G2B:** Rojo (`#ef4444`, `#f87171`)
- **G3A/G3B:** Verde (`#22c55e`, `#4ade80`)

### **UI Principal:**
- **Primario:** Cyan (`#0284c7`)
- **Secundario:** Azul (`#3b82f6`)
- **Éxito:** Verde (`#22c55e`)
- **Advertencia:** Naranja (`#f97316`)
- **Error:** Rojo (`#ef4444`)

---

## 📊 **MODELOS DE BASE DE DATOS:**

1. **Empresa** - Datos de la empresa
2. **User** - Usuarios del sistema (auth)
3. **Empleado** - Datos de empleados
4. **Sede** - Ubicaciones de trabajo
5. **GrupoTrabajo** - Grupos MXJVS y Lunes
6. **Vacacion** - Solicitudes de vacaciones
7. **Fichaje** - Registro de entrada/salida
8. **CambioTurno** - Intercambios de turnos
9. **Deuda** - Deudas de días
10. **Adelanto** - Adelantos de sueldo
11. **Configuracion** - Ajustes del sistema
12. **LogAuditoria** - Auditoría de acciones

---

## 🚀 **TECNOLOGÍAS:**

- **Framework:** Next.js 15
- **Lenguaje:** TypeScript
- **UI:** React 18 + Tailwind CSS
- **Base de datos:** PostgreSQL (Supabase)
- **ORM:** Prisma 5.20
- **Autenticación:** NextAuth v5
- **Gráficos:** Chart.js + react-chartjs-2
- **Formularios:** React Hook Form + Zod
- **Iconos:** Lucide React
- **Deploy:** Vercel (gratis)

---

## 📝 **ARCHIVOS IMPORTANTES:**

### **INSTRUCCIONES-5-PASOS.md**
Guía rápida de instalación (10 minutos)

### **SOLUCION-SUPABASE.md**
Solución a errores de conexión con Supabase

### **.env.example**
Template de variables de entorno
- Solo necesitas pegar tu contraseña de Supabase

### **package.json**
Dependencias corregidas:
- React 18.3.1 (compatible)
- tailwind-merge 2.5.2 (existe)
- @hello-pangea/dnd 16.6.0 (compatible)

---

## ✅ **PRUEBA QUE FUNCIONA:**

Después de instalar:

1. **Login:** http://localhost:3000
2. **Dashboard:** Verás 4 KPIs + 3 gráficos
3. **Empleados:** 80 empleados en tabla filtrable

---

## 🔜 **SIGUIENTE SESIÓN (Pendiente):**

**SESIÓN 3:** Calendario global + Gestión de grupos

---

## 🆘 **SOPORTE:**

Si algo no funciona:
1. Lee `SOLUCION-SUPABASE.md`
2. Verifica que PowerShell está en la carpeta correcta
3. Verifica que ejecutaste `npm install --legacy-peer-deps`
4. Verifica que la URL de Supabase tiene puerto `6543` (no 5432)

---

**¡DISFRUTA SCHEDULEO!** 🎉
