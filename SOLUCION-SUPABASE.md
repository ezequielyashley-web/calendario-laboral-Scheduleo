# 🔧 SOLUCIÓN AL ERROR DE SUPABASE

## ❌ **PROBLEMA:**

Error: `Authentication failed` o `Tenant or user not found`

---

## ✅ **CAUSA:**

Tu contraseña de Supabase (`tVqVTbt9uRD0QKYu`) puede tener caracteres que necesitan codificación URL.

---

## 🎯 **SOLUCIÓN 1: CODIFICAR LA CONTRASEÑA**

### **Opción A: Usar herramienta online**

1. Ve a: https://www.urlencoder.org/
2. Pega tu contraseña: `tVqVTbt9uRD0QKYu`
3. Haz clic en **Encode**
4. Copia el resultado
5. Úsalo en tu `.env`

### **Opción B: Usar Node.js**

En PowerShell (en la carpeta del proyecto):

```powershell
node -e "console.log(encodeURIComponent('tVqVTbt9uRD0QKYu'))"
```

Copia el resultado y úsalo en `.env`

---

## 🎯 **SOLUCIÓN 2: CREAR NUEVA CONTRASEÑA**

1. Ve a Supabase: https://supabase.com/dashboard/project/ndqgmiutwzchanmclqxs/settings/database
2. Haz clic en **"Reset password"**
3. **IMPORTANTE:** Elige una contraseña SIN caracteres especiales
   - ✅ Solo letras y números
   - ❌ No uses: `@`, `#`, `$`, `%`, `/`, etc.
4. Ejemplo bueno: `Scheduleo2024Abc123`
5. Copia la nueva contraseña
6. Úsala en tu `.env`

---

## 📝 **FORMATO CORRECTO DEL .ENV:**

```
DATABASE_URL="postgresql://postgres.ndqgmiutwzchanmclqxs:TU_CONTRASEÑA@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"
```

**Reemplaza:**
- `TU_CONTRASEÑA` por tu contraseña real (codificada si tiene caracteres especiales)

**Componentes importantes:**
- ✅ Empieza con `postgresql://`
- ✅ Usuario: `postgres.ndqgmiutwzchanmclqxs`
- ✅ Host: `aws-1-eu-central-1.pooler.supabase.com` (fíjate en **aws-1**, no aws-0)
- ✅ Puerto: `6543` (pooler, NO 5432)
- ✅ Database: `postgres`

---

## 🔍 **VERIFICAR QUE FUNCIONA:**

```powershell
npx prisma db push
```

Si ves:
```
✔ Your database is now in sync with your schema.
```

**✅ ¡FUNCIONA!**

Si sigue sin funcionar:
```
❌ Verifica que copiaste bien toda la URL
❌ Verifica que la contraseña no tiene espacios
❌ Verifica que usas puerto 6543 (no 5432)
❌ Verifica que es aws-1 (no aws-0)
```

---

## 🆘 **ÚLTIMA OPCIÓN:**

Si nada funciona, el proyecto puede estar pausado en Supabase.

1. Ve a: https://supabase.com/dashboard/project/ndqgmiutwzchanmclqxs
2. Si dice **"PAUSED"** o "Pausado"
3. Haz clic en **"Resume"** o "Reanudar"
4. Espera 2-3 minutos
5. Intenta de nuevo

---

## ✅ **UNA VEZ QUE FUNCIONE:**

Continúa con las instrucciones normales:
```powershell
npm run db:seed
npm run dev
```
