export type TipoAccion = 'tarea' | 'habito' | 'principio';

// Cuándo toca una tarea, o cuándo se revisa un principio.
// `semanas` cuenta desde el inicio de la fase (semana 1 = la primera).
export type Cuando =
  | { antesInicio: true }
  | { semanas: [number, number] }
  | { desde?: string; hasta?: string }
  | { hastaFin: true };

export interface Accion {
  id: string;
  corto: string;
  texto: string;
  tipo: TipoAccion;
  trasInicio?: boolean;
  cuando?: Cuando;
  objetivoSemana?: number;
  soloDias?: number[]; // 0 = domingo … 6 = sábado
  maxSeguidos?: number;
  hechaISO?: string;
}

export interface Pilar {
  id: string;
  nombre: string;
  porque: string;
  color: number; // 1-8 → --color-p1 … --color-p8
  acciones: Accion[];
}

// Horario de la fase, para estimar cuándo termina (opcional).
export interface Calendario {
  horas: number;
  horasDia: number[]; // por getDay(): domingo = 0
  festivos: string[];
  paron?: { desde: string; hasta: string };
}

export interface Cuadricula {
  id: string;
  objetivo: string;
  objetivoCorto?: string;
  fechaObjetivo: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  fase?: string; // con artículo: «el plan», «las prácticas»…
  calendario?: Calendario;
  plantilla?: boolean; // cuadrícula vacía recién creada: Hoy enseña cómo empezar
  pilares: Pilar[];
}

export interface Config {
  cuadriculaActivaId: string;
  diaRevision: number;
  ultimoExportISO: string | null;
}

export type Marcas = Record<string, string[]>; // 'AAAA-MM-DD' → ids de hábitos marcados

export type Respuesta = 'si' | 'medias' | 'no';

export interface Revision {
  semana: string; // 'AAAA-Www'
  fechaISO: string;
  respuestas: Record<string, Respuesta>;
}

export interface BackupV1 {
  app: 'harada';
  version: 1;
  exportadoISO: string;
  config: Config;
  cuadricula: Cuadricula;
  marcas: Marcas;
  revisiones: Revision[];
}
