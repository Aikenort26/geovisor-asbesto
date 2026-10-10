import type { Map as MapaML } from 'maplibre-gl';
import { GRUPOS, type Capa } from '../config/capas';
import { idsMapa, OPACIDAD_BASE, propiedadOpacidad } from '../mapa/fuentes';
import { duracion } from './movimiento';
import { escapar } from './popup';

type MapaMin = Pick<MapaML, 'setLayoutProperty' | 'setPaintProperty' | 'getLayer'>;

const opacidadUsuario: Record<string, number> = {};

function aplicarOpacidad(mapa: MapaMin, c: Capa, factor: number) {
  for (const id of idsMapa(c)) {
    const capa = mapa.getLayer(id);
    if (!capa) continue;
    for (const p of propiedadOpacidad(capa.type)) {
      mapa.setPaintProperty(id, p as never, (OPACIDAD_BASE[`${id}|${p}`] ?? 1) * factor);
    }
  }
}

/** Enciende o apaga una capa con fundido (la opacidad baja antes de ocultarla). */
export function cambiarVisibilidad(mapa: MapaMin, c: Capa, visible: boolean) {
  const ms = duracion(300);
  const factor = opacidadUsuario[c.id] ?? 1;
  if (visible) {
    aplicarOpacidad(mapa, c, 0);
    for (const id of idsMapa(c)) if (mapa.getLayer(id)) mapa.setLayoutProperty(id, 'visibility', 'visible');
    requestAnimationFrame(() => aplicarOpacidad(mapa, c, factor));
  } else {
    aplicarOpacidad(mapa, c, 0);
    setTimeout(() => {
      for (const id of idsMapa(c)) if (mapa.getLayer(id)) mapa.setLayoutProperty(id, 'visibility', 'none');
    }, ms);
  }
}

/**
 * Lista "Capas de información": grupos, casilla, opacidad y descripción.
 * `alCambiar` recibe los ids visibles en el orden del catálogo.
 */
export function montarListaCapas(
  raiz: HTMLElement,
  mapa: MapaMin,
  capas: Capa[],
  faltantes: string[],
  alCambiar: (visibles: string[]) => void
) {
  const visibles = new Set(capas.filter((c) => c.visible && !faltantes.includes(c.id)).map((c) => c.id));
  const emitir = () => alCambiar(capas.filter((c) => visibles.has(c.id)).map((c) => c.id));

  raiz.innerHTML = GRUPOS.map((g) => {
    const delGrupo = capas.filter((c) => c.grupo === g);
    if (!delGrupo.length) return '';
    return `<section class="grupo-capas"><h3 class="grupo-capas__titulo">${g}</h3><ul>${delGrupo
      .map((c) => {
        const falta = faltantes.includes(c.id);
        const marca = c.tipo === 'calor' ? 'calor' : c.tipo === 'puntos' ? 'punto' : c.tipo === 'linea' || c.tipo === 'contorno' ? 'linea' : 'area';
        return `<li class="capa${falta ? ' capa--falta' : ''}" data-capa="${c.id}">
          <label class="capa__fila">
            <input type="checkbox" data-capa="${c.id}" ${visibles.has(c.id) ? 'checked' : ''} ${falta ? 'disabled' : ''}>
            <span class="capa__marca capa__marca--${marca}" style="--color:${c.color}" aria-hidden="true"></span>
            <span class="capa__titulo">${escapar(c.titulo)}${falta ? ' <em>(no disponible)</em>' : ''}</span>
          </label>
          <div class="capa__detalle"><div class="capa__detalle-int">
            <p>${escapar(c.descripcion)}</p>
            <label class="capa__opacidad">Opacidad
              <input type="range" min="0" max="100" value="100" data-opacidad="${c.id}" ${falta ? 'disabled' : ''}
                aria-label="Opacidad de ${escapar(c.titulo)}"></label>
          </div></div>
        </li>`;
      })
      .join('')}</ul></section>`;
  }).join('');

  raiz.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    const id = input.dataset.capa;
    if (!id || input.type !== 'checkbox') return;
    const c = capas.find((x) => x.id === id)!;
    if (input.checked) visibles.add(id);
    else visibles.delete(id);
    input.closest('.capa')?.classList.toggle('capa--activa', input.checked);
    cambiarVisibilidad(mapa, c, input.checked);
    emitir();
  });
  raiz.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    const id = input.dataset.opacidad;
    if (!id) return;
    const c = capas.find((x) => x.id === id)!;
    opacidadUsuario[id] = Number(input.value) / 100;
    if (visibles.has(id)) aplicarOpacidad(mapa, c, opacidadUsuario[id]);
  });
  raiz.querySelectorAll('.capa').forEach((li) => {
    const id = (li as HTMLElement).dataset.capa!;
    li.classList.toggle('capa--activa', visibles.has(id));
  });

  /** Fija desde fuera (recorrido, enlace compartido) el conjunto de capas visibles. */
  function establecer(ids: string[]) {
    for (const c of capas) {
      if (faltantes.includes(c.id)) continue;
      const debe = ids.includes(c.id);
      if (debe === visibles.has(c.id)) continue;
      if (debe) visibles.add(c.id);
      else visibles.delete(c.id);
      const casilla = raiz.querySelector<HTMLInputElement>(`input[type=checkbox][data-capa="${c.id}"]`);
      if (casilla) casilla.checked = debe;
      raiz.querySelector(`.capa[data-capa="${c.id}"]`)?.classList.toggle('capa--activa', debe);
      cambiarVisibilidad(mapa, c, debe);
    }
    emitir();
  }

  emitir();
  return { establecer, visibles: () => capas.filter((c) => visibles.has(c.id)).map((c) => c.id) };
}
