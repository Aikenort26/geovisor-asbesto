import area from '@turf/area';
import length from '@turf/length';
import type { Map as MapaML, MapMouseEvent, GeoJSONSource } from 'maplibre-gl';

type Coord = [number, number];
export type ModoMedicion = 'linea' | 'area';

/** Texto de la medida: metros/km para distancias, m²/ha/km² para áreas. */
export function medir(coords: Coord[], modo: ModoMedicion): string {
  const es = (v: number, d: number) => v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (modo === 'linea') {
    if (coords.length < 2) return '';
    const km = length({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }, { units: 'kilometers' });
    return km < 1 ? `${es(Math.round(km * 1000), 0)} m` : `${es(km, 2)} km`;
  }
  if (coords.length < 3) return '';
  const m2 = area({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...coords, coords[0]]] } });
  if (m2 < 100000) return `${es(Math.round(m2 / 10) * 10, 0)} m²`;
  if (m2 < 1e6) return `${es(m2 / 1e4, 2)} ha`;
  return `${es(m2 / 1e6, 2)} km²`;
}

/** Herramienta de medición: clics agregan vértices, doble clic o Esc termina. */
export function crearMedicion(mapa: MapaML, salida: (texto: string) => void) {
  let modo: ModoMedicion | null = null;
  let puntos: Coord[] = [];
  const vacio = { type: 'FeatureCollection' as const, features: [] };

  mapa.addSource('medicion', { type: 'geojson', data: vacio });
  mapa.addLayer({ id: 'medicion-relleno', type: 'fill', source: 'medicion', filter: ['==', '$type', 'Polygon'],
    paint: { 'fill-color': '#2f5877', 'fill-opacity': 0.15 } });
  mapa.addLayer({ id: 'medicion-linea', type: 'line', source: 'medicion',
    paint: { 'line-color': '#14283a', 'line-width': 2, 'line-dasharray': [2, 1.5] } });
  mapa.addLayer({ id: 'medicion-vertices', type: 'circle', source: 'medicion', filter: ['==', '$type', 'Point'],
    paint: { 'circle-radius': 4, 'circle-color': '#ffffff', 'circle-stroke-color': '#14283a', 'circle-stroke-width': 2 } });

  const dibujar = () => {
    const features: GeoJSON.Feature[] = puntos.map((p) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: p } }));
    if (modo === 'area' && puntos.length >= 3)
      features.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...puntos, puntos[0]]] } });
    else if (puntos.length >= 2)
      features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: puntos } });
    (mapa.getSource('medicion') as GeoJSONSource).setData({ type: 'FeatureCollection', features });
    salida(modo ? medir(puntos, modo) || (modo === 'linea' ? 'Haga clic para marcar puntos' : 'Marque al menos tres puntos') : '');
  };
  const alClic = (e: MapMouseEvent) => {
    puntos.push([e.lngLat.lng, e.lngLat.lat]);
    dibujar();
  };
  const alTecla = (e: KeyboardEvent) => {
    if (e.key === 'Escape') detener();
  };
  function iniciar(m: ModoMedicion) {
    detener();
    modo = m;
    puntos = [];
    mapa.getCanvas().style.cursor = 'crosshair';
    mapa.doubleClickZoom.disable();
    mapa.on('click', alClic);
    window.addEventListener('keydown', alTecla);
    dibujar();
  }
  function detener() {
    modo = null;
    puntos = [];
    mapa.getCanvas().style.cursor = '';
    mapa.doubleClickZoom.enable();
    mapa.off('click', alClic);
    window.removeEventListener('keydown', alTecla);
    dibujar();
  }
  return { iniciar, detener, activo: () => modo !== null };
}
