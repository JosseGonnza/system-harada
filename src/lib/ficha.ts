import type { Accion, Cuadricula, Pilar, TipoAccion } from './types';
import type { Contexto } from './puntos';
import { caducada, estadoAccion, ultimaRevision, vecesEn7Dias } from './puntos';
import { deISO, diasEntre, fechaCorta, ultimos7 } from './fechas';
import { cuandoTexto, deFase, esc, fase, LETRA_DIA, RESPUESTA, TIPO } from './formato';
import { setCuadricula, setMarcas } from './db';
import { alternarMarca } from './hoy';
import { aplicarEdicion, cuandoDe, modoDe, type ModoCuando } from './editar';

function contenido(p: Pilar, a: Accion, ctx: Contexto, c: Cuadricula): string {
  const e = estadoAccion(a, ctx);
  const cuando = cuandoTexto(a, c);
  let estado = '';
  let control = '';
  if (e === 'espera') {
    estado = `En espera hasta el inicio ${deFase(c)}.`;
  } else if (a.tipo === 'tarea') {
    estado = a.hechaISO ? `Hecha el ${fechaCorta(a.hechaISO)}.` : 'Pendiente.';
    control = a.hechaISO
      ? `<button type="button" data-hecha="0" class="w-full rounded-full bg-surface2 py-3 font-semibold">Desmarcar</button>`
      : `<button type="button" data-hecha="1" class="w-full rounded-full py-3 font-semibold text-bg" style="background:var(--c)">Marcar como hecha</button>`;
  } else if (a.tipo === 'habito') {
    const dias = ultimos7(ctx.hoy)
      .map((d) => {
        const hecho = !!ctx.marcas[d]?.includes(a.id);
        return `<button type="button" data-dia="${d}" aria-pressed="${hecho}" aria-label="${fechaCorta(d)}: ${hecho ? 'hecho' : 'sin marcar'}" class="flex flex-col items-center gap-1 px-1 py-0.5 text-xs ${d === ctx.hoy ? 'font-bold text-ink' : 'text-mut'}">
          ${LETRA_DIA[deISO(d).getDay()]}<i class="pt ${hecho ? 'pt-on' : 'pt-off'}" style="width:18px;height:18px"></i></button>`;
      })
      .join('');
    estado = `Últimos 7 días: ${vecesEn7Dias(a.id, ctx.marcas, ctx.hoy)} de ${a.objetivoSemana}.`;
    control = `<div class="flex justify-between rounded-2xl bg-surface2 px-3 py-3">${dias}</div>
      <p class="mt-2 text-xs text-mut">Toca un día para marcarlo o desmarcarlo, por si se te olvidó.</p>`;
  } else {
    const rev = ultimaRevision(a.id, ctx.revisiones, ctx.hoy);
    if (!rev) estado = 'Aún sin revisar.';
    else if (caducada(a, ctx)) estado = `Última revisión hace ${diasEntre(rev.fecha, ctx.hoy)} días: ya no cuenta hasta que lo vuelvas a revisar.`;
    else estado = `Última revisión: ${RESPUESTA[rev.respuesta].toLowerCase()} (${fechaCorta(rev.fecha)}).`;
    control = `<p class="text-xs text-mut">Se revisa cada semana desde Semana.</p>`;
  }
  return `<div class="pil-${p.color} flex flex-col gap-4">
    <div class="flex items-center gap-2 text-xs">
      <span class="rounded-full px-2.5 py-1 font-semibold text-bg" style="background:var(--c)">${TIPO[a.tipo]}</span>
      <span class="text-mut">${esc(p.nombre)}</span>
    </div>
    <h2 id="ficha-titulo" class="text-xl font-bold leading-tight">${esc(a.corto)}</h2>
    <p class="leading-relaxed">${esc(a.texto)}</p>
    <div class="flex flex-col gap-1 text-sm text-mut">
      ${cuando ? `<span>${esc(cuando)}</span>` : ''}
      <span>${esc(estado)}</span>
    </div>
    ${control}
    <div class="flex justify-between text-sm text-mut">
      <button type="button" data-editar class="py-2">Editar</button>
      <button type="button" data-cerrar class="py-2">Cerrar</button>
    </div>
  </div>`;
}

const modos = (c: Cuadricula): [ModoCuando, string][] => [
  ['ninguno', 'Sin fecha'],
  ['antes', `Antes de empezar ${fase(c)}`],
  ['semanas', `Semanas ${deFase(c)}`],
  ['hasta', 'Hasta una fecha'],
  ['entre', 'Entre dos fechas'],
  ['fin', `Antes del fin ${deFase(c)}`],
];

function formulario(p: Pilar, a: Accion, cuadricula: Cuadricula): string {
  const c = a.cuando;
  const sem = c && 'semanas' in c ? c.semanas : [1, 1];
  const desde = c && 'desde' in c ? (c.desde ?? '') : '';
  const hasta = c && 'hasta' in c ? (c.hasta ?? '') : '';
  const opcion = (v: string, texto: string, sel: boolean) => `<option value="${v}" ${sel ? 'selected' : ''}>${texto}</option>`;
  const etiqueta = 'flex flex-col gap-1.5 text-sm';
  return `<form data-form class="pil-${p.color} flex flex-col gap-4">
    <div class="flex items-center gap-2 text-xs"><span class="text-mut">Editar · ${esc(p.nombre)}</span></div>
    <label class="${etiqueta}"><span class="text-mut">Nombre corto</span>
      <input name="corto" maxlength="40" required class="campo" value="${esc(a.corto)}" /></label>
    <label class="${etiqueta}"><span class="text-mut">Texto</span>
      <textarea name="texto" rows="3" class="campo">${esc(a.texto)}</textarea></label>
    <label class="${etiqueta}"><span class="text-mut">Tipo</span>
      <select name="tipo" class="campo">${(Object.keys(TIPO) as TipoAccion[]).map((t) => opcion(t, TIPO[t], t === a.tipo)).join('')}</select></label>
    <label data-solo="habito" class="${etiqueta}"><span class="text-mut">Veces por semana</span>
      <input type="number" name="objetivo" min="1" max="7" class="campo" value="${a.objetivoSemana ?? 1}" /></label>
    <label data-solo="tarea" class="${etiqueta}"><span class="text-mut">Cuándo</span>
      <select name="modo" class="campo">${modos(cuadricula).map(([m, t]) => opcion(m, t, m === modoDe(c))).join('')}</select></label>
    <div data-modo="semanas" class="grid grid-cols-2 gap-2">
      <label class="${etiqueta}"><span class="text-mut">Desde la semana</span><input type="number" name="semDesde" min="1" max="52" class="campo" value="${sem[0]}" /></label>
      <label class="${etiqueta}"><span class="text-mut">Hasta la semana</span><input type="number" name="semHasta" min="1" max="52" class="campo" value="${sem[1]}" /></label>
    </div>
    <label data-modo="entre" class="${etiqueta}"><span class="text-mut">Desde</span><input type="date" name="desde" class="campo" value="${desde}" /></label>
    <label data-modo="hasta entre" class="${etiqueta}"><span class="text-mut">Hasta</span><input type="date" name="hasta" class="campo" value="${hasta}" /></label>
    <label data-solo="habito principio" class="flex items-center gap-3 text-sm">
      <input type="checkbox" name="trasInicio" class="size-5" ${a.trasInicio ? 'checked' : ''} /> Espera al inicio ${esc(deFase(cuadricula))}</label>
    <button type="submit" class="w-full rounded-full py-3 font-semibold text-bg" style="background:var(--c)">Guardar</button>
    <button type="button" data-cancelar-edicion class="py-2 text-sm text-mut">Cancelar</button>
  </form>`;
}

function ajustarCampos(form: HTMLFormElement) {
  const tipo = (form.elements.namedItem('tipo') as HTMLSelectElement).value;
  const modo = (form.elements.namedItem('modo') as HTMLSelectElement).value;
  form.querySelectorAll<HTMLElement>('[data-solo]').forEach((el) => (el.hidden = !el.dataset.solo!.split(' ').includes(tipo)));
  form.querySelectorAll<HTMLElement>('[data-modo]').forEach((el) => (el.hidden = tipo !== 'tarea' || !el.dataset.modo!.split(' ').includes(modo)));
}

export function buscarAccion(c: Cuadricula, id: string): [Pilar, Accion] | null {
  for (const p of c.pilares) {
    const a = p.acciones.find((x) => x.id === id);
    if (a) return [p, a];
  }
  return null;
}

// Monta la hoja de detalle sobre un <dialog>. Devuelve la función para abrirla con un id de acción.
export function crearFicha(
  dialog: HTMLDialogElement,
  datos: () => { c: Cuadricula; ctx: Contexto },
  alCambiar: () => void,
): (id: string) => void {
  const pintar = () => {
    const { c, ctx } = datos();
    const encontrado = buscarAccion(c, dialog.dataset.accion ?? '');
    if (encontrado) dialog.innerHTML = contenido(...encontrado, ctx, c);
  };

  dialog.addEventListener('click', async (ev) => {
    if (ev.target === dialog) return dialog.close();
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-cerrar],[data-hecha],[data-editar],[data-cancelar-edicion],[data-dia]');
    if (!el) return;
    if (el.dataset.dia) {
      const { ctx } = datos();
      ctx.marcas = alternarMarca(ctx.marcas, el.dataset.dia, dialog.dataset.accion ?? '');
      await setMarcas(ctx.marcas);
      navigator.vibrate?.(12);
      pintar();
      alCambiar();
      return;
    }
    if (el.dataset.editar !== undefined) {
      const { c } = datos();
      const encontrado = buscarAccion(c, dialog.dataset.accion ?? '');
      if (!encontrado) return;
      dialog.innerHTML = formulario(...encontrado, c);
      ajustarCampos(dialog.querySelector('form')!);
      return;
    }
    if (el.dataset.cancelarEdicion !== undefined) return pintar();
    if (el.dataset.hecha === undefined) return dialog.close();
    const { c, ctx } = datos();
    const encontrado = buscarAccion(c, dialog.dataset.accion ?? '');
    if (!encontrado) return;
    const a = encontrado[1];
    if (el.dataset.hecha === '1') a.hechaISO = ctx.hoy;
    else delete a.hechaISO;
    await setCuadricula(c);
    pintar();
    alCambiar();
  });

  dialog.addEventListener('change', (ev) => {
    const form = (ev.target as HTMLElement).closest('form');
    if (form) ajustarCampos(form);
  });

  dialog.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const { c } = datos();
    const encontrado = buscarAccion(c, dialog.dataset.accion ?? '');
    if (!encontrado) return;
    const [p, a] = encontrado;
    const f = new FormData(form);
    const texto = (k: string) => String(f.get(k) ?? '');
    const editada = aplicarEdicion(a, {
      corto: texto('corto'),
      texto: texto('texto'),
      tipo: texto('tipo') as TipoAccion,
      objetivoSemana: Number(texto('objetivo')),
      trasInicio: f.has('trasInicio'),
      cuando: cuandoDe(texto('modo') as ModoCuando, {
        semDesde: Number(texto('semDesde')),
        semHasta: Number(texto('semHasta')),
        desde: texto('desde'),
        hasta: texto('hasta'),
      }),
    });
    p.acciones[p.acciones.indexOf(a)] = editada;
    await setCuadricula(c);
    pintar();
    alCambiar();
  });

  return (id: string) => {
    dialog.dataset.accion = id;
    pintar();
    dialog.showModal();
  };
}
