"""
Tendencia de contaminación lumínica en Buenos Aires (VIIRS 2012→2024) y
proyección a 2035 por ajuste lineal por píxel. Genera:
- números provinciales (cielo oscuro que se achica),
- los 21 puntos: Bortle hoy vs proyectado 2035 (cuáles están en riesgo),
- figuras dark para /data-science.

Proyección de TENDENCIA, no pronóstico exacto. Caveat: 2012-2020 son VNL v2.1
y 2024 es v2.2 (cambio de versión), y la extrapolación lineal a 10 años es
incierta (depende de urbanización y transición a LED).
"""

import json
import re
import sys
from pathlib import Path

import numpy as np
import rasterio
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
OUT = HERE.parent / "public" / "data-science"
OUT.mkdir(parents=True, exist_ok=True)
INK, FG, FGM, ACCENT, CYAN, RED = "#0b0f17", "#e6e9ef", "#aab2c5", "#e0a96d", "#7fd4ff", "#ff9b9b"
plt.rcParams.update({
    "figure.facecolor": INK, "axes.facecolor": INK, "savefig.facecolor": INK,
    "text.color": FG, "axes.labelcolor": FGM, "axes.titlecolor": FG,
    "axes.edgecolor": "#2a3040", "xtick.color": FGM, "ytick.color": FGM,
    "grid.color": "#1c2230", "font.size": 11,
})

YEARS = [2012, 2016, 2020, 2024]
DARK = 0.5  # nW/cm²/sr — umbral de "cielo oscuro" (~Bortle 3 o mejor)

stack, bounds = [], None
for y in YEARS:
    with rasterio.open(DATA / f"viirs_ba_{y}.tif") as ds:
        stack.append(ds.read(1).astype("float64"))
        bounds = ds.bounds
stack = np.array(stack)  # (4, H, W)
H, W = stack.shape[1:]

# ── Ajuste lineal por píxel (OLS vectorizado): radiancia = a + b·año ──
x = np.array(YEARS, dtype="float64")
xb = x - x.mean()
Y = stack.reshape(4, -1)
slope = (xb[:, None] * (Y - Y.mean(0))).sum(0) / (xb ** 2).sum()  # nW por año
rad2024 = Y[-1]
rad2035 = np.clip(rad2024 + slope * (2035 - 2024), 0, None)
slope_img = slope.reshape(H, W)
rad2035_img = rad2035.reshape(H, W)


def dark_pct(flat):
    return 100.0 * (flat < DARK).mean()


print("Año     px con luz(>0)   mediana(lit)   % BA oscuro")
for i, y in enumerate(YEARS):
    lit = stack[i][stack[i] > 0]
    print(f"{y}    {lit.size:>11,}      {np.median(lit):.2f}          {dark_pct(stack[i].ravel()):.1f}%")
print(f"2035*   {'(proy.)':>11}      {'—':>4}          {dark_pct(rad2035):.1f}%")
print(f"\nCielo oscuro: 2024 {dark_pct(rad2024):.1f}%  ->  2035 {dark_pct(rad2035):.1f}%  "
      f"(pierde {dark_pct(rad2024) - dark_pct(rad2035):.1f} pts)")

# ── Los 21 puntos: Bortle hoy vs proyectado 2035 ──
pts = json.loads((HERE.parent / "data" / "seed-points.json").read_text("utf-8"))["puntos"]
with rasterio.open(DATA / "viirs_ba_2024.tif") as ds:
    pxdeg = abs(ds.transform.a)
    half = max(1, round((3 / 111.0) / pxdeg))

    def idx(lat, lng):
        r, c = ds.index(lng, lat)
        return r, c

def bortle(r):
    for thr, b in [(0.1, 2), (0.5, 3), (3, 4), (10, 5), (30, 6), (100, 7), (300, 8)]:
        if r < thr:
            return b
    return 9

def mean3(arr, r, c):
    w = arr[max(0, r - half):r + half + 1, max(0, c - half):c + half + 1]
    return float(w.mean()) if w.size else np.nan

print("\nPuntos en riesgo (Bortle empeora para 2035):")
en_riesgo, se_mantienen = [], []
for p in pts:
    r, c = idx(p["lat"], p["lng"])
    if not (0 <= r < H and 0 <= c < W):
        continue
    serie = [mean3(stack[i], r, c) for i in range(4)]
    s = (xb * (np.array(serie) - np.mean(serie))).sum() / (xb ** 2).sum()
    proj = max(0.0, serie[-1] + s * 11)
    b_now, b_fut = bortle(serie[-1]), bortle(proj)
    if b_fut > b_now:
        en_riesgo.append((p["nombre"], b_now, b_fut))
    elif p.get("categoria") != "observatorio" and b_now <= 3:
        se_mantienen.append(p["nombre"])
for n, a, b in en_riesgo:
    print(f"  ⚠ {n}: Bortle {a} -> {b}")
print(f"\nEscapadas oscuras que se MANTIENEN (Bortle ≤3 estable): {len(se_mantienen)}")
for n in se_mantienen:
    print(f"  ✓ {n}")

# ── Figura 1: cielo oscuro a través del tiempo + proyección ──
dark_series = [dark_pct(stack[i].ravel()) for i in range(4)]
fig, ax = plt.subplots(figsize=(7.5, 4.6))
ax.plot(YEARS, dark_series, "o-", color=CYAN, lw=2, label="observado (VIIRS)")
ax.plot([2024, 2035], [dark_series[-1], dark_pct(rad2035)], "o--", color=RED, lw=2, label="proyección 2035")
ax.set(xlabel="año", ylabel="% de la Provincia con cielo oscuro",
       title="El cielo oscuro de Buenos Aires se achica")
ax.legend(facecolor=INK, edgecolor="#2a3040", labelcolor=FG)
ax.grid(True, alpha=0.25)
fig.tight_layout(); fig.savefig(OUT / "tendencia.png", dpi=130); plt.close(fig)

# ── Figura 2: el mismo mapa en 2012 y 2024, para el slider antes/después ──
# Ambas imágenes: mismas dimensiones, misma normalización log y mismo encuadre
# (eje apagado, sin márgenes) → se superponen pixel a pixel en el slider web.
ring = np.array(json.loads(
    re.search(r"\[\[.*\]\]", (HERE.parent / "lib" / "ba-province.ts").read_text("utf-8"),
              re.DOTALL).group(0)
))  # [lng, lat] por vértice
norm = LogNorm(vmin=0.3, vmax=float(np.nanpercentile(stack[stack > 0], 99.7)))
ext = [bounds.left, bounds.right, bounds.bottom, bounds.top]
fw = 6.5
fh = fw * H / W
for i, y in [(0, YEARS[0]), (len(YEARS) - 1, YEARS[-1])]:
    disp = np.where(stack[i] > 0.3, stack[i], np.nan)
    fig = plt.figure(figsize=(fw, fh))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.imshow(disp, extent=ext, origin="upper", cmap="inferno", norm=norm, aspect="auto")
    ax.plot(ring[:, 0], ring[:, 1], color="white", lw=0.7, alpha=0.22)
    ax.set_xlim(bounds.left, bounds.right)
    ax.set_ylim(bounds.bottom, bounds.top)
    ax.axis("off")
    fig.savefig(OUT / f"radiancia_{y}.png", dpi=140)
    plt.close(fig)
print(f"\nDimensiones slider: {round(fw * 140)}x{round(fh * 140)} px")
print(f"Figuras: tendencia.png, radiancia_{YEARS[0]}.png, radiancia_{YEARS[-1]}.png")
