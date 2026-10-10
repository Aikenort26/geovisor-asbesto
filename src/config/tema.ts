// Tokens de diseño tomados del traspaso del compañero (variante "fibras").
export const TEMA = {
  fondo: '#d9e1e8',
  rayas: '#8499ab',
  linea: '#b2c0cc',
  texto: '#14283a',
  textoSuave: '#3b5266',
  acento: '#2f5877',
  panel: '#f3f6f8',
  textos: {
    lugar: 'Cartagena de Indias',
    titulo: 'Geovisor',
    tituloFuerte: 'Asbesto',
    sistema: 'Sistema de Información Geográfica'
  }
} as const;

export const VISTA_INICIAL = { centro: [-75.5, 10.4] as [number, number], zoom: 12 };
export const VISTA_BOLIVAR = { centro: [-74.9, 9.2] as [number, number], zoom: 6.6 };
