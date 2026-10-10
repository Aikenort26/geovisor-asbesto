export interface Parada {
  titulo: string;
  texto: string;
  centro: [number, number];
  zoom: number;
  inclinacion: number;
  rumbo: number;
  capas: string[];
}

export const PARADAS: Parada[] = [
  {
    titulo: 'Cartagena de Indias',
    texto: 'El proyecto estudió la presencia de asbesto en el área urbana de Cartagena: cubiertas, redes de acueducto, polvo, aire y agua. Cada barrio se clasifica según la densidad de tubería de asbesto-cemento.',
    centro: [-75.505, 10.4],
    zoom: 12,
    inclinacion: 0,
    rumbo: 0,
    capas: ['limites', 'barrios']
  },
  {
    titulo: 'Cubiertas de asbesto-cemento',
    texto: 'Con imágenes multiespectrales e hiperespectrales y aprendizaje automático se identificaron las cubiertas de asbesto-cemento a 1,2 m de resolución. Es la principal fuente potencial de fibras en los barrios.',
    centro: [-75.49, 10.395],
    zoom: 15.2,
    inclinacion: 40,
    rumbo: -15,
    capas: ['cubiertas']
  },
  {
    titulo: 'Liberación potencial de fibras',
    texto: 'La superficie de densidad estima dónde se concentra la liberación potencial de fibras a partir de la distribución y el estado de las cubiertas. Las zonas amarillas concentran la mayor intensidad.',
    centro: [-75.495, 10.4],
    zoom: 13.4,
    inclinacion: 30,
    rumbo: 10,
    capas: ['calor_fibras']
  },
  {
    titulo: 'Polvo superficial en viviendas',
    texto: 'El polvo se recogió por aspirado de superficies (ASTM D5755) y se analizó por microscopía electrónica de transmisión. El resultado se expresa en estructuras de asbesto por centímetro cuadrado (s/cm²).',
    centro: [-75.5, 10.395],
    zoom: 13.2,
    inclinacion: 20,
    rumbo: 0,
    capas: ['mcv-calor', 'barrios']
  },
  {
    titulo: 'Red de acueducto en asbesto-cemento',
    texto: 'Más de 250 km de tubería de asbesto-cemento atraviesan los barrios estudiados. La densidad por barrio permite priorizar sustituciones y orientar el muestreo de agua de consumo.',
    centro: [-75.515, 10.405],
    zoom: 13.6,
    inclinacion: 25,
    rumbo: 20,
    capas: ['barrios', 'tuberia', 'agua_grifo-calor']
  },
  {
    titulo: 'El siguiente paso: territorios posdesastre',
    texto: 'Estas capacidades se trasladan ahora a los municipios afectados por el sismo de 2026, para identificar fuentes, rutas y escenarios de exposición asociados con escombros, RCD y asbesto.',
    centro: [-75.505, 10.4],
    zoom: 12.2,
    inclinacion: 0,
    rumbo: 0,
    capas: ['cubiertas', 'mcv-calor', 'limites']
  }
];
