// types/auditoria.ts
// Tipos para el sistema de auditoría y trazabilidad completa

export type TipoAccion =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREAR_EMPLEADO'
  | 'EDITAR_EMPLEADO'
  | 'ELIMINAR_EMPLEADO'
  | 'APROBAR_VACACION'
  | 'RECHAZAR_VACACION'
  | 'APROBAR_CAMBIO'
  | 'RECHAZAR_CAMBIO'
  | 'APROBAR_BAJA'
  | 'CAMBIAR_GRUPO'
  | 'CREAR_SEDE'
  | 'EDITAR_SEDE'
  | 'ELIMINAR_SEDE'
  | 'CAMBIAR_CONFIGURACION'
  | 'FICHAJE_ENTRADA'
  | 'FICHAJE_SALIDA'
  | 'GENERAR_REPORTE'
  | 'EXPORTAR_DATOS'
  | 'ACCESO_INSPECTOR'
  | 'CAMBIAR_ROL'
  | 'RESETEAR_PIN'
  | 'BLOQUEAR_CUENTA'
  | 'DESBLOQUEAR_CUENTA';

export type Plataforma = 'desktop_master' | 'mobile_employee' | 'mobile_master';

export type NivelSeveridad = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface LogAuditoria {
  id: string;
  timestamp: Date;
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: string;
  accion: TipoAccion;
  entidad?: string; // 'Empleado', 'Vacacion', 'CambioTurno', etc.
  entidadId?: string;
  entidadNombre?: string;
  descripcion: string;
  detalles?: Record<string, any>;
  valorAnterior?: Record<string, any> | null;
  valorNuevo?: Record<string, any> | null;
  platform: Plataforma;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  screenWidth?: number;
  severidad: NivelSeveridad;
  exito: boolean;
  mensajeError?: string;
}

export interface FiltrosAuditoria {
  fechaInicio?: string;
  fechaFin?: string;
  usuarioIds?: string[];
  acciones?: TipoAccion[];
  plataformas?: Plataforma[];
  severidades?: NivelSeveridad[];
  entidades?: string[];
  exito?: boolean;
  busqueda?: string; // texto libre
}

export interface EstadisticasAuditoria {
  totalAcciones: number;
  accionesPorDia: { fecha: string; cantidad: number }[];
  accionesPorPlataforma: Record<Plataforma, number>;
  accionesPorTipo: Record<TipoAccion, number>;
  usuariosMasActivos: { usuarioId: string; nombre: string; acciones: number }[];
  erroresRecientes: number;
  accionesExitosas: number;
}

export const TIPO_ACCION_LABELS: Record<TipoAccion, string> = {
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
  CREAR_EMPLEADO: 'Crear empleado',
  EDITAR_EMPLEADO: 'Editar empleado',
  ELIMINAR_EMPLEADO: 'Eliminar empleado',
  APROBAR_VACACION: 'Aprobar vacaciones',
  RECHAZAR_VACACION: 'Rechazar vacaciones',
  APROBAR_CAMBIO: 'Aprobar cambio de turno/día',
  RECHAZAR_CAMBIO: 'Rechazar cambio de turno/día',
  APROBAR_BAJA: 'Aprobar baja IT',
  CAMBIAR_GRUPO: 'Cambiar grupo de empleado',
  CREAR_SEDE: 'Crear sede',
  EDITAR_SEDE: 'Editar sede',
  ELIMINAR_SEDE: 'Eliminar sede',
  CAMBIAR_CONFIGURACION: 'Cambiar configuración',
  FICHAJE_ENTRADA: 'Fichaje entrada',
  FICHAJE_SALIDA: 'Fichaje salida',
  GENERAR_REPORTE: 'Generar reporte',
  EXPORTAR_DATOS: 'Exportar datos',
  ACCESO_INSPECTOR: 'Acceso inspector AEAT',
  CAMBIAR_ROL: 'Cambiar rol de usuario',
  RESETEAR_PIN: 'Resetear PIN',
  BLOQUEAR_CUENTA: 'Bloquear cuenta',
  DESBLOQUEAR_CUENTA: 'Desbloquear cuenta',
};

export const TIPO_ACCION_ICONS: Record<TipoAccion, string> = {
  LOGIN: '🔓',
  LOGOUT: '🔒',
  CREAR_EMPLEADO: '👤',
  EDITAR_EMPLEADO: '✏️',
  ELIMINAR_EMPLEADO: '🗑️',
  APROBAR_VACACION: '✅',
  RECHAZAR_VACACION: '❌',
  APROBAR_CAMBIO: '✅',
  RECHAZAR_CAMBIO: '❌',
  APROBAR_BAJA: '✅',
  CAMBIAR_GRUPO: '🔄',
  CREAR_SEDE: '🏢',
  EDITAR_SEDE: '✏️',
  ELIMINAR_SEDE: '🗑️',
  CAMBIAR_CONFIGURACION: '⚙️',
  FICHAJE_ENTRADA: '⏰',
  FICHAJE_SALIDA: '⏰',
  GENERAR_REPORTE: '📊',
  EXPORTAR_DATOS: '📥',
  ACCESO_INSPECTOR: '👁️',
  CAMBIAR_ROL: '🔑',
  RESETEAR_PIN: '🔐',
  BLOQUEAR_CUENTA: '🚫',
  DESBLOQUEAR_CUENTA: '🔓',
};

export const PLATAFORMA_LABELS: Record<Plataforma, string> = {
  desktop_master: 'Desktop Máster',
  mobile_employee: 'Móvil Empleado',
  mobile_master: 'Móvil Máster',
};

export const PLATAFORMA_COLORS: Record<Plataforma, { bg: string; text: string; badge: string }> = {
  desktop_master: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-700',
  },
  mobile_employee: {
    bg: 'bg-green-50',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-700',
  },
  mobile_master: {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-700',
  },
};

export const SEVERIDAD_COLORS: Record<NivelSeveridad, { bg: string; text: string; icon: string }> = {
  INFO: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    icon: 'ℹ️',
  },
  WARNING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: '⚠️',
  },
  ERROR: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: '❌',
  },
  CRITICAL: {
    bg: 'bg-red-100',
    text: 'text-red-900',
    icon: '🚨',
  },
};
