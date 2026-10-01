import { describe, expect, it } from 'vitest';
import { crearPlantilla, ID_PLANTILLA } from '../src/lib/plantilla';

describe('cuadrícula vacía', () => {
  const c = crearPlantilla('2026-10-01');
  const acciones = c.pilares.flatMap((p) => p.acciones);

  it('8 pilares de 8 acciones, con ids únicos y un color por pilar', () => {
    expect(c.pilares).toHaveLength(8);
    expect(acciones).toHaveLength(64);
    expect(new Set(acciones.map((a) => a.id)).size).toBe(64);
    expect(c.pilares.map((p) => p.color)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('todo son tareas sin fecha hasta que el usuario decida', () => {
    expect(acciones.every((a) => a.tipo === 'tarea' && !a.cuando)).toBe(true);
  });

  it('va marcada como plantilla, con objetivo a seis meses', () => {
    expect(c.plantilla).toBe(true);
    expect(c.id).toBe(ID_PLANTILLA);
    expect(c.fechaObjetivo).toBe('2027-04-01');
  });
});
