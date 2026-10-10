"""Empaqueta tmp/<nombre>_xyz/ (gdal2tiles --xyz) o tmp/<nombre>.mbtiles en public/tiles/<nombre>.pmtiles."""
import math
import sqlite3
import sys
from pathlib import Path

from pmtiles.convert import mbtiles_to_pmtiles
from pmtiles.reader import MmapSource, Reader
from pmtiles.tile import Compression, TileType, zxy_to_tileid
from pmtiles.writer import Writer

raiz = Path(__file__).resolve().parent.parent


def lon(x, z):
    return x / 2**z * 360 - 180


def lat(y, z):
    return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / 2**z))))


def desde_xyz(carpeta: Path, destino: Path):
    teselas = []
    for p in carpeta.glob("*/*/*.png"):
        z, x, y = int(p.parent.parent.name), int(p.parent.name), int(p.stem)
        teselas.append((zxy_to_tileid(z, x, y), z, x, y, p))
    teselas.sort()
    zmin = min(t[1] for t in teselas)
    zmax = max(t[1] for t in teselas)
    tope = [t for t in teselas if t[1] == zmax]
    x0, x1 = min(t[2] for t in tope), max(t[2] for t in tope) + 1
    y0, y1 = min(t[3] for t in tope), max(t[3] for t in tope) + 1
    with open(destino, "wb") as f:
        w = Writer(f)
        for tid, *_, p in teselas:
            w.write_tile(tid, p.read_bytes())
        w.finalize(
            {
                "tile_type": TileType.PNG,
                "tile_compression": Compression.NONE,
                "min_zoom": zmin,
                "max_zoom": zmax,
                "min_lon_e7": int(lon(x0, zmax) * 1e7),
                "max_lon_e7": int(lon(x1, zmax) * 1e7),
                "min_lat_e7": int(lat(y1, zmax) * 1e7),
                "max_lat_e7": int(lat(y0, zmax) * 1e7),
                "center_zoom": zmin + 2,
                "center_lon_e7": int((lon(x0, zmax) + lon(x1, zmax)) / 2 * 1e7),
                "center_lat_e7": int((lat(y0, zmax) + lat(y1, zmax)) / 2 * 1e7),
            },
            {"name": destino.stem, "attribution": "Universidad de Cartagena · FUNDCLAS"},
        )


for nombre in sys.argv[1:] or ["cubiertas", "calor_fibras"]:
    destino = raiz / "public" / "tiles" / f"{nombre}.pmtiles"
    xyz = raiz / "tmp" / f"{nombre}_xyz"
    if xyz.is_dir():
        desde_xyz(xyz, destino)
    else:
        origen = raiz / "tmp" / f"{nombre}.mbtiles"
        with sqlite3.connect(origen) as db:
            zmax = db.execute("select max(zoom_level) from tiles").fetchone()[0]
        mbtiles_to_pmtiles(str(origen), str(destino), zmax)
    with open(destino, "rb") as f:
        cab = Reader(MmapSource(f)).header()
    print(
        f"{destino.name}: {destino.stat().st_size / 1e6:.1f} MB, z{cab['min_zoom']}-{cab['max_zoom']}, "
        f"lon {cab['min_lon_e7'] / 1e7:.4f}..{cab['max_lon_e7'] / 1e7:.4f}, "
        f"lat {cab['min_lat_e7'] / 1e7:.4f}..{cab['max_lat_e7'] / 1e7:.4f}, teselas {cab['addressed_tiles_count']}"
    )
