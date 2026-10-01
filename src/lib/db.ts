import { get, set } from 'idb-keyval';
import type { BackupV1, Config, Cuadricula, Marcas, Revision } from './types';
import { CONFIG_INICIAL, crearPlantilla, ID_PLANTILLA } from './plantilla';
import { hoyISO } from './fechas';
import { sinProgreso } from './editar';

// La config es global; el resto vive con el prefijo de la cuadrícula (`mi-cuadricula:…`),
// para que una segunda cuadrícula no pise a la primera.
let activa = CONFIG_INICIAL.cuadriculaActivaId;
const pk = (nombre: string) => `${activa}:${nombre}`;

async function sembrar(id: string): Promise<void> {
  if (!(await get(`${id}:cuadricula`))) await set(`${id}:cuadricula`, crearPlantilla(hoyISO(), id));
  if (!(await get(`${id}:marcas`))) await set(`${id}:marcas`, {});
  if (!(await get(`${id}:revisiones`))) await set(`${id}:revisiones`, []);
}

// Pide al navegador que no borre los datos aunque el móvil vaya justo de espacio.
async function pedirPersistencia(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* sin soporte: los datos siguen en IndexedDB igual */
  }
}

export async function initDB(): Promise<void> {
  if (typeof navigator !== 'undefined') void pedirPersistencia();
  let config = (await get('config')) as Config | undefined;
  if (!config) {
    config = CONFIG_INICIAL;
    await set('config', config);
  }
  activa = config.cuadriculaActivaId;
  await sembrar(activa);
}

export const getConfig = async (): Promise<Config> => ({ ...CONFIG_INICIAL, ...(await get('config')) });
export const setConfig = (c: Config) => set('config', c);
export const getCuadricula = () => get(pk('cuadricula')) as Promise<Cuadricula>;
export const setCuadricula = (c: Cuadricula) => set(pk('cuadricula'), c);
export const getMarcas = () => get(pk('marcas')) as Promise<Marcas>;
export const setMarcas = (m: Marcas) => set(pk('marcas'), m);
export const getRevisiones = () => get(pk('revisiones')) as Promise<Revision[]>;
export const setRevisiones = (r: Revision[]) => set(pk('revisiones'), r);

// Sustituye todo lo de la cuadrícula activa por una copia importada.
export async function importar(b: BackupV1): Promise<void> {
  activa = b.config.cuadriculaActivaId;
  await set('config', b.config);
  await set(pk('cuadricula'), b.cuadricula);
  await set(pk('marcas'), b.marcas);
  await set(pk('revisiones'), b.revisiones);
}

// Conserva la cuadrícula y borra lo hecho: tareas, marcas y revisiones.
export async function borrarProgreso(): Promise<void> {
  await set(pk('cuadricula'), sinProgreso(await getCuadricula()));
  await set(pk('marcas'), {});
  await set(pk('revisiones'), []);
}

// Vuelve a una cuadrícula vacía, sin nada de lo anterior.
export async function empezarDeCero(): Promise<void> {
  activa = ID_PLANTILLA;
  await set(pk('cuadricula'), crearPlantilla(hoyISO()));
  await set(pk('marcas'), {});
  await set(pk('revisiones'), []);
  await set('config', { ...(await getConfig()), cuadriculaActivaId: ID_PLANTILLA, ultimoExportISO: null });
}
