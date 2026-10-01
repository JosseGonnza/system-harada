import { describe, expect, it } from 'vitest';
import { cuandoTexto, deFase, fase } from '../src/lib/formato';
import type { Accion } from '../src/lib/types';

const tarea = (cuando: Accion['cuando']): Accion => ({ id: 't', corto: 'T', texto: '', tipo: 'tarea', cuando });

describe('fase', () => {
  it('sin nombre, «el plan»', () => {
    expect(fase({})).toBe('el plan');
    expect(deFase({})).toBe('del plan');
  });

  it('con nombre propio, con su artículo', () => {
    expect(deFase({ fase: 'las prácticas' })).toBe('de las prácticas');
  });

  it('los textos de cuándo usan la fase', () => {
    expect(cuandoTexto(tarea({ antesInicio: true }), { fase: 'las prácticas' })).toBe('Antes de empezar las prácticas');
    expect(cuandoTexto(tarea({ semanas: [1, 2] }), {})).toBe('Semanas 1–2 del plan');
    expect(cuandoTexto(tarea({ semanas: [6, 6] }), { fase: 'el curso' })).toBe('Semana 6 del curso');
  });
});
