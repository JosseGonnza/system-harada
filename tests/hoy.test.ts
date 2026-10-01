import { describe, expect, it } from 'vitest';
import { alternarMarca, habitosDeHoy, habitosEnEspera, principioDelDia, seguidosAntes, tareasDeHoy } from '../src/lib/hoy';
import type { Contexto } from '../src/lib/puntos';
import { CUADRICULA } from './fixtures/cuadricula';
import type { Cuadricula } from '../src/lib/types';

const copia = (): Cuadricula => structuredClone(CUADRICULA);
const ctx = (hoy: string, fechaInicio: string | null = null): Contexto => ({ hoy, fechaInicio, marcas: {}, revisiones: [] });
const ids = (xs: { accion: { id: string } }[]) => xs.map((x) => x.accion.id);

describe('hábitos de hoy', () => {
  it('sin fase empezada, el hábito que depende de ella está en espera y los de día fijo salen solo ese día', () => {
    const c = copia();
    const jueves = habitosDeHoy(c, ctx('2026-10-01'));
    expect(ids(jueves)).toEqual(['grado-5', 'energia-1', 'energia-3']);
    expect(ids(habitosEnEspera(c, ctx('2026-10-01')))).toEqual(['energia-2']);
    expect(ids(habitosDeHoy(c, ctx('2026-10-05')))).toContain('energia-6');
    expect(ids(habitosDeHoy(c, ctx('2026-10-02')))).toContain('energia-5');
    expect(ids(habitosDeHoy(c, ctx('2026-10-04')))).toContain('energia-4');
    expect(ids(habitosDeHoy(c, ctx('2026-10-02')))).not.toContain('grado-5');
  });

  it('con la fase empezada, el hábito de entre semana sale de lunes a viernes y no en finde', () => {
    const c = { ...copia(), fechaInicio: '2026-10-19' };
    expect(ids(habitosDeHoy(c, ctx('2026-10-20', '2026-10-19')))).toContain('energia-2');
    expect(ids(habitosDeHoy(c, ctx('2026-10-24', '2026-10-19')))).not.toContain('energia-2');
  });
});

describe('tareas de hoy', () => {
  it('antes de tener fecha de inicio salen las cinco de "antes de empezar"', () => {
    expect(ids(tareasDeHoy(copia(), ctx('2026-10-01'))).sort()).toEqual(['energia-8', 'grado-1', 'grado-2', 'negocio-1', 'stack-2']);
  });

  it('una tarea con solo fecha límite aparece dos semanas antes', () => {
    expect(ids(tareasDeHoy(copia(), ctx('2026-12-03')))).not.toContain('conversacion-6');
    expect(ids(tareasDeHoy(copia(), ctx('2026-12-04')))).toContain('conversacion-6');
  });

  it('pasada la fecha, sale la primera como atrasada', () => {
    const t = tareasDeHoy(copia(), ctx('2026-12-19'));
    expect(t[0].accion.id).toBe('conversacion-6');
    expect(t[0].urgencia).toBe('atrasada');
  });

  it('las de semanas de la fase salen en su semana, y las de antes de empezar pasan a atrasadas', () => {
    const c = { ...copia(), fechaInicio: '2026-10-19' };
    const semana1 = tareasDeHoy(c, ctx('2026-10-20', '2026-10-19'));
    expect(ids(semana1)).toEqual(expect.arrayContaining(['stack-1', 'equipo-2', 'conversacion-1']));
    expect(semana1.find((x) => x.accion.id === 'stack-2')?.urgencia).toBe('atrasada');
    expect(ids(semana1)).not.toContain('conversacion-3');
  });

  it('una tarea hecha hoy sigue en la lista; hecha otro día, no', () => {
    const c = copia();
    c.pilares[0].acciones[1].hechaISO = '2026-10-01';
    c.pilares[4].acciones[0].hechaISO = '2026-09-30';
    const t = tareasDeHoy(c, ctx('2026-10-01'));
    expect(t.find((x) => x.accion.id === 'stack-2')?.urgencia).toBe('hecha');
    expect(ids(t)).not.toContain('negocio-1');
  });
});

describe('oferta por escrito (hasta el fin o el objetivo)', () => {
  const limite = (fechaFin: string | null) =>
    tareasDeHoy({ ...copia(), fechaFin }, ctx('2027-02-10')).find((x) => x.accion.id === 'conversacion-8')?.hasta;

  it('si la fase acaba después del objetivo, manda el objetivo', () => {
    expect(limite('2027-02-09')).toBe('2027-02-08');
  });

  it('si acaba antes, manda el fin de la fase', () => {
    expect(limite('2027-01-26')).toBe('2027-01-26');
  });

  it('sin fecha de fin, el objetivo', () => {
    expect(limite(null)).toBe('2027-02-08');
  });
});

describe('principio del día', () => {
  it('sin fase empezada solo rotan los dos que no dependen de ella', () => {
    const vistos = new Set(['2026-10-01', '2026-10-02', '2026-10-03'].map((d) => principioDelDia(copia(), ctx(d))?.accion.id));
    expect([...vistos].sort()).toEqual(['grado-6', 'grado-7']);
  });

  it('si alguno falló en la última revisión, sale ese y no los demás', () => {
    const revisiones = [{ semana: '2026-W40', fechaISO: '2026-10-02', respuestas: { 'grado-6': 'si' as const, 'grado-7': 'no' as const } }];
    const dias = ['2026-10-03', '2026-10-04', '2026-10-05'].map((d) => principioDelDia(copia(), { ...ctx(d), revisiones })?.accion.id);
    expect(new Set(dias)).toEqual(new Set(['grado-7']));
  });

  it('el de "primeras semanas" deja de salir pasada la semana 4', () => {
    const c = { ...copia(), fechaInicio: '2026-10-19' };
    const tras = Array.from({ length: 40 }, (_, i) => {
      const d = new Date(2026, 10, 20 + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return principioDelDia(c, ctx(iso, '2026-10-19'))?.accion.id;
    });
    expect(tras).not.toContain('visibilidad-3');
  });
});

describe('marcas', () => {
  it('alternar marca y desmarca sin dejar días vacíos', () => {
    const m1 = alternarMarca({}, '2026-10-01', 'energia-3');
    expect(m1).toEqual({ '2026-10-01': ['energia-3'] });
    expect(alternarMarca(m1, '2026-10-01', 'energia-3')).toEqual({});
  });

  it('cuenta los días seguidos anteriores a hoy', () => {
    const m = { '2026-09-28': ['g'], '2026-09-29': ['g'], '2026-09-30': ['g'], '2026-09-26': ['g'] };
    expect(seguidosAntes('g', m, '2026-10-01')).toBe(3);
    expect(seguidosAntes('g', m, '2026-09-28')).toBe(0);
  });
});
