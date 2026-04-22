# 🔄 ACTUALIZAR DE SESIÓN 1 A SESIÓN 2

## 🎯 **OPCIÓN RECOMENDADA: USAR EL PROYECTO SESIÓN 1 QUE YA TIENES**

Ya tienes `scheduleo-sesion1` funcionando (o casi). Vamos a añadirle SESIÓN 2.

---

## ✅ **PASO 1: ARREGLAR EL .ENV**

**PROBLEMA ACTUAL:** Tu contraseña `tVqVTbt9uRD0QKYu` necesita codificación URL.

**SOLUCIÓN RÁPIDA:**

1. Abre PowerShell en tu carpeta del proyecto
2. Ejecuta:
```powershell
node -e "console.log(encodeURIComponent('tVqVTbt9uRD0QKYu'))"
```

3. Copia el resultado (debería ser: `tVqVTbt9uRD0QKYu` - sin cambios si no tiene caracteres especiales)

4. Abre `.env`:
```powershell
notepad .env
```

5. Usa esta URL EXACTA:
```
DATABASE_URL="postgresql://postgres.ndqgmiutwzchanmclqxs:tVqVTbt9uRD0QKYu@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"
```

**IMPORTANTE:** Fíjate en `aws-1` (no aws-0)

6. Guarda y cierra

7. Prueba:
```powershell
npx prisma db push
```

---

## ✅ **PASO 2: AÑADIR COMPONENTES DE SESIÓN 2**

Descarga estos 2 archivos que te acabo de dar:
- `DashboardMaster.tsx`
- `TablaEmpleados.tsx`

Guárdalos en:
```
D:\PROYECTOS\Calendario laboral scheduleo completo\scheduleo-sesion1\components\
```

---

## ✅ **PASO 3: CREAR PÁGINAS**

### **3.1 Página Dashboard**

Crea: `app\(dashboard)\dashboard\page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import DashboardMaster from '@/components/DashboardMaster'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Panel de Control
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Bienvenido, {session.user?.name || session.user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-lg font-semibold">
                {session.user?.role === 'SUPER_ADMIN' ? 'ADMINISTRADOR' : 'EMPLEADO'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardMaster />
      </main>
    </div>
  )
}
```

### **3.2 Página Empleados**

Crea: `app\(dashboard)\empleados\page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import TablaEmpleados from '@/components/TablaEmpleados'

export default async function EmpleadosPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user?.role !== 'SUPER_ADMIN' && session.user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Empleados
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Administra el equipo de trabajo
              </p>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
            >
              ← Volver al Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TablaEmpleados />
      </main>
    </div>
  )
}
```

---

## ✅ **PASO 4: CREAR TABLAS E INICIAR**

```powershell
npx prisma db push
npm run db:seed
npm run dev
```

---

## 🎉 **¡LISTO!**

Abre: http://localhost:3000

Ahora tienes:
- ✅ Dashboard con KPIs y gráficos
- ✅ Tabla de empleados filtrable
- ✅ 80 empleados de prueba

---

## 🔗 **RUTAS DISPONIBLES:**

- `/` → Redirecciona a `/dashboard`
- `/auth/signin` → Login
- `/dashboard` → Dashboard principal
- `/empleados` → Gestión de empleados (solo admin)

---

## ❓ **SI ALGO FALLA:**

1. **Error de conexión Supabase:** Lee `SOLUCION-SUPABASE.md`
2. **Componentes no se encuentran:** Verifica que están en `components/`
3. **Error de TypeScript:** Ejecuta `npm run build` para ver errores
