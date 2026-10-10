import { animarContador } from './contador';

const CLAVE = 'geovisor-asbesto:bienvenida-vista';

export interface Cifras {
  muestras: number;
  barrios: number;
  tuberia: number;
  cubiertas: number;
}

function yaVista(): boolean {
  try {
    return localStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
}

function marcarVista() {
  try {
    localStorage.setItem(CLAVE, '1');
  } catch {
    /* almacenamiento bloqueado: se mostrará de nuevo, sin consecuencias */
  }
}

/** Ventana de bienvenida con cifras animadas. Se muestra en la primera visita o al pedirla. */
export function montarBienvenida(dialogo: HTMLDialogElement, alRecorrido: () => void) {
  let cifras: Cifras | null = null;

  const animar = () => {
    if (!cifras) return;
    const decimales: Record<keyof Cifras, number> = { muestras: 0, barrios: 0, tuberia: 0, cubiertas: 1 };
    dialogo.querySelectorAll<HTMLElement>('[data-contador]').forEach((dd, i) => {
      const k = dd.dataset.contador as keyof Cifras;
      setTimeout(() => animarContador(dd, cifras![k], decimales[k]), 120 + i * 80);
    });
  };

  const cerrar = () => {
    marcarVista();
    dialogo.close();
  };
  dialogo.addEventListener('click', (e) => {
    const accion = (e.target as HTMLElement).closest<HTMLElement>('[data-accion]')?.dataset.accion;
    if (accion === 'explorar') cerrar();
    if (accion === 'recorrido') {
      cerrar();
      alRecorrido();
    }
    if (e.target === dialogo) cerrar();
  });
  dialogo.addEventListener('cancel', marcarVista);

  return {
    fijarCifras(c: Cifras) {
      cifras = c;
      if (dialogo.open) animar();
    },
    mostrar(forzar = false) {
      if (!forzar && yaVista()) return false;
      dialogo.showModal();
      animar();
      return true;
    }
  };
}
