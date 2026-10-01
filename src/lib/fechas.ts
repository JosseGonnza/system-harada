const DIA_MS = 86_400_000;

// Modo simulación para probar: con ?simular=AAAA-MM-DD la app se cree que hoy es esa fecha (?simular=no lo quita).
export const CLAVE_SIMULACION = 'harada:hoySimulado';

export function hoySimulado(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(CLAVE_SIMULACION);
  } catch {
    return null;
  }
}

export function hoyISO(d?: Date): string {
  if (!d) {
    const simulado = hoySimulado();
    if (simulado) return simulado;
    d = new Date();
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

export function deISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Días de calendario entre dos fechas locales. Redondea para que el cambio de hora no reste un día.
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((deISO(hasta).getTime() - deISO(desde).getTime()) / DIA_MS);
}

// Semana de la fase en curso (1 = la del primer día). null si aún no hay fecha o no ha empezado.
export function semanaFase(inicio: string | null, hoy: string): number | null {
  if (!inicio || hoy < inicio) return null;
  return Math.floor(diasEntre(inicio, hoy) / 7) + 1;
}

export function fechaLarga(iso: string): string {
  return deISO(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function sumarDias(iso: string, n: number): string {
  const d = deISO(iso);
  d.setDate(d.getDate() + n);
  return hoyISO(d);
}

export function lunesDe(iso: string): string {
  return sumarDias(iso, -((deISO(iso).getDay() + 6) % 7));
}

// Los 7 días que acaban en `iso`, incluido: la ventana de los hábitos.
export function ultimos7(iso: string): string[] {
  return Array.from({ length: 7 }, (_, i) => sumarDias(iso, i - 6));
}

// Los 7 días (lunes → domingo) de la semana que contiene `iso`.
export function diasSemana(iso: string): string[] {
  const lunes = lunesDe(iso);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

// Semana ISO 8601 ('AAAA-Www'): la semana pertenece al año de su jueves.
export function semanaISO(iso: string): string {
  const jueves = deISO(sumarDias(lunesDe(iso), 3));
  const año = jueves.getFullYear();
  const primerJueves = deISO(sumarDias(lunesDe(`${año}-01-04`), 3));
  const n = 1 + Math.round((jueves.getTime() - primerJueves.getTime()) / (7 * DIA_MS));
  return `${año}-W${String(n).padStart(2, '0')}`;
}

export function fechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
