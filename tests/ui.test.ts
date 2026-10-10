import { montarPestanas } from '../src/ui/pestanas';
import { montarListaCapas } from '../src/ui/lista-capas';
import { montarLeyenda } from '../src/ui/leyenda';
import { capasPublicas } from '../src/config/privacidad';

function htmlPestanas() {
  document.body.innerHTML = `
    <div role="tablist">
      <button class="pestana" role="tab" data-seccion="capas">Capas de información</button>
      <button class="pestana" role="tab" data-seccion="leyenda">Leyenda</button>
    </div>
    <section id="seccion-capas"></section><section id="seccion-leyenda" hidden></section>`;
}

test('pestañas accesibles con flechas', () => {
  htmlPestanas();
  montarPestanas(document.body);
  const [a, b] = Array.from(document.querySelectorAll<HTMLButtonElement>('.pestana'));
  expect(a.getAttribute('aria-controls')).toBe('seccion-capas');
  expect(a.getAttribute('aria-selected')).toBe('true');
  a.focus();
  a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  expect(b.getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(b);
  expect((document.getElementById('seccion-capas') as HTMLElement).hidden).toBe(true);
});

function mapaFalso() {
  return { setLayoutProperty: vi.fn(), setPaintProperty: vi.fn(), getLayer: vi.fn(() => ({ type: 'fill' })) };
}

test('lista agrupada, faltantes deshabilitadas, casilla y opacidad', () => {
  document.body.innerHTML = '<div id="l"></div>';
  const capas = capasPublicas(true);
  const mapa = mapaFalso();
  const cambios: string[][] = [];
  montarListaCapas(document.getElementById('l')!, mapa as never, capas, ['cubiertas'], (v) => cambios.push(v));
  const grupos = Array.from(document.querySelectorAll('.grupo-capas__titulo')).map((g) => g.textContent);
  expect(grupos).toContain('Muestreo ambiental');
  const cub = document.querySelector<HTMLInputElement>('input[data-capa="cubiertas"]')!;
  expect(cub.disabled).toBe(true);
  expect(cub.closest('.capa')!.textContent).toContain('no disponible');
  const barrios = document.querySelector<HTMLInputElement>('input[data-capa="barrios"]')!;
  barrios.click();
  expect(cambios.at(-1)).not.toContain('barrios');
  const rango = document.querySelector<HTMLInputElement>('input[data-opacidad="barrios"]')!;
  rango.value = '50';
  rango.dispatchEvent(new Event('input'));
  expect(mapa.setPaintProperty).toHaveBeenCalled();
});

test('la leyenda muestra solo las capas activas en orden', () => {
  document.body.innerHTML = '<div id="ley"></div>';
  const capas = capasPublicas(true);
  const actualizar = montarLeyenda(document.getElementById('ley')!, capas);
  actualizar(['mcv-calor', 'barrios']);
  const titulos = Array.from(document.querySelectorAll('.leyenda__titulo')).map((t) => t.textContent ?? '');
  expect(titulos).toHaveLength(2);
  expect(titulos.indexOf('Densidad de tubería AC por barrio')).toBeLessThan(
    titulos.findIndex((t) => t.startsWith('Polvo superficial'))
  );
});
