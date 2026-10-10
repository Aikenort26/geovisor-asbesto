import { Recorrido } from '../src/ui/recorrido-estado';
import { PARADAS } from '../src/config/recorrido';

test('seis paradas con texto breve', () => {
  expect(PARADAS).toHaveLength(6);
  for (const p of PARADAS) expect(p.texto.split(/\s+/).length).toBeLessThanOrEqual(45);
});

test('no pasa de los límites y restaura las capas al cerrar', () => {
  const r = new Recorrido(PARADAS);
  r.abrir(['barrios']);
  expect(r.activo).toBe(true);
  expect(r.indice).toBe(0);
  r.anterior();
  expect(r.indice).toBe(0);
  for (let i = 0; i < 10; i++) r.siguiente();
  expect(r.indice).toBe(5);
  expect(r.cerrar()).toEqual(['barrios']);
  expect(r.activo).toBe(false);
});
