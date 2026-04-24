"use client"

export default function InformacionSistema() {
  const version = "1.0.0"
  const ultimaActualizacion = "Abril 2026"

  const stack = [
    { nombre: "Next.js", version: "15.x", emoji: "⚛️", tipo: "Framework" },
    { nombre: "TypeScript", version: "5.x", emoji: "🔷", tipo: "Lenguaje" },
    { nombre: "Tailwind CSS", version: "3.x", emoji: "🎨", tipo: "Estilos" },
    { nombre: "Prisma", version: "5.x", emoji: "🔺", tipo: "ORM" },
    { nombre: "Supabase", version: "PostgreSQL", emoji: "🗄️", tipo: "Base de Datos" },
    { nombre: "NextAuth", version: "5.x", emoji: "🔐", tipo: "Autenticación" },
    { nombre: "Vercel", version: "Cloud", emoji: "▲", tipo: "Deploy" },
  ]

  const features = [
    {
      categoria: "🔐 Autenticación & Seguridad",
      items: [
        "Sistema de login con email y PIN/contraseña",
        "Credenciales alfanuméricas (PIN 4 dígitos o contraseña 10 caracteres)",
        "Cambio obligatorio de credenciales en primer login",
        "Recuperación de contraseña vía email (Resend)",
        "Roles: SUPER_ADMIN, ADMIN_SEDE, EMPLEADO",
        "NextAuth v5 con middleware de rutas protegidas",
        "Audit logging completo (RDL 8/2019)",
      ]
    },
    {
      categoria: "👥 Gestión de Empleados",
      items: [
        "CRUD completo de empleados",
        "Asignación a sedes (Madrid Centro, Vallecas)",
        "Grupos de turno (G1A/B, G2A/B, G3A/B, L1/L2/L3)",
        "Campo teléfono editable",
        "Campo tipo de negocio (Restaurante, Pescadería, Hotel, Catering, Panadería, Bar)",
        "Filtros: búsqueda, sede, grupo",
        "Vista responsive: tabla (desktop) + cards (mobile)",
        "Avatares con gradientes de colores",
      ]
    },
    {
      categoria: "📅 Calendario Laboral",
      items: [
        "Vista anual de 12 meses",
        "Calendario oficial Madrid 2026 (PDF procesado)",
        "Tipos de día: Laboral (teal), Festivo (purple), Domingo (red)",
        "Modal de configuración por día",
        "Asignación de grupos trabajando por día",
        "Libranzas: completas (día libre) o medias jornadas",
        "Marcadores especiales: festivos, días especiales",
        "Filtros por sede y grupo",
        "Estadísticas: días laborales, festivos, domingos",
      ]
    },
    {
      categoria: "🏖️ Gestión de Vacaciones",
      items: [
        "Solicitud de vacaciones por empleado",
        "Aprobación por Máster (admin)",
        "Validación de cobertura mínima por puesto",
        "Sistema de alertas si hay conflictos",
        "Override forzado para admin (forzar=true)",
        "Historial de solicitudes",
        "Estados: Pendiente, Aprobada, Rechazada",
      ]
    },
    {
      categoria: "⏰ Fichajes & Control Horario",
      items: [
        "Sistema de fichaje entrada/salida (RDL 8/2019)",
        "Registro digital de jornadas",
        "Detección automática de fichajes tardíos",
        "Vista de fichajes por empleado y fecha",
        "Exportación para inspección laboral",
        "Cálculo automático de horas trabajadas",
      ]
    },
    {
      categoria: "🔄 Cambios de Turno",
      items: [
        "Solicitud de intercambio entre empleados",
        "Sistema de aprobación por Máster",
        "Chat interno para coordinación",
        "Validación de compatibilidad de grupos",
        "Historial de cambios",
      ]
    },
    {
      categoria: "📊 Reportes & Análisis",
      items: [
        "4 tipos de reportes: Asistencia, Vacaciones, Fichajes, Horas",
        "Métricas con tendencias (+/-)",
        "Gráficos de barras animados (asistencia semanal)",
        "Distribución por grupo (progress bars)",
        "Tabla de detalles por empleado",
        "Filtros: rango fecha (semana/mes/trimestre/año) + sede",
        "Botón exportar (preparado para PDF/Excel)",
      ]
    },
    {
      categoria: "🔔 Notificaciones",
      items: [
        "Sistema Apple-style con toast translúcido",
        "Badge con contador (pulse animation)",
        "Campana con animación vibración (bellRing)",
        "Auto-hide después de 10 segundos",
        "Click toast → navega a /notificaciones",
        "Tipos: info 📬, success ✅, warning ⚠️, error ❌",
        "Lista completa en página dedicada",
      ]
    },
    {
      categoria: "💰 Deudas & Anticipos",
      items: [
        "Registro de deudas de empleados",
        "Solicitud de anticipos salariales",
        "Aprobación y tracking",
        "Descuento automático en nómina",
        "Historial financiero por empleado",
      ]
    },
    {
      categoria: "🏥 Bajas Médicas (IT Sick Leave)",
      items: [
        "Monitoreo automático de bajas@empresa.com cada 5 minutos",
        "OCR de PDFs de la Seguridad Social (RED telematics)",
        "Extracción automática de datos",
        "Confirmación con PIN por Máster",
        "Registro de baja en sistema",
      ]
    },
    {
      categoria: "👥 Gestión de Grupos",
      items: [
        "CRUD de grupos de turno",
        "Tipos: Entre Semana (MXJVS) y Lunes",
        "Selector de color (8 presets)",
        "Selector de emoji (8 opciones)",
        "Vista previa en vivo al crear/editar",
        "Asignación de días de trabajo",
        "Mover empleados entre grupos",
      ]
    },
    {
      categoria: "📱 PWA & Mobile",
      items: [
        "Progressive Web App instalable",
        "Web Push Notifications (VAPID)",
        "Modo offline básico",
        "Interfaz mobile-first",
        "Gestos táctiles optimizados",
      ]
    },
    {
      categoria: "🎨 Diseño & UX",
      items: [
        "Glassmorphism (backdrop-blur + transparencias)",
        "Paleta: Patina Blue #7BA8A8, Transformative Teal #00A896",
        "Dark mode completo (auto/manual toggle)",
        "Animaciones suaves (hover scale, shadow)",
        "Gradientes en cards y botones",
        "Emojis coloridos en toda la UI",
        "Responsive: mobile + tablet + desktop",
      ]
    },
    {
      categoria: "🛠️ Herramientas Admin",
      items: [
        "Dashboard con métricas en tiempo real",
        "Gestión de puestos de trabajo",
        "Cobertura mínima por puesto",
        "Ayuda contextual integrada",
        "iCal export para sincronización calendarios",
        "Sistema de configuración por tabs",
      ]
    },
    {
      categoria: "📜 Cumplimiento Legal",
      items: [
        "RDL 8/2019 (registro jornada obligatorio)",
        "LOPD/RGPD compliance",
        "Audit logging completo",
        "Exportación para inspección laboral",
        "Sistema de confirmación para acciones críticas",
      ]
    },
  ]

  const tecnologias = {
    frontend: ["Next.js 15", "React 18", "TypeScript 5", "Tailwind CSS 3"],
    backend: ["Next.js API Routes", "Prisma ORM", "NextAuth v5"],
    database: ["Supabase (PostgreSQL)", "Direct Connection + Pooler"],
    servicios: ["Resend (emails)", "Vercel (deploy)", "Web Push API"],
    herramientas: ["Git/GitHub", "VS Code", "PowerShell", "Chrome DevTools"],
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-4xl">ℹ️</span>
              Información del Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold">
              CalendarioApp / Scheduleo - Gestión Laboral Completa
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Versión</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{version}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{ultimaActualizacion}</p>
          </div>
        </div>
      </div>

      {/* Stack Tecnológico */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-3xl">🛠️</span>
          <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
            Stack Tecnológico
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stack.map((tech, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/60 dark:bg-gray-700/60 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">{tech.emoji}</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{tech.nombre}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tech.version}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{tech.tipo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Completas */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span className="text-3xl">⚡</span>
          <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
            Funcionalidades Completas
          </span>
        </h2>
        <div className="space-y-6">
          {features.map((feature, i) => (
            <div key={i} className="backdrop-blur-xl bg-white/60 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                {feature.categoria}
              </h3>
              <ul className="space-y-2">
                {feature.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-[#00A896] mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tecnologías Detalladas */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-3xl">🔧</span>
          <span className="bg-gradient-to-r from-[#7BA8A8] to-[#00A896] bg-clip-text text-transparent">
            Tecnologías Detalladas
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(tecnologias).map(([categoria, items]) => (
            <div
              key={categoria}
              className="backdrop-blur-xl bg-white/60 dark:bg-gray-700/60 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg"
            >
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 capitalize">
                {categoria.replace('_', ' ')}
              </h3>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-[#00A896]">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con créditos */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl text-center">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          Desarrollado con ❤️ por Ezequiel Arturo
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          © 2026 CalendarioApp / Scheduleo - Todos los derechos reservados
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <span className="px-3 py-1 bg-gradient-to-r from-[#7BA8A8] to-[#00A896] text-white rounded-lg text-xs font-bold shadow-md">
            🇪🇸 Hecho en España
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-bold shadow-md">
            ✅ Cumple RDL 8/2019
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md">
            🔐 RGPD Compliant
          </span>
        </div>
      </div>
    </div>
  )
}
