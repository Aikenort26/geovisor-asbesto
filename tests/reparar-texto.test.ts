import { repararTexto } from '../scripts/reparar-texto.mjs';

const roto = (s: string) => Buffer.from(s, 'utf8').toString('latin1');

test('repara latin1→utf8 y respeta texto sano', () => {
  expect(repararTexto(roto('Agua caída de teja'))).toBe('Agua caída de teja');
  expect(repararTexto(roto('Línea'))).toBe('Línea');
  expect(repararTexto('Crespo')).toBe('Crespo');
  expect(repararTexto('Ñuñoa')).toBe('Ñuñoa');
  expect(repararTexto(12)).toBe(12);
});
