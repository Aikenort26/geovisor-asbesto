import type { IControl, Map as MapaML } from 'maplibre-gl';

const SVG = {
  inicio: '<svg viewBox="0 0 20 20"><path d="M3.5 9.5L10 4l6.5 5.5M5.5 8v7.5h9V8"/></svg>',
  linea: '<svg viewBox="0 0 20 20"><path d="M3 15L15 3M5 13l1.5 1.5M8 10l1.5 1.5M11 7l1.5 1.5"/></svg>',
  area: '<svg viewBox="0 0 20 20"><path d="M4 6l7-2.5 5 6-4 7-8-3z"/></svg>'
};

function boton(titulo: string, svg: string, alClic: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'control-icono';
  b.title = titulo;
  b.setAttribute('aria-label', titulo);
  b.innerHTML = svg;
  b.addEventListener('click', alClic);
  return b;
}

function grupo(...hijos: HTMLElement[]): HTMLDivElement {
  const g = document.createElement('div');
  g.className = 'maplibregl-ctrl maplibregl-ctrl-group';
  g.append(...hijos);
  return g;
}

/** Botón "Vista inicial" (SVG en lugar del carácter ⌂ del prototipo). */
export class ControlInicio implements IControl {
  constructor(private irAlInicio: () => void) {}
  onAdd() {
    return grupo(boton('Vista inicial', SVG.inicio, this.irAlInicio));
  }
  onRemove() {}
}

/** Medición de distancia y área. */
export class ControlMedicion implements IControl {
  private botones: HTMLButtonElement[] = [];
  constructor(private iniciar: (modo: 'linea' | 'area') => void, private detener: () => void) {}
  onAdd() {
    const alternar = (modo: 'linea' | 'area', b: () => HTMLButtonElement) => () => {
      const activo = b().getAttribute('aria-pressed') === 'true';
      this.botones.forEach((x) => x.setAttribute('aria-pressed', 'false'));
      if (activo) this.detener();
      else {
        b().setAttribute('aria-pressed', 'true');
        this.iniciar(modo);
      }
    };
    const linea: HTMLButtonElement = boton('Medir distancia', SVG.linea, alternar('linea', () => linea));
    const area: HTMLButtonElement = boton('Medir área', SVG.area, alternar('area', () => area));
    this.botones = [linea, area];
    this.botones.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    return grupo(linea, area);
  }
  reiniciar() {
    this.botones.forEach((x) => x.setAttribute('aria-pressed', 'false'));
  }
  onRemove() {}
}

export type MapaBase = 'claro' | 'calles' | 'satelite';

/** Selector segmentado de mapa base. */
export class ControlMapaBase implements IControl {
  constructor(private alCambiar: (b: MapaBase) => void, private inicial: MapaBase = 'claro') {}
  onAdd() {
    const g = grupo();
    g.classList.add('mapas-base');
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', 'Mapa base');
    const opciones: [MapaBase, string][] = [['claro', 'Claro'], ['calles', 'Calles'], ['satelite', 'Satélite']];
    for (const [id, texto] of opciones) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = texto;
      b.setAttribute('aria-pressed', String(id === this.inicial));
      b.addEventListener('click', () => {
        g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        this.alCambiar(id);
      });
      g.append(b);
    }
    return g;
  }
  onRemove() {}
}

/** Fuentes ráster para los mapas base alternativos (sin clave de API). */
export function agregarMapasBase(mapa: MapaML) {
  const primera = mapa.getStyle().layers[0]?.id;
  const antes = mapa.getStyle().layers[1]?.id ?? primera;
  mapa.addSource('base-calles', {
    type: 'raster', tileSize: 256, maxzoom: 19,
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  mapa.addSource('base-satelite', {
    type: 'raster', tileSize: 256, maxzoom: 19,
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: 'Imágenes © Esri, Maxar, Earthstar Geographics'
  });
  mapa.addLayer({ id: 'base-calles', type: 'raster', source: 'base-calles', layout: { visibility: 'none' } }, antes);
  mapa.addLayer({ id: 'base-satelite', type: 'raster', source: 'base-satelite', layout: { visibility: 'none' } }, antes);
}

/** Muestra el mapa base elegido. Las capas del estilo vectorial se ocultan bajo los ráster. */
export function cambiarMapaBase(mapa: MapaML, base: MapaBase, capasEstilo: string[]) {
  if (!mapa.getLayer('base-calles') || !mapa.getLayer('base-satelite')) return;
  mapa.setLayoutProperty('base-calles', 'visibility', base === 'calles' ? 'visible' : 'none');
  mapa.setLayoutProperty('base-satelite', 'visibility', base === 'satelite' ? 'visible' : 'none');
  for (const id of capasEstilo) {
    const tipo = mapa.getLayer(id)?.type;
    if (tipo === 'background') continue;
    mapa.setLayoutProperty(id, 'visibility', base === 'claro' ? 'visible' : 'none');
  }
}
