import type { Accion, Config, Cuadricula, Pilar } from './types';
import { sumarDias } from './fechas';

export const ID_PLANTILLA = 'mi-cuadricula';

// Cuadrícula vacía para empezar: 8 pilares de 8 acciones que se rellenan desde la app.
export function crearPlantilla(hoy: string, id = ID_PLANTILLA): Cuadricula {
  const pilares: Pilar[] = Array.from({ length: 8 }, (_, i) => ({
    id: `pilar-${i + 1}`,
    nombre: `Pilar ${i + 1}`,
    color: i + 1,
    porque: 'Por qué este pilar te acerca al objetivo.',
    acciones: Array.from(
      { length: 8 },
      (_, j): Accion => ({ id: `pilar-${i + 1}-${j + 1}`, corto: `Acción ${j + 1}`, texto: 'Qué vas a hacer, en concreto.', tipo: 'tarea' }),
    ),
  }));
  return {
    id,
    objetivo: 'Tu objetivo',
    objetivoCorto: 'Objetivo',
    fechaObjetivo: sumarDias(hoy, 182),
    fechaInicio: null,
    fechaFin: null,
    plantilla: true,
    pilares,
  };
}

export const CONFIG_INICIAL: Config = {
  cuadriculaActivaId: ID_PLANTILLA,
  diaRevision: 5,
  ultimoExportISO: null,
};
