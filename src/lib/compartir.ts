// Comparte archivos con el menú del sistema (Android → Gmail). Si el navegador no lo
// permite —sin https, o tipos de archivo que Chrome no deja compartir— los descarga.

export type Resultado = 'compartido' | 'descargado' | 'cancelado';

export const puedeCompartir = (archivos: File[]): boolean => !!navigator.canShare?.({ files: archivos });

function descargar(f: File) {
  const url = URL.createObjectURL(f);
  const a = document.createElement('a');
  a.href = url;
  a.download = f.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function compartir(archivos: File[], titulo: string): Promise<Resultado> {
  if (puedeCompartir(archivos)) {
    try {
      await navigator.share({ files: archivos, title: titulo });
      return 'compartido';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelado';
    }
  }
  // Escalonadas: algunos navegadores bloquean varias descargas seguidas.
  for (const [i, f] of archivos.entries()) setTimeout(() => descargar(f), i * 400);
  return 'descargado';
}
