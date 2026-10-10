/** Pestañas del panel (patrón ARIA tabs): clic, flechas, Inicio y Fin. */
export function montarPestanas(raiz: ParentNode, alCambiar?: (seccion: string) => void) {
  const pestanas = Array.from(raiz.querySelectorAll<HTMLButtonElement>('.pestana'));

  const activar = (p: HTMLButtonElement, foco = false) => {
    for (const q of pestanas) {
      const activa = q === p;
      q.setAttribute('aria-selected', String(activa));
      q.tabIndex = activa ? 0 : -1;
      const seccion = document.getElementById(`seccion-${q.dataset.seccion}`);
      if (seccion) seccion.hidden = !activa;
    }
    if (foco) p.focus();
    alCambiar?.(p.dataset.seccion ?? '');
  };

  pestanas.forEach((p, i) => {
    p.id ||= `pestana-${p.dataset.seccion}`;
    p.setAttribute('aria-controls', `seccion-${p.dataset.seccion}`);
    document.getElementById(`seccion-${p.dataset.seccion}`)?.setAttribute('aria-labelledby', p.id);
    p.addEventListener('click', () => activar(p));
    p.addEventListener('keydown', (e) => {
      const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: pestanas.length - 1 }[e.key];
      if (destino === undefined) return;
      e.preventDefault();
      activar(pestanas[(destino + pestanas.length) % pestanas.length], true);
    });
  });
  if (pestanas[0]) activar(pestanas[0]);
  return { activar: (seccion: string) => { const p = pestanas.find((x) => x.dataset.seccion === seccion); if (p) activar(p); } };
}
