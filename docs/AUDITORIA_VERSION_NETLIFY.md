# Auditoría de la versión Netlify del geovisor

**Versión revisada:** https://geovisor-asbesto-ctg.netlify.app/ y el traspaso `geovisor-asbesto-traspaso.xml` (etapa 1 de 7, 2026-10-10).
**Resultado:** se conserva la interfaz (encabezado "fibras", panel con pestañas, tokens y textos) y se reemplaza el motor y la publicación.

## Estado encontrado

La versión publicada es la etapa 1:
- tiene encabezado, pestañas "Capas de información" y "Leyenda" y el mapa base con controles;
- las dos pestañas muestran solo los textos de relleno ("Aquí aparecerán las capas del geovisor", "La leyenda se mostrará según las capas activas");
- no hay datos, capas, búsqueda, compartir ni exportar.

## Conservado, corregido y agregado

| Aspecto | Prototipo (Leaflet / Netlify) | Esta versión | Dónde |
|---|---|---|---|
| Encabezado "fibras" | Rayas, título, "Sistema de Información Geográfica" y bloque azul de 120 px vacío | **Conservado** literal. El bloque azul ahora tiene Acerca, Compartir y Exportar con íconos blancos | `index.html`, `src/estilos/encabezado.css` |
| Tokens de diseño | `--fondo`, `--rayas`, `--linea`, `--texto`, `--texto-suave`, `--acento`, `--panel` | **Conservados** con los mismos nombres y valores | `src/estilos/tokens.css`, `src/config/tema.ts` |
| Textos de interfaz | "Capas de información", "Leyenda", "Buscar dirección o lugar", etc. | **Conservados** | `index.html`, `src/ui/*` |
| Vista móvil | Columna invertida con el panel abajo | **Conservada** y ajustada (panel al 40 %, buscador a todo el ancho) | `src/estilos/panel.css`, `mapa.css` |
| Vista inicial | Botón con el carácter ⌂, que cambia según el sistema | **Corregido**: ícono SVG | `src/mapa/controles.ts` |
| Pestañas | Solo clic; sin `aria-controls` ni manejo con teclado | **Corregido**: patrón ARIA tabs con flechas, Inicio y Fin | `src/ui/pestanas.ts` |
| Datos | Ninguno; quedaba pendiente el formato | **Agregado**: 9 capas vectoriales descargadas del servicio público de ArcGIS y el shapefile de barrios | `scripts/descargar-arcgis.mjs`, `scripts/shp-a-geojson.sh` |
| Texto con caracteres rotos | — | **Agregado**: reparación automática de UTF-8 leído como latin1 (por ejemplo, "Agua caída de teja") | `scripts/reparar-texto.mjs` |
| Mapa de calor | Previsto con Leaflet.heat (CPU, saltos al hacer zoom) | **Reemplazado** por el heatmap de MapLibre (GPU), en escala logarítmica, con la rampa violeta→amarillo y oculto sobre z16 para no señalar viviendas | `src/mapa/calor.ts` |
| Ráster de 1,2 m (738 y 777 MB) | Previsto con georaster-layer-for-leaflet, inviable en el navegador | **Reemplazado** por teselas PMTiles generadas con GDAL; el navegador pide solo las teselas visibles | `scripts/raster-a-pmtiles.sh` |
| Capa ausente | — | **Agregado**: si falta un archivo de teselas, la capa se marca "no disponible" y el resto del visor funciona | `src/mapa/fuentes.ts` |
| Buscador | Previsto con Nominatim | **Agregado**: primero busca barrios en los datos locales y luego Nominatim (límite de 1 consulta/s, caja de Cartagena) | `src/ui/busqueda.ts` |
| Compartir / Exportar | Bloque vacío | **Agregado**: enlace con vista y capas; PNG con cabecera, leyenda y atribución | `src/mapa/estado-url.ts`, `src/mapa/exportar.ts` |
| Mapa base CARTO | Pedía clave ("API KEY REQUIRED") | **Corregido**: OpenFreeMap (claro, sin clave), OpenStreetMap y Esri | `src/mapa/controles.ts` |
| Apertura con doble clic (`file://`) | Bloqueaba las teselas de OSM | **Corregido**: servidor de Vite en desarrollo y Vercel en producción | `vite.config.ts`, `vercel.json` |
| Pruebas | Solo validación de sintaxis | **Agregado**: 27 pruebas unitarias (Vitest) | `tests/` |
| Publicación | Netlify Drop manual, sin historial | **Reemplazado** por GitHub + Vercel con despliegue automático en cada push a `main` | `vercel.json` |
| Presentación | — | **Agregado**: entrada animada, bienvenida con cifras, recorrido guiado de 6 paradas, panel de indicadores por barrio, medición, fundidos de capas; todo respeta `prefers-reduced-motion` | `src/ui/bienvenida.ts`, `recorrido.ts`, `panel-barrio.ts`, `src/estilos/animaciones.css` |

## Pendientes heredados del traspaso

- **Umbral de 1000 s/cm²:** no se muestra hasta que lo confirme el higienista.
- **Publicación de los datos:** el usuario la confirmó (los participantes firmaron consentimiento informado). Aun así, las muestras se presentan por defecto como mapa de calor y los puntos quedan apagados (`PUBLICAR_PUNTOS` en `src/config/privacidad.ts`).
- **Unidades por confirmar:** las de aire (sin unidad en los datos) y las de agua (se muestran como MFL, millones de fibras por litro).
