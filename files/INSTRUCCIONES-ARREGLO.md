# 🔧 ARREGLAR ERRORES DE NEXTAUTH V5

## ❌ **PROBLEMAS DETECTADOS:**

1. `getServerSession is not a function` - Sintaxis incorrecta NextAuth v5
2. Error de Prisma en login

---

## ✅ **SOLUCIÓN:**

Reemplazar 2 archivos con las versiones corregidas.

---

## 📝 **PASO 1: DETENER EL SERVIDOR**

En PowerShell, presiona **Ctrl+C** para detener `npm run dev`

---

## 📝 **PASO 2: REEMPLAZAR auth.ts**

1. Descarga el archivo **auth.ts** (arriba ⬆️)
2. Cópialo a:
```
D:\PROYECTOS\Calendario laboral scheduleo completo\proyecto calendario\auth.ts
```
3. **Reemplaza** el archivo existente

---

## 📝 **PASO 3: REEMPLAZAR csrf-token route**

1. Descarga el archivo **csrf-token-route.ts** (arriba ⬆️)
2. Renómbralo a **route.ts**
3. Cópialo a:
```
D:\PROYECTOS\Calendario laboral scheduleo completo\proyecto calendario\app\api\csrf-token\route.ts
```
4. **Reemplaza** el archivo existente

---

## 📝 **PASO 4: REINICIAR SERVIDOR**

En PowerShell:
```powershell
npm run dev
```

---

## 🌐 **PASO 5: PROBAR LOGIN**

1. Abre: http://localhost:3000
2. Email: `admin@empresa.com`
3. Contraseña: `Scheduleo2024!`

---

## ✅ **RESULTADO ESPERADO:**

- ❌ Ya NO debe aparecer el error "1 error"
- ✅ El login debe funcionar
- ✅ Debes entrar al Dashboard

---

**Reemplaza los 2 archivos y reinicia el servidor** 🚀
