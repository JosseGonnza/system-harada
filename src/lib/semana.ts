import type { Accion, Cuadricula, Respuesta, Revision } from './types';
import { deISO, lunesDe, semanaISO, sumarDias } from './fechas';
import { estadoAccion, resumenPilar, type Contexto } from './puntos';
import { enVentana, type Item } from './hoy';

export const MAX_SEMANAS = 12;

export interface PuntoSemana {
  lunes: string;
  semana: string;
  puntos: number[]; // encendidos por pilar, en el orden de la cuadrícula
  total: number;
}

// Encendidos por pilar tal como estaban el día `dia`.
export function puntosEn(c: Cuadricula, ctx: Contexto, dia: string): number[] {
  const en = { ...ctx, hoy: dia };
  return c.pilares.map((p) => resumenPilar(p, en).on);
}

export function primeraActividad(c: Cuadricula, ctx: Contexto): string {
  const fechas = [
    ...Object.keys(ctx.marcas),
    ...ctx.revisiones.map((r) => r.fechaISO),
    ...c.pilares.flatMap((p) => p.acciones.map((a) => a.hechaISO).filter((f): f is string => !!f)),
  ];
  return fechas.length ? fechas.sort()[0] : ctx.hoy;
}

// Una entrada por semana, desde la primera con actividad (como mucho las 12 últimas).
// Las semanas pasadas se miden en su domingo; la actual, hoy.
export function historial(c: Cuadricula, ctx: Contexto): PuntoSemana[] {
  const actual = lunesDe(ctx.hoy);
  let lunes = lunesDe(primeraActividad(c, ctx));
  if (lunes > actual) lunes = actual;
  const minimo = sumarDias(actual, -(MAX_SEMANAS - 1) * 7);
  if (lunes < minimo) lunes = minimo;
  const lista: PuntoSemana[] = [];
  for (; lunes <= actual; lunes = sumarDias(lunes, 7)) {
    const domingo = sumarDias(lunes, 6);
    const puntos = puntosEn(c, ctx, domingo < ctx.hoy ? domingo : ctx.hoy);
    lista.push({ lunes, semana: semanaISO(lunes), puntos, total: puntos.reduce((a, b) => a + b, 0) });
  }
  return lista;
}

// Encendidos por pilar hace 7 días: la comparación justa (este lunes contra el lunes pasado).
// null si hace 7 días aún no había nada que comparar.
export function puntosHace7(c: Cuadricula, ctx: Contexto): number[] | null {
  const dia = sumarDias(ctx.hoy, -7);
  return primeraActividad(c, ctx) > dia ? null : puntosEn(c, ctx, dia);
}

export function principiosARevisar(c: Cuadricula, ctx: Contexto): Item[] {
  return c.pilares.flatMap((pilar) =>
    pilar.acciones
      .filter((a) => a.tipo === 'principio' && estadoAccion(a, ctx) !== 'espera' && enVentana(a, c, ctx))
      .map((accion) => ({ pilar, accion })),
  );
}

export const revisionDe = (revisiones: Revision[], semana: string) => revisiones.find((r) => r.semana === semana);

// Guarda una respuesta en la revisión de la semana (la crea si no existe).
export function responder(revisiones: Revision[], semana: string, dia: string, id: string, r: Respuesta): Revision[] {
  const existe = revisionDe(revisiones, semana);
  if (!existe) return [...revisiones, { semana, fechaISO: dia, respuestas: { [id]: r } }];
  return revisiones.map((x) => (x === existe ? { ...x, fechaISO: dia, respuestas: { ...x.respuestas, [id]: r } } : x));
}

// Lunes = 0 … domingo = 6.
const indiceLunes = (diaJS: number) => (diaJS + 6) % 7;

export function tocaRevisar(diaRevision: number, hoy: string): boolean {
  return indiceLunes(deISO(hoy).getDay()) >= indiceLunes(diaRevision);
}

export interface Logro extends Item {
  fecha: string;
}

export function logros(c: Cuadricula): Logro[] {
  return c.pilares
    .flatMap((pilar) =>
      pilar.acciones.filter((a): a is Accion & { hechaISO: string } => !!a.hechaISO).map((accion) => ({ pilar, accion, fecha: accion.hechaISO })),
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function textoLogros(lista: Logro[]): string {
  return lista
    .map(({ fecha, pilar, accion }) => {
      const [, m, d] = fecha.split('-');
      return `- ${d}/${m} · ${accion.corto} (${pilar.nombre}): ${accion.texto}`;
    })
    .join('\n');
}

