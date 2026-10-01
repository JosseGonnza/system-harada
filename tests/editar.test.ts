import { describe, expect, it } from 'vitest';
import { aplicarEdicion, cuandoDe, modoDe, sinProgreso } from '../src/lib/editar';
import { crearPlantilla } from '../src/lib/plantilla';
import type { Accion } from '../src/lib/types';

const tarea: Accion = { id: 't', corto: 'T', texto: 'Texto', tipo: 'tarea', cuando: { antesInicio: true }, hechaISO: '2026-10-01' };
const gym: Accion = { id: 'g', corto: 'Gym', texto: 'Gym', tipo: 'habito', objetivoSemana: 3, maxSeguidos: 3 };

describe('editar acciones', () => {
  it('cambia texto y mantiene la fecha de hecha', () => {
    expect(aplicarEdicion(tarea, { corto: ' Nuevo ', texto: 'Otro', tipo: 'tarea', cuando: { hasta: '2026-11-01' } })).toEqual({
      id: 't', corto: 'Nuevo', texto: 'Otro', tipo: 'tarea', cuando: { hasta: '2026-11-01' }, hechaISO: '2026-10-01',
    });
  });

  it('un nombre vacío no borra el que había', () => {
    expect(aplicarEdicion(tarea, { corto: '  ', texto: '', tipo: 'tarea' }).corto).toBe('T');
  });

  it('de tarea a hábito: limpia lo de tarea y pone objetivo', () => {
    const n = aplicarEdicion(tarea, { corto: 'T', texto: 'Texto', tipo: 'habito', objetivoSemana: 9, trasInicio: true });
    expect(n).toEqual({ id: 't', corto: 'T', texto: 'Texto', tipo: 'habito', objetivoSemana: 7, trasInicio: true });
  });

  it('un hábito editado conserva su aviso de días seguidos', () => {
    expect(aplicarEdicion(gym, { corto: 'Gym', texto: 'Gym', tipo: 'habito', objetivoSemana: 4 }).maxSeguidos).toBe(3);
  });
});

describe('cuándo', () => {
  it('ida y vuelta entre modo y valor', () => {
    expect(modoDe({ semanas: [1, 2] })).toBe('semanas');
    expect(modoDe({ desde: '2027-01-01', hasta: '2027-01-31' })).toBe('entre');
    expect(modoDe({ hasta: '2026-12-18' })).toBe('hasta');
    expect(cuandoDe('semanas', { semDesde: 4, semHasta: 3 })).toEqual({ semanas: [3, 4] });
    expect(cuandoDe('entre', { desde: '2027-01-31', hasta: '2027-01-01' })).toEqual({ desde: '2027-01-01', hasta: '2027-01-31' });
    expect(cuandoDe('hasta', {})).toBeNull();
  });
});

describe('borrar progreso', () => {
  it('quita las fechas de hecha y deja el resto igual', () => {
    const c = crearPlantilla('2026-10-01');
    c.pilares[0].acciones[0].hechaISO = '2026-10-02';
    const limpia = sinProgreso(c);
    expect(limpia.pilares[0].acciones[0].hechaISO).toBeUndefined();
    expect(c.pilares[0].acciones[0].hechaISO).toBe('2026-10-02');
    expect(limpia.pilares[0].acciones[0].corto).toBe(c.pilares[0].acciones[0].corto);
  });
});
