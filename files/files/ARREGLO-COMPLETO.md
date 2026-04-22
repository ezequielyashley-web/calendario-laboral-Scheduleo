# ✅ ARREGLO COMPLETO - 2 PROBLEMAS

## 🎯 **LO QUE VOY A ARREGLAR:**

1. ❌ Texto invisible al escribir → **CSS**
2. ❌ Login falla → **Hash de contraseña**

---

## 📝 **PASO 1: ARREGLAR TEXTO INVISIBLE**

Reemplaza:
```
D:\PROYECTOS\Calendario laboral scheduleo completo\proyecto calendario\components\SecureLoginForm.tsx
```

Con el archivo: **SecureLoginForm-CORREGIDO.tsx** (descarga arriba ⬆️)

**Cambio:** Agregué `text-gray-900 placeholder:text-gray-400` a los inputs.

---

## 📝 **PASO 2: ARREGLAR LOGIN**

### 2.1 Generar hash:
```powershell
cd "D:\PROYECTOS\Calendario laboral scheduleo completo\proyecto calendario"
node generar-hash.js
```

Copia el hash (línea que empieza con `$2a$10$`)

### 2.2 Actualizar en Supabase:

https://supabase.com/dashboard/project/ndqgmiutwzchanmclqxs/sql/new

```sql
UPDATE "User"
SET password = 'PEGA_EL_HASH_AQUI'
WHERE email IN ('admin@empresa.com', 'empleado1@empresa.com');
```

Click **RUN**

---

## 🎯 **RESULTADO:**

✅ Texto visible al escribir
✅ Login funciona con `admin@empresa.com` / `Scheduleo2024!`

---

**2 pasos, 2 minutos, listo para mañana** 🚀
