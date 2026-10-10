import './estilos/index.css';
import maplibregl, { type MapGeoJSONFeature } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { VISTA_BOLIVAR, VISTA_INICIAL } from './config/tema';
import { capasPublicas } from './config/privacidad';
import { PARADAS } from './config/recorrido';
import type { Capa } from './config/capas';
import { agregarCapas, idsMapa } from './mapa/fuentes';
import { codificarEstado, decodificarEstado } from './mapa/estado-url';
import { exportarPNG } from './mapa/exportar';
import { ControlInicio, ControlMapaBase, ControlMedicion, agregarMapasBase, cambiarMapaBase } from './mapa/controles';
import { montarPestanas } from './ui/pestanas';
import { montarListaCapas } from './ui/lista-capas';
import { montarLeyenda } from './ui/leyenda';
import { htmlPopup } from './ui/popup';
import { montarBuscador } from './ui/busqueda';
import { pintarPanelBarrio, resumenBarrio } from './ui/panel-barrio';
import { crearMedicion } from './ui/medicion';
import { montarBienvenida } from './ui/bienvenida';
import { montarRecorrido } from './ui/recorrido';
import { htmlAcerca } from './ui/acerca';
import { duracion, movimientoReducido } from './ui/movimiento';

/** Área de cubiertas de AC: 8.164.312 píxeles clasificados × 1,44 m² (ráster de 1,2 m). */
const KM2_CUBIERTAS = (8164312 * 1.44) / 1e6;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const capas = capasPublicas();
const estadoInicial = decodificarEstado(location.hash);
const animar = !movimientoReducido() && !estadoInicial;

document.body.classList.add('inicio');
maplibregl.addProtocol('pmtiles', new Protocol().tile);

const mapa = new maplibregl.Map({
  container: 'mapa',
  style: 'https://tiles.openfreemap.org/styles/positron',
  center: estadoInicial ? [estadoInicial.lon, estadoInicial.lat] : animar ? VISTA_BOLIVAR.centro : VISTA_INICIAL.centro,
  zoom: estadoInicial?.zoom ?? (animar ? VISTA_BOLIVAR.zoom : VISTA_INICIAL.zoom),
  maxZoom: 18,
  minZoom: 5,
  attributionControl: { compact: true, customAttribution: 'Proyecto BPIN 2020000100366 · UdC · FUNDCLAS' },
  canvasContextAttributes: { preserveDrawingBuffer: true },
  locale: {
    'NavigationControl.ZoomIn': 'Acercar',
    'NavigationControl.ZoomOut': 'Alejar',
    'NavigationControl.ResetBearing': 'Orientar al norte',
    'FullscreenControl.Enter': 'Pantalla completa',
    'FullscreenControl.Exit': 'Salir de pantalla completa',
    'GeolocateControl.FindMyLocation': 'Mi ubicación',
    'ScaleControl.Meters': 'm',
    'ScaleControl.Kilometers': 'km'
  }
});

const aviso = (texto: string) => {
  const el = $('aviso');
  el.textContent = texto;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2200);
};

const irAlInicio = () =>
  mapa.flyTo({ center: VISTA_INICIAL.centro, zoom: VISTA_INICIAL.zoom, pitch: 0, bearing: 0, duration: duracion(1200), essential: true });

mapa.addControl(new ControlMapaBase((b) => cambiarMapaBase(mapa, b, capasEstilo)), 'top-right');
mapa.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
mapa.addControl(new ControlInicio(irAlInicio), 'top-right');
mapa.addControl(new maplibregl.FullscreenControl({ container: document.querySelector('.mapa-zona') as HTMLElement }), 'top-right');
mapa.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-right');
mapa.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

let capasEstilo: string[] = [];

mapa.on('load', async () => {
  const estilo = mapa.getStyle().layers;
  capasEstilo = estilo.filter((l) => (l.layout as { visibility?: string } | undefined)?.visibility !== 'none').map((l) => l.id);
  const primeraEtiqueta = estilo.find((l) => l.type === 'symbol')?.id;
  agregarMapasBase(mapa);

  const { disponibles, faltantes } = await agregarCapas(mapa, capas, primeraEtiqueta);
  $('cargando').classList.add('listo');

  // ---------- Panel: pestañas, lista y leyenda ----------
  montarPestanas(document);
  const actualizarLeyenda = montarLeyenda($('leyenda'), capas);
  const lista = montarListaCapas($('lista-capas'), mapa, capas, faltantes, actualizarLeyenda);
  if (estadoInicial) lista.establecer(estadoInicial.capas);

  // ---------- Medición ----------
  const control = new ControlMedicion(
    (modo) => medicion.iniciar(modo),
    () => { medicion.detener(); }
  );
  const medicion = crearMedicion(mapa, (texto) => {
    const el = $('medida');
    el.hidden = !texto;
    el.textContent = texto;
    if (!medicion?.activo()) control.reiniciar();
  });
  mapa.addControl(control, 'top-right');

  // ---------- Popups y panel por barrio ----------
  const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '300px', offset: 10 });
  const consultables = capas.filter((c) => c.campos && (c.tipo === 'puntos' || c.tipo === 'linea'));
  const idsConsultables = consultables.flatMap(idsMapa);
  const idBarrios = 'barrios-relleno';
  let barrioSel: number | string | undefined;

  const datos = async (url: string) => (await fetch(url)).json() as Promise<GeoJSON.FeatureCollection>;
  const [barriosFC, ...muestrasFC] = await Promise.all([
    datos('/data/barrios.geojson'),
    ...capas.filter((c) => c.tipo === 'calor').map((c) => datos(c.url))
  ]);
  const titulosMuestras = capas.filter((c) => c.tipo === 'calor').map((c) => c.titulo);
  const muestrasPorTipo = Object.fromEntries(titulosMuestras.map((t, i) => [t, muestrasFC[i].features]));

  const seleccionarBarrio = (f: GeoJSON.Feature, id: number | string | undefined, volar: boolean) => {
    if (barrioSel !== undefined) mapa.setFeatureState({ source: 'barrios', id: barrioSel }, { seleccion: false });
    barrioSel = id;
    if (id !== undefined) mapa.setFeatureState({ source: 'barrios', id }, { seleccion: true });
    pintarPanelBarrio($('panel-barrio'), resumenBarrio(f as never, muestrasPorTipo as never), cerrarBarrio);
    if (volar) {
      const [minX, minY, maxX, maxY] = limites(f.geometry);
      mapa.fitBounds([[minX, minY], [maxX, maxY]], { padding: { top: 80, bottom: 260, left: 60, right: 60 }, duration: duracion(1100), maxZoom: 16 });
    }
  };
  const cerrarBarrio = () => {
    if (barrioSel !== undefined) mapa.setFeatureState({ source: 'barrios', id: barrioSel }, { seleccion: false });
    barrioSel = undefined;
    const panel = $('panel-barrio');
    panel.classList.remove('abierto');
    setTimeout(() => { if (!panel.classList.contains('abierto')) panel.hidden = true; }, duracion(300));
  };

  mapa.on('click', (e) => {
    if (medicion.activo()) return;
    const objetivos = [...idsConsultables, idBarrios].filter((id) => mapa.getLayer(id));
    const [f] = mapa.queryRenderedFeatures(e.point, { layers: objetivos }) as MapGeoJSONFeature[];
    $('pista').classList.add('oculta');
    if (!f) {
      popup.remove();
      cerrarBarrio();
      $('pista').classList.remove('oculta');
      return;
    }
    if (f.layer.id === idBarrios) {
      popup.remove();
      const completo = typeof f.id === 'number' ? barriosFC.features[f.id] : undefined;
      seleccionarBarrio(completo ?? f, f.id, false);
      return;
    }
    const capa = consultables.find((c) => idsMapa(c).includes(f.layer.id))!;
    popup.setLngLat(e.lngLat).setHTML(htmlPopup(f.properties, capa.campos!, capa.titulo.split(' · ')[0])).addTo(mapa);
  });
  for (const id of [...idsConsultables, idBarrios]) {
    mapa.on('mouseenter', id, () => { if (!medicion.activo()) mapa.getCanvas().style.cursor = 'pointer'; });
    mapa.on('mouseleave', id, () => { if (!medicion.activo()) mapa.getCanvas().style.cursor = ''; });
  }

  // ---------- Buscador ----------
  const nombres = barriosFC.features.map((f) => String(f.properties?.NOMBRE ?? '')).sort((a, b) => a.localeCompare(b, 'es'));
  let marcador: maplibregl.Marker | undefined;
  montarBuscador($('buscador'), {
    nombresBarrios: () => nombres,
    alElegirBarrio: (nombre) => {
      const idx = barriosFC.features.findIndex((f) => f.properties?.NOMBRE === nombre);
      if (idx < 0) return;
      if (!lista.visibles().includes('barrios')) lista.establecer([...lista.visibles(), 'barrios']);
      seleccionarBarrio(barriosFC.features[idx], idx, true);
    },
    alElegirLugar: (centro, nombre) => {
      marcador?.remove();
      marcador = new maplibregl.Marker({ color: '#2f5877' }).setLngLat(centro).setPopup(new maplibregl.Popup().setText(nombre)).addTo(mapa);
      mapa.flyTo({ center: centro, zoom: 16, duration: duracion(1400), essential: true });
    }
  });

  // ---------- Recorrido, bienvenida y acerca ----------
  const recorrido = montarRecorrido({
    raiz: $('recorrido'),
    mapa,
    paradas: PARADAS,
    capasVisibles: () => lista.visibles(),
    establecerCapas: (ids) => lista.establecer(ids),
    disponibles: () => disponibles
  });
  $('boton-recorrido').addEventListener('click', () => { cerrarBarrio(); popup.remove(); recorrido.abrir(); });

  const bienvenida = montarBienvenida($<HTMLDialogElement>('bienvenida'), () => recorrido.abrir());
  const kmTuberia = barriosFC.features.reduce((s, f) => s + (Number(f.properties?.SUM_SUM_km) || 0), 0);
  bienvenida.fijarCifras({
    muestras: muestrasFC.reduce((s, fc) => s + fc.features.length, 0),
    barrios: barriosFC.features.length,
    tuberia: Math.round(kmTuberia),
    cubiertas: KM2_CUBIERTAS
  });

  // Vuelo de entrada: de Bolívar a Cartagena, con inclinación
  if (animar) {
    setTimeout(() => {
      mapa.flyTo({ center: VISTA_INICIAL.centro, zoom: VISTA_INICIAL.zoom + 0.6, pitch: 35, bearing: -8, duration: duracion(2600), curve: 1.6, essential: true });
      mapa.once('moveend', () => mapa.easeTo({ pitch: 0, bearing: 0, zoom: VISTA_INICIAL.zoom, duration: duracion(1400) }));
    }, 350);
    setTimeout(() => bienvenida.mostrar(), 1700);
  } else if (!estadoInicial) {
    bienvenida.mostrar();
  }

  setTimeout(() => document.body.classList.remove('inicio'), 1500);
});

// ---------- Encabezado: acerca, compartir y exportar ----------
$('acerca-contenido').innerHTML = htmlAcerca();
const acerca = $<HTMLDialogElement>('acerca');
$('boton-acerca').addEventListener('click', () => acerca.showModal());
acerca.addEventListener('click', (e) => {
  if (e.target === acerca || (e.target as HTMLElement).closest('[data-accion="cerrar"]')) acerca.close();
});

function capasActivas(): Capa[] {
  return capas.filter((c) => idsMapa(c).some((id) => mapa.getLayer(id) && mapa.getLayoutProperty(id, 'visibility') !== 'none'));
}

/** El estado solo se escribe en la URL al compartir, para no saltar la entrada animada al recargar. */
function guardarHash() {
  const c = mapa.getCenter();
  const hash = codificarEstado({ lon: c.lng, lat: c.lat, zoom: mapa.getZoom(), capas: capasActivas().map((x) => x.id) });
  history.replaceState(null, '', hash);
}

$('boton-compartir').addEventListener('click', async () => {
  guardarHash();
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ title: 'Geovisor Asbesto Cartagena', url: location.href });
      return;
    }
    await navigator.clipboard.writeText(location.href);
    aviso('Enlace copiado: reproduce esta vista y sus capas');
  } catch {
    aviso('No se pudo copiar el enlace; cópielo desde la barra de direcciones');
  }
});

$('boton-exportar').addEventListener('click', async () => {
  aviso('Generando imagen…');
  try {
    await exportarPNG(mapa, capasActivas());
    aviso('Imagen descargada');
  } catch {
    aviso('No se pudo exportar la imagen');
  }
});

function limites(g: GeoJSON.Geometry): [number, number, number, number] {
  const b: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  const recorrer = (c: unknown): void => {
    if (typeof (c as number[])[0] === 'number') {
      const [x, y] = c as number[];
      b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y);
    } else (c as unknown[]).forEach(recorrer);
  };
  recorrer((g as GeoJSON.Polygon).coordinates);
  return b;
}
