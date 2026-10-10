import { COLORES_DENSIDAD, CORTES_DENSIDAD, RAMPA_CALOR, type Capa } from '../config/capas';
import { escapar } from './popup';

function cuerpo(c: Capa): string {
  switch (c.tipo) {
    case 'coropleta': {
      const filas = COLORES_DENSIDAD.map((color, i) => {
        const desde = CORTES_DENSIDAD[i].toLocaleString('es-CO');
        const hasta = CORTES_DENSIDAD[i + 1]?.toLocaleString('es-CO');
        return `<li><span class="muestra muestra--area" style="background:${color}"></span>${hasta ? `${desde} – ${hasta}` : `más de ${desde}`}</li>`;
      });
      return `<ul class="leyenda__clases">${filas.join('')}</ul><p class="leyenda__unidad">${c.unidad ?? ''}</p>`;
    }
    case 'calor':
      return `<div class="leyenda__rampa" style="background:linear-gradient(90deg,${RAMPA_CALOR.join(',')})"></div>
        <div class="leyenda__extremos"><span>Baja</span><span>Alta</span></div>
        <p class="leyenda__unidad">Intensidad relativa${c.unidad ? ` según ${escapar(c.unidad)}` : ''}</p>`;
    case 'raster-pmtiles':
      return c.id === 'calor_fibras'
        ? `<div class="leyenda__rampa" style="background:linear-gradient(90deg,${RAMPA_CALOR.join(',')})"></div>
           <div class="leyenda__extremos"><span>Baja</span><span>Alta</span></div>`
        : `<ul class="leyenda__clases"><li><span class="muestra muestra--area" style="background:${c.color}"></span>Cubierta identificada</li></ul>`;
    case 'puntos':
      return `<ul class="leyenda__clases">
        <li><span class="muestra muestra--punto" style="background:${c.color}"></span>Asbesto detectado</li>
        <li><span class="muestra muestra--punto" style="background:#8499ab"></span>No detectado</li></ul>`;
    case 'linea':
      return `<ul class="leyenda__clases"><li><span class="muestra muestra--linea" style="background:${c.color}"></span>Tramo de tubería</li></ul>`;
    case 'contorno':
      return `<ul class="leyenda__clases"><li><span class="muestra muestra--contorno" style="border-color:${c.color}"></span>Límite</li></ul>`;
    default:
      return '';
  }
}

/** Leyenda dinámica: solo capas activas, en el orden del catálogo. */
export function montarLeyenda(raiz: HTMLElement, capas: Capa[]) {
  return function actualizar(visibles: string[]) {
    const activas = capas.filter((c) => visibles.includes(c.id));
    raiz.innerHTML = activas.length
      ? activas.map((c) => `<section class="leyenda__item"><h3 class="leyenda__titulo">${escapar(c.titulo)}</h3>${cuerpo(c)}</section>`).join('')
      : '<p class="vacio">Active una capa para ver su leyenda.</p>';
  };
}
