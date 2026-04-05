// types/ajustes.ts
// Tipos para el panel de ajustes y configuración

export type TipoSede = 'PESCADERIA' | 'RESTAURANTE' | 'CATERING';

export interface Sede {
  id: string;
  nombre: string;
  tipo: TipoSede;
  direccion: string;
  telefono?: string;
  email?: string;
  horarioApertura?: string;
  horarioCierre?: string;
  capacidadEmpleados: number;
  activa: boolean;
  empresaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfiguracionSeguridad {
  requierePin: boolean;
  longitudPin: 4 | 6;
  requierePassword: boolean;
  longitudMinPassword: number;
  expiracionPassword: number; // días
  intentosMaximos: number;
  tiempoBloqueo: number; // minutos
  autenticacionDosFactor: boolean;
}

export interface ConfiguracionInspeccion {
  accesoInspectorActivo: boolean;
  codigoInspector?: string;
  nivelAcceso: 'SOLO_LECTURA' | 'LECTURA_DESCARGA';
  registrosAccesibles: string[]; // años disponibles
  ultimaInspeccion?: Date;
  inspectorNombre?: string;
  inspectorEntidad?: string; // AEAT, Inspección Trabajo, etc.
}

export interface ConfiguracionNotificaciones {
  emailNotificaciones: boolean;
  pushNotificaciones: boolean;
  smsNotificaciones: boolean;
  notificarVacacionesAprobadas: boolean;
  notificarCambiosTurno: boolean;
  notificarBajasIT: boolean;
  notificarFichajes: boolean;
  emailsAdministradores: string[];
}

export interface ConfiguracionHorarios {
  horaInicioJornada: string; // HH:MM
  horaFinJornada: string; // HH:MM
  minutosToleranciaEntrada: number;
  minutosToleranciaSalida: number;
  horasExtrasAutomaticas: boolean;
  descansoMinimo: number; // minutos
}

export interface FestivoPersonalizado {
  id: string;
  fecha: string; // YYYY-MM-DD
  nombre: string;
  aplicaATodos: boolean;
  sedesAfectadas?: string[]; // IDs de sedes
  recurrente: boolean; // se repite cada año
  empresaId: string;
}

export const TIPO_SEDE_LABELS: Record<TipoSede, string> = {
  PESCADERIA: 'Pescadería',
  RESTAURANTE: 'Restaurante',
  CATERING: 'Catering',
};

export const TIPO_SEDE_ICONS: Record<TipoSede, string> = {
  PESCADERIA: '🐟',
  RESTAURANTE: '🍽️',
  CATERING: '🎉',
};

export const TIPO_SEDE_COLORS: Record<TipoSede, { bg: string; border: string; text: string }> = {
  PESCADERIA: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
  },
  RESTAURANTE: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
  },
  CATERING: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
  },
};
