import { escapar } from './popup';
import { formatoNumero } from './contador';

type Posicion = number[];
interface Rasgo {
  type: 'Feature';
  properties: Record<string, unknown> | null;
  geometry: { type: string; coordinates: unknown } | null;
}

export function esPositiva(resultado: unknown): boolean {
  const s = typeof resultado === 'string' ? resultado.trim() : '';
  return s !== '' && s !== 'None Detected' && s !== 'NAO';
}

function dentroAnillo([x, y]: Posicion, anillo: Posicion[]): boolean {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

export function puntoEnPoligono(p: Posicion, geom: Rasgo['geometry']): boolean {
  if (!geom) return false;
  const poligonos = (geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : []) as Posicion[][][];
  return poligonos.some(([exterior, ...huecos]) => dentroAnillo(p, exterior) && !huecos.some((h) => dentroAnillo(p, h)));
}

export interface Resumen {
  nombre: string;
  personas: number;
  viviendas: number;
  kmTuberia: number;
  densidad: number;
  nbiPobreza: number;
  muestras: Record<string, { total: number; positivas: number }>;
}

export function resumenBarrio(barrio: Rasgo, muestrasPorTipo: Record<string, Rasgo[]>): Resumen {
  const p = barrio.properties ?? {};
  const num = (k: string) => (typeof p[k] === 'number' ? (p[k] as number) : 0);
  const muestras: Resumen['muestras'] = {};
  for (const [tipo, lista] of Object.entries(muestrasPorTipo)) {
    const dentro = lista.filter((m) => m.geometry?.type === 'Point' && puntoEnPoligono(m.geometry.coordinates as Posicion, barrio.geometry));
    if (dentro.length) muestras[tipo] = { total: dentro.length, positivas: dentro.filter((m) => esPositiva(m.properties?.Asbestos__)).length };
  }
  return {
    nombre: String(p.NOMBRE ?? ''),
    personas: num('PERSONAS'),
    viviendas: num('VIVIENDAS'),
    kmTuberia: num('SUM_SUM_km'),
    densidad: num('Densidad_k'),
    nbiPobreza: num('nbi_pobrez'),
    muestras
  };
}

/** Panel inferior con indicadores del barrio seleccionado. */
export function pintarPanelBarrio(raiz: HTMLElement, r: Resumen, alCerrar: () => void) {
  const tarjetas = [
    ['Población', formatoNumero(r.personas, 0), 'hab.'],
    ['Viviendas', formatoNumero(r.viviendas, 0), ''],
    ['Tubería AC', formatoNumero(r.kmTuberia, 2), 'km'],
    ['Densidad de tubería', formatoNumero(r.densidad, 1), 'km/km²'],
    ['NBI pobreza', formatoNumero(r.nbiPobreza, 1), '%']
  ];
  const filasMuestras = Object.entries(r.muestras)
    .map(([tipo, m]) => `<li><span>${escapar(tipo)}</span><span class="barra" style="--p:${m.total ? m.positivas / m.total : 0}"></span>
      <strong>${m.positivas}</strong>/<span>${m.total}</span></li>`)
    .join('');
  raiz.innerHTML = `
    <div class="panel-barrio__cabeza">
      <div><span class="panel-barrio__rotulo">Barrio</span><h2>${escapar(r.nombre)}</h2></div>
      <button class="boton-icono" type="button" aria-label="Cerrar panel del barrio">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>
    </div>
    <div class="panel-barrio__tarjetas">${tarjetas
      .map(([t, v, u]) => `<div class="tarjeta"><span class="tarjeta__rotulo">${t}</span><span class="tarjeta__valor">${v}<small>${u}</small></span></div>`)
      .join('')}</div>
    ${filasMuestras
      ? `<h3 class="panel-barrio__sub">Muestras con asbesto detectado / analizadas</h3><ul class="panel-barrio__muestras">${filasMuestras}</ul>`
      : '<p class="panel-barrio__nota">Sin muestras ambientales dentro de este barrio.</p>'}`;
  raiz.hidden = false;
  requestAnimationFrame(() => raiz.classList.add('abierto'));
  raiz.querySelector('button')!.addEventListener('click', alCerrar);
}
