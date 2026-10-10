// Catálogo declarativo de capas: único lugar con ids, colores, archivos y etiquetas de campos.
// Etiquetas con unidad: "Etiqueta|unidad".

export type TipoCapa = 'coropleta' | 'linea' | 'muestras' | 'calor' | 'puntos' | 'contorno' | 'raster-pmtiles';
export type Grupo = 'Contexto territorial' | 'Análisis espacial' | 'Muestreo ambiental';

export interface Capa {
  id: string;
  titulo: string;
  grupo: Grupo;
  tipo: TipoCapa;
  url: string;
  visible: boolean;
  color: string;
  descripcion: string;
  campoPeso?: string;
  maximo?: number;
  unidad?: string;
  campos?: Record<string, string>;
  /** Para capas derivadas de 'muestras': id de la capa madre. */
  madre?: string;
}

export const GRUPOS: Grupo[] = ['Contexto territorial', 'Análisis espacial', 'Muestreo ambiental'];

/** Rampa violeta → amarillo del visor ArcGIS original ("MCV XY"). */
export const RAMPA_CALOR = ['#440154', '#482878', '#31688e', '#21918c', '#5ec962', '#fde725'];

/** Cortes de la coropleta de densidad (los mismos del webmap de ArcGIS). */
export const CORTES_DENSIDAD = [0, 3.3, 6.6, 9.8, 13];
export const COLORES_DENSIDAD = ['#eef2f5', '#c9d6e1', '#8fa9bf', '#56809f', '#2f5877'];

const CAMPOS_MUESTRA = {
  Sample: 'Código de muestra',
  Sample_typ: 'Tipo de muestra',
  Neighborho: 'Barrio',
  Asbestos__: 'Tipo de asbesto'
};

export const CAPAS: Capa[] = [
  {
    id: 'limites',
    titulo: 'Límite departamental',
    grupo: 'Contexto territorial',
    tipo: 'contorno',
    url: '/data/limite_departamento.geojson',
    visible: true,
    color: '#3b5266',
    descripcion: 'Departamento de Bolívar.'
  },
  {
    id: 'barrios',
    titulo: 'Densidad de tubería AC por barrio',
    grupo: 'Contexto territorial',
    tipo: 'coropleta',
    url: '/data/barrios.geojson',
    visible: true,
    color: '#2f5877',
    unidad: 'km/km²',
    descripcion: 'Kilómetros de tubería de asbesto-cemento por kilómetro cuadrado de barrio.',
    campos: {
      NOMBRE: 'Barrio',
      LOC: 'Localidad',
      PERSONAS: 'Población|hab.',
      VIVIENDAS: 'Viviendas',
      SUM_SUM_km: 'Tubería AC|km',
      Densidad_k: 'Densidad de tubería AC|km/km²'
    }
  },
  {
    id: 'tuberia',
    titulo: 'Tubería de asbesto-cemento',
    grupo: 'Contexto territorial',
    tipo: 'linea',
    url: '/data/tuberia_ac.geojson',
    visible: false,
    color: '#14283a',
    descripcion: 'Red de acueducto en asbesto-cemento, segmentada por barrio.',
    campos: { NOMBRE: 'Barrio', km_tuberia: 'Longitud del tramo|km' }
  },
  {
    id: 'cubiertas',
    titulo: 'Cubiertas de asbesto-cemento',
    grupo: 'Análisis espacial',
    tipo: 'raster-pmtiles',
    url: '/tiles/cubiertas.pmtiles',
    visible: true,
    color: '#b23a26',
    descripcion: 'Cubiertas identificadas por teledetección y aprendizaje automático (resolución 1,2 m).'
  },
  {
    id: 'calor_fibras',
    titulo: 'Liberación potencial de fibras desde cubiertas',
    grupo: 'Análisis espacial',
    tipo: 'raster-pmtiles',
    url: '/tiles/calor_fibras.pmtiles',
    visible: false,
    color: '#21918c',
    descripcion: 'Superficie de densidad que estima dónde se concentra la liberación potencial de fibras.'
  },
  {
    id: 'mcv',
    titulo: 'Polvo superficial (microvac)',
    grupo: 'Muestreo ambiental',
    tipo: 'muestras',
    url: '/data/muestras_mcv.geojson',
    visible: true,
    color: '#7a3e9d',
    campoPeso: 'Strucutres',
    maximo: 326400000,
    unidad: 's/cm²',
    descripcion: 'Polvo superficial por aspirado (ASTM D5755) analizado por microscopía electrónica de transmisión.',
    campos: { ...CAMPOS_MUESTRA, Strucutres: 'Estructuras de asbesto|s/cm²' }
  },
  {
    id: 'plm',
    titulo: 'Materiales de construcción (PLM)',
    grupo: 'Muestreo ambiental',
    tipo: 'muestras',
    url: '/data/muestras_plm.geojson',
    visible: false,
    color: '#b23a26',
    campoPeso: 'Volume____',
    maximo: 55,
    unidad: '%',
    descripcion: 'Materiales analizados por microscopía de luz polarizada.',
    campos: { ...CAMPOS_MUESTRA, Volume____: 'Contenido de asbesto|%' }
  },
  {
    id: 'aire',
    titulo: 'Aire',
    grupo: 'Muestreo ambiental',
    tipo: 'muestras',
    url: '/data/muestras_aire.geojson',
    visible: false,
    color: '#31688e',
    campoPeso: 'Strucutres',
    maximo: 1,
    descripcion: 'Muestras de aire analizadas por microscopía electrónica de transmisión.',
    campos: { ...CAMPOS_MUESTRA, Strucutres: 'Estructuras de asbesto' }
  },
  {
    id: 'agua_teja',
    titulo: 'Agua de escorrentía de techos',
    grupo: 'Muestreo ambiental',
    tipo: 'muestras',
    url: '/data/agua_teja.geojson',
    visible: false,
    color: '#21918c',
    campoPeso: 'Concentrat',
    maximo: 14.29,
    unidad: 'MFL',
    descripcion: 'Agua lluvia recogida a la caída de cubiertas de asbesto-cemento.',
    campos: { ...CAMPOS_MUESTRA, Concentrat: 'Concentración|MFL' }
  },
  {
    id: 'agua_grifo',
    titulo: 'Agua de grifo',
    grupo: 'Muestreo ambiental',
    tipo: 'muestras',
    url: '/data/agua_grifo.geojson',
    visible: false,
    color: '#3b8ea5',
    campoPeso: 'Concentrat',
    maximo: 4.86,
    unidad: 'MFL',
    descripcion: 'Agua de consumo tomada en el grifo de las viviendas.',
    campos: { ...CAMPOS_MUESTRA, Concentrat: 'Concentración|MFL' }
  },
  {
    id: 'agua_tanque',
    titulo: 'Agua de tanque',
    grupo: 'Muestreo ambiental',
    tipo: 'muestras',
    url: '/data/agua_tanque.geojson',
    visible: false,
    color: '#5e8c61',
    campoPeso: 'Concentrat',
    maximo: 20.04,
    unidad: 'MFL',
    descripcion: 'Agua almacenada en tanques de asbesto-cemento.',
    campos: { ...CAMPOS_MUESTRA, Concentrat: 'Concentración|MFL' }
  }
];
