"""
Rate de candidatos a puntos nuevos con VIIRS.
- Observatorios: se reporta el cielo urbano del lugar (a propósito no son oscuros).
- Escapadas: el satélite busca la CELDA OSCURA accesible cerca del pueblo
  (como los 13 originales) y reporta su Bortle + a cuántos km del pueblo está.
Conversión radiancia→Bortle aproximada, consistente con los 13 puntos validados.
"""

import sys
from pathlib import Path

import numpy as np
import rasterio

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = Path(__file__).resolve().parent
RASTER = HERE / "data" / "viirs_ba_2024.tif"

# (nombre, categoria, lat, lng)
CAND = [
    ("AAAA Parque Centenario (CABA)", "observatorio", -34.606, -58.435),
    ("Observatorio de La Plata", "observatorio", -34.907, -57.932),
    ("Mercedes (Obs. Di Palma)", "observatorio", -34.654, -59.430),
    ("San Miguel del Monte", "escapada", -35.430, -58.800),
    ("General Belgrano", "escapada", -35.770, -58.490),
    ("Capitán Sarmiento", "escapada", -34.170, -59.790),
    ("Brandsen", "escapada", -35.170, -58.230),
    ("Chivilcoy", "escapada", -34.900, -60.020),
]


def bortle(r: float) -> int:
    if np.isnan(r):
        return -1
    for thr, b in [(0.1, 2), (0.5, 3), (3, 4), (10, 5), (30, 6), (100, 7), (300, 8)]:
        if r < thr:
            return b
    return 9


def box_mean(a: np.ndarray, half: int) -> np.ndarray:
    """Media en ventana (2*half+1)^2 por cada celda (integral image)."""
    H, W = a.shape
    P = np.pad(a, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    out = np.empty((H, W))
    for i in range(H):
        i0, i1 = max(0, i - half), min(H, i + half + 1)
        for j in range(W):
            j0, j1 = max(0, j - half), min(W, j + half + 1)
            out[i, j] = (P[i1, j1] - P[i0, j1] - P[i1, j0] + P[i0, j0]) / ((i1 - i0) * (j1 - j0))
    return out


with rasterio.open(RASTER) as ds:
    arr = ds.read(1).astype("float64")
    pxdeg = abs(ds.transform.a)
    half3 = max(1, round((3 / 111.0) / pxdeg))

    def mean3(lat, lng):
        r, c = ds.index(lng, lat)
        w = arr[max(0, r - half3):r + half3 + 1, max(0, c - half3):c + half3 + 1]
        return float(w.mean()) if w.size else np.nan

    def darkest_near(lat, lng, radius_km=12):
        r, c = ds.index(lng, lat)
        rad = round((radius_km / 111.0) / pxdeg)
        r0, r1 = max(0, r - rad), min(arr.shape[0], r + rad + 1)
        c0, c1 = max(0, c - rad), min(arr.shape[1], c + rad + 1)
        bm = box_mean(arr[r0:r1, c0:c1], half3)
        di, dj = np.unravel_index(np.argmin(bm), bm.shape)
        gr, gc = r0 + di, c0 + dj
        lng_d, lat_d = ds.xy(gr, gc)
        dist = float(np.hypot((lat_d - lat) * 111, (lng_d - lng) * 111 * np.cos(np.radians(lat))))
        return float(bm[di, dj]), lat_d, lng_d, dist

    print("OBSERVATORIOS (cielo urbano a propósito):")
    for nombre, cat, lat, lng in CAND:
        if cat == "observatorio":
            m = mean3(lat, lng)
            print(f"  {nombre:32} rad {m:6.1f}  ->  Bortle ~{bortle(m)}")

    print("\nESCAPADAS (el satélite busca el spot oscuro cerca):")
    for nombre, cat, lat, lng in CAND:
        if cat == "escapada":
            mt = mean3(lat, lng)
            md, dlat, dlng, dist = darkest_near(lat, lng)
            print(
                f"  {nombre:22} pueblo B~{bortle(mt)} | spot a {dist:4.0f} km -> "
                f"Bortle ~{bortle(md)} (rad {md:.2f}) @ {dlat:.3f},{dlng:.3f}"
            )
