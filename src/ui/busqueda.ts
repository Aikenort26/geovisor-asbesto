export function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Coincidencias locales de barrio, sin tildes ni mayúsculas. */
export function buscarBarrio(q: string, nombres: string[], max = 8): string[] {
  const n = normalizar(q);
  if (!n) return [];
  return nombres.filter((x) => normalizar(x).includes(n)).slice(0, max);
}

export interface ResultadoLugar {
  nombre: string;
  tipo: 'barrio' | 'lugar';
  centro?: [number, number];
}

const VIEWBOX = '-75.60,10.50,-75.40,10.28';
let ultimaConsulta = 0;

/** Nominatim con límite de 1 consulta por segundo y caja de Cartagena. */
export async function buscarLugar(q: string, senal?: AbortSignal): Promise<ResultadoLugar[]> {
  const espera = 1000 - (Date.now() - ultimaConsulta);
  if (espera > 0) await new Promise((r) => setTimeout(r, espera));
  ultimaConsulta = Date.now();
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&bounded=1&viewbox=${VIEWBOX}` +
    `&accept-language=es&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { signal: senal, headers: { Accept: 'application/json' } });
  if (!r.ok) return [];
  const datos = (await r.json()) as { display_name: string; lon: string; lat: string }[];
  return datos.map((d) => ({
    nombre: d.display_name.split(',').slice(0, 3).join(','),
    tipo: 'lugar' as const,
    centro: [Number(d.lon), Number(d.lat)] as [number, number]
  }));
}

interface OpcionesBuscador {
  nombresBarrios: () => string[];
  alElegirBarrio: (nombre: string) => void;
  alElegirLugar: (centro: [number, number], nombre: string) => void;
}

/** Caja de búsqueda con lista desplegable accesible (combobox). */
export function montarBuscador(raiz: HTMLElement, op: OpcionesBuscador) {
  raiz.innerHTML = `
    <label class="buscador__etiqueta" for="buscador-entrada">Buscar dirección o lugar</label>
    <div class="buscador__caja">
      <svg class="buscador__icono" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4.5 4.5"/></svg>
      <input id="buscador-entrada" type="search" autocomplete="off" placeholder="Buscar dirección o lugar"
        role="combobox" aria-expanded="false" aria-controls="buscador-lista" aria-autocomplete="list">
    </div>
    <ul id="buscador-lista" class="buscador__lista" role="listbox" hidden></ul>`;
  const entrada = raiz.querySelector('input')!;
  const lista = raiz.querySelector('ul')!;
  let resultados: ResultadoLugar[] = [];
  let activo = -1;
  let temporizador: number | undefined;
  let control: AbortController | undefined;

  const pintar = () => {
    lista.innerHTML = resultados
      .map((r, i) => `<li role="option" id="op-${i}" aria-selected="${i === activo}" data-i="${i}">
        <span class="buscador__tipo">${r.tipo === 'barrio' ? 'Barrio' : 'Lugar'}</span>${r.nombre.replace(/</g, '&lt;')}</li>`)
      .join('');
    lista.hidden = resultados.length === 0;
    entrada.setAttribute('aria-expanded', String(!lista.hidden));
    entrada.setAttribute('aria-activedescendant', activo >= 0 ? `op-${activo}` : '');
  };
  const elegir = (i: number) => {
    const r = resultados[i];
    if (!r) return;
    entrada.value = r.tipo === 'barrio' ? r.nombre : r.nombre.split(',')[0];
    resultados = [];
    pintar();
    if (r.tipo === 'barrio') op.alElegirBarrio(r.nombre);
    else if (r.centro) op.alElegirLugar(r.centro, r.nombre);
  };

  entrada.addEventListener('input', () => {
    const q = entrada.value;
    resultados = buscarBarrio(q, op.nombresBarrios()).map((nombre) => ({ nombre, tipo: 'barrio' as const }));
    activo = -1;
    pintar();
    window.clearTimeout(temporizador);
    control?.abort();
    if (resultados.length === 0 && normalizar(q).length >= 4) {
      temporizador = window.setTimeout(async () => {
        control = new AbortController();
        try {
          resultados = await buscarLugar(q, control.signal);
          pintar();
        } catch {
          /* consulta cancelada o sin red */
        }
      }, 600);
    }
  });
  entrada.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') activo = Math.min(resultados.length - 1, activo + 1);
    else if (e.key === 'ArrowUp') activo = Math.max(0, activo - 1);
    else if (e.key === 'Enter') return elegir(activo >= 0 ? activo : 0);
    else if (e.key === 'Escape') { resultados = []; pintar(); return; }
    else return;
    e.preventDefault();
    pintar();
  });
  lista.addEventListener('mousedown', (e) => {
    const li = (e.target as HTMLElement).closest('li');
    if (li) elegir(Number(li.dataset.i));
  });
  entrada.addEventListener('blur', () => setTimeout(() => { resultados = []; pintar(); }, 150));
}
