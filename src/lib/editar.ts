import type { Accion, Cuando, Cuadricula, TipoAccion } from './types';

export interface Edicion {
  corto: string;
  texto: string;
  tipo: TipoAccion;
  objetivoSemana?: number;
  cuando?: Cuando | null;
  trasInicio?: boolean;
}

const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

// Aplica lo editado en la ficha sin arrastrar campos que no encajan con el nuevo tipo.
export function aplicarEdicion(a: Accion, e: Edicion): Accion {
  const n: Accion = { id: a.id, corto: e.corto.trim() || a.corto, texto: e.texto.trim() || a.texto, tipo: e.tipo };
  if (e.tipo === 'tarea') {
    if (e.cuando) n.cuando = e.cuando;
    if (a.tipo === 'tarea' && a.hechaISO) n.hechaISO = a.hechaISO;
    return n;
  }
  if (e.trasInicio) n.trasInicio = true;
  if (e.tipo === 'habito') {
    n.objetivoSemana = limitar(e.objetivoSemana ?? a.objetivoSemana ?? 1, 1, 7);
    if (a.tipo === 'habito') {
      if (a.soloDias) n.soloDias = a.soloDias;
      if (a.maxSeguidos) n.maxSeguidos = a.maxSeguidos;
    }
    return n;
  }
  if (a.tipo === 'principio' && a.cuando) n.cuando = a.cuando;
  return n;
}

export type ModoCuando = 'ninguno' | 'antes' | 'semanas' | 'hasta' | 'entre' | 'fin';

export function modoDe(c: Cuando | undefined): ModoCuando {
  if (!c) return 'ninguno';
  if ('antesInicio' in c) return 'antes';
  if ('hastaFin' in c) return 'fin';
  if ('semanas' in c) return 'semanas';
  return c.desde ? 'entre' : 'hasta';
}

export function cuandoDe(modo: ModoCuando, v: { semDesde?: number; semHasta?: number; desde?: string; hasta?: string }): Cuando | null {
  switch (modo) {
    case 'antes':
      return { antesInicio: true };
    case 'fin':
      return { hastaFin: true };
    case 'semanas': {
      const d = limitar(v.semDesde || 1, 1, 52);
      const h = limitar(v.semHasta || d, 1, 52);
      return { semanas: [Math.min(d, h), Math.max(d, h)] };
    }
    case 'hasta':
      return v.hasta ? { hasta: v.hasta } : null;
    case 'entre':
      return v.desde && v.hasta ? { desde: v.desde < v.hasta ? v.desde : v.hasta, hasta: v.desde < v.hasta ? v.hasta : v.desde } : null;
    default:
      return null;
  }
}

// La misma cuadrícula sin tareas hechas, para empezar de verdad después de probar.
export function sinProgreso(c: Cuadricula): Cuadricula {
  const copia = structuredClone(c);
  for (const p of copia.pilares) for (const a of p.acciones) delete a.hechaISO;
  return copia;
}
