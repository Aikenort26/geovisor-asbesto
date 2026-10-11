"""Genera docs/img/panel-datos.svg: panel de cifras del geovisor en estilo de tarjetas oscuras.

Uso:  python scripts/graficas-readme.py
Lee public/data/*.geojson; no necesita dependencias.
"""
import json
import math
from collections import Counter
from pathlib import Path
from xml.sax.saxutils import escape

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "public" / "data"
SALIDA = RAIZ / "docs" / "img" / "panel-datos.svg"

FONDO, BORDE, TEXTO, SUAVE = "#0d1117", "#30363d", "#e6edf3", "#7d8590"
ROSA, AZUL, MORADO, NARANJA, VERDE = "#f0508c", "#58a6ff", "#c66cf5", "#ff8a3d", "#3fb950"
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
MONO = "ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace"

TIPOS = [
    ("muestras_plm", "PLM"), ("agua_teja", "Techo"), ("muestras_mcv", "Polvo"),
    ("agua_tanque", "Tanque"), ("agua_grifo", "Grifo"), ("muestras_aire", "Aire"),
]
NOMBRES_ASBESTO = {"Chrysotile": "Crisotilo", "Crocidolite": "Crocidolita", "Amosite": "Amosita",
                   "Anthophyllite": "Antofilita", "All": "Varios"}


def leer(nombre):
    return json.loads((DATOS / f"{nombre}.geojson").read_text(encoding="utf-8"))["features"]


def positiva(p):
    return (p.get("Asbestos__") or "").strip() not in ("", "None Detected", "NAO")


def es(n, d=0):
    return f"{n:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


# ---------- datos ----------
muestras = {etq: leer(arch) for arch, etq in TIPOS}
total = sum(len(v) for v in muestras.values())
barras_tipo = [(etq, sum(positiva(f["properties"]) for f in fs), len(fs)) for etq, fs in muestras.items()]
barrios = leer("barrios")
km = sum(f["properties"]["SUM_SUM_km"] for f in barrios)
habitantes = sum(f["properties"]["PERSONAS"] or 0 for f in barrios)
densidades = [f["properties"]["Densidad_k"] or 0 for f in barrios]
mcv = [f["properties"]["Strucutres"] for f in muestras["Polvo"] if (f["properties"]["Strucutres"] or 0) > 0]
asbestos = Counter(NOMBRES_ASBESTO.get(f["properties"]["Asbestos__"], None)
                   for fs in muestras.values() for f in fs if positiva(f["properties"]))
asbestos.pop(None, None)
KM2_CUBIERTAS = 8164312 * 1.44 / 1e6

# ---------- primitivas ----------
partes = []


def add(s):
    partes.append(s)


def tarjeta(x, y, w, h):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{FONDO}" stroke="{BORDE}"/>')


def texto(x, y, t, color=TEXTO, tam=13, peso=400, fuente=SANS, ancla="start"):
    add(f'<text x="{x}" y="{y}" fill="{color}" font-family="{fuente}" font-size="{tam}" '
        f'font-weight="{peso}" text-anchor="{ancla}">{escape(t)}</text>')


def icono(x, y, color, tipo):
    s = f'fill="none" stroke="{color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
    formas = {
        "cuadros": f'<g fill="{color}"><rect x="{x}" y="{y}" width="5" height="5" rx="1"/><rect x="{x+6.5}" y="{y}" width="5" height="5" rx="1"/><rect x="{x+13}" y="{y}" width="5" height="5" rx="1"/><rect x="{x}" y="{y+6.5}" width="5" height="5" rx="1"/><rect x="{x+6.5}" y="{y+6.5}" width="5" height="5" rx="1"/><rect x="{x+13}" y="{y+6.5}" width="5" height="5" rx="1"/><rect x="{x}" y="{y+13}" width="18" height="5" rx="1"/></g>',
        "circulo": f'<circle cx="{x+9}" cy="{y+9}" r="7.5" {s}/><circle cx="{x+9}" cy="{y+9}" r="1.8" fill="{color}"/>',
        "red": f'<path d="M{x+3} {y+15}L{x+9} {y+4}L{x+15} {y+15}M{x+5} {y+11}h8" {s}/>',
        "techo": f'<path d="M{x+1} {y+10}L{x+9} {y+3}L{x+17} {y+10}M{x+3} {y+15}q2-2.5 4 0t4 0t4 0" {s}/>',
        "polvo": f'<g fill="{color}"><circle cx="{x+4}" cy="{y+12}" r="2"/><circle cx="{x+10}" cy="{y+7}" r="2.4"/><circle cx="{x+15}" cy="{y+13}" r="1.6"/><circle cx="{x+12}" cy="{y+15}" r="1.2"/></g>',
        "lupa": f'<circle cx="{x+8}" cy="{y+8}" r="5.5" {s}/><path d="M{x+12} {y+12}l4.5 4.5" {s}/>',
    }
    add(formas[tipo])


def leyenda(x, y, items):
    for color, t in items:
        add(f'<circle cx="{x+5}" cy="{y - 4}" r="4.5" fill="{color}"/>')
        texto(x + 14, y, t, color, 12)
        x += 22 + len(t) * 6.6


def barras(x, y, w, h, series, colores, etiquetas=None):
    """series: lista de tuplas (valor_inferior, valor_superior) apiladas."""
    n = len(series)
    paso = w / n
    ancho = paso * 0.72
    maximo = max(a + b for a, b in series) or 1
    for i, (a, b) in enumerate(series):
        bx = x + i * paso + (paso - ancho) / 2
        ha, hb = h * a / maximo, h * b / maximo
        add(f'<rect x="{bx:.1f}" y="{y + h - ha:.1f}" width="{ancho:.1f}" height="{ha:.1f}" fill="{colores[0]}"/>')
        if hb:
            add(f'<rect x="{bx:.1f}" y="{y + h - ha - hb:.1f}" width="{ancho:.1f}" height="{hb:.1f}" fill="{colores[1]}"/>')
        if etiquetas:
            texto(bx + ancho / 2, y + h + 13, etiquetas[i], SUAVE, 9.5, fuente=MONO, ancla="middle")


W = 860
add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="400" viewBox="0 0 {W} 400" role="img" '
    f'aria-label="Panel de cifras del Geovisor Asbesto Cartagena">')
add(f'<rect width="{W}" height="400" fill="{FONDO}"/>')

# ---------- fila 1: resumen ----------
tarjeta(8, 8, 844, 50)
icono(24, 24, ROSA, "cuadros")
texto(52, 38, f"{total} muestras ambientales analizadas · {es(sum(p for _, p, _ in barras_tipo))} con asbesto", ROSA, 15, 600)
cx = 600
for etq, pos, n in barras_tipo:
    for k in range(max(1, round(n / total * 34))):
        op = 0.25 + 0.75 * pos / n
        add(f'<rect x="{cx}" y="27" width="6.5" height="6.5" fill="{ROSA}" fill-opacity="{op:.2f}"><title>{etq}: {pos}/{n}</title></rect>')
        cx += 7.5

# ---------- fila 2: indicadores ----------
cw, gap = (844 - 2 * 12) / 3, 12
kpis = [
    (AZUL, f"{len(barrios)} barrios caracterizados", f"{es(habitantes)} habitantes", "↑", "población cubierta"),
    (MORADO, f"{es(km, 0)} km de tubería AC", f"densidad máx. {es(max(densidades), 1)} km/km²", "→", "red de acueducto"),
    (NARANJA, f"{es(KM2_CUBIERTAS, 1)} km² de cubiertas AC", "8.164.312 píxeles a 1,2 m", "↑", "teledetección"),
]
for i, (color, titulo, sub, flecha, nota) in enumerate(kpis):
    x = 8 + i * (cw + gap)
    tarjeta(x, 68, cw, 80)
    texto(x + 16, 94, titulo, color, 15, 600)
    texto(x + 16, 116, sub, SUAVE, 12, fuente=MONO)
    texto(x + 16, 135, f"{flecha} {nota}", VERDE if flecha == "↑" else SUAVE, 12, fuente=MONO)

# ---------- fila 3: gráficas ----------
y3, h3 = 158, 166
# a) muestras por tipo (apiladas)
x = 8
tarjeta(x, y3, cw, h3)
icono(x + 14, y3 + 16, AZUL, "circulo")
texto(x + 40, y3 + 30, "Muestras por tipo", AZUL, 15, 600)
leyenda(x + 16, y3 + 52, [(AZUL, "Con asbesto"), ("#3b5ba5", "Sin asbesto")])
barras(x + 10, y3 + 62, cw - 20, 80, [(p, n - p) for _, p, n in barras_tipo], (AZUL, "#3b5ba5"),
       [e for e, _, _ in barras_tipo])
# b) densidad de tubería por barrio
x = 8 + cw + gap
tarjeta(x, y3, cw, h3)
icono(x + 14, y3 + 16, MORADO, "red")
texto(x + 40, y3 + 30, "Tubería AC por barrio", MORADO, 15, 600)
leyenda(x + 16, y3 + 52, [(MORADO, "Barrios según km de tubería AC por km²")])
bins = [0] * 20
for d in densidades:
    bins[min(19, int(d // 2))] += 1
barras(x + 10, y3 + 62, cw - 20, 80, [(0, b) for b in bins], ("#7c5cd6", MORADO))
texto(x + 14, y3 + h3 - 8, "0", SUAVE, 10, fuente=MONO)
texto(x + cw - 14, y3 + h3 - 8, "38 km/km²", SUAVE, 10, fuente=MONO, ancla="end")
# c) polvo superficial (escala logarítmica)
x = 8 + 2 * (cw + gap)
tarjeta(x, y3, cw, h3)
icono(x + 14, y3 + 16, NARANJA, "polvo")
texto(x + 40, y3 + 30, "Polvo superficial", NARANJA, 15, 600)
leyenda(x + 16, y3 + 52, [(NARANJA, "Muestras según estructuras de asbesto")])
logs = [math.log10(v) for v in mcv]
lo, hi = math.floor(min(logs)), math.ceil(max(logs))
nb = 24
bins = [0] * nb
for v in logs:
    bins[min(nb - 1, int((v - lo) / (hi - lo) * nb))] += 1
barras(x + 10, y3 + 62, cw - 20, 80, [(b, 0) for b in bins], (NARANJA, NARANJA))
SUP = str.maketrans("0123456789-", "⁰¹²³⁴⁵⁶⁷⁸⁹⁻")
texto(x + 14, y3 + h3 - 8, f"10{str(lo).translate(SUP)}", SUAVE, 10, fuente=MONO)
texto(x + cw - 14, y3 + h3 - 8, f"10{str(hi).translate(SUP)} s/cm²", SUAVE, 10, fuente=MONO, ancla="end")

# ---------- fila 4: tipos de asbesto ----------
y4 = 334
tarjeta(8, y4, 844, 60)
icono(22, y4 + 21, VERDE, "lupa")
texto(48, y4 + 35, "Tipos de asbesto identificados", VERDE, 15, 600)
col = 266
for nombre, n in asbestos.most_common():
    texto(col, y4 + 26, f"{nombre} · {n}", "#8b949e", 12, fuente=MONO)
    for k in range(min(n, 60)):
        fila, c = divmod(k, 20)
        tono = "#2ea043" if k < n * 0.5 else "#196c2e"
        add(f'<rect x="{col + c * 5.6:.1f}" y="{y4 + 33 + fila * 5.6:.1f}" width="4.4" height="4.4" fill="{tono}"/>')
    col += 122

add("</svg>")
SALIDA.write_text("\n".join(partes), encoding="utf-8")
print(f"{SALIDA.relative_to(RAIZ)}: {total} muestras, {len(barrios)} barrios, tipos {dict(asbestos)}")
