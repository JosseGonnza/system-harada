import { describe, expect, it } from 'vitest';
import { CUADRICULA } from './fixtures/cuadricula';

const acciones = CUADRICULA.pilares.flatMap((p) => p.acciones);
const deTipo = (tipo: string) => acciones.filter((a) => a.tipo === tipo);

describe('cuadrícula de prueba', () => {
  it('tiene 8 pilares de 8 acciones', () => {
    expect(CUADRICULA.pilares).toHaveLength(8);
    for (const p of CUADRICULA.pilares) expect(p.acciones).toHaveLength(8);
  });

  it('reparte las 64 en 32 tareas, 7 hábitos y 25 principios', () => {
    expect(deTipo('tarea')).toHaveLength(32);
    expect(deTipo('habito')).toHaveLength(7);
    expect(deTipo('principio')).toHaveLength(25);
  });

  it('no repite ids', () => {
    expect(new Set(acciones.map((a) => a.id)).size).toBe(64);
  });

  it('cada pilar usa un color distinto del 1 al 8', () => {
    expect(CUADRICULA.pilares.map((p) => p.color).sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('todo hábito tiene objetivo semanal y solo los hábitos lo tienen', () => {
    for (const a of acciones) {
      if (a.tipo === 'habito') expect(a.objetivoSemana).toBeGreaterThan(0);
      else expect(a.objetivoSemana).toBeUndefined();
    }
  });

  it('hay cinco tareas de "antes de empezar"', () => {
    const antes = acciones.filter((a) => a.cuando && 'antesInicio' in a.cuando).map((a) => a.id);
    expect(antes.sort()).toEqual(['energia-8', 'grado-1', 'grado-2', 'negocio-1', 'stack-2']);
  });
});
