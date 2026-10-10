import { RAMPA_CALOR } from '../config/capas';

/**
 * Estilo de mapa de calor para muestras. El peso usa escala logarítmica porque los valores
 * van de 0 a cientos de millones; cada muestra aporta un mínimo para que el muestreo se vea.
 * El radio crece con el zoom y la capa se oculta sobre z16 para no señalar viviendas.
 */
export function estiloCalor(campoPeso: string, maximo: number): Record<string, unknown> {
  const valor = ['max', 0, ['to-number', ['get', campoPeso], 0]];
  const norma = maximo > 0 ? ['/', ['ln', ['+', 1, valor]], Math.log(1 + maximo)] : 0;
  const [c0, c1, c2, c3, c4, c5] = RAMPA_CALOR;
  return {
    'heatmap-weight': ['min', 1, ['+', 0.18, ['*', 0.82, norma]]],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 16, 2.2],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(68,1,84,0)',
      0.12, hexAlfa(c0, 0.55),
      0.3, hexAlfa(c1, 0.7),
      0.5, hexAlfa(c2, 0.8),
      0.7, hexAlfa(c3, 0.85),
      0.85, hexAlfa(c4, 0.9),
      1, hexAlfa(c5, 0.95)
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 10, 13, 18, 16, 40],
    'heatmap-opacity': 0.85
  };
}

export const ZOOM_MAX_CALOR = 16.5;

function hexAlfa(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
