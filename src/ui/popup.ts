const TRADUCCIONES: Record<string, string> = {
  'None Detected': 'No detectado',
  NAO: 'No detectado (NAO)',
  Chrysotile: 'Crisotilo',
  Crocidolite: 'Crocidolita',
  Amosite: 'Amosita',
  Anthophyllite: 'Antofilita',
  All: 'Varios tipos'
};

export function escapar(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function formatear(v: unknown, unidad?: string): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') {
    const decimales = Number.isInteger(v) ? 0 : Math.abs(v) < 10 ? 2 : 1;
    const n = v.toLocaleString('es-CO', { maximumFractionDigits: decimales });
    return unidad ? `${n} ${unidad}` : n;
  }
  const s = String(v).trim();
  if (!s) return null;
  return escapar(TRADUCCIONES[s] ?? s);
}

/** HTML de la ventana emergente. `campos` define orden y etiquetas ("Etiqueta|unidad"). */
export function htmlPopup(props: Record<string, unknown>, campos: Record<string, string>, titulo?: string): string {
  const filas = Object.entries(campos)
    .map(([campo, etiqueta]) => {
      const [nombre, unidad] = etiqueta.split('|');
      const valor = formatear(props[campo], unidad);
      return valor === null ? '' : `<tr><th>${escapar(nombre)}</th><td>${valor}</td></tr>`;
    })
    .join('');
  const cabecera = titulo ? `<h3 class="popup__titulo">${escapar(titulo)}</h3>` : '';
  return `<div class="popup">${cabecera}<table class="popup__tabla">${filas}</table></div>`;
}
