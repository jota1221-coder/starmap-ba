# Plan — Notebook 03: modelo radiancia → Bortle

Paso 4 (opcional, DS). La idea: pasar de *extrapolar* a *predecir con un modelo*. Concretamente, un modelo que estime la clase **Bortle** de un lugar a partir de su **radiancia VIIRS** (y features derivadas).

## La verdad sobre los datos (leer primero)

Hoy tenemos **21 puntos** con Bortle asignado a mano. Para entrenar un modelo de ML eso es **muy poco**: cualquier modelo complejo va a sobreajustar. Hay que ser honesto con esto o el notebook resta en vez de sumar.

Dos caminos:

- **A — Modelo chico y honesto (se puede ya):** una regresión **ordinal/isotónica** de Bortle sobre `log(radiancia)`, validada con **leave-one-out CV**. No es "deep learning", es una **calibración interpretable** radiancia→Bortle con su intervalo de error. Honesto y defendible.
- **B — Conseguir más etiquetas primero (mejor modelo):** sumar puntos con SQM/Bortle conocidos de fuentes públicas (lightpollutionmap.info, reportes de la comunidad, dataset Globe at Night) → llegar a 100–300 etiquetas y ahí sí entrenar algo más serio (kNN, gradient boosting) con train/test de verdad.

**Recomendación:** hacer **A** como notebook 03 (rápido, cierra el arco de DS con un modelo real y bien acotado) y dejar **B** anotado como mejora. No vender un modelo grande entrenado con 21 puntos.

## Esquema del notebook (camino A)

1. **Datos** — los 21 puntos + radiancia VIIRS (píxel y media 3 km), reusando el método ya validado en el notebook 01.
2. **Features** — `log(radiancia_3km)`, opcional: distancia a la celda iluminada más cercana, radiancia del píxel.
3. **Modelo** — regresión isotónica o logística ordinal: `Bortle ~ log(radiancia)`. Simple e interpretable.
4. **Validación** — **leave-one-out** (con 21 puntos es lo correcto): reportar error medio de clase (±0.x Bortle) y matriz de confusión.
5. **Aplicación** — predecir Bortle en una grilla de la Provincia → un "mapa Bortle" continuo derivado del satélite, comparado con el heatmap del notebook 01.
6. **Límites (honesto)** — n chico, etiquetas propias (no es un ground-truth independiente), mezcla de versiones VNL. Es una calibración, no un oráculo.

## Criterio de "vale la pena"

- Si la LOO-CV da un error razonable (≈ ±0.5–1 clase Bortle) → buena pieza de portfolio.
- Si da error grande → el hallazgo *es* que con estos datos no se puede, y eso también se cuenta (honestidad > inflar).

## Decisión

Queda **planificado**. Construirlo es ~medio día. Antes conviene priorizar el lanzamiento (paso 3): más usuarios pueden traer más reseñas/puntos y, con eso, más etiquetas para el camino B.
