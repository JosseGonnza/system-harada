import { describe, expect, it } from 'vitest';
import { caducada, encendidos, estadoAccion, pilaresFlojos, resumenPilar, ultimaRespuesta, vecesEn7Dias, type Contexto } from '../src/lib/puntos';
import { CUADRICULA } from './fixtures/cuadricula';
import type { Accion, Revision } from '../src/lib/types';

// Miércoles 21/10/2026, semana del lunes 19 al domingo 25.
const base: Contexto = { hoy: '2026-10-21', fechaInicio: '2026-10-19', marcas: {}, revisiones: [] };
const gym: Accion = { id: 'gym', corto: 'Gym', texto: '', tipo: 'habito', objetivoSemana: 3 };
const trasFase: Accion = { id: 'tras', corto: 'Tras la fase', texto: '', tipo: 'habito', objetivoSemana: 4, trasInicio: true };
const regla: Accion = { id: 'regla', corto: 'Regla', texto: '', tipo: 'principio', trasInicio: true };
const tarea: Accion = { id: 't', corto: 'T', texto: '', tipo: 'tarea' };

describe('tareas', () => {
  it('pendiente → apagada, hecha → encendida', () => {
    expect(estadoAccion(tarea, base)).toBe('off');
    expect(estadoAccion({ ...tarea, hechaISO: '2026-10-20' }, base)).toBe('on');
  });

  it('nunca están en espera, aunque no haya empezado la fase', () => {
    expect(estadoAccion({ ...tarea, trasInicio: true }, { ...base, fechaInicio: null })).toBe('off');
  });
});

describe('hábitos', () => {
  it('cuentan los últimos 7 días, hoy incluido', () => {
    const marcas = { '2026-10-14': ['gym'], '2026-10-15': ['gym'], '2026-10-21': ['gym'], '2026-10-22': ['gym'] };
    expect(vecesEn7Dias('gym', marcas, base.hoy)).toBe(2); // 15 y 21; el 14 queda fuera y el 22 es mañana
  });

  it('el lunes no se hunde: el finde anterior sigue contando', () => {
    const marcas = { '2026-10-23': ['gym'], '2026-10-24': ['gym'], '2026-10-25': ['gym'] };
    expect(estadoAccion(gym, { ...base, hoy: '2026-10-26', marcas })).toBe('on');
  });

  it('sin marcas → apagado; algo sin llegar → a medias; objetivo cumplido → encendido', () => {
    expect(estadoAccion(gym, base)).toBe('off');
    expect(estadoAccion(gym, { ...base, marcas: { '2026-10-19': ['gym'] } })).toBe('medias');
    const tres = { '2026-10-19': ['gym'], '2026-10-20': ['gym'], '2026-10-21': ['gym'] };
    expect(estadoAccion(gym, { ...base, marcas: tres })).toBe('on');
  });

  it('los que dependen de la fase esperan a su inicio', () => {
    expect(estadoAccion(trasFase, { ...base, fechaInicio: null })).toBe('espera');
    expect(estadoAccion(trasFase, { ...base, fechaInicio: '2026-10-26' })).toBe('espera');
    expect(estadoAccion(trasFase, base)).toBe('off');
  });
});

describe('principios', () => {
  it('sin revisión → apagado', () => {
    expect(estadoAccion(regla, base)).toBe('off');
  });

  it('manda la última respuesta que exista para esa acción', () => {
    const revisiones: Revision[] = [
      { semana: '2026-W44', fechaISO: '2026-10-30', respuestas: { otra: 'si' } },
      { semana: '2026-W43', fechaISO: '2026-10-23', respuestas: { regla: 'medias' } },
    ];
    expect(ultimaRespuesta('regla', revisiones)).toBe('medias');
    expect(estadoAccion(regla, { ...base, hoy: '2026-10-31', revisiones })).toBe('medias');
  });

  it('en espera antes del inicio de la fase', () => {
    expect(estadoAccion(regla, { ...base, hoy: '2026-10-10' })).toBe('espera');
  });
});

describe('cuadrícula recién cargada', () => {
  const hoy: Contexto = { hoy: '2026-09-30', fechaInicio: null, marcas: {}, revisiones: [] };

  it('empieza con 0 encendidos', () => {
    expect(encendidos(CUADRICULA, hoy)).toBe(0);
  });

  it('Coste cero: 7 en espera y la tarea apagada', () => {
    const r = resumenPilar(CUADRICULA.pilares[1], hoy);
    expect(r.espera).toBe(7);
    expect(r.off).toBe(1);
  });
});

describe('caducidad de principios', () => {
  const revisiones = [{ semana: '2026-W43', fechaISO: '2026-10-23', respuestas: { regla: 'si' as const } }];

  it('una respuesta cuenta 14 días; al 15º deja de contar', () => {
    expect(estadoAccion(regla, { ...base, hoy: '2026-11-06', revisiones })).toBe('on');
    expect(estadoAccion(regla, { ...base, hoy: '2026-11-07', revisiones })).toBe('off');
    expect(caducada(regla, { ...base, hoy: '2026-11-07', revisiones })).toBe(true);
  });

  it('un principio con ventana ya cerrada conserva su respuesta', () => {
    const conVentana: Accion = { ...regla, cuando: { semanas: [1, 1] } };
    expect(estadoAccion(conVentana, { ...base, hoy: '2026-12-20', revisiones })).toBe('on');
  });
});

describe('pilar más flojo', () => {
  const ctx0: Contexto = { hoy: '2026-10-01', fechaInicio: null, marcas: {}, revisiones: [] };

  it('si todos van igual no señala ninguno', () => {
    expect(pilaresFlojos(CUADRICULA, ctx0)).toEqual([]);
  });

  it('señala el de menor proporción, sin contar lo que está en espera', () => {
    const c = structuredClone(CUADRICULA);
    for (const p of c.pilares) if (p.id !== 'conversacion') p.acciones.forEach((a) => a.tipo === 'tarea' && (a.hechaISO = '2026-09-30'));
    expect(pilaresFlojos(c, ctx0)).toEqual(['conversacion']);
  });

  it('con más de dos empatados abajo no señala', () => {
    const c = structuredClone(CUADRICULA);
    c.pilares[0].acciones[0].hechaISO = '2026-09-30';
    expect(pilaresFlojos(c, ctx0)).toEqual([]);
  });
});
