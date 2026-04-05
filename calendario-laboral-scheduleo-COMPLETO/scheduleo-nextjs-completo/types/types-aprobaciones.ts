// types/aprobaciones.ts
// Tipos para el centro de aprobaciones

export type TipoSolicitud = 'VACACION' | 'CAMBIO_TURNO' | 'BAJA_IT';

export type TipoCambio = 'INTERCAMBIO_TURNO' | 'CAMBIO_DIA';

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface SolicitudVacacion {
  id: string;
  empleado: {
    id: string;
    nombre: string;
    puesto: string;
    sede: string;
  };
  fechaInicio: string;
  fechaFin: string;
  duracionDias: number;
  tipo: 'VERANO' | 'INVIERNO' | 'OTRO';
  comentarios?: string;
  estado: EstadoSolicitud;
  createdAt: Date;
}

export interface SolicitudCambioTurno {
  id: string;
  tipo: TipoCambio;
  empleadoA: {
    id: string;
    nombre: string;
    puesto: string;
    sede: string;
  };
  empleadoB?: {
    id: string;
    nombre: string;
    puesto: string;
    sede: string;
  };
  fecha: string;
  turnoOriginal?: string;
  turnoSolicitado?: string;
  diaOriginal?: string;
  diaSolicitado?: string;
  motivo: string;
  aceptadoPorEmpleadoB?: boolean;
  estado: EstadoSolicitud;
  createdAt: Date;
}

export interface SolicitudBajaIT {
  id: string;
  empleado: {
    id: string;
    nombre: string;
    puesto: string;
    sede: string;
  };
  datosOCR: {
    paciente: string;
    dni: string;
    diagnostico: string;
    duracionDias: number;
    fechaInicio: string;
    fechaFin: string;
  };
  documentoUrl: string;
  estado: EstadoSolicitud;
  createdAt: Date;
}

export interface EstadisticasAprobaciones {
  totalPendientes: number;
  vacaciones: number;
  cambios: number;
  bajasIT: number;
}
