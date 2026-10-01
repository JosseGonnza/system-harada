import type { Accion, Cuadricula, Marcas, Pilar, Respuesta, Revision } from './types';
import { diasEntre, sumarDias, ultimos7 } from './fechas';

// Estado del punto de una acción: encendido, a medias, apagado o en espera
// (depende del inicio de la fase y aún no ha llegado).
export type Estado = 'on' | 'medias' | 'off' | 'espera';

export interface Contexto {
  hoy: string;
  fechaInicio: string | null;
  marcas: Marcas;
  revisiones: Revision[];
}

export interface ResumenPilar {
  estados: Estado[];
  on: number;
  medias: number;
  off: number;
  espera: number;
}

export const empezado = (ctx: Contexto): boolean => !!ctx.fechaInicio && ctx.hoy >= ctx.fechaInicio;

// Los hábitos cuentan los últimos 7 días, no la semana natural: así la cuadrícula no se hunde
// cada lunes. Medido en domingo, coincide con la semana de lunes a domingo.
export function vecesEn7Dias(id: string, marcas: Marcas, hoy: string): number {
  return ultimos7(hoy).filter((d) => marcas[d]?.includes(id)).length;
}

// Una respuesta de hace más de 14 días ya no cuenta: si dejas de revisar, la cuadrícula no
// puede seguir enseñando los «sí» de hace un mes como si fueran de ahora.
export const CADUCIDAD_DIAS = 14;

// Última respuesta dada a un principio y su fecha, opcionalmente solo hasta una fecha (para mirar semanas pasadas).
export function ultimaRevision(id: string, revisiones: Revision[], hasta?: string): { respuesta: Respuesta; fecha: string } | null {
  const ordenadas = revisiones
    .filter((r) => !hasta || r.fechaISO <= hasta)
    .sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));
  for (let i = ordenadas.length - 1; i >= 0; i--) {
    const r = ordenadas[i].respuestas[id];
    if (r) return { respuesta: r, fecha: ordenadas[i].fechaISO };
  }
  return null;
}

export function ultimaRespuesta(id: string, revisiones: Revision[], hasta?: string): Respuesta | null {
  return ultimaRevision(id, revisiones, hasta)?.respuesta ?? null;
}

// Un principio con ventana (p. ej. semanas 1–4) que ya terminó conserva su última respuesta para siempre.
function ventanaCerrada(a: Accion, ctx: Contexto): boolean {
  if (!a.cuando || !('semanas' in a.cuando) || !ctx.fechaInicio) return false;
  return ctx.hoy > sumarDias(ctx.fechaInicio, a.cuando.semanas[1] * 7 - 1);
}

export function caducada(a: Accion, ctx: Contexto): boolean {
  const rev = ultimaRevision(a.id, ctx.revisiones, ctx.hoy);
  return !!rev && !ventanaCerrada(a, ctx) && diasEntre(rev.fecha, ctx.hoy) > CADUCIDAD_DIAS;
}

export function estadoAccion(a: Accion, ctx: Contexto): Estado {
  if (a.tipo === 'tarea') return a.hechaISO && a.hechaISO <= ctx.hoy ? 'on' : 'off';
  if (a.trasInicio && !empezado(ctx)) return 'espera';
  if (a.tipo === 'habito') {
    const n = vecesEn7Dias(a.id, ctx.marcas, ctx.hoy);
    if (n >= (a.objetivoSemana ?? 1)) return 'on';
    return n > 0 ? 'medias' : 'off';
  }
  if (caducada(a, ctx)) return 'off';
  const r = ultimaRespuesta(a.id, ctx.revisiones, ctx.hoy);
  return r === 'si' ? 'on' : r === 'medias' ? 'medias' : 'off';
}

export function resumenPilar(p: Pilar, ctx: Contexto): ResumenPilar {
  const estados = p.acciones.map((a) => estadoAccion(a, ctx));
  const cuenta = (e: Estado) => estados.filter((x) => x === e).length;
  return { estados, on: cuenta('on'), medias: cuenta('medias'), off: cuenta('off'), espera: cuenta('espera') };
}

// El pilar o pilares con menos proporción encendida. Vacío si todos van igual o si empatan más de dos
// (señalar a medio tablero no dice nada).
export function pilaresFlojos(c: Cuadricula, ctx: Contexto): string[] {
  const proporciones = c.pilares
    .map((p) => {
      const r = resumenPilar(p, ctx);
      const activos = 8 - r.espera;
      return { id: p.id, valor: activos ? (r.on + r.medias / 2) / activos : null };
    })
    .filter((x): x is { id: string; valor: number } => x.valor !== null);
  if (proporciones.length < 2) return [];
  const min = Math.min(...proporciones.map((x) => x.valor));
  const max = Math.max(...proporciones.map((x) => x.valor));
  const flojos = proporciones.filter((x) => x.valor === min).map((x) => x.id);
  return min === max || flojos.length > 2 ? [] : flojos;
}

export function encendidos(c: Cuadricula, ctx: Contexto): number {
  return c.pilares.reduce((total, p) => total + resumenPilar(p, ctx).on, 0);
}
