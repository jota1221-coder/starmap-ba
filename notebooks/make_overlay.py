"""
Genera un PNG TRANSPARENTE de contaminación lumínica (VIIRS 2024) para usarlo como
ImageOverlay en el mapa Leaflet de /mapa.

Dos cuidados clave:
  1) Reproyecta a Web Mercator (EPSG:3857) → alinea exacto con el mapa de Leaflet
     (si se dejara en lat/lng plano, el halo queda corrido respecto de las ciudades).
  2) Upscale + blur → halo difuso en vez de cuadrados de 500 m al hacer zoom.

Donde el cielo es oscuro → transparente (se ve el mapa base). Imprime los bounds
[[S,W],[N,E]] que hay que pasarle a Leaflet.
"""

import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio import Affine
from rasterio.enums import Resampling
from rasterio.transform import array_bounds
from rasterio.warp import calculate_default_transform, reproject, transform_bounds
from matplotlib import colormaps
from matplotlib.colors import LogNorm
from PIL import Image, ImageFilter

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "public" / "mapa"
OUT.mkdir(parents=True, exist_ok=True)

DARK = 0.5  # nW/cm²/sr — debajo de esto: cielo oscuro → transparente
DST = "EPSG:3857"
UPSCALE = 2  # remuestreo fino para suavizar

with rasterio.open(HERE / "data" / "viirs_ba_2024.tif") as src:
    tr, w, h = calculate_default_transform(
        src.crs, DST, src.width, src.height, *src.bounds
    )
    w, h = w * UPSCALE, h * UPSCALE
    tr = Affine(tr.a / UPSCALE, tr.b, tr.c, tr.d, tr.e / UPSCALE, tr.f)
    arr = np.zeros((h, w), dtype="float64")
    reproject(
        source=rasterio.band(src, 1),
        destination=arr,
        src_transform=src.transform,
        src_crs=src.crs,
        dst_transform=tr,
        dst_crs=DST,
        resampling=Resampling.bilinear,
    )
    left, bottom, right, top = array_bounds(h, w, tr)

# Bounds del ráster Mercator, convertidos a lat/lng para Leaflet.
west, south, east, north = transform_bounds(DST, "EPSG:4326", left, bottom, right, top)

lit = arr > DARK
norm = LogNorm(vmin=DARK, vmax=float(np.percentile(arr[lit], 99)))
v = np.clip(norm(np.where(lit, arr, DARK)), 0, 1)  # 0..1 (log)

# Color cálido tipo "luz de ciudad": amarillo (poca) → rojo (mucha).
rgba = (colormaps["YlOrRd"](v) * 255).astype("uint8")  # H x W x 4

# Alpha: 0 donde está oscuro; sube con la luz (sutil en pueblos, fuerte en AMBA).
alpha = np.clip(v ** 0.7, 0, 1) * 0.92
alpha[~lit] = 0.0
rgba[..., 3] = (alpha * 255).astype("uint8")

img = Image.fromarray(rgba, "RGBA").filter(ImageFilter.GaussianBlur(radius=2 * UPSCALE))
# WebP en vez de PNG: mismo canal alpha, ~80% menos peso (auditoría de rendimiento).
path = OUT / "viirs-overlay.webp"
img.save(path, "WEBP", quality=80, method=6)

kb = path.stat().st_size // 1024
print(f"OK {path.name}  {img.width}x{img.height}px  {kb} KB  (EPSG:3857, x{UPSCALE} + blur)")
print(
    "Leaflet bounds [[S,W],[N,E]] =",
    f"[[{south:.6f}, {west:.6f}], [{north:.6f}, {east:.6f}]]",
)
