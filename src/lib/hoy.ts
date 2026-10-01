import type { Accion, Cuadricula, Marcas, Pilar } from './types';
import { deISO, diasEntre, semanaFase, sumarDias } from './fechas';
import { estadoAccion, ultimaRespuesta, type Contexto } from './puntos';

// Las tareas que solo tienen fecha límite aparecen en Hoy dos semanas antes.
export const AVISO_DIAS = 14;

export interface Item {
  pilar: Pilar;
  accion: Accion;
}

export type Urgencia = 'atrasada' | 'toca' | 'hecha';

export interface TareaHoy extends Item {
  urgencia: Urgencia;
  hasta: string | null;
}

const items = (c: Cuadricula): Item[] => c.pilares.flatMap((pilar) => pilar.acciones.map((accion) => ({ pilar, accion })));

export function habitosDeHoy(c: Cuadricula, ctx: Contexto): Item[] {
  const dia = deISO(ctx.hoy).getDay();
  return items(c).filter(
    ({ accion: a }) => a.tipo === 'habito' && estadoAccion(a, ctx) !== 'espera' && (!a.soloDias || a.soloDias.includes(dia)),
  );
}

export function habitosEnEspera(c: Cuadricula, ctx: Contexto): Item[] {
  return items(c).filter(({ accion: a }) => a.tipo === 'habito' && estadoAccion(a, ctx) === 'espera');
}

interface Ventana {
  desde: string | null;
  hasta: string | null;
  sinAviso?: boolean; // se enseña siempre, sin esperar a las dos semanas previas
}

// Cuándo se puede hacer una tarea. null si todavía no se sabe (falta la fecha de inicio).
export function ventana(a: Accion, c: Cuadricula): Ventana | null {
  const w = a.cuando;
  if (!w) return null;
  if ('antesInicio' in w) return { desde: null, hasta: c.fechaInicio ? sumarDias(c.fechaInicio, -1) : null, sinAviso: true };
  if ('hastaFin' in w) {
    // Fin de la fase u objetivo, lo que llegue antes: el fin puede caer después del objetivo.
    const fin = c.fechaFin && c.fechaFin < c.fechaObjetivo ? c.fechaFin : c.fechaObjetivo;
    return { desde: null, hasta: fin };
  }
  if ('semanas' in w) {
    if (!c.fechaInicio) return null;
    const [d, h] = w.semanas;
    return { desde: sumarDias(c.fechaInicio, (d - 1) * 7), hasta: sumarDias(c.fechaInicio, h * 7 - 1) };
  }
  return { desde: w.desde ?? null, hasta: w.hasta ?? null };
}

export function tareasDeHoy(c: Cuadricula, ctx: Contexto): TareaHoy[] {
  const lista: TareaHoy[] = [];
  for (const { pilar, accion: a } of items(c)) {
    if (a.tipo !== 'tarea') continue;
    const v = ventana(a, c);
    if (!v) continue;
    if (a.hechaISO) {
      if (a.hechaISO === ctx.hoy) lista.push({ pilar, accion: a, urgencia: 'hecha', hasta: v.hasta });
      continue;
    }
    if (v.hasta && ctx.hoy > v.hasta) lista.push({ pilar, accion: a, urgencia: 'atrasada', hasta: v.hasta });
    else if (v.desde && ctx.hoy < v.desde) continue;
    else if (!v.desde && !v.sinAviso && v.hasta && diasEntre(ctx.hoy, v.hasta) > AVISO_DIAS) continue;
    else lista.push({ pilar, accion: a, urgencia: 'toca', hasta: v.hasta });
  }
  const orden: Record<Urgencia, number> = { atrasada: 0, toca: 1, hecha: 2 };
  return lista.sort(
    (x, y) => orden[x.urgencia] - orden[y.urgencia] || (x.hasta ?? '9999').localeCompare(y.hasta ?? '9999'),
  );
}

// Un principio con ventana (p. ej. "semanas 1–4") solo sale mientras dure.
export function enVentana(a: Accion, c: Cuadricula, ctx: Contexto): boolean {
  if (!a.cuando || !('semanas' in a.cuando)) return true;
  const n = semanaFase(c.fechaInicio, ctx.hoy);
  return n !== null && n >= a.cuando.semanas[0] && n <= a.cuando.semanas[1];
}

export function principioDelDia(c: Cuadricula, ctx: Contexto): Item | null {
  const activos = items(c).filter(
    ({ accion: a }) => a.tipo === 'principio' && estadoAccion(a, ctx) !== 'espera' && enVentana(a, c, ctx),
  );
  if (!activos.length) return null;
  // Primero los que fallaron en la última revisión: el recordatorio trabaja donde flojeas.
  const flojos = activos.filter(({ accion: a }) => estadoAccion(a, ctx) !== 'on' && ultimaRespuesta(a.id, ctx.revisiones, ctx.hoy) !== null);
  const grupo = flojos.length ? flojos : activos;
  const n = diasEntre('2026-01-01', ctx.hoy);
  return grupo[((n % grupo.length) + grupo.length) % grupo.length];
}

// Días seguidos marcados justo antes de `hoy` (sin contar hoy).
export function seguidosAntes(id: string, marcas: Marcas, hoy: string): number {
  let n = 0;
  while (marcas[sumarDias(hoy, -(n + 1))]?.includes(id)) n++;
  return n;
}

export function alternarMarca(marcas: Marcas, dia: string, id: string): Marcas {
  const del = marcas[dia] ?? [];
  const nuevo = del.includes(id) ? del.filter((x) => x !== id) : [...del, id];
  const copia = { ...marcas };
  if (nuevo.length) copia[dia] = nuevo;
  else delete copia[dia];
  return copia;
}
