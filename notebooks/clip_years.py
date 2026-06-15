"""
Recorta a la Provincia de Buenos Aires todos los compuestos VIIRS globales
(.tif.gz) que haya en data/, uno por año. Para el análisis de tendencia
2012→2024. Reusa el polígono IGN de la app. Salta los que ya estén recortados.
"""

import json
import re
import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.mask import mask
from shapely.geometry import Polygon, mapping

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
TS = HERE.parent / "lib" / "ba-province.ts"


def ba_polygon() -> Polygon:
    text = TS.read_text(encoding="utf-8")
    ring = json.loads(re.search(r"\[\[.*\]\]", text, re.DOTALL).group(0))
    return Polygon(ring)


poly = ba_polygon()
for gz in sorted(DATA.glob("VNL*.tif.gz")):
    m = re.search(r"npp_?(\d{4})", gz.name)
    if not m:
        print(f"(no pude inferir año de {gz.name}, skip)")
        continue
    year = m.group(1)
    out = DATA / f"viirs_ba_{year}.tif"
    if out.exists():
        print(f"{year}: ya recortado, skip")
        continue
    print(f"{year}: recortando (descomprime hasta BA, ~1-2 min)…")
    with rasterio.open(f"/vsigzip/{gz.as_posix()}") as src:
        img, tr = mask(src, [mapping(poly)], crop=True, nodata=0)
        meta = src.meta.copy()
    meta.update(
        driver="GTiff", height=img.shape[1], width=img.shape[2],
        transform=tr, nodata=0, compress="deflate",
    )
    with rasterio.open(out, "w", **meta) as dst:
        dst.write(img)
    lit = img[0][img[0] > 0]
    print(f"  -> {out.name}  {img.shape[2]}x{img.shape[1]} px | "
          f"px con luz: {lit.size:,} | mediana {np.median(lit):.2f}")

print("\n--- rasters BA por año ---")
for tif in sorted(DATA.glob("viirs_ba_*.tif")):
    with rasterio.open(tif) as ds:
        print(f"  {tif.name}: {ds.width}x{ds.height}")
