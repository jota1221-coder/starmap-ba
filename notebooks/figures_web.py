"""
Genera las 3 figuras del análisis VIIRS con el tema OSCURO de la app
(paleta ink/accent) para la página /data-science. Salida: public/data-science/.
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
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
OUT = HERE.parent / "public" / "data-science"
OUT.mkdir(parents=True, exist_ok=True)

INK, FG, FG_MUTED, ACCENT, CYAN = "#0b0f17", "#e6e9ef", "#aab2c5", "#e0a96d", "#7fd4ff"
plt.rcParams.update({
    "figure.facecolor": INK, "axes.facecolor": INK, "savefig.facecolor": INK,
    "text.color": FG, "axes.labelcolor": FG_MUTED, "axes.titlecolor": FG,
    "axes.edgecolor": "#2a3040", "xtick.color": FG_MUTED, "ytick.color": FG_MUTED,
    "grid.color": "#1c2230", "font.size": 11,
})

pts = json.loads((HERE.parent / "data" / "seed-points.json").read_text("utf-8"))["puntos"]
df = pd.DataFrame(pts)
with rasterio.open(HERE / "data" / "viirs_ba_2024.tif") as ds:
    arr = ds.read(1).astype("float64")
    b = ds.bounds

    def buffer_mean(lat, lng, km=3.0):
        deg = km / 111.0
        r0, c0 = ds.index(lng - deg, lat + deg)
        r1, c1 = ds.index(lng + deg, lat - deg)
        (r0, r1), (c0, c1) = sorted((r0, r1)), sorted((c0, c1))
        w = arr[max(0, r0):r1 + 1, max(0, c0):c1 + 1]
        return float(w.mean()) if w.size else np.nan

    df["rad_3km"] = [buffer_mean(p.lat, p.lng) for p in df.itertuples()]
lit = arr[arr > 0]


def style_legend(ax):
    leg = ax.legend(facecolor=INK, edgecolor="#2a3040")
    for t in leg.get_texts():
        t.set_color(FG)


# Fig 1 — heatmap
fig, ax = plt.subplots(figsize=(7.5, 8.5))
disp = np.where(arr > 0, arr, np.nan)
im = ax.imshow(disp, extent=[b.left, b.right, b.bottom, b.top], origin="upper",
               cmap="inferno", norm=LogNorm(vmin=0.3, vmax=float(np.nanpercentile(disp, 99.9))))
ax.scatter(df.lng, df.lat, c=CYAN, s=42, edgecolor="white", linewidth=0.7, zorder=3, label="13 puntos")
ax.set(title="Contaminación lumínica VIIRS — Buenos Aires (2024)", xlabel="Longitud", ylabel="Latitud")
cb = plt.colorbar(im, ax=ax, label="Radiancia [nW/cm²/sr] (log)", shrink=0.7)
cb.ax.yaxis.label.set_color(FG_MUTED)
cb.ax.tick_params(colors=FG_MUTED)
style_legend(ax)
fig.tight_layout()
fig.savefig(OUT / "heatmap.png", dpi=130)
plt.close(fig)

# Fig 2 — validación
fig, ax = plt.subplots(figsize=(7.5, 5))
rng = np.random.default_rng(7)
ax.scatter(df.bortle + rng.uniform(-0.12, 0.12, len(df)), df.rad_3km,
           s=70, color=ACCENT, edgecolor="#1a1d26", zorder=3)
med = df.groupby("bortle")["rad_3km"].median()
ax.plot(med.index, med.values, "--", color=CYAN, label="mediana por clase")
out = df.loc[df.rad_3km.idxmax()]
ax.annotate(f"{out.partido} (B{out.bortle})", (out.bortle, out.rad_3km),
            textcoords="offset points", xytext=(10, -4), fontsize=8, color="#ff9b9b")
ax.set_yscale("symlog", linthresh=0.1)
ax.set_xticks([2, 3, 4, 5])
ax.set(xlabel="Bortle asignado a mano", ylabel="Radiancia VIIRS 3 km (symlog)",
       title="Validación: el satélite vs los ratings (Spearman +0.76)")
style_legend(ax)
ax.grid(True, alpha=0.25)
fig.tight_layout()
fig.savefig(OUT / "validacion.png", dpi=130)
plt.close(fig)

# Fig 3 — distribución
fig, ax = plt.subplots(figsize=(7.5, 4.5))
ax.hist(np.log10(lit), bins=60, color=ACCENT, edgecolor=INK)
ax.set(xlabel="log₁₀(radiancia)  [nW/cm²/sr]", ylabel="cantidad de píxeles",
       title=f"Distribución de radiancia en BA ({lit.size:,} px con luz)")
ax.grid(True, alpha=0.25)
fig.tight_layout()
fig.savefig(OUT / "distribucion.png", dpi=130)
plt.close(fig)

print("Figuras web (tema oscuro) en", OUT)
for f in sorted(OUT.glob("*.png")):
    print(" -", f.name, f"{f.stat().st_size // 1024} KB")
