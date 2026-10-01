import { describe, expect, it } from 'vitest';
import type { Contexto } from '../src/lib/puntos';
import { estadoAccion } from '../src/lib/puntos';
import { CUADRICULA } from './fixtures/cuadricula';
import { historial, logros, principiosARevisar, puntosHace7, responder, revisionDe, textoLogros, tocaRevisar } from '../src/lib/semana';
import type { Cuadricula, Revision } from '../src/lib/types';

const copia = (): Cuadricula => structuredClone(CUADRICULA);
const ctx = (hoy: string, extra: Partial<Contexto> = {}): Contexto => ({ hoy, fechaInicio: null, marcas: {}, revisiones: [], ...extra });

describe('estados en una fecha pasada', () => {
  it('una tarea hecha después de esa fecha cuenta como pendiente', () => {
    const a = { ...copia().pilares[0].acciones[1], hechaISO: '2026-10-10' };
    expect(estadoAccion(a, ctx('2026-10-09'))).toBe('off');
    expect(estadoAccion(a, ctx('2026-10-10'))).toBe('on');
  });

  it('una respuesta posterior a esa fecha no cuenta', () => {
    const grado6 = copia().pilares[6].acciones[5];
    const revisiones: Revision[] = [{ semana: '2026-W41', fechaISO: '2026-10-09', respuestas: { 'grado-6': 'si' } }];
    expect(estadoAccion(grado6, ctx('2026-10-08', { revisiones }))).toBe('off');
    expect(estadoAccion(grado6, ctx('2026-10-11', { revisiones }))).toBe('on');
  });
});

describe('historial', () => {
  it('sin actividad, solo la semana actual', () => {
    const h = historial(copia(), ctx('2026-10-01'));
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ lunes: '2026-09-28', semana: '2026-W40', total: 0 });
  });

  it('mide cada semana pasada en su domingo y la actual hoy', () => {
    const c = copia();
    c.pilares[0].acciones[1].hechaISO = '2026-09-30'; // semana del 28/09
    c.pilares[4].acciones[0].hechaISO = '2026-10-06'; // semana del 05/10
    const h = historial(c, ctx('2026-10-07'));
    expect(h.map((x) => x.lunes)).toEqual(['2026-09-28', '2026-10-05']);
    expect(h[0].puntos[0]).toBe(1);
    expect(h[0].total).toBe(1);
    expect(h[1].total).toBe(2);
  });

  it('los hábitos cuentan en su semana y no arrastran', () => {
    const marcas = { '2026-09-28': ['grado-5'], '2026-09-29': ['grado-5'] };
    const h = historial(copia(), ctx('2026-10-07', { marcas }));
    expect(h[0].puntos[6]).toBe(1);
    expect(h[1].puntos[6]).toBe(0);
  });

  it('nunca más de 12 semanas', () => {
    const c = copia();
    c.pilares[0].acciones[1].hechaISO = '2026-01-05';
    expect(historial(c, ctx('2026-10-07'))).toHaveLength(12);
  });
});

describe('comparación con hace 7 días', () => {
  it('sin actividad hace 7 días no hay comparación', () => {
    const c = copia();
    c.pilares[0].acciones[1].hechaISO = '2026-10-05';
    expect(puntosHace7(c, ctx('2026-10-07'))).toBeNull();
  });

  it('compara con el estado de hace exactamente 7 días', () => {
    const c = copia();
    c.pilares[0].acciones[1].hechaISO = '2026-09-28';
    c.pilares[4].acciones[0].hechaISO = '2026-10-06';
    expect(puntosHace7(c, ctx('2026-10-07'))?.[0]).toBe(1);
    expect(puntosHace7(c, ctx('2026-10-07'))?.[4]).toBe(0);
  });
});

describe('revisión', () => {
  it('sin fase empezada solo hay dos principios activos', () => {
    expect(principiosARevisar(copia(), ctx('2026-10-02')).map((x) => x.accion.id)).toEqual(['grado-6', 'grado-7']);
  });

  it('con la fase empezada entran todos (25 en la semana 1)', () => {
    const c = { ...copia(), fechaInicio: '2026-10-19' };
    expect(principiosARevisar(c, ctx('2026-10-23', { fechaInicio: '2026-10-19' }))).toHaveLength(25);
  });

  it('responder crea la revisión de la semana y luego la completa', () => {
    let r = responder([], '2026-W40', '2026-10-02', 'grado-6', 'si');
    r = responder(r, '2026-W40', '2026-10-03', 'grado-7', 'medias');
    expect(r).toHaveLength(1);
    expect(revisionDe(r, '2026-W40')).toEqual({ semana: '2026-W40', fechaISO: '2026-10-03', respuestas: { 'grado-6': 'si', 'grado-7': 'medias' } });
  });

  it('toca revisar a partir del día elegido (viernes) hasta el domingo', () => {
    expect(tocaRevisar(5, '2026-10-01')).toBe(false);
    expect(tocaRevisar(5, '2026-10-02')).toBe(true);
    expect(tocaRevisar(5, '2026-10-04')).toBe(true);
    expect(tocaRevisar(5, '2026-10-05')).toBe(false);
  });
});

describe('logros', () => {
  it('lista las tareas hechas, de la más reciente a la más antigua', () => {
    const c = copia();
    c.pilares[0].acciones[1].hechaISO = '2026-09-30';
    c.pilares[4].acciones[0].hechaISO = '2026-10-01';
    const l = logros(c);
    expect(l.map((x) => x.accion.id)).toEqual(['negocio-1', 'stack-2']);
    expect(textoLogros(l).split('\n')[0]).toBe('- 01/10 · Acción 5.1 (Pilar 5): Texto de la acción 5.1.');
  });
});
