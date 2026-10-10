import { buscarBarrio } from '../src/ui/busqueda';
import { resumenBarrio, esPositiva } from '../src/ui/panel-barrio';
import { medir } from '../src/ui/medicion';

const NOMBRES = ['CRESPO', 'OLAYA ST. CENTRAL', 'EL BOSQUE', 'MANGA', 'BOCAGRANDE', 'NUEVO BOSQUE'];

test('búsqueda sin tildes ni mayúsculas, máximo 8', () => {
  expect(buscarBarrio('olaya', NOMBRES)).toEqual(['OLAYA ST. CENTRAL']);
  expect(buscarBarrio('bósque', NOMBRES)).toEqual(['EL BOSQUE', 'NUEVO BOSQUE']);
  expect(buscarBarrio('  ', NOMBRES)).toEqual([]);
  expect(buscarBarrio('a', Array.from({ length: 20 }, (_, i) => `A${i}`)).length).toBe(8);
});

test('una muestra es positiva si detecta algún tipo de asbesto', () => {
  expect(esPositiva('Chrysotile')).toBe(true);
  expect(esPositiva('None Detected')).toBe(false);
  expect(esPositiva('NAO')).toBe(false);
  expect(esPositiva('')).toBe(false);
  expect(esPositiva(undefined)).toBe(false);
});

const cuadrado = {
  type: 'Feature' as const,
  properties: { NOMBRE: 'CRESPO', PERSONAS: 100, VIVIENDAS: 30, SUM_SUM_km: 1.5, Densidad_k: 7.2, nbi_pobrez: 10 },
  geometry: { type: 'Polygon' as const, coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
};
const punto = (x: number, y: number, a: string) => ({
  type: 'Feature' as const,
  properties: { Asbestos__: a },
  geometry: { type: 'Point' as const, coordinates: [x, y] }
});

test('resumen por barrio cuenta muestras dentro del polígono', () => {
  const r = resumenBarrio(cuadrado, {
    'Polvo superficial': [punto(0.5, 0.5, 'Chrysotile'), punto(0.2, 0.2, 'NAO'), punto(5, 5, 'Chrysotile')]
  });
  expect(r.personas).toBe(100);
  expect(r.kmTuberia).toBe(1.5);
  expect(r.muestras['Polvo superficial']).toEqual({ total: 2, positivas: 1 });
});

test('medición de distancia y área', () => {
  const lado = 100 / 111319.49;
  const texto = medir([[0, 0], [0, lado], [lado, lado], [lado, 0]], 'area');
  expect(texto).toMatch(/^\d{1,2}\.\d{3} m²$/);
  expect(Math.abs(Number(texto.replace(/\D/g, '')) - 10000)).toBeLessThan(100);
  expect(medir([[0, 0], [0, lado * 5], [lado * 5, lado * 5], [lado * 5, 0]], 'area')).toMatch(/^\d+,\d{2} ha$/);
  expect(medir([[0, 0], [0, 2000 / 111194.93]], 'linea')).toBe('2,00 km');
  expect(medir([[0, 0], [0, 150 / 111194.93]], 'linea')).toBe('150 m');
  expect(medir([[0, 0]], 'linea')).toBe('');
});
