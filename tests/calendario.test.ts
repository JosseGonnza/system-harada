import { describe, expect, it } from 'vitest';
import { finEstimado } from '../src/lib/calendario';
import type { Calendario } from '../src/lib/types';

// 39 h/semana: de lunes a jueves 8 h y viernes 7 h.
const cal: Calendario = {
  horas: 515,
  horasDia: [0, 8, 8, 8, 8, 7, 0],
  festivos: ['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25', '2027-01-01', '2027-01-06'],
  paron: { desde: '2026-12-23', hasta: '2027-01-07' },
};

describe('fin estimado', () => {
  it('cuenta horas por día, sin festivos y con o sin parón', () => {
    expect(finEstimado('2026-10-19', cal)).toBe('2027-02-09');
    expect(finEstimado('2026-10-19', cal, false)).toBe('2027-01-26');
  });

  it('sin días con horario no se queda colgado', () => {
    expect(finEstimado('2026-10-19', { ...cal, horasDia: [0, 0, 0, 0, 0, 0, 0] })).toBe('2026-10-19');
  });
});
