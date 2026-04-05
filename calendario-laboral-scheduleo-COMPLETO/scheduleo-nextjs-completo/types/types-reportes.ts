// types/reportes.ts
// Tipos para generador de reportes y exportaciones

export type TipoReporte =
  | 'ASISTENCIA'
  | 'VACACIONES'
  | 'HORAS_EXTRAS'
  | 'DEUDAS_ADELANTOS'
  | 'COBERTURA'
  | 'BAJAS_MEDICAS';

export type FormatoExportacion = 'EXCEL' | 'PDF' | 'CSV' | 'ZIP';

export type PeriodoReporte = 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL' | 'PERSONALIZADO';

export interface ConfiguracionReporte {
  tipo: TipoReporte;
  periodo: PeriodoReporte;
  fechaInicio?: string;
  fechaFin?: string;
  sedeIds?: string[]; // filtrar por sedes específicas
  empleadoIds?: string[]; // filtrar por empleados específicos
  incluirGraficos: boolean;
  incluirResumen: boolean;
  formato: FormatoExportacion;
}

export interface ReporteAsistencia {
  empleadoId: string;
  empleadoNombre: string;
  sede: string;
  diasTrabajados: number;
  diasEsperados: number;
  porcentajeAsistencia: number;
  llegadasTardeñas: number;
  horasTotales: number;
  fichajes: {
    fecha: string;
    entrada?: string;
    salida?: string;
    horasTrabajadas: number;
    tardanza: number; // minutos
  }[];
}

export interface ReporteVacaciones {
  empleadoId: string;
  empleadoNombre: string;
  sede: string;
  diasTotales: number;
  diasConsumidos: number;
  diasPendientes: number;
  diasProximas: number; // aprobadas pero futuras
  solicitudesPendientes: number;
  periodos: {
    fechaInicio: string;
    fechaFin: string;
    dias: number;
    estado: string;
  }[];
}

export interface ReporteHorasExtras {
  empleadoId: string;
  empleadoNombre: string;
  sede: string;
  horasExtrasAcumuladas: number;
  valorMonetario: number;
  detalles: {
    fecha: string;
    horas: number;
    motivo: string;
  }[];
}

export interface ReporteDeudasAdelantos {
  empleadoId: string;
  empleadoNombre: string;
  sede: string;
  saldoTotal: number; // positivo=deuda, negativo=adelanto
  comprasPescaderia: number;
  adelantosSalario: number;
  transacciones: {
    fecha: string;
    tipo: 'COMPRA' | 'ADELANTO' | 'PAGO';
    monto: number;
    concepto: string;
  }[];
}

export interface ReporteCobertura {
  fecha: string;
  sede: string;
  puesto: string;
  coberturaMinima: number;
  coberturaActual: number;
  cumple: boolean;
  empleados: string[];
}

export interface ReporteBajasMedicas {
  mes: string;
  sede: string;
  totalBajas: number;
  diasPerdidos: number;
  diagnosticos: Record<string, number>; // diagnóstico: cantidad
  detalles: {
    empleadoNombre: string;
    diagnostico: string;
    fechaInicio: string;
    fechaFin: string;
    dias: number;
  }[];
}

export const TIPO_REPORTE_LABELS: Record<TipoReporte, string> = {
  ASISTENCIA: 'Asistencia y Puntualidad',
  VACACIONES: 'Vacaciones',
  HORAS_EXTRAS: 'Horas Extras',
  DEUDAS_ADELANTOS: 'Deudas y Adelantos',
  COBERTURA: 'Cobertura por Puesto',
  BAJAS_MEDICAS: 'Bajas Médicas',
};

export const TIPO_REPORTE_ICONS: Record<TipoReporte, string> = {
  ASISTENCIA: '📊',
  VACACIONES: '🏖️',
  HORAS_EXTRAS: '⏰',
  DEUDAS_ADELANTOS: '💰',
  COBERTURA: '👥',
  BAJAS_MEDICAS: '🏥',
};

export const TIPO_REPORTE_COLORS: Record<TipoReporte, { bg: string; border: string; text: string }> = {
  ASISTENCIA: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
  VACACIONES: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  HORAS_EXTRAS: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  DEUDAS_ADELANTOS: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
  COBERTURA: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900' },
  BAJAS_MEDICAS: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
};
