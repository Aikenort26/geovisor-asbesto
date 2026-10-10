#!/bin/sh
# Convierte los GeoTIFF de ArcGIS Pro (UTM 18N, 1,2 m) en teselas ráster coloreadas (MBTiles).
# Uso:  FUENTES=<carpeta INFO_GEOVISOR/CAPAS> sh scripts/raster-a-pmtiles.sh
# Corre dentro de ghcr.io/osgeo/gdal; luego `pmtiles-convert` pasa cada .mbtiles a .pmtiles.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)
mkdir -p "$REPO/tmp"
MSYS_NO_PATHCONV=1 docker run --rm -v "$FUENTES":/f:ro -v "$REPO":/r ghcr.io/osgeo/gdal:ubuntu-small-3.10.0 sh -euc '
  # SQLite (MBTiles) es muy lento sobre volúmenes montados de Windows: se trabaja en /tmp del contenedor.
  mkdir -p /w && cd /w
  W="-q -overwrite -t_srs EPSG:3857 -multi -wo NUM_THREADS=ALL_CPUS -co TILED=YES -co COMPRESS=DEFLATE"

  # Cubiertas: clasificación 0/1 → rojo ladrillo, 0 transparente
  gdalwarp $W -r near -ot Byte -dstnodata 0 /f/RASTERS/CUBIERTAS_ASBESTO/CUBIERTAS_ASBESTO.tif cub_3857.tif
  gdaldem color-relief -q -alpha -nearest_color_entry cub_3857.tif /r/scripts/paletas/cubiertas.txt cub_rgba.tif -co TILED=YES -co COMPRESS=DEFLATE
  rm -f cubiertas.mbtiles
  gdal_translate -q -of MBTILES -co TILE_FORMAT=PNG8 -co DITHER=NO -co ZOOM_LEVEL_STRATEGY=UPPER cub_rgba.tif cubiertas.mbtiles
  gdaladdo -q -r average cubiertas.mbtiles

  # Mapa de calor de liberación de fibras: entero, NoData = 2147483647
  gdalwarp $W -r bilinear -srcnodata 2147483647 -dstnodata 2147483647 /f/RASTERS/MAPA_CALOR_LIBERACI*/MAPA_CALOR_ASBESTO.tif cal_3857.tif
  gdaldem color-relief -q -alpha cal_3857.tif /r/scripts/paletas/calor.txt cal_rgba.tif -co TILED=YES -co COMPRESS=DEFLATE
  rm -f calor_fibras.mbtiles
  gdal_translate -q -of MBTILES -co TILE_FORMAT=PNG8 -co DITHER=NO -co ZOOM_LEVEL_STRATEGY=LOWER cal_rgba.tif calor_fibras.mbtiles
  gdaladdo -q -r average calor_fibras.mbtiles
  cp cubiertas.mbtiles calor_fibras.mbtiles /r/tmp/
  ls -la /r/tmp/*.mbtiles
'
