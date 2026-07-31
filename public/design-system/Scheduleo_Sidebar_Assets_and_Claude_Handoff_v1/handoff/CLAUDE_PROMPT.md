# CLAUDE — IMPLEMENTACIÓN SIDEBAR SCHEDULEO 2.0

Implementa exactamente la imagen `scheduleo-sidebar-reference.png` en Next.js 15 + TypeScript + Tailwind CSS.

- Modifica únicamente Sidebar.
- Usa `/public/design-system/sidebar/`.
- Fondo: `/design-system/sidebar/decor/sidebar-background.svg`.
- Opción activa: `/design-system/sidebar/decor/active-menu-item.svg`.
- Logo e iconos: usar exclusivamente los SVG suministrados.
- Ancho desktop 320px; tablet 288px; alto 100dvh.
- Radio exterior 28px; padding 20px; overflow-y auto con scrollbar oculta.
- Panel ejecutivo: 64px alto, radio 18px, sombra `0 10px 22px rgba(79,70,229,.14)`.
- Menú: 48px alto por elemento, icono 22px, texto Inter 15px semibold.
- Secciones: PRINCIPAL, GESTIÓN, SISTEMA.
- Activo: texto e icono #5B5CF6.
- Pie: tarjeta sticky inferior de 84px con avatar E, nombre Ezequiel G., punto #10B981, texto En línea y botón logout.
- El logout debe conectar con la acción real de cierre de sesión existente.
- No crear autenticación nueva.
- No modificar Header, Dashboard ni otras pantallas.
