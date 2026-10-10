import type { Map as MapaML } from 'maplibre-gl';
import type { Parada } from '../config/recorrido';
import { Recorrido } from './recorrido-estado';
import { duracion } from './movimiento';
import { escapar } from './popup';

interface Opciones {
  raiz: HTMLElement;
  mapa: MapaML;
  paradas: Parada[];
  capasVisibles: () => string[];
  establecerCapas: (ids: string[]) => void;
  disponibles: () => string[];
}

/** Tarjeta del recorrido guiado: vuela a cada parada y enciende sus capas. */
export function montarRecorrido(op: Opciones) {
  const estado = new Recorrido(op.paradas);

  const irA = (p: Parada) => {
    const disponibles = op.disponibles();
    op.establecerCapas(p.capas.filter((c) => disponibles.includes(c)));
    const ms = duracion(2400);
    const vista = { center: p.centro, zoom: p.zoom, pitch: p.inclinacion, bearing: p.rumbo };
    if (ms) op.mapa.flyTo({ ...vista, duration: ms, curve: 1.3, essential: true });
    else op.mapa.jumpTo(vista);
  };

  const pintar = () => {
    const p = estado.actual;
    const n = op.paradas.length;
    const i = estado.indice;
    op.raiz.innerHTML = `
      <div class="recorrido__progreso" aria-hidden="true"><span style="width:${((i + 1) / n) * 100}%"></span></div>
      <div class="recorrido__cuerpo">
        <div class="recorrido__texto">
          <span class="recorrido__paso">Recorrido · ${i + 1} de ${n}</span>
          <h2>${escapar(p.titulo)}</h2>
          <p>${escapar(p.texto)}</p>
        </div>
      </div>
      <div class="recorrido__nav">
        <button class="boton" type="button" data-r="anterior" ${i === 0 ? 'disabled' : ''}>Anterior</button>
        <button class="boton boton--primario" type="button" data-r="${i === n - 1 ? 'cerrar' : 'siguiente'}">
          ${i === n - 1 ? 'Finalizar' : 'Siguiente'}</button>
        <span class="espacio"></span>
        <button class="boton-icono" type="button" data-r="cerrar" aria-label="Cerrar recorrido">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>
      </div>`;
    irA(p);
  };

  const cerrar = () => {
    if (!estado.activo) return;
    op.establecerCapas(estado.cerrar());
    op.raiz.hidden = true;
    document.body.classList.remove('en-recorrido');
    window.removeEventListener('keydown', teclas);
  };
  const teclas = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea')) return;
    if (e.key === 'ArrowRight') { estado.siguiente(); pintar(); }
    else if (e.key === 'ArrowLeft') { estado.anterior(); pintar(); }
    else if (e.key === 'Escape') cerrar();
  };

  op.raiz.addEventListener('click', (e) => {
    const accion = (e.target as HTMLElement).closest<HTMLElement>('[data-r]')?.dataset.r;
    if (accion === 'siguiente') { estado.siguiente(); pintar(); }
    else if (accion === 'anterior') { estado.anterior(); pintar(); }
    else if (accion === 'cerrar') cerrar();
  });

  return {
    abrir() {
      estado.abrir(op.capasVisibles());
      op.raiz.hidden = false;
      document.body.classList.add('en-recorrido');
      pintar();
      window.addEventListener('keydown', teclas);
      op.raiz.querySelector<HTMLButtonElement>('.boton--primario')?.focus();
    },
    cerrar,
    activo: () => estado.activo
  };
}
