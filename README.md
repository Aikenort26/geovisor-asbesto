# Geovisor Asbesto · Cartagena de Indias

Visor web público y de código abierto con la información georreferenciada del proyecto **BPIN 2020000100366**, *Formulación de una estrategia integral para reducir el impacto sobre la salud pública y ambiental por la presencia de asbesto en el territorio del Departamento de Bolívar*. Lo ejecutaron la Universidad de Cartagena y la Fundación Colombia Libre de Asbesto (FUNDCLAS).

Contiene las siguientes capas:
- cubiertas de asbesto-cemento identificadas por teledetección (1,2 m);
- liberación potencial de fibras;
- polvo superficial (ASTM D5755, TEM);
- materiales (PLM);
- aire;
- agua de escorrentía de techos, de grifo y de tanque;
- red de acueducto en asbesto-cemento con su densidad por barrio.

Reemplaza el geovisor de ArcGIS Online y conserva la interfaz diseñada por el equipo (ver [docs/AUDITORIA_VERSION_NETLIFY.md](docs/AUDITORIA_VERSION_NETLIFY.md)).

## Tecnología

- **Visor:** Vite + TypeScript + [MapLibre GL JS](https://maplibre.org/), sin backend.
- **Ráster:** teselas [PMTiles](https://protomaps.com/docs/pmtiles) servidas como archivos estáticos.
- **Mapas base:** OpenFreeMap, OpenStreetMap y Esri World Imagery, todos sin clave.
- **Despliegue:** en Vercel; cada push a `main` publica una nueva versión.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas unitarias (Vitest)
npm run build      # verificación de tipos y build de producción
```

## Regenerar los datos

1. **Capas vectoriales** desde el servicio público de ArcGIS:
   ```bash
   npm run datos
   ```
   El script verifica que cada capa tenga el número de entidades esperado (`scripts/capas-fuente.json`) y repara los textos con caracteres rotos.
2. **Barrios** desde el shapefile, con Docker:
   ```bash
   FUENTES=/ruta/INFO_GEOVISOR/CAPAS sh scripts/shp-a-geojson.sh
   ```
3. **Ráster** (cubiertas y mapa de calor) desde los GeoTIFF de ArcGIS Pro (UTM 18N, 1,2 m), con Docker:
   ```bash
   FUENTES=/ruta/INFO_GEOVISOR/CAPAS sh scripts/raster-a-pmtiles.sh
   uvx --from pmtiles pmtiles-convert tmp/cubiertas.mbtiles public/tiles/cubiertas.pmtiles
   uvx --from pmtiles pmtiles-convert tmp/calor_fibras.mbtiles public/tiles/calor_fibras.pmtiles
   ```
   Las rampas de color están en `scripts/paletas/`.

Los GeoTIFF originales (1,5 GB) no se versionan. Se conservan en el expediente del proyecto.

## Privacidad

Los participantes firmaron consentimiento informado para el uso de su información en el proyecto. Aun así, el visor presenta las muestras como mapas de calor, que se ocultan sobre el zoom 16 para no señalar viviendas. Los puntos originales están disponibles pero apagados. Para quitarlos del sitio publicado, se cambia `PUBLICAR_PUNTOS` a `false` en `src/config/privacidad.ts`.

## Licencia

- **Código:** MIT.
- **Datos:** CC BY 4.0. Citar como: Universidad de Cartagena y FUNDCLAS, *Geovisor Asbesto Cartagena*, Proyecto BPIN 2020000100366.
