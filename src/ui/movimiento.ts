/** true si la persona pidió reducir el movimiento en su sistema operativo. */
export function movimientoReducido(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Duración efectiva de una animación: 0 cuando se pide movimiento reducido. */
export function duracion(ms: number): number {
  return movimientoReducido() ? 0 : ms;
}
