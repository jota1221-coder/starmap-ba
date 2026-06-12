"""
Recorta el compuesto VIIRS VNL v2.2 (median_masked, 2024) a la Provincia de
Buenos Aires y guarda un raster chico, listo para el análisis.

- Fuente del raster: Earth Observation Group (NOAA/Colorado School of Mines),
  producto VNL v2.2 anual (dominio público). Archivo global gzipeado en data/.
- Polígono de BA: se lee del MISMO `lib/ba-province.ts` que usa la app
  (límites oficiales IGN, 277 vértices) → una sola fuente de verdad.

Uso:  python clip_viirs_ba.py
Salida:  notebooks/data/viirs_ba_2024.tif
"""

import json
import re
import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.mask import mask
from shapely.geometry import Polygon, mapping

# La consola de Windows usa cp1252 y rompe al imprimir → o ²; forzamos UTF-8.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
GLOBAL_GZ = DATA / "VNL_npp_2024_global.median_masked.tif.gz"
TS_FILE = HERE.parent / "lib" / "ba-province.ts"
OUT = DATA / "viirs_ba_2024.tif"


def load_ba_polygon() -> Polygon:
    """Anillo exterior de BA desde el TS de la app (mismo límite que el mapa)."""
    text = TS_FILE.read_text(encoding="utf-8")
    m = re.search(r"\[\[.*\]\]", text, re.DOTALL)
    if not m:
        raise RuntimeError("No se encontró el anillo en ba-province.ts")
    ring = json.loads(m.group(0))  # [[lng, lat], ...]
    return Polygon(ring)


def main() -> None:
    poly = load_ba_polygon()
    print(f"Polígono BA: {len(poly.exterior.coords)} vértices | bounds {tuple(round(b, 2) for b in poly.bounds)}")

    vsi = f"/vsigzip/{GLOBAL_GZ.as_posix()}"
    print("Abriendo raster global vía /vsigzip/ (descomprime hasta las filas de BA, ~1-2 min)…")
    with rasterio.open(vsi) as src:
        print(f"  global: {src.width}x{src.height} px | CRS {src.crs} | dtype {src.dtypes[0]}")
        out_img, out_transform = mask(src, [mapping(poly)], crop=True, nodata=0)
        meta = src.meta.copy()

    meta.update(
        driver="GTiff",
        height=out_img.shape[1],
        width=out_img.shape[2],
        transform=out_transform,
        nodata=0,
        compress="deflate",
    )
    with rasterio.open(OUT, "w", **meta) as dst:
        dst.write(out_img)

    arr = out_img[0].astype("float64")
    lit = arr[arr > 0]  # píxeles con algo de luz (el resto es cielo oscuro)
    print(f"\nRecorte BA → {OUT.name}: {arr.shape[1]}x{arr.shape[0]} px")
    print(f"  píxeles con luz (>0): {lit.size:,} de {arr.size:,} ({100 * lit.size / arr.size:.1f}%)")
    if lit.size:
        print(
            "  radiancia [nW/cm²/sr]:"
            f" min {lit.min():.3f} | mediana {np.median(lit):.3f}"
            f" | media {lit.mean():.3f} | max {lit.max():.1f}"
        )
    print("OK")


if __name__ == "__main__":
    main()
