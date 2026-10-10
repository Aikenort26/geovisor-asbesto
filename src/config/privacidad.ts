import { CAPAS, type Capa } from './capas';

/**
 * Los participantes firmaron consentimiento informado para el uso de su información en el proyecto.
 * Aun así, el visor público muestra las muestras como mapa de calor por defecto y deja los puntos
 * originales apagados. Con `false` los puntos desaparecen del build.
 */
export const PUBLICAR_PUNTOS = true;

/** Expande cada capa de muestras en "<id>-calor" (visible) y "<id>-puntos" (apagada). */
export function capasPublicas(publicarPuntos: boolean = PUBLICAR_PUNTOS): Capa[] {
  return CAPAS.flatMap((c): Capa[] => {
    if (c.tipo !== 'muestras') return [c];
    const calor: Capa = { ...c, id: `${c.id}-calor`, tipo: 'calor', madre: c.id };
    const puntos: Capa = {
      ...c,
      id: `${c.id}-puntos`,
      titulo: `${c.titulo} · puntos de muestreo`,
      tipo: 'puntos',
      visible: false,
      madre: c.id
    };
    return publicarPuntos ? [calor, puntos] : [calor];
  });
}
