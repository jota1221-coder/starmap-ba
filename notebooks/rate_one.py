"""Rateo VIIRS de un punto: radiancia exacta, media 3km y la celda más oscura
cercana (metodología "apuntar a la celda oscura accesible")."""
import sys
from pathlib import Path
import numpy as np
import rasterio

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
LAT, LNG = -38.6689, -59.0033  # Balneario Los Ángeles (geocoding)


def bortle(r):
    for thr, b in [(0.1, 2), (0.5, 3), (3, 4), (10, 5), (30, 6), (100, 7), (300, 8)]:
        if r < thr:
            return b
    return 9


with rasterio.open(HERE / "data" / "viirs_ba_2024.tif") as ds:
    arr = ds.read(1).astype("float64")
    H, W = arr.shape
    px = abs(ds.transform.a)
    half = max(1, round((3 / 111.0) / px))      # ~3 km
    rad = round((10 / 111.0) / px)              # buscar en ~10 km
    r, c = ds.index(LNG, LAT)
    if not (0 <= r < H and 0 <= c < W):
        print("FUERA del raster"); raise SystemExit

    def mean3(rr, cc):
        w = arr[max(0, rr - half):rr + half + 1, max(0, cc - half):cc + half + 1]
        return float(w.mean()) if w.size else np.nan

    exact = float(arr[r, c])
    m3 = mean3(r, c)
    best, bestrc = 9e9, (r, c)
    for rr in range(max(0, r - rad), min(H, r + rad + 1)):
        for cc in range(max(0, c - rad), min(W, c + rad + 1)):
            m = mean3(rr, cc)
            if m < best:
                best, bestrc = m, (rr, cc)
    blng, blat = ds.xy(bestrc[0], bestrc[1])
    print(f"Punto geocodificado lat={LAT} lng={LNG}")
    print(f"  exacto:   rad={exact:.2f}  -> Bortle {bortle(exact)}")
    print(f"  media 3km: rad={m3:.2f}  -> Bortle {bortle(m3)}")
    print(f"  celda más oscura a <10km: rad={best:.2f} -> Bortle {bortle(best)} "
          f"@ lat={blat:.4f} lng={blng:.4f}")
