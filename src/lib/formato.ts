import type { Accion, Cuadricula, TipoAccion } from './types';
import { fechaCorta } from './fechas';

export const TIPO: Record<TipoAccion, string> = { tarea: 'Tarea', habito: 'Hábito', principio: 'Principio' };

// La fase es lo que marca la fecha de inicio: «el plan», «las prácticas», «el curso»…
export const FASE_POR_DEFECTO = 'el plan';
export const fase = (c: Pick<Cuadricula, 'fase'>) => c.fase?.trim() || FASE_POR_DEFECTO;
export const deFase = (c: Pick<Cuadricula, 'fase'>) => `de ${fase(c)}`.replace(/^de el /, 'del ');

export function cuandoTexto(a: Accion, cuadricula: Pick<Cuadricula, 'fase'>): string | null {
  const c = a.cuando;
  if (!c) return null;
  if ('antesInicio' in c) return `Antes de empezar ${fase(cuadricula)}`;
  if ('hastaFin' in c) return `Antes del fin ${deFase(cuadricula)} o del objetivo, lo que llegue antes`;
  if ('semanas' in c) {
    const [d, h] = c.semanas;
    return d === h ? `Semana ${d} ${deFase(cuadricula)}` : `Semanas ${d}–${h} ${deFase(cuadricula)}`;
  }
  if (c.desde && c.hasta) return `Del ${fechaCorta(c.desde)} al ${fechaCorta(c.hasta)}`;
  if (c.hasta) return `Hasta el ${fechaCorta(c.hasta)}`;
  if (c.desde) return `Desde el ${fechaCorta(c.desde)}`;
  return null;
}

// Versión corta para las casillas del 3×3.
export function cuandoCorto(a: Accion): string | null {
  const c = a.cuando;
  if (!c) return null;
  if ('antesInicio' in c) return 'Antes';
  if ('hastaFin' in c) return 'Fin';
  if ('semanas' in c) {
    const [d, h] = c.semanas;
    return d === h ? `Sem ${d}` : `Sem ${d}–${h}`;
  }
  if (c.hasta) return `≤ ${fechaCorta(c.hasta)}`;
  if (c.desde) return `≥ ${fechaCorta(c.desde)}`;
  return null;
}

export const LETRA_DIA = ['D', 'L', 'M', 'X', 'J', 'V', 'S']; // por getDay(): domingo = 0

export const RESPUESTA = { si: 'Sí', medias: 'A medias', no: 'No' } as const;

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
