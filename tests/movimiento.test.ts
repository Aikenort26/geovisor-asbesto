import { duracion } from '../src/ui/movimiento';
import { formatoNumero, valorEnTiempo } from '../src/ui/contador';

function preferirReducido(reducido: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reducido }) as never;
}

test('sin preferencia, conserva la duración', () => {
  preferirReducido(false);
  expect(duracion(600)).toBe(600);
});

test('con prefers-reduced-motion la duración es 0', () => {
  preferirReducido(true);
  expect(duracion(600)).toBe(0);
});

test('el contador termina exactamente en el valor final', () => {
  expect(valorEnTiempo(255.1, 900, 900)).toBe(255.1);
  expect(valorEnTiempo(255.1, 1200, 900)).toBe(255.1);
  expect(valorEnTiempo(255.1, 0, 900)).toBe(0);
  expect(valorEnTiempo(100, 450, 900)).toBeGreaterThan(50);
  expect(formatoNumero(255.1, 1)).toBe('255,1');
  expect(formatoNumero(1240000, 0)).toBe('1.240.000');
});
