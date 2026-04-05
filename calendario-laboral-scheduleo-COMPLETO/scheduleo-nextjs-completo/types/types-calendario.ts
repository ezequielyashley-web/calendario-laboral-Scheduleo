// types/calendario.ts
// Tipos para el sistema de calendario con festivos por comunidad

export type ComunidadAutonoma =
  | 'madrid'
  | 'cataluna'
  | 'baleares'
  | 'valencia'
  | 'andalucia'
  | 'pais_vasco'
  | 'galicia'
  | 'canarias'
  | 'castilla_leon'
  | 'castilla_mancha'
  | 'murcia'
  | 'aragon'
  | 'extremadura'
  | 'asturias'
  | 'navarra'
  | 'cantabria'
  | 'rioja';

export const COMUNIDADES_LABELS: Record<ComunidadAutonoma, string> = {
  madrid: 'Comunidad de Madrid',
  cataluna: 'Cataluña (Barcelona)',
  baleares: 'Islas Baleares',
  valencia: 'Comunidad Valenciana',
  andalucia: 'Andalucía',
  pais_vasco: 'País Vasco',
  galicia: 'Galicia',
  canarias: 'Canarias',
  castilla_leon: 'Castilla y León',
  castilla_mancha: 'Castilla-La Mancha',
  murcia: 'Región de Murcia',
  aragon: 'Aragón',
  extremadura: 'Extremadura',
  asturias: 'Principado de Asturias',
  navarra: 'Comunidad Foral de Navarra',
  cantabria: 'Cantabria',
  rioja: 'La Rioja',
};

export interface Festivo {
  fecha: string; // YYYY-MM-DD
  nombre: string;
  tipo: 'nacional' | 'autonomico';
  comunidad?: ComunidadAutonoma;
}

export interface ConfiguracionCalendario {
  comunidad: ComunidadAutonoma;
  domingosLaborablesDiciembre: number[]; // [6, 13, 20, 27]
  modoTema: 'auto' | 'light' | 'dark';
}

export interface DiaCalendario {
  dia: number;
  fecha: string;
  esDomingo: boolean;
  esFestivo: boolean;
  festivoNombre?: string;
  esDomingoLaborable: boolean;
  esLaboral: boolean;
}

// Festivos Nacionales 2026 (comunes a toda España)
export const FESTIVOS_NACIONALES_2026: Record<string, string> = {
  '2026-01-01': 'Año Nuevo',
  '2026-01-06': 'Reyes Magos',
  '2026-04-03': 'Viernes Santo',
  '2026-05-01': 'Día del Trabajo',
  '2026-08-15': 'Asunción de la Virgen',
  '2026-10-12': 'Fiesta Nacional de España',
  '2026-11-01': 'Todos los Santos',
  '2026-12-06': 'Día de la Constitución',
  '2026-12-08': 'Inmaculada Concepción',
  '2026-12-25': 'Navidad',
  '2026-12-26': 'San Esteban',
};

// Festivos Autonómicos por Comunidad
export const FESTIVOS_AUTONOMICOS_2026: Record<ComunidadAutonoma, Record<string, string>> = {
  madrid: {
    '2026-05-02': 'Fiesta de la Comunidad de Madrid',
    '2026-07-25': 'Santiago Apóstol',
    '2026-11-09': 'Virgen de la Almudena',
  },
  cataluna: {
    '2026-04-06': 'Lunes de Pascua',
    '2026-06-24': 'Sant Joan',
    '2026-09-11': 'Diada de Catalunya',
    '2026-12-26': 'Sant Esteve',
  },
  baleares: {
    '2026-03-01': 'Día de las Islas Baleares',
    '2026-04-06': 'Lunes de Pascua',
    '2026-12-26': 'Sant Esteve',
  },
  valencia: {
    '2026-03-19': 'San José',
    '2026-04-06': 'Lunes de Pascua',
    '2026-10-09': 'Día de la Comunidad Valenciana',
  },
  andalucia: {
    '2026-02-28': 'Día de Andalucía',
    '2026-04-02': 'Jueves Santo',
  },
  pais_vasco: {
    '2026-03-19': 'San José',
    '2026-04-02': 'Jueves Santo',
    '2026-04-06': 'Lunes de Pascua',
    '2026-07-25': 'Santiago Apóstol',
  },
  galicia: {
    '2026-03-19': 'San José',
    '2026-05-17': 'Día de las Letras Gallegas',
    '2026-07-25': 'Día Nacional de Galicia',
  },
  canarias: {
    '2026-02-16': 'Carnaval',
    '2026-05-30': 'Día de Canarias',
  },
  castilla_leon: {
    '2026-04-23': 'Día de Castilla y León',
    '2026-04-02': 'Jueves Santo',
  },
  castilla_mancha: {
    '2026-05-31': 'Día de Castilla-La Mancha',
    '2026-04-02': 'Jueves Santo',
  },
  murcia: {
    '2026-03-19': 'San José',
    '2026-06-09': 'Día de la Región de Murcia',
  },
  aragon: {
    '2026-04-23': 'San Jorge (Día de Aragón)',
    '2026-04-02': 'Jueves Santo',
  },
  extremadura: {
    '2026-02-19': 'Día de Extremadura',
    '2026-04-02': 'Jueves Santo',
  },
  asturias: {
    '2026-09-08': 'Día de Asturias',
    '2026-04-02': 'Jueves Santo',
  },
  navarra: {
    '2026-04-02': 'Jueves Santo',
    '2026-04-06': 'Lunes de Pascua',
    '2026-07-25': 'Santiago Apóstol',
  },
  cantabria: {
    '2026-02-13': 'Día de las Instituciones',
    '2026-04-02': 'Jueves Santo',
    '2026-07-28': 'Día de Cantabria',
  },
  rioja: {
    '2026-06-09': 'Día de La Rioja',
    '2026-04-02': 'Jueves Santo',
  },
};

export const MESES_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const DIAS_SEMANA_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
