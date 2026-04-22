# 🚀 SCHEDULEO - INSTALACIÓN EN 5 PASOS

## ⚡ INSTALACIÓN RÁPIDA (10 minutos)

### **PASO 1: Extraer el ZIP**
Extrae `scheduleo-COMPLETO-v2.zip` en:
```
D:\PROYECTOS\Calendario laboral scheduleo completo\
```

Ruta final: `D:\PROYECTOS\Calendario laboral scheduleo completo\scheduleo-v2\`

---

### **PASO 2: Configurar base de datos**

1. Abre `.env` con Bloc de notas
2. Busca la línea `DATABASE_URL=`
3. Reemplaza `TU_CONTRASEÑA_AQUI` con tu contraseña de Supabase

**Ejemplo:**
```
DATABASE_URL="postgresql://postgres.ndqgmiutwzchanmclqxs:tVqVTbt9uRD0QKYu@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"
```

**⚠️ IMPORTANTE:** Si tu contraseña tiene caracteres especiales, lee `SOLUCION-SUPABASE.md`

---

### **PASO 3: Abrir PowerShell en la carpeta**

1. Abre la carpeta `scheduleo-v2` en el Explorador de archivos
2. Haz clic en la barra de ruta (arriba)
3. Escribe: `powershell`
4. Presiona Enter

---

### **PASO 4: Instalar dependencias**

En PowerShell:
```powershell
npm install --legacy-peer-deps
```

⏱️ Tarda 3-5 minutos. Espera hasta que termine.

---

### **PASO 5: Crear base de datos e iniciar**

```powershell
npx prisma db push
```

Espera que termine, luego:

```powershell
npm run db:seed
```

Verás: `✅ 80 empleados creados`

Finalmente:

```powershell
npm run dev
```

---

## ✅ **¡LISTO!**

Abre: http://localhost:3000

**Login:**
- Email: `admin@empresa.com`
- Contraseña: `Scheduleo2024!`

---

## 🎯 **LO QUE TIENES:**

✅ **SESIÓN 1:** Proyecto base + Auth + Seguridad  
✅ **SESIÓN 2:** Dashboard con KPIs + Tabla empleados + Gráficos  
✅ 80 empleados de prueba  
✅ 2 sedes (Madrid Centro + Vallecas)  
✅ 9 grupos de trabajo  

---

## ❓ **SI ALGO FALLA:**

Lee `SOLUCION-SUPABASE.md` para problemas de conexión.

---

## 🔄 **PARA VOLVER A ABRIR:**

1. PowerShell en la carpeta
2. `npm run dev`
3. http://localhost:3000
