# StarMap BA — Análisis de datos

Análisis exploratorio de **contaminación lumínica** en la Provincia de Buenos Aires con datos satelitales VIIRS, para validar los ratings de cielo oscuro (Bortle) de [StarMap BA](https://starmapba.com.ar).

## Notebook

**[`01_contaminacion_luminica_ba.ipynb`](01_contaminacion_luminica_ba.ipynb)** — recorta el compuesto VIIRS anual a la Provincia, mapea la contaminación lumínica y **valida los 13 puntos** contra el satélite.

**Hallazgo principal:** el Bortle asignado a mano correlaciona fuerte con la radiancia satelital independiente y de mayor resolución (Spearman **+0.76**). El **94.5%** de la Provincia está bajo el umbral de detección del satélite — mucho cielo oscuro accesible.

## Datos

- **VIIRS VNL v2.2** anual 2024 (`median_masked`) — [Earth Observation Group / NOAA](https://eogdata.mines.edu/products/vnl/), dominio público.
- El ráster global (~312 MB) **no** está versionado; sí el recorte a BA (`data/viirs_ba_2024.tif`, 0.75 MB), así el notebook corre tal cual tras clonar.

## Cómo correrlo

```bash
uv venv --python 3.12
uv pip install -r requirements.txt
jupyter lab
```

## Scripts

- **`clip_viirs_ba.py`** — recorta el ráster VIIRS global a la Provincia usando el mismo polígono IGN que la app (`lib/ba-province.ts`). Requiere el archivo global de EOG en `data/`.
