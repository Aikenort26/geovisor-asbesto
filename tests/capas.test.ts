import { CAPAS } from '../src/config/capas';
import { capasPublicas } from '../src/config/privacidad';
import { estiloCalor } from '../src/mapa/calor';
import { agregarCapas, idsMapa } from '../src/mapa/fuentes';

function mapaFalso() {
  const capas: string[] = [];
  return {
    capas,
    addSource: vi.fn(),
    getSource: vi.fn(() => undefined),
    addLayer: vi.fn((l: { id: string }) => capas.push(l.id)),
    getLayer: vi.fn((id: string) => (capas.includes(id) ? { id } : undefined)),
    on: vi.fn()
  };
}

test('cada capa de muestras genera calor visible y puntos apagados', () => {
  const pub = capasPublicas(true);
  expect(pub.find((c) => c.id === 'mcv-calor')?.visible).toBe(true);
  expect(pub.find((c) => c.id === 'mcv-puntos')?.visible).toBe(false);
  expect(pub.some((c) => c.tipo === 'muestras')).toBe(false);
});

test('PUBLICAR_PUNTOS=false elimina toda capa de puntos', () => {
  expect(capasPublicas(false).some((c) => c.id.endsWith('-puntos'))).toBe(false);
  expect(capasPublicas(false).some((c) => c.id.endsWith('-calor'))).toBe(true);
});

test('ids de capa son únicos', () => {
  const ids = capasPublicas(true).map((c) => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(CAPAS.length).toBeGreaterThan(8);
});

test('el calor no se vuelve puntual en zoom alto', () => {
  const p = estiloCalor('Strucutres', 1240000);
  expect((p['heatmap-radius'] as unknown[]).slice(-2)).toEqual([16, 40]);
});

test('el peso del calor usa escala logarítmica', () => {
  const p = estiloCalor('Strucutres', 326400000);
  expect(JSON.stringify(p['heatmap-weight'])).toContain('ln');
});

test('capa PMTiles ausente queda en faltantes sin lanzar', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
  const mapa = mapaFalso();
  const cub = CAPAS.find((c) => c.id === 'cubiertas')!;
  const r = await agregarCapas(mapa as never, [cub]);
  expect(r.faltantes).toEqual(['cubiertas']);
  expect(mapa.addLayer).not.toHaveBeenCalled();
});

test('capa GeoJSON se agrega con sus ids de mapa', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;
  const mapa = mapaFalso();
  const barrios = capasPublicas(true).find((c) => c.id === 'barrios')!;
  const r = await agregarCapas(mapa as never, [barrios]);
  expect(r.disponibles).toEqual(['barrios']);
  expect(mapa.capas).toEqual(idsMapa(barrios));
});

test('una respuesta HTML (fallback SPA) no cuenta como PMTiles', async () => {
  const html = new TextEncoder().encode('<!DOCTYPE html>').buffer;
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, arrayBuffer: async () => html }) as unknown as typeof fetch;
  const r = await agregarCapas(mapaFalso() as never, [CAPAS.find((c) => c.id === 'cubiertas')!]);
  expect(r.faltantes).toEqual(['cubiertas']);
});

test('un archivo PMTiles real se agrega', async () => {
  const pm = new TextEncoder().encode('PMTiles').buffer;
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 206, arrayBuffer: async () => pm }) as unknown as typeof fetch;
  const r = await agregarCapas(mapaFalso() as never, [CAPAS.find((c) => c.id === 'cubiertas')!]);
  expect(r.disponibles).toEqual(['cubiertas']);
});
