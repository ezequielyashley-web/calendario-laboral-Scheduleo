# 🖥️ Scheduleo Desktop v2.0

**Sistema profesional de gestión de personal para empresas españolas**

## 🎯 Proyecto Completo - 10 Fases Implementadas

Este proyecto contiene **TODO el trabajo realizado** en las 10 fases de desarrollo, sin modificaciones.

---

## ✅ LO QUE YA ESTÁ INCLUIDO

### **Configuración Completa:**
- ✅ Next.js 15 + TypeScript
- ✅ Tailwind CSS
- ✅ package.json con dependencias
- ✅ .gitignore correcto
- ✅ .env.local.example

### **5 Archivos de Tipos:**
- types-calendario.ts
- types-aprobaciones.ts
- types-ajustes.ts
- types-reportes.ts
- types-auditoria.ts

### **10 Componentes Master:**
- CalendarioAnual.tsx
- CentroAprobaciones.tsx
- PanelAjustes.tsx
- GeneradorReportes.tsx
- SistemaAuditoria.tsx
- Header.tsx
- Sidebar.tsx
- EmpleadosTable.tsx
- PerfilEmpleado.tsx
- DashboardStats.tsx

### **Páginas Next.js:**
- app/layout.tsx
- app/page.tsx  
- app/globals.css
- app/(authenticated)/master/layout.tsx
- app/(authenticated)/master/page.tsx
- app/(authenticated)/master/calendario/page.tsx
- app/(authenticated)/master/aprobaciones/page.tsx

---

## 🚀 INSTALACIÓN LOCAL

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.local.example .env.local

# 3. Editar .env.local con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
npm run dev
```

Abrir http://localhost:3000

---

## 📦 SUBIR A GITHUB

Tu repositorio: **https://github.com/ezequielyashley-web/calendario-laboral-Scheduleo**

### Pasos:

```bash
# 1. Inicializar Git
git init

# 2. Añadir archivos
git add .

# 3. Commit inicial
git commit -m "feat: scheduleo desktop v2.0 completo - 10 fases"

# 4. Renombrar rama
git branch -M main

# 5. Conectar con GitHub
git remote add origin https://github.com/ezequielyashley-web/calendario-laboral-Scheduleo.git

# 6. Subir código
git push -u origin main
```

**IMPORTANTE:** Si el repo ya existe en GitHub:
```bash
git push -f origin main
```

---

## 🌐 DEPLOY A VERCEL

### Opción A: Desde Dashboard (Recomendado)

1. Ir a https://vercel.com
2. Conectar con GitHub
3. Importar `calendario-laboral-Scheduleo`
4. Deploy automático

### Opción B: Desde Terminal

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Variables de Entorno en Vercel:

Añadir en Settings → Environment Variables:
```
DATABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
calendario-laboral-scheduleo/
├── app/
│   ├── (authenticated)/
│   │   └── master/
│   │       ├── calendario/
│   │       ├── aprobaciones/
│   │       ├── empleados/
│   │       ├── ajustes/
│   │       ├── reportes/
│   │       └── auditoria/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── master/
│       ├── CalendarioAnual.tsx
│       ├── CentroAprobaciones.tsx
│       ├── PanelAjustes.tsx
│       ├── GeneradorReportes.tsx
│       ├── SistemaAuditoria.tsx
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── EmpleadosTable.tsx
│       ├── PerfilEmpleado.tsx
│       └── DashboardStats.tsx
├── types/
│   ├── types-calendario.ts
│   ├── types-aprobaciones.ts
│   ├── types-ajustes.ts
│   ├── types-reportes.ts
│   └── types-auditoria.ts
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🎯 FUNCIONALIDADES (10 FASES)

### Fase 1-3: Base + Dashboard + Empleados
- Layout profesional
- Dashboard con KPIs
- Tabla de empleados

### Fase 4: Calendario Global
- 17 comunidades autónomas
- Festivos automáticos
- Modo claro/oscuro

### Fase 5: Perfil Empleado
- Timeline de eventos
- KPIs personales

### Fase 6: Centro de Aprobaciones
- Vacaciones
- 2 tipos de cambios (intercambio + cambio día)
- Bajas IT con OCR

### Fase 7: Gestión de Grupos
- Drag & drop
- 6 grupos de trabajo

### Fase 8: Ajustes Multi-Sede
- Seguridad
- 3 tipos de sedes
- Inspección AEAT
- Configuración general

### Fase 9: Reportes
- 6 tipos de reportes
- Exportación Excel/PDF/CSV

### Fase 10: Auditoría
- Timeline completo
- Filtros avanzados
- Trazabilidad total

---

## ⚠️ IMPORTANTE

**TODO el código de las 10 fases está INTACTO.**

No se modificó nada del trabajo realizado. Solo se añadieron archivos mínimos de Next.js para que funcione como aplicación completa.

---

## 📝 SIGUIENTES PASOS

1. ✅ Descargar este proyecto
2. ✅ Ejecutar `npm install`
3. ✅ Probar con `npm run dev`
4. ✅ Subir a GitHub con los comandos de arriba
5. ✅ Deploy a Vercel

---

## 🔗 Links

- **GitHub:** https://github.com/ezequielyashley-web/calendario-laboral-Scheduleo
- **Autor:** Ezequiel Arturo

---

**¡Proyecto completo y listo para producción!** 🚀
