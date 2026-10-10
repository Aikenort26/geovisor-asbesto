#!/bin/sh
# Barrios (shapefile Web Mercator) → GeoJSON EPSG:4326. Simplifica el límite departamental (4,4 MB).
# Uso:  FUENTES=<carpeta INFO_GEOVISOR/CAPAS> sh scripts/shp-a-geojson.sh
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)
MSYS_NO_PATHCONV=1 docker run --rm -v "$FUENTES":/f:ro -v "$REPO":/r ghcr.io/osgeo/gdal:ubuntu-small-3.10.0 sh -euc '
  cd /r/public/data
  rm -f barrios.geojson
  ogr2ogr -f GeoJSON -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6 -lco RFC7946=YES \
    barrios.geojson /f/SHP/DENSIDAD_DE_TUBERIAS_DE_ASBESTO_POR_BARRIO/Densidad_Tuberias_Barrio.shp
  ogr2ogr -f GeoJSON -simplify 0.0005 -lco COORDINATE_PRECISION=5 -lco RFC7946=YES limite_dep_s.geojson limite_departamento.geojson
  mv limite_dep_s.geojson limite_departamento.geojson
  ls -la barrios.geojson limite_departamento.geojson
'
