import type { Map as MapaML, LayerSpecification } from 'maplibre-gl';
import { COLORES_DENSIDAD, CORTES_DENSIDAD, type Capa } from '../config/capas';
import { estiloCalor, ZOOM_MAX_CALOR } from './calor';

const VACIO_POSITIVO = ['None Detected', 'NAO', ''];

/** Ids de capas MapLibre que dibujan una capa del catálogo. */
export function idsMapa(c: Capa): string[] {
  switch (c.tipo) {
    case 'coropleta':
      return [`${c.id}-relleno`, `${c.id}-borde`];
    case 'puntos':
      return [`${c.id}-circulo`];
    default:
      return [c.id];
  }
}

/** Propiedad de pintura que controla la opacidad según el tipo de capa MapLibre. */
export function propiedadOpacidad(tipoMapa: string): string[] {
  switch (tipoMapa) {
    case 'fill': return ['fill-opacity'];
    case 'line': return ['line-opacity'];
    case 'circle': return ['circle-opacity', 'circle-stroke-opacity'];
    case 'heatmap': return ['heatmap-opacity'];
    case 'raster': return ['raster-opacity'];
    default: return [];
  }
}

/** Opacidad de referencia de cada capa MapLibre (la del estilo), escalada por el deslizador. */
export const OPACIDAD_BASE: Record<string, number> = {};

function fuenteDe(c: Capa): string {
  return c.madre ?? c.id;
}

function urlAbsoluta(ruta: string): string {
  return new URL(ruta, globalThis.location?.href ?? 'http://localhost/').href;
}

function definiciones(c: Capa): LayerSpecification[] {
  const fuente = fuenteDe(c);
  const vis = c.visible ? 'visible' : 'none';
  switch (c.tipo) {
    case 'contorno':
      return [{ id: c.id, type: 'line', source: fuente, layout: { visibility: vis },
        paint: { 'line-color': c.color, 'line-width': 1.6, 'line-dasharray': [3, 2], 'line-opacity': 0.8 } }];
    case 'coropleta': {
      const pasos: unknown[] = ['step', ['to-number', ['get', 'Densidad_k'], 0], COLORES_DENSIDAD[0]];
      CORTES_DENSIDAD.slice(1).forEach((corte, i) => pasos.push(corte, COLORES_DENSIDAD[i + 1]));
      return [
        { id: `${c.id}-relleno`, type: 'fill', source: fuente, layout: { visibility: vis },
          paint: { 'fill-color': pasos as never, 'fill-opacity': 0.55 } },
        { id: `${c.id}-borde`, type: 'line', source: fuente, layout: { visibility: vis },
          paint: { 'line-color': ['case', ['boolean', ['feature-state', 'seleccion'], false], '#14283a', '#ffffff'],
            'line-width': ['case', ['boolean', ['feature-state', 'seleccion'], false], 2.6, 0.8], 'line-opacity': 0.9 } }
      ];
    }
    case 'linea':
      return [{ id: c.id, type: 'line', source: fuente, layout: { visibility: vis, 'line-cap': 'round' },
        paint: { 'line-color': c.color, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 16, 3], 'line-opacity': 0.85 } }];
    case 'calor':
      return [{ id: c.id, type: 'heatmap', source: fuente, maxzoom: ZOOM_MAX_CALOR, layout: { visibility: vis },
        paint: estiloCalor(c.campoPeso ?? '', c.maximo ?? 0) as never }];
    case 'puntos':
      return [{ id: `${c.id}-circulo`, type: 'circle', source: fuente, layout: { visibility: vis },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3, 16, 7],
          'circle-color': ['match', ['coalesce', ['get', 'Asbestos__'], ''], VACIO_POSITIVO, '#8499ab', c.color],
          'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.2,
          'circle-opacity': 0.95, 'circle-stroke-opacity': 0.95
        } }];
    case 'raster-pmtiles':
      return [{ id: c.id, type: 'raster', source: fuente, layout: { visibility: vis },
        paint: { 'raster-opacity': 0.85, 'raster-resampling': 'nearest', 'raster-fade-duration': 300 } }];
    default:
      return [];
  }
}

/**
 * Agrega fuentes y capas al mapa. Una capa ráster cuyo archivo no responde queda en `faltantes`
 * y el visor sigue funcionando; la lista de capas la muestra como "no disponible".
 */
export async function agregarCapas(mapa: MapaML, capas: Capa[], antesDe?: string) {
  const disponibles: string[] = [];
  const faltantes: string[] = [];
  for (const c of capas) {
    const fuente = fuenteDe(c);
    if (!mapa.getSource(fuente)) {
      if (c.tipo === 'raster-pmtiles') {
        const ok = await existe(c.url);
        if (!ok) {
          faltantes.push(c.id);
          continue;
        }
        mapa.addSource(fuente, { type: 'raster', url: `pmtiles://${urlAbsoluta(c.url)}`, tileSize: 256 });
      } else {
        mapa.addSource(fuente, { type: 'geojson', data: c.url, generateId: true });
      }
    }
    for (const def of definiciones(c)) {
      for (const p of propiedadOpacidad(def.type)) {
        const v = (def as { paint?: Record<string, unknown> }).paint?.[p];
        OPACIDAD_BASE[`${def.id}|${p}`] = typeof v === 'number' ? v : 1;
      }
      mapa.addLayer(def, antesDe && mapa.getLayer(antesDe) ? antesDe : undefined);
    }
    disponibles.push(c.id);
  }
  return { disponibles, faltantes };
}

/** Comprueba que el archivo exista y sea una PMTiles (un servidor SPA puede responder 200 con HTML). */
async function existe(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { headers: { Range: 'bytes=0-6' } });
    if (!r.ok) return false;
    const bytes = new Uint8Array(await r.arrayBuffer()).slice(0, 7);
    return new TextDecoder().decode(bytes) === 'PMTiles';
  } catch {
    return false;
  }
}
