<div align="center">

<img src="docs/img/logo.svg" width="120" alt="Logo del Geovisor Asbesto: cubierta ondulada sobre la trama de barrios y un foco de calor">

# Geovisor Asbesto · Cartagena de Indias

**Visor web público y de código abierto sobre la presencia de asbesto en el entorno urbano de Cartagena**
Proyecto **BPIN 2020000100366** · Universidad de Cartagena · FUNDCLAS

[![Abrir el geovisor](https://img.shields.io/badge/Abrir_el_geovisor-geovisor--asbesto.vercel.app-2f5877?style=for-the-badge&logo=googlemaps&logoColor=white)](https://geovisor-asbesto.vercel.app)

[![Visitas](https://hits.sh/github.com/Aikenort26/geovisor-asbesto.svg?label=visitas&color=2f5877&labelColor=14283a)](https://hits.sh/github.com/Aikenort26/geovisor-asbesto/)
[![Estrellas](https://img.shields.io/github/stars/Aikenort26/geovisor-asbesto?style=flat&label=estrellas&color=fde725&labelColor=14283a&logo=github)](https://github.com/Aikenort26/geovisor-asbesto/stargazers)
[![Descargas](https://img.shields.io/github/downloads/Aikenort26/geovisor-asbesto/total?label=descargas&color=5ec962&labelColor=14283a)](https://github.com/Aikenort26/geovisor-asbesto/releases)
[![Versión](https://img.shields.io/github/v/release/Aikenort26/geovisor-asbesto?label=versi%C3%B3n&color=21918c&labelColor=14283a)](https://github.com/Aikenort26/geovisor-asbesto/releases/latest)
[![Despliegue](https://img.shields.io/github/deployments/Aikenort26/geovisor-asbesto/production?label=vercel&logo=vercel&labelColor=14283a)](https://geovisor-asbesto.vercel.app)
[![Último cambio](https://img.shields.io/github/last-commit/Aikenort26/geovisor-asbesto?label=%C3%BAltimo%20cambio&color=8499ab&labelColor=14283a)](https://github.com/Aikenort26/geovisor-asbesto/commits/main)

[![MapLibre](https://img.shields.io/badge/MapLibre_GL-5-396CB2?logo=maplibre&logoColor=white)](https://maplibre.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PMTiles](https://img.shields.io/badge/PMTiles-teselas_r%C3%A1ster-21918c)](https://protomaps.com/docs/pmtiles)
[![Pruebas](https://img.shields.io/badge/pruebas-27_en_verde-5ec962?logo=vitest&logoColor=white)](tests/)
[![Código MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-14283a)](LICENSE)
[![Datos CC BY 4.0](https://img.shields.io/badge/datos-CC_BY_4.0-14283a)](LICENSE)

</div>

---

<table>
<tr>
<td width="50%"><img src="docs/img/vista-cubiertas-polvo.jpg" alt="Cubiertas de asbesto-cemento en rojo sobre la densidad de tubería por barrio, con el mapa de calor del polvo superficial"></td>
<td width="50%"><img src="docs/img/vista-calor-fibras.jpg" alt="Superficie de liberación potencial de fibras desde cubiertas, de violeta a amarillo"></td>
</tr>
<tr>
<td align="center"><sub><b>Cubiertas de asbesto-cemento</b> (1,2 m), densidad de tubería AC por barrio y polvo superficial</sub></td>
<td align="center"><sub><b>Liberación potencial de fibras</b> desde cubiertas</sub></td>
</tr>
</table>

## En cifras

<img src="docs/img/panel-datos.svg" width="100%" alt="Panel de cifras: 514 muestras ambientales (335 con asbesto), 189 barrios, 255 km de tubería de asbesto-cemento, 11,8 km² de cubiertas; muestras con asbesto por tipo, distribución de la densidad de tubería por barrio, estructuras de asbesto en polvo superficial y tipos de asbesto identificados">

<details>
<summary><b>Tabla: muestras con asbesto detectado por tipo</b></summary>

| Tipo de muestra | Analizadas | Con asbesto | % |
|---|---:|---:|---:|
| Materiales de construcción (PLM) | 232 | 203 | 87,5 |
| Agua de escorrentía de techos | 40 | 34 | 85,0 |
| Polvo superficial (microvac, TEM) | 114 | 82 | 71,9 |
| Agua de tanque | 28 | 8 | 28,6 |
| Agua de grifo | 64 | 7 | 10,9 |
| Aire (TEM) | 36 | 1 | 2,8 |

Una muestra cuenta como positiva cuando el análisis identificó algún tipo de asbesto (crisotilo, crocidolita, amosita, antofilita). El panel se regenera con `python scripts/graficas-readme.py` a partir de `public/data/`.

</details>

## Recorrido guiado

<img src="docs/img/recorrido-guiado.jpg" width="100%" alt="Recorrido guiado del geovisor, parada 2 de 6: cubiertas de asbesto-cemento en rojo sobre el mapa de Cartagena, con la tarjeta explicativa y los botones Anterior y Siguiente">

Seis paradas animadas cuentan el estudio de principio a fin:
1. el contexto de Cartagena;
2. las cubiertas de asbesto-cemento;
3. la liberación potencial de fibras;
4. el polvo superficial en viviendas;
5. la red de acueducto;
6. el paso siguiente, hacia los territorios posdesastre.

En cada parada el mapa vuela, se inclina y enciende las capas que corresponden. Se navega con los botones o con las flechas del teclado.

## Funciones

- **Capas:** cubiertas de asbesto-cemento (teledetección y aprendizaje automático, 1,2 m), liberación potencial de fibras, polvo superficial, materiales, aire, tres tipos de agua y la red de acueducto en asbesto-cemento con su densidad por barrio.
- **Privacidad:** las muestras se ven como mapas de calor, que se ocultan sobre el zoom 16 para no señalar viviendas. Los puntos originales están disponibles, pero apagados.
- **Recorrido guiado** de 6 paradas, **panel de indicadores por barrio**, buscador de barrios y direcciones, medición de distancias y áreas.
- **Compartir** la vista con sus capas y **exportar** un PNG con cabecera, leyenda y atribución.
- Mapas base claro, calles y satélite, todos sin clave de API. Interfaz adaptada a celular y respetuosa de `prefers-reduced-motion`.

## Cómo funciona

```mermaid
%%{init: {"theme": "dark", "themeVariables": {"background": "#0d1117", "primaryColor": "#161b22", "primaryBorderColor": "#30363d", "primaryTextColor": "#e6edf3", "lineColor": "#7d8590", "clusterBkg": "#0d1117", "clusterBorder": "#30363d", "fontFamily": "Segoe UI, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    subgraph Fuentes
        A1[ArcGIS Online<br/>servicio público]
        A2[Shapefile de barrios]
        A3[GeoTIFF ArcGIS Pro<br/>UTM 18N · 1,2 m]
    end
    subgraph Procesamiento
        B1[descargar-arcgis.mjs<br/>GeoJSON + reparación de texto]
        B2[ogr2ogr · Docker GDAL]
        B3[gdalwarp · color-relief<br/>gdal2tiles → PMTiles]
    end
    subgraph Visor["Visor estático (Vite + MapLibre)"]
        C1[public/data/*.geojson]
        C2[public/tiles/*.pmtiles]
        C3[Capas · calor · recorrido<br/>panel por barrio]
    end
    A1 --> B1 --> C1
    A2 --> B2 --> C1
    A3 --> B3 --> C2
    C1 --> C3
    C2 --> C3
    C3 --> D[(Vercel / Netlify<br/>despliegue automático)]
    classDef fuente fill:#161b22,stroke:#f0508c,color:#f0508c
    classDef proceso fill:#161b22,stroke:#c66cf5,color:#c66cf5
    classDef visor fill:#161b22,stroke:#58a6ff,color:#58a6ff
    classDef salida fill:#161b22,stroke:#3fb950,color:#3fb950
    class A1,A2,A3 fuente
    class B1,B2,B3 proceso
    class C1,C2,C3 visor
    class D salida
```

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas unitarias (Vitest)
npm run build      # verificación de tipos y build de producción
```

### Regenerar los datos

1. **Capas vectoriales** desde el servicio público de ArcGIS: `npm run datos`. Verifica el número de entidades de cada capa (`scripts/capas-fuente.json`) y repara los textos con caracteres rotos.
2. **Barrios** desde el shapefile: `FUENTES=/ruta/INFO_GEOVISOR/CAPAS sh scripts/shp-a-geojson.sh`.
3. **Ráster** (cubiertas y mapa de calor): `FUENTES=/ruta/INFO_GEOVISOR/CAPAS sh scripts/raster-a-pmtiles.sh` y luego `uv run --with pmtiles python scripts/mbtiles-a-pmtiles.py`. Las rampas de color están en `scripts/paletas/`.

Los GeoTIFF originales (1,5 GB) no se versionan.

## Despliegue

- **Vercel:** cada push a `main` publica una nueva versión.
- **Netlify:** espejo en [geovisor-asbesto-ctg.netlify.app](https://geovisor-asbesto-ctg.netlify.app), vinculado a este repositorio; cada push a `main` lo actualiza. El repositorio trae `netlify.toml` (compilación) y `public/_headers` (lectura por rangos de las teselas).
- **Paquete listo para subir:** en [Releases](https://github.com/Aikenort26/geovisor-asbesto/releases) está el sitio compilado en un `.zip`, para arrastrar a Netlify Drop o a cualquier hosting estático.

## Actividad del repositorio

<a href="https://github.com/Aikenort26/geovisor-asbesto/commits/main">
  <img src="docs/img/actividad.svg" width="100%" alt="Actividad del repositorio: commits y días activos en los últimos 28 días, y commits por tipo (funciones, correcciones, documentación, mantenimiento)">
</a>

La gráfica se regenera con `python scripts/actividad-readme.py` a partir de `git log`.

## Historial de estrellas

<a href="https://star-history.com/#Aikenort26/geovisor-asbesto&Date">
  <img src="https://api.star-history.com/svg?repos=Aikenort26/geovisor-asbesto&type=Date&theme=dark" alt="Historial de estrellas del repositorio" width="600">
</a>

## Licencia y cita

- **Código:** MIT.
- **Datos:** CC BY 4.0.

**Cita sugerida:** Universidad de Cartagena y FUNDCLAS (2026). *Geovisor Asbesto Cartagena* [aplicación web]. Proyecto BPIN 2020000100366. https://geovisor-asbesto.vercel.app

## Descargo de responsabilidad

El software se entrega "tal cual", sin garantía. El autor no responde por modificaciones, bifurcaciones ni redistribuciones de terceros; cada usuario debe revisar y validar el código y los resultados antes de usarlos. Ver [DESCARGO.md](DESCARGO.md).
