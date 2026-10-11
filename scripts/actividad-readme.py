"""Genera docs/img/actividad.svg: actividad del repositorio a partir de git log, en el estilo del panel de cifras.

Uso:  python scripts/actividad-readme.py   (luego commit de docs/img/actividad.svg)
Reemplaza al widget de OSS Insight, que no indexa repositorios nuevos.
"""
import subprocess
from collections import Counter
from datetime import date, timedelta
from pathlib import Path
from xml.sax.saxutils import escape

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "docs" / "img" / "actividad.svg"

FONDO, BORDE, TEXTO, SUAVE = "#0d1117", "#30363d", "#e6edf3", "#7d8590"
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
MONO = "ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace"
TIPOS = [("feat", "Funciones", "#58a6ff"), ("fix", "Correcciones", "#f0508c"),
         ("docs", "Documentación", "#3fb950"), ("chore", "Mantenimiento", "#c66cf5"),
         ("otro", "Otros", "#ff8a3d")]
DIAS = 28

salida = subprocess.run(["git", "log", "--no-merges", "--format=%ad|%s|%an", "--date=short"],
                        cwd=RAIZ, capture_output=True, text=True, encoding="utf-8", check=True).stdout
commits = [l.split("|", 2) for l in salida.splitlines() if l.strip()]
por_dia = Counter(d for d, _, _ in commits)
por_tipo = Counter()
for _, asunto, _ in commits:
    pref = asunto.split(":", 1)[0].split("(", 1)[0].strip()
    por_tipo[pref if pref in dict((t, 0) for t, _, _ in TIPOS) else "otro"] += 1
autores = len({a for _, _, a in commits})
hoy = date.today()
inicio = min(date.fromisoformat(d) for d, _, _ in commits)
dias_activos = len(por_dia)
este_mes = sum(n for d, n in por_dia.items() if d.startswith(hoy.strftime("%Y-%m")))

partes = []
add = partes.append


def texto(x, y, t, color=TEXTO, tam=13, peso=400, fuente=SANS, ancla="start"):
    add(f'<text x="{x}" y="{y}" fill="{color}" font-family="{fuente}" font-size="{tam}" '
        f'font-weight="{peso}" text-anchor="{ancla}">{escape(t)}</text>')


W, H = 860, 190
add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
    f'aria-label="Actividad del repositorio">')
add(f'<rect width="{W}" height="{H}" fill="{FONDO}"/>')

# tarjeta izquierda: cifras y calendario de los últimos 28 días
add(f'<rect x="8" y="8" width="416" height="174" rx="6" fill="{FONDO}" stroke="{BORDE}"/>')
texto(24, 36, f"{len(commits)} commits · {dias_activos} días activos", "#58a6ff", 15, 600)
texto(24, 58, f"desde {inicio.isoformat()} · {autores} autor{'es' if autores != 1 else ''} · {este_mes} este mes", SUAVE, 12, fuente=MONO)
maximo = max(por_dia.values())
lado, paso = 22, 27
for i in range(DIAS):
    d = hoy - timedelta(days=DIAS - 1 - i)
    n = por_dia.get(d.isoformat(), 0)
    fila, col = divmod(i, 14)
    x, y = 24 + col * paso, 76 + fila * paso
    color = "#161b22" if n == 0 else "#0e4429" if n <= maximo * 0.34 else "#26a641" if n <= maximo * 0.67 else "#39d353"
    add(f'<rect x="{x}" y="{y}" width="{lado}" height="{lado}" rx="3" fill="{color}"><title>{d.isoformat()}: {n} commits</title></rect>')
texto(24, 152 + 18, f"Últimos {DIAS} días", SUAVE, 11, fuente=MONO)
texto(24 + 13 * paso + lado, 152 + 18, f"hasta {hoy.isoformat()}", SUAVE, 11, fuente=MONO, ancla="end")

# tarjeta derecha: commits por tipo
add(f'<rect x="436" y="8" width="416" height="174" rx="6" fill="{FONDO}" stroke="{BORDE}"/>')
texto(452, 36, "Commits por tipo", "#c66cf5", 15, 600)
x0, ancho = 452, 384
total = len(commits)
x = x0
for clave, _, color in TIPOS:
    n = por_tipo.get(clave, 0)
    if n:
        w = ancho * n / total
        add(f'<rect x="{x:.1f}" y="52" width="{w:.1f}" height="10" fill="{color}"/>')
        x += w
y = 88
for i, (clave, nombre, color) in enumerate(TIPOS):
    n = por_tipo.get(clave, 0)
    cx, cy = x0 + (i % 2) * 196, y + (i // 2) * 30
    add(f'<circle cx="{cx + 5}" cy="{cy - 4}" r="4.5" fill="{color}"/>')
    texto(cx + 16, cy, nombre, color, 13)
    texto(cx + 180, cy, str(n), SUAVE, 13, fuente=MONO, ancla="end")

add("</svg>")
SALIDA.write_text("\n".join(partes), encoding="utf-8")
print(f"{SALIDA.relative_to(RAIZ)}: {total} commits, tipos {dict(por_tipo)}")
