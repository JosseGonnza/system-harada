import { describe, expect, it } from 'vitest';
import { avisoBackup, crearBackup, hayDatos, markdownSemana, validarBackup } from '../src/lib/exportar';
import { CONFIG_INICIAL } from '../src/lib/plantilla';
import { CUADRICULA } from './fixtures/cuadricula';
import type { Contexto } from '../src/lib/puntos';
import type { Cuadricula } from '../src/lib/types';

const copia = (): Cuadricula => structuredClone(CUADRICULA);
const ctx = (hoy: string, extra: Partial<Contexto> = {}): Contexto => ({ hoy, fechaInicio: null, marcas: {}, revisiones: [], ...extra });

describe('copia de seguridad', () => {
  it('ida y vuelta: lo que se exporta se puede importar', () => {
    const b = crearBackup(CONFIG_INICIAL, copia(), { '2026-10-01': ['energia-3'] }, [], new Date('2026-10-01T10:00:00Z'));
    expect(validarBackup(JSON.parse(JSON.stringify(b)))).toEqual(b);
  });

  it('rechaza archivos que no son de Harada, de otra versión o incompletos', () => {
    expect(() => validarBackup({ app: 'gym', version: 2 })).toThrow('no es una copia de Harada');
    expect(() => validarBackup({ app: 'harada', version: 2 })).toThrow('versión');
    const rota = crearBackup(CONFIG_INICIAL, copia(), {}, [], new Date());
    rota.cuadricula.pilares.pop();
    expect(() => validarBackup(rota)).toThrow('8 pilares');
  });
});

describe('aviso de copia', () => {
  it('sin datos no avisa', () => {
    expect(avisoBackup(null, false, '2026-10-01')).toBeNull();
  });

  it('con datos y sin copia, avisa', () => {
    expect(avisoBackup(null, true, '2026-10-01')).toMatch(/ninguna copia/);
  });

  it('avisa a partir de 7 días', () => {
    expect(avisoBackup('2026-10-01T12:00:00', true, '2026-10-07')).toBeNull();
    expect(avisoBackup('2026-10-01T12:00:00', true, '2026-10-08')).toBe('Hace 7 días que no haces copia de seguridad.');
  });

  it('detecta si hay algo que perder', () => {
    const c = copia();
    expect(hayDatos(c, {}, [])).toBe(false);
    c.pilares[0].acciones[1].hechaISO = '2026-10-01';
    expect(hayDatos(c, {}, [])).toBe(true);
  });
});

describe('foto semanal en Markdown', () => {
  it('nombre por semana ISO y propiedades para Dataview', () => {
    const c = copia();
    c.pilares[0].acciones[1].hechaISO = '2026-09-30';
    const { nombre, texto } = markdownSemana(c, ctx('2026-10-01', { marcas: { '2026-09-29': ['grado-5'], '2026-09-30': ['grado-5'] } }));
    expect(nombre).toBe('harada-2026-W40.md');
    expect(texto).toMatch(/^---\ntipo: harada\n/);
    expect(texto).toContain('semana: 2026-W40');
    expect(texto).toContain('total: 2');
    expect(texto).toContain('stack: 1');
    expect(texto).toContain('grado: 1');
    expect(texto).toContain('habitos_cumplidos: 1');
    expect(texto).toContain('- 30/09 · Acción 1.2 (Pilar 1)');
    expect(texto).toContain('- Acción 7.5: 2/2 ✓');
    expect(texto).toContain('- Acción 8.2: en espera');
  });

  it('resume la revisión con los principios en no y a medias', () => {
    const revisiones = [{ semana: '2026-W40', fechaISO: '2026-10-02', respuestas: { 'grado-6': 'no' as const, 'grado-7': 'medias' as const } }];
    const { texto } = markdownSemana(copia(), ctx('2026-10-02', { revisiones }));
    expect(texto).toContain('0 sí · 1 a medias · 1 no');
    expect(texto).toContain('- ❌ Acción 7.6 (Pilar 7)');
  });
});
