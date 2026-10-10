import { duracion } from './movimiento';

export function formatoNumero(v: number, decimales: number): string {
  return v.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

/** Valor del contador en el instante `t` (ease-out cúbico); en t ≥ total es exactamente `final`. */
export function valorEnTiempo(final: number, t: number, total: number): number {
  if (total <= 0 || t >= total) return final;
  if (t <= 0) return 0;
  const x = t / total;
  return final * (1 - Math.pow(1 - x, 3));
}

export function animarContador(el: HTMLElement, final: number, decimales = 0, ms = 900) {
  const total = duracion(ms);
  const inicio = performance.now();
  const paso = (ahora: number) => {
    const t = ahora - inicio;
    el.textContent = formatoNumero(valorEnTiempo(final, t, total), decimales);
    if (t < total) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
