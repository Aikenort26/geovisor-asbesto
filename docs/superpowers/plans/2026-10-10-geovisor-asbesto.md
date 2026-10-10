# Geovisor Asbesto Cartagena (open source): plan de implementación v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (modo Native elegido) para implementar este plan tarea por tarea. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar en Vercel un geovisor público y open source del proyecto BPIN 2020000100366. Debe conservar la interfaz diseñada por el compañero (encabezado "fibras", panel con pestañas Capas/Leyenda y bloque azul Compartir/Exportar) y llevarla a una presentación de nivel de convocatoria: animaciones, recorrido guiado e indicadores. Sirve como antecedente técnico de la propuesta Minciencias SIGP 142806.

**Architecture:** Sitio estático Vite + TypeScript + MapLibre GL JS, sin backend.
- Vectores: GeoJSON versionados en el repo. Barrios desde el shapefile local; muestras y tubería desde el servicio público de ArcGIS.
- Ráster: los dos GeoTIFF de 1,2 m (cubiertas y mapa de calor de liberación de fibras) se convierten a PMTiles ráster con GDAL en Docker.
- Despliegue: el repo de GitHub queda conectado a Vercel y cada push a `main` despliega solo.

**Tech Stack:**
- Visor: Vite 6, TypeScript 5, maplibre-gl 5, pmtiles 4, @turf/area y @turf/length 7.
- Pruebas: Vitest 3 + jsdom.
- Conversión de datos: Docker con `ghcr.io/osgeo/gdal:ubuntu-small-3.10.0`, más la CLI de `pmtiles`.
- Hosting: GitHub (`Aikenort26`) y Vercel (`aikenort26`); ambas sesiones ya están autenticadas.

**Spec:** Esta conversación (2026-10-10), el traspaso `C:\Users\User\Downloads\geovisor-asbesto-traspaso.xml` y el visor ArcGIS de origen (webmap `f3465e843da34811b0e18fb9d39f43a0`, app `9bf87297c1ac4fcfa33a601596dd0846`).

## Context

- **Por qué se migra:** la licencia de ArcGIS vence y la propuesta cita el geovisor como antecedente. Un compañero empezó una versión con Leaflet en Netlify (https://geovisor-asbesto-ctg.netlify.app/). Va en la etapa 1 de 7: hay encabezado y pestañas, pero las capas y la leyenda siguen vacías.
- **Qué pide el usuario:**
  - auditar esa versión;
  - mantener la misma interfaz;
  - darle mejor presentación ("animaciones, estilos, para que sea un proyecto ganador");
  - crear el repo en GitHub, conectarlo a Vercel y desplegar automáticamente.
- **Datos fuente** (ya entregados en `INFO_GEOVISOR-20261010T154114Z-1-001.zip`):

| Archivo | Contenido | Notas |
|---|---|---|
| `CUBIERTAS_ASBESTO.tif` (738 MB) | Clasificación binaria 0/1, 1,2 m/px | 8.164.312 px = 1, unos 11,8 km² de cubierta AC. Sin `.prj`. El origen 438162 E / 1155785 N corresponde a **EPSG:32618 (UTM 18N)**; se verifica contra los barrios en la Task 3. |
| `MAPA_CALOR_ASBESTO.tif` (777 MB) | Banda "MosaicAsbesto", entero, 1,2 m/px | Valor 2147483647 = NoData. Valores útiles de 0 a ~55/256 del histograma. Misma proyección supuesta. |
| `Densidad_Tuberias_Barrio.shp` | 189 barrios en Web Mercator | Campos: CODIGO, NOMBRE, UCG, LOC, AREA_HA, PERSONAS, VIVIENDAS, colegios, salud, nbi_*, KM2, SUM_SUM_km, Densidad_k. |

- **Decisión técnica: MapLibre en lugar de Leaflet.** La interfaz del compañero es HTML/CSS y se conserva tal cual. Lo que cambia es el motor del mapa. MapLibre da:
  - transiciones `flyTo` fluidas;
  - inclinación 3D;
  - mapas de calor por GPU;
  - PMTiles;
  - fundidos de capas.
  Leaflet no logra la misma calidad de animación.

## Global Constraints

- **Repo:** `C:\Users\User\dev\geovisor-asbesto`, fuera de Drive. Remoto `github.com/Aikenort26/geovisor-asbesto`, público, con proyecto Vercel `geovisor-asbesto` conectado por Git.
- **Fuentes pesadas:** los TIF no entran al repo. Se copian a `G:\Mi unidad\05-contratos\Minciencias_Salud_Desastre_2026\10_GEOVISOR_FUENTES\` y se trabajan desde `C:\Users\User\dev\geovisor-fuentes\` (fuera de Drive y fuera del repo).
- **Tokens del traspaso** (exactos):
  - `--fondo #d9e1e8`, `--rayas #8499ab`, `--linea #b2c0cc`, `--texto #14283a`;
  - `--texto-suave #3b5266`, `--acento #2f5877`, `--panel #f3f6f8`;
  - tipografía `'Segoe UI', Arial, sans-serif`;
  - encabezado de unos 56 px.
- **Encabezado "fibras":**
  - bloque de rayas diagonales a la izquierda;
  - "Cartagena de Indias" encima de "GEOVISOR **ASBESTO**", con Asbesto en peso 800;
  - "Sistema de Información Geográfica" a la derecha, tras una línea fina;
  - bloque azul acero de 120 px con Compartir y Exportar (íconos blancos);
  - filo inferior de 3 px.
- **Textos de interfaz** (exactos):
  - "Capas de información";
  - "Leyenda";
  - "Haga clic sobre una entidad del mapa para consultar sus datos.";
  - "Buscar dirección o lugar";
  - "Acerca del geovisor".
- **Estilo:** sobrio e institucional. Sin emojis, sin degradados llamativos, sin brillos, radio ≤ 4 px.
- **Animación con propósito:** duraciones entre 150 y 600 ms, `ease-out`. Todo se desactiva con `prefers-reduced-motion: reduce`.
- **Unidades:** se escribe **s/cm²**, con s minúscula. No se muestran umbrales normativos (por ejemplo 1000 s/cm²) hasta que el higienista lo confirme.
- **Atribución en pie y "Acerca del geovisor":** "Proyecto BPIN 2020000100366 — Universidad de Cartagena · FUNDCLAS". Los autores se nombran según `afiliaciones_canonicas_autores.xml`; si alguno no está en el catálogo, se pregunta antes.
- **Muestras:** se muestran por defecto como mapa de calor (`maxzoom` 16, radio creciente). Los puntos originales están disponibles pero apagados. `PUBLICAR_PUNTOS` en `src/config/privacidad.ts` vale `true` por defecto.
- **Tamaño de archivos:** cada PMTiles ≤ 90 MB (límite de GitHub y Vercel) y cada GeoJSON ≤ 5 MB.
- **Mapas base:**
  - "Claro" con OpenFreeMap positron (por defecto, sin clave);
  - "Calles" con OpenStreetMap;
  - "Satélite" con Esri World Imagery y su atribución, como en la versión del compañero.
- **Buscador:** primero filtra los barrios locales. Si no hay coincidencia, usa Nominatim con debounce de 600 ms, como máximo 1 petición por segundo y `viewbox` de Cartagena.

## Review Focus

1. **Ráster sin proyección o con proyección errónea:** si el supuesto EPSG:32618 falla, las cubiertas quedan desplazadas. La Task 3 lo verifica: un píxel de cubierta conocido debe caer dentro del barrio correcto.
2. **Mojibake en los atributos de ArcGIS** ("Agua caída de teja" llega mal codificado): debe repararse. La prueba va en la Task 2. Los ejemplos de prueba contienen un guion suave intencional; no se le pasa el limpiador de marcas.
3. **PMTiles ausente o mayor de 90 MB:** el visor carga igual y muestra la capa "no disponible", sin errores en consola. La prueba va en la Task 4.
4. **Movimiento:** con `prefers-reduced-motion` no hay `flyTo` largo, contadores animados ni recorrido automático. La prueba va en la Task 7.
5. **Móvil a 375 px:** sin scroll horizontal, panel abajo (en columna invertida, como el CSS del compañero) y encabezado reducido. Se verifica en la Task 9.

---

## Auditoría de la versión Netlify (entregable: `docs/AUDITORIA_VERSION_NETLIFY.md`)

**Se conserva:**
- el HTML y el CSS del encabezado y del panel;
- los tokens de diseño;
- los textos de interfaz;
- la vista móvil en columna invertida;
- el control "Vista inicial".

**Se corrige:**
1. El sitio no tiene datos: las capas y la leyenda son marcadores de posición.
2. Leaflet sin compilación y desde unpkg no tiene pruebas ni control de versiones de dependencias.
3. El mapa de calor con Leaflet.heat corre en CPU y hace saltos al cambiar de zoom.
4. No hay estrategia para los ráster de 1,2 m. "georaster-layer-for-leaflet" sobre 738 MB no es viable en un navegador.
5. Las pestañas no tienen manejo de teclado: faltan las flechas, `aria-controls` y el foco visible.
6. El bloque de Compartir/Exportar está vacío.
7. "Vista inicial" usa el carácter ⌂, que se ve distinto según el sistema; se reemplaza por un SVG.
8. Netlify Drop se publica a mano: no hay historial ni despliegue automático.

---

## Estructura de archivos

```
geovisor-asbesto/
  index.html                    # estructura del compañero + modales + recorrido
  vercel.json, vite.config.ts, tsconfig.json, package.json, README.md, LICENSE
  scripts/
    reparar-texto.mjs, descargar-arcgis.mjs, capas-fuente.json
    shp-a-geojson.sh            # ogr2ogr (Docker) barrios
    raster-a-pmtiles.sh         # gdalwarp + color + MBTiles + pmtiles
    paletas/cubiertas.txt, paletas/calor.txt   # tablas gdaldem color-relief
  public/data/*.geojson, public/tiles/*.pmtiles, public/og.png
  src/
    main.ts
    config/tema.ts, config/capas.ts, config/privacidad.ts, config/recorrido.ts
    mapa/fuentes.ts, mapa/calor.ts, mapa/estado-url.ts, mapa/exportar.ts
    ui/encabezado.ts, ui/pestanas.ts, ui/lista-capas.ts, ui/leyenda.ts, ui/popup.ts,
    ui/busqueda.ts, ui/panel-barrio.ts, ui/medicion.ts, ui/acerca.ts,
    ui/bienvenida.ts, ui/recorrido.ts, ui/contador.ts, ui/movimiento.ts
    estilos/tokens.css, estilos/base.css, estilos/encabezado.css, estilos/panel.css,
    estilos/mapa.css, estilos/animaciones.css
  tests/*.test.ts
  docs/AUDITORIA_VERSION_NETLIFY.md, docs/superpowers/plans/2026-10-10-geovisor-asbesto.md
```

---

### Task 1: Andamiaje, repositorio y despliegue continuo

**Files:** `package.json`, `vite.config.ts`, `vercel.json`, `index.html`, `src/main.ts`, `src/config/tema.ts`, `src/estilos/tokens.css`, `tests/tema.test.ts`.

- [ ] En `C:\Users\User\dev`:
  - `npm create vite@6 geovisor-asbesto -- --template vanilla-ts`;
  - `npm i maplibre-gl@5 pmtiles@4 @turf/area@7 @turf/length@7`;
  - `npm i -D vitest@3 jsdom@25`.
- [ ] Prueba que falla:
```ts
import { TEMA } from '../src/config/tema';
test('tokens del traspaso', () => {
  expect(TEMA).toMatchObject({ fondo: '#d9e1e8', rayas: '#8499ab', linea: '#b2c0cc', texto: '#14283a',
    textoSuave: '#3b5266', acento: '#2f5877', panel: '#f3f6f8' });
});
```
- [ ] Implementar `TEMA` y `tokens.css` con las mismas variables `--fondo` … `--panel`. Pasar `index.html` del traspaso a la estructura Vite, sin las etiquetas de Leaflet.
- [ ] Mapa mínimo en `main.ts`: OpenFreeMap positron, centro `[-75.50, 10.40]` y zoom 12, los mismos valores del compañero.
- [ ] Crear `vercel.json`:
```json
{ "headers": [{ "source": "/tiles/(.*)", "headers": [
  { "key": "Accept-Ranges", "value": "bytes" }, { "key": "Cache-Control", "value": "public, max-age=604800, immutable" } ] }] }
```
- [ ] Publicar:
  - `git init`, commit `feat: andamiaje`, luego `gh repo create Aikenort26/geovisor-asbesto --public --source . --push`;
  - `vercel link --yes --project geovisor-asbesto`, `vercel git connect`, `vercel --prod`;
  - verificar que la URL `*.vercel.app` responde 200 y que un push posterior despliega solo.

### Task 2: Datos vectoriales

**Files:** `scripts/reparar-texto.mjs`, `scripts/descargar-arcgis.mjs`, `scripts/capas-fuente.json`, `scripts/shp-a-geojson.sh`, `tests/reparar-texto.test.ts`, `public/data/*.geojson`.

- [ ] Prueba que falla. Los ejemplos con texto mal codificado se construyen en código para no depender de caracteres invisibles:
```ts
import { repararTexto } from '../scripts/reparar-texto.mjs';
const roto = (s: string) => Buffer.from(s, 'utf8').toString('latin1');
test('repara latin1→utf8 y respeta texto sano', () => {
  expect(repararTexto(roto('Agua caída de teja'))).toBe('Agua caída de teja');
  expect(repararTexto(roto('Línea'))).toBe('Línea');
  expect(repararTexto('Crespo')).toBe('Crespo');
  expect(repararTexto(12)).toBe(12);
});
```
- [ ] Implementar:
```js
export function repararTexto(s) {
  if (typeof s !== 'string' || !/[\u00C2\u00C3]/.test(s)) return s;
  const r = Buffer.from(s, 'latin1').toString('utf8');
  return r.includes('\uFFFD') ? s : r;
}
```
- [ ] `descargar-arcgis.mjs`:
  - lee `capas-fuente.json`: GDB/15 PLM, 28 aire, 24 MCV, 0 agua de teja, 30 agua de grifo, 27 agua de tanque, 31 tubería, 33 y 34 límites;
  - hace el bucle `query?where=1=1&outFields=*&outSR=4326&f=geojson&resultOffset=N&resultRecordCount=2000` mientras haya `exceededTransferLimit`;
  - aplica `repararTexto` y redondea las coordenadas a 6 decimales;
  - imprime los conteos esperados: 232, 36, 114, 40, 64, 28, 1472, 1 y 1.
- [ ] `shp-a-geojson.sh`: `docker run --rm -v "$FUENTES":/f -v "$PWD/public/data":/o ghcr.io/osgeo/gdal:ubuntu-small-3.10.0 ogr2ogr -f GeoJSON -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6 /o/barrios.geojson /f/Densidad_Tuberias_Barrio.shp`. Esperado: 189 features.
- [ ] Commit `feat: datos vectoriales`.

### Task 3: Ráster a PMTiles

**Files:** `scripts/raster-a-pmtiles.sh`, `scripts/paletas/cubiertas.txt`, `scripts/paletas/calor.txt`, `public/tiles/cubiertas.pmtiles`, `public/tiles/calor_fibras.pmtiles`.

- [ ] Copiar el zip a `10_GEOVISOR_FUENTES\` (Drive) y descomprimir en `C:\Users\User\dev\geovisor-fuentes\`.
- [ ] Paletas:
  - `cubiertas.txt`: `0 0 0 0 0` y `1 192 57 43 255`, rojo ladrillo opaco;
  - `calor.txt`: rampa violeta→amarillo del visor original, 6 pasos de `0 68 1 84 0` (transparente en 0) a `max 253 231 37 230`; `nv 0 0 0 0`.
- [ ] Por cada TIF, en Docker GDAL:
  1. `gdalwarp -s_srs EPSG:32618 -t_srs EPSG:3857 -r near -dstnodata 2147483647 -co COMPRESS=DEFLATE -co TILED=YES` (en el calor, primero `gdal_translate -a_nodata 2147483647`);
  2. `gdaldem color-relief -alpha <tif> paletas/x.txt rgba.tif`;
  3. `gdal_translate -of MBTILES -co TILE_FORMAT=PNG8 -co ZOOM_LEVEL_STRATEGY=UPPER rgba.tif x.mbtiles`, luego `gdaladdo -r average x.mbtiles 2 4 8 16 32` (para cubiertas, `-r mode`);
  4. `pmtiles convert x.mbtiles public/tiles/x.pmtiles`.
- [ ] Verificar:
  - `pmtiles show`: bounds dentro de lon −75,58/−75,44 y lat 10,30/10,50, y zoom máximo 17;
  - cada archivo ≤ 90 MB; si se pasa, rehacerlo con zoom máximo 16 y anotarlo;
  - sobre el mapa, las cubiertas caen sobre techos del barrio Crespo (punto PLM `1.1.1`, en −75,5173 / 10,4448). Si no caen, probar EPSG:3116 o 9377 y documentar cuál sirvió.
- [ ] Commit `feat: cubiertas y mapa de calor de fibras en PMTiles`.

### Task 4: Catálogo de capas, fuentes y mapas de calor

**Files:** `src/config/capas.ts`, `src/config/privacidad.ts`, `src/mapa/fuentes.ts`, `src/mapa/calor.ts`, `tests/capas.test.ts`.

**Interfaces:**
```ts
export type TipoCapa = 'coropleta'|'linea'|'muestras'|'contorno'|'raster-pmtiles';
export interface Capa { id: string; titulo: string; grupo: 'Contexto territorial'|'Muestreo ambiental'|'Análisis espacial';
  tipo: TipoCapa; url: string; visible: boolean; color: string; campoPeso?: string; unidad?: string;
  campos?: Record<string,string>; descripcion: string; }
export const CAPAS: Capa[];
export function capasPublicas(publicarPuntos: boolean): Capa[];
export function estiloCalor(campoPeso: string, maximo: number): Record<string, unknown>;
export async function agregarCapas(map: maplibregl.Map, capas: Capa[]): Promise<{ disponibles: string[]; faltantes: string[] }>;
```
- [ ] Catálogo:

| id | Título | Detalle |
|---|---|---|
| `barrios` | Densidad de tubería AC por barrio | Coropleta de `Densidad_k` con cortes 0, 3.3, 6.6, 9.8 y 13 |
| `tuberia` | Tubería de asbesto-cemento | |
| `cubiertas` | Cubiertas de asbesto-cemento | ráster |
| `calor_fibras` | Liberación potencial de fibras desde cubiertas | ráster |
| `mcv` | Polvo superficial (microvac) | `Strucutres`, en s/cm² |
| `plm` | Materiales (PLM) | `Volume____` |
| `aire` | Aire | `Strucutres`; unidad por confirmar, se muestra "estructuras" |
| `agua_teja`, `agua_grifo`, `agua_tanque` | Agua | `Concentrat` |
| `limites` | Límites | |

- [ ] Pruebas que fallan:
  - `capasPublicas(true)` incluye `mcv-calor` visible y `mcv-puntos` oculto;
  - `capasPublicas(false)` no tiene ningún `-puntos`;
  - `estiloCalor('Strucutres', 1240000)['heatmap-radius']` termina en `16, 40`;
  - con `fetch` simulado devolviendo 404, `agregarCapas` deja `cubiertas` en `faltantes` sin lanzar error.
- [ ] Implementar. Para las PMTiles: `maplibregl.addProtocol('pmtiles', new Protocol().tile)` una sola vez, y un HEAD previo para cada una.
- [ ] Commit `feat: catálogo de capas`.

### Task 5: Interfaz del compañero con lista de capas, leyenda, pestañas y popups

**Files:** `src/ui/encabezado.ts`, `ui/pestanas.ts`, `ui/lista-capas.ts`, `ui/leyenda.ts`, `ui/popup.ts`, `src/estilos/encabezado.css`, `panel.css`, `tests/ui.test.ts`, `tests/popup.test.ts`.

- [ ] Pruebas que fallan:
  - **Pestañas:** las flechas izquierda/derecha cambian `aria-selected` y el foco; cada pestaña tiene `aria-controls`.
  - **Lista de capas:** agrupada por `grupo`; una capa faltante sale deshabilitada con "no disponible"; el checkbox llama a `setLayoutProperty`; el deslizador de opacidad llama a `setPaintProperty`.
  - **Leyenda:** muestra solo las capas activas, en el mismo orden que la lista.
  - **Popup:** `htmlPopup({Asbestos__:'Chrysotile', Strucutres:1240000, Polyline_2:' ', Neighborho:'<b>x'}, campos)` contiene "Tipo de asbesto" y "1.240.000 s/cm²", omite el campo vacío y escapa `<b>`.
- [ ] Implementar sobre el HTML/CSS del traspaso, que se copia literal. Las capas de calor no tienen popup. Si se hace clic donde no hay entidad, el panel de información muestra "Haga clic sobre una entidad del mapa para consultar sus datos.".
- [ ] Commit `feat: interfaz base con capas, leyenda y popups`.

### Task 6: Buscador, panel por barrio, medición, compartir y exportar

**Files:** `ui/busqueda.ts`, `ui/panel-barrio.ts`, `ui/medicion.ts`, `mapa/estado-url.ts`, `mapa/exportar.ts`, `tests/barrio.test.ts`, `tests/estado-url.test.ts`.

**Interfaces:**
- `buscarBarrio(q, nombres): string[]`: sin tildes, máximo 8.
- `resumenBarrio(nombre, barrios, muestras)`: devuelve `{ personas, viviendas, kmTuberia, densidad, muestras: Record<tipo,{total,positivas}> }`.
- `medir(coords, modo)`: devuelve texto.
- `codificarEstado({lon,lat,zoom,capas}): string` y `decodificarEstado(hash)`.
- [ ] Pruebas que fallan:
  - `buscarBarrio('olaya', …)` encuentra "OLAYA HERRERA";
  - una muestra es positiva si `Asbestos__` no está en `['None Detected','NAO','']`;
  - el cuadrado de 100 m mide "10.000 m²";
  - `decodificarEstado(codificarEstado(x))` devuelve `x`;
  - un hash corrupto devuelve `null`.
- [ ] Implementar:
  - **Compartir** (ícono blanco en el bloque azul): copia la URL con `#@lon,lat,z/capas` y avisa con un toast "Enlace copiado".
  - **Exportar:** guarda un PNG del mapa con la leyenda y la atribución dibujadas en el lienzo. Requiere `preserveDrawingBuffer: true` al exportar; el nombre del archivo es `geovisor-asbesto-AAAAMMDD.png`.
  - **Nominatim:** solo si no hay coincidencia local, con `User-Agent` implícito del navegador y `email` del proyecto en la consulta.
- [ ] Commit `feat: búsqueda, indicadores, medición, compartir y exportar`.

### Task 7: Presentación y animaciones (la parte "ganadora")

**Files:** `ui/bienvenida.ts`, `ui/recorrido.ts`, `config/recorrido.ts`, `ui/contador.ts`, `ui/movimiento.ts`, `ui/acerca.ts`, `src/estilos/animaciones.css`, `tests/movimiento.test.ts`, `tests/recorrido.test.ts`.

Principio: cada animación orienta al usuario. Nada decorativo que contradiga la regla "sobrio, institucional".

- [ ] **Entrada:** el mapa arranca en la vista de Bolívar y hace `flyTo` a Cartagena (1.800 ms, inclinación 35°). Al mismo tiempo, las rayas del encabezado se dibujan de izquierda a derecha (`background-position`, 600 ms) y el panel entra desde la izquierda (300 ms).
- [ ] **Bienvenida** (primera visita, con try/catch en `localStorage`):
  - título del proyecto y una línea de propósito;
  - cuatro cifras con contador animado de 0 al valor en 900 ms, calculadas desde los datos: muestras analizadas, barrios estudiados, km de tubería AC y km² de cubierta AC (8.164.312 px × 1,44 m²);
  - botones "Explorar el mapa" y "Ver recorrido".
- [ ] **Recorrido guiado** de 6 paradas, en `config/recorrido.ts`:
  1. contexto de Cartagena;
  2. cubiertas de asbesto-cemento;
  3. liberación potencial de fibras;
  4. polvo superficial (MCV);
  5. tubería de asbesto-cemento por barrio;
  6. el siguiente paso: posdesastre, con la propuesta 2026.
  Cada parada define `centro`, `zoom`, `inclinacion`, `capasVisibles` y un texto de 40 palabras o menos. Navegación con anterior y siguiente, teclado (← → Esc) y barra de progreso.
- [ ] **Microinteracciones:**
  - fundido de 300 ms al encender o apagar una capa, con transición de `*-opacity`;
  - la leyenda se despliega con `grid-template-rows` y la altura animada;
  - popup con entrada de 150 ms;
  - hover en filas de la lista con una barra acento de 3 px a la izquierda;
  - el panel por barrio sube desde abajo.
- [ ] **Acerca del geovisor:** objetivo, metodología (PLM, TEM/ASTM D5755, teledetección multiespectral e hiperespectral), fuentes de datos, licencia (MIT para el código y CC BY 4.0 para los datos), cita sugerida y vínculo a la producción científica del proyecto (la lista del formulario SIGP 142806).
- [ ] **Metadatos para compartir:** `public/og.png` de 1200×630, capturado del propio visor, y etiquetas `og:` y `twitter:`.
- [ ] Pruebas que fallan:
  - `duracion(600)` devuelve 0 cuando `matchMedia('(prefers-reduced-motion: reduce)')` es verdadero;
  - `contador` llega exactamente al valor final y lo formatea en es-CO;
  - el recorrido no pasa de la parada 6 ni baja de la 1, y Esc lo cierra y restaura las capas que el usuario tenía antes.
- [ ] Commit `feat: bienvenida, recorrido guiado y animaciones`.

### Task 8: Auditoría escrita y README

**Files:** `docs/AUDITORIA_VERSION_NETLIFY.md`, `README.md`, copia del plan en `docs/superpowers/plans/`.

- [ ] La auditoría (sección de arriba) incluye una tabla "Conservado / Corregido / Agregado" con la referencia a cada archivo.
- [ ] El README explica qué es, la URL pública, las fuentes, cómo regenerar los datos (Tasks 2 y 3), el desarrollo local con `npm run dev` y que el despliegue es automático con cada push a `main`.
- [ ] Commit `docs: auditoría y README`.

### Task 9: Verificación final y publicación

- [ ] `npx vitest run` en verde y `npm run build` sin errores.
- [ ] `npm run dev` revisado con el navegador integrado:
  - consola sin errores;
  - entrada animada y bienvenida;
  - recorrido completo de 6 paradas;
  - cada capa enciende y apaga con fundido;
  - popups correctos;
  - compartir genera un enlace que reproduce la vista;
  - el PNG exportado se descarga;
  - en zoom 17 el calor de muestras no deja ver puntos nítidos;
  - modo reducido de movimiento emulado sin animaciones;
  - a 375 px, sin scroll horizontal.
- [ ] Push a `main`, esperar el despliegue de Vercel y comprobar `curl -I -H "Range: bytes=0-99" https://<url>/tiles/cubiertas.pmtiles`, que debe devolver `206`.
- [ ] Capturas de escritorio y móvil, más un GIF corto del recorrido, en `05-contratos/Minciencias_Salud_Desastre_2026/10_GEOVISOR_FUENTES/evidencias/` para el anexo de la propuesta.
- [ ] Actualizar la memoria `minciencias-macroproyecto-sismo-2026` con la URL pública y el repo.

## Verificación end-to-end

Corresponde a la Task 9: pruebas unitarias, build, recorrido manual con el navegador integrado (escritorio y 375 px), la prueba de rango 206 en producción y la comparación lado a lado con el visor ArcGIS mientras siga en línea.

## Pendientes de confirmar (no bloquean)

- La unidad de las muestras de aire: s/L o s/cc.
- Si se muestra un umbral de referencia de 1000 s/cm² para el polvo superficial.
- Si el nombre "Polvo superficial (microvac)" es correcto para la capa "MCV".
