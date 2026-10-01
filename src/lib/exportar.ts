import type { BackupV1, Config, Cuadricula, Marcas, Revision } from './types';
import { diasEntre, fechaCorta, hoyISO, lunesDe, semanaISO, sumarDias } from './fechas';
import { estadoAccion, resumenPilar, vecesEn7Dias, type Contexto } from './puntos';
import { historial, puntosHace7, revisionDe } from './semana';

export const DIAS_AVISO_BACKUP = 7;

export function crearBackup(config: Config, cuadricula: Cuadricula, marcas: Marcas, revisiones: Revision[], ahora: Date): BackupV1 {
  return { app: 'harada', version: 1, exportadoISO: ahora.toISOString(), config, cuadricula, marcas, revisiones };
}

export const nombreBackup = (hoy: string) => `harada-backup-${hoy}.json`;

// Comprueba que un JSON importado es una copia válida. Lanza un Error con el motivo, en castellano.
export function validarBackup(datos: unknown): BackupV1 {
  const b = datos as Partial<BackupV1> | null;
  if (!b || typeof b !== 'object' || b.app !== 'harada') throw new Error('Este archivo no es una copia de Harada.');
  if (b.version !== 1) throw new Error(`La copia es de una versión que esta app no conoce (${String(b.version)}).`);
  const c = b.cuadricula;
  if (!c || !Array.isArray(c.pilares) || c.pilares.length !== 8 || c.pilares.some((p) => !Array.isArray(p.acciones) || p.acciones.length !== 8))
    throw new Error('La copia está incompleta: la cuadrícula no tiene 8 pilares de 8 acciones.');
  if (!b.config || typeof b.config !== 'object') throw new Error('La copia está incompleta: falta la configuración.');
  if (!b.marcas || typeof b.marcas !== 'object') throw new Error('La copia está incompleta: faltan los hábitos marcados.');
  if (!Array.isArray(b.revisiones)) throw new Error('La copia está incompleta: faltan las revisiones.');
  return b as BackupV1;
}

export function hayDatos(c: Cuadricula, marcas: Marcas, revisiones: Revision[]): boolean {
  return Object.keys(marcas).length > 0 || revisiones.length > 0 || c.pilares.some((p) => p.acciones.some((a) => a.hechaISO));
}

// Texto del aviso de copia de seguridad, o null si no hace falta.
export function avisoBackup(ultimoExportISO: string | null, datos: boolean, hoy: string): string | null {
  if (!datos) return null;
  if (!ultimoExportISO) return 'Aún no has hecho ninguna copia de seguridad.';
  const dias = diasEntre(hoyISO(new Date(ultimoExportISO)), hoy);
  return dias >= DIAS_AVISO_BACKUP ? `Hace ${dias} días que no haces copia de seguridad.` : null;
}

// Foto de la semana para Obsidian: propiedades para Dataview y un resumen legible.
export function markdownSemana(c: Cuadricula, ctx: Contexto): { nombre: string; texto: string } {
  const semana = semanaISO(ctx.hoy);
  const lunes = lunesDe(ctx.hoy);
  const domingo = sumarDias(lunes, 6);
  const h = historial(c, ctx);
  const actual = h[h.length - 1];
  const antes = puntosHace7(c, ctx);
  const resumenes = c.pilares.map((p) => resumenPilar(p, ctx));

  const habitos = c.pilares.flatMap((p) => p.acciones.filter((a) => a.tipo === 'habito'));
  const activos = habitos.filter((a) => estadoAccion(a, ctx) !== 'espera');
  const cumplidos = activos.filter((a) => vecesEn7Dias(a.id, ctx.marcas, ctx.hoy) >= (a.objetivoSemana ?? 1));

  const props = [
    'tipo: harada',
    `cuadricula: ${c.id}`,
    `semana: ${semana}`,
    `desde: ${lunes}`,
    `hasta: ${domingo}`,
    `exportado: ${ctx.hoy}`,
    `total: ${actual.total}`,
    ...c.pilares.map((p, i) => `${p.id}: ${resumenes[i].on}`),
    `habitos_cumplidos: ${cumplidos.length}`,
    `habitos_activos: ${activos.length}`,
  ];

  const celda = (i: number) => `${c.pilares[i].nombre} ${resumenes[i].on}/${8 - resumenes[i].espera}`;
  const dias = Math.max(0, diasEntre(ctx.hoy, c.fechaObjetivo));
  const tabla = [
    `| ${celda(0)} | ${celda(1)} | ${celda(2)} |`,
    '|:-:|:-:|:-:|',
    `| **${celda(3)}** | **🎯 ${c.objetivoCorto ?? c.objetivo} · ${dias} días** | **${celda(4)}** |`,
    `| **${celda(5)}** | **${celda(6)}** | **${celda(7)}** |`,
  ];

  const diff = antes ? actual.total - antes.reduce((a, b) => a + b, 0) : null;
  const comparacion = diff === null ? '' : ` · ${diff > 0 ? '+' : ''}${diff} respecto a hace 7 días`;

  const lineaHabitos = habitos.map((a) => {
    if (estadoAccion(a, ctx) === 'espera') return `- ${a.corto}: en espera`;
    const n = vecesEn7Dias(a.id, ctx.marcas, ctx.hoy);
    return `- ${a.corto}: ${n}/${a.objetivoSemana}${n >= (a.objetivoSemana ?? 1) ? ' ✓' : ''}`;
  });

  const hechas = c.pilares
    .flatMap((p) => p.acciones.filter((a) => a.hechaISO && a.hechaISO >= lunes && a.hechaISO <= domingo).map((a) => ({ p, a })))
    .sort((x, y) => x.a.hechaISO!.localeCompare(y.a.hechaISO!))
    .map(({ p, a }) => `- ${fechaCorta(a.hechaISO!)} · ${a.corto} (${p.nombre})`);

  const rev = revisionDe(ctx.revisiones, semana);
  const principios = c.pilares.flatMap((p) => p.acciones.filter((a) => a.tipo === 'principio').map((a) => ({ p, a })));
  const con = (r: string) => principios.filter(({ a }) => rev?.respuestas[a.id] === r);
  const lineaRevision = rev
    ? [
        `${con('si').length} sí · ${con('medias').length} a medias · ${con('no').length} no`,
        ...(con('no').length + con('medias').length ? [''] : []),
        ...con('no').map(({ p, a }) => `- ❌ ${a.corto} (${p.nombre})`),
        ...con('medias').map(({ p, a }) => `- ◐ ${a.corto} (${p.nombre})`),
      ]
    : ['Sin revisión esta semana.'];

  const texto = [
    '---',
    ...props,
    '---',
    '',
    `# Harada · ${semana}`,
    '',
    `${fechaCorta(lunes)} – ${fechaCorta(domingo)} · ${c.objetivo}`,
    '',
    `**${actual.total} de 64 encendidos**${comparacion}`,
    '',
    ...tabla,
    '',
    `## Hábitos · ${cumplidos.length} de ${activos.length} cumplidos en los últimos 7 días`,
    '',
    ...lineaHabitos,
    '',
    '## Hecho esta semana',
    '',
    ...(hechas.length ? hechas : ['- Nada marcado como hecho.']),
    '',
    '## Revisión de principios',
    '',
    ...lineaRevision,
    '',
  ].join('\n');

  return { nombre: `harada-${semana}.md`, texto };
}
