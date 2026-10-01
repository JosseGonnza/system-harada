import type { Calendario } from './types';
import { deISO, sumarDias } from './fechas';

// Día en que se completan las horas de la fase, contando solo días con horario, sin festivos ni parón.
export function finEstimado(inicio: string, cal: Calendario, conParon = true): string {
  if (!cal.horasDia.some((h) => h > 0)) return inicio;
  let d = inicio;
  let horas = 0;
  for (;;) {
    const h = cal.horasDia[deISO(d).getDay()] ?? 0;
    const paron = conParon && !!cal.paron && d >= cal.paron.desde && d <= cal.paron.hasta;
    if (h && !paron && !cal.festivos.includes(d)) {
      horas += h;
      if (horas >= cal.horas) return d;
    }
    d = sumarDias(d, 1);
  }
}
