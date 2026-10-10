import type { Parada } from '../config/recorrido';

/** Estado del recorrido guiado, independiente del mapa y del DOM. */
export class Recorrido {
  indice = 0;
  activo = false;
  private capasPrevias: string[] = [];

  constructor(readonly paradas: Parada[]) {}

  get actual(): Parada {
    return this.paradas[this.indice];
  }

  abrir(capasActuales: string[]) {
    this.capasPrevias = [...capasActuales];
    this.indice = 0;
    this.activo = true;
  }

  siguiente() {
    this.indice = Math.min(this.paradas.length - 1, this.indice + 1);
  }

  anterior() {
    this.indice = Math.max(0, this.indice - 1);
  }

  /** Cierra el recorrido y devuelve las capas que la persona tenía antes de abrirlo. */
  cerrar(): string[] {
    this.activo = false;
    return this.capasPrevias;
  }
}
