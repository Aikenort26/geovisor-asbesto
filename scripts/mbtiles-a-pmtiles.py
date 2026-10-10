"""Convierte tmp/*.mbtiles a public/tiles/*.pmtiles e imprime su resumen."""
import sqlite3
import sys
from pathlib import Path

from pmtiles.convert import mbtiles_to_pmtiles
from pmtiles.reader import MmapSource, Reader

raiz = Path(__file__).resolve().parent.parent
for nombre in sys.argv[1:] or ["cubiertas", "calor_fibras"]:
    origen = raiz / "tmp" / f"{nombre}.mbtiles"
    destino = raiz / "public" / "tiles" / f"{nombre}.pmtiles"
    with sqlite3.connect(origen) as db:
        zmax = db.execute("select max(zoom_level) from tiles").fetchone()[0]
    mbtiles_to_pmtiles(str(origen), str(destino), zmax)
    with open(destino, "rb") as f:
        cab = Reader(MmapSource(f)).header()
    print(f"{destino.name}: {destino.stat().st_size / 1e6:.1f} MB, z{cab['min_zoom']}-{cab['max_zoom']}, "
          f"lon {cab['min_lon_e7'] / 1e7:.4f}..{cab['max_lon_e7'] / 1e7:.4f}, lat {cab['min_lat_e7'] / 1e7:.4f}..{cab['max_lat_e7'] / 1e7:.4f}, "
          f"teselas {cab['addressed_tiles_count']}")
