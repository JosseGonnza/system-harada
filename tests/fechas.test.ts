import { describe, expect, it } from 'vitest';
import { diasEntre, diasSemana, hoyISO, lunesDe, semanaISO, semanaFase } from '../src/lib/fechas';

describe('fechas', () => {
  it('hoyISO usa la fecha local', () => {
    expect(hoyISO(new Date(2026, 8, 30, 23, 59))).toBe('2026-09-30');
  });

  it('cuenta los días hasta el objetivo', () => {
    expect(diasEntre('2026-09-30', '2027-02-08')).toBe(131);
  });

  it('el cambio de hora de octubre no resta un día', () => {
    expect(diasEntre('2026-10-24', '2026-10-26')).toBe(2);
  });

  it('semana de la fase: null antes de empezar o sin fecha', () => {
    expect(semanaFase(null, '2026-10-20')).toBeNull();
    expect(semanaFase('2026-10-19', '2026-10-18')).toBeNull();
  });

  it('semana de la fase: el primer día es la 1 y el lunes siguiente la 2', () => {
    expect(semanaFase('2026-10-19', '2026-10-19')).toBe(1);
    expect(semanaFase('2026-10-19', '2026-10-25')).toBe(1);
    expect(semanaFase('2026-10-19', '2026-10-26')).toBe(2);
  });
});

describe('semanas', () => {
  it('el lunes de un domingo es el de 6 días antes', () => {
    expect(lunesDe('2026-10-25')).toBe('2026-10-19');
    expect(lunesDe('2026-10-19')).toBe('2026-10-19');
  });

  it('una semana va de lunes a domingo', () => {
    expect(diasSemana('2026-10-21')).toEqual([
      '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25',
    ]);
  });

  it('semana ISO, incluido el cambio de año', () => {
    expect(semanaISO('2026-09-30')).toBe('2026-W40');
    expect(semanaISO('2027-01-01')).toBe('2026-W53');
    expect(semanaISO('2027-01-04')).toBe('2027-W01');
  });
});
