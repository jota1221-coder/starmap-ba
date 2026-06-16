# StarMap BA — Caso de proyecto

> Material para portfolio / CV / LinkedIn. Producto en vivo: **[starmapba.com.ar](https://starmapba.com.ar)** · Código: **[github.com/jota1221-coder/starmap-ba](https://github.com/jota1221-coder/starmap-ba)**

## TL;DR

Diseñé y llevé a producción **StarMap BA**, una web app que le dice a un aficionado a la astronomía **dónde y cuándo** salir a ver estrellas en la Provincia de Buenos Aires. Combina contaminación lumínica satelital, pronóstico del clima y posición de los astros en un **score 0–100** por lugar y por noche. Después **validé** el modelo contra datos satelitales independientes (VIIRS de NASA/NOAA): **correlación de Spearman +0.76**.

Es a la vez un **producto real** (usable por la comunidad amateur argentina) y un **proyecto de portfolio** que muestra full-stack + un modelo de datos defendible.

---

## El problema

La contaminación lumínica hace invisible la mayor parte del cielo nocturno desde las ciudades. El que quiere ver estrellas se enfrenta a dos preguntas que ningún mapa estático resuelve junto:

1. **¿Dónde?** — un lugar oscuro, real, llegable en auto y con información.
2. **¿Cuándo?** — una noche despejada y sin Luna.

El valor del producto está justo en esa intersección **dónde × cuándo**, no en mostrar un mapa de luz.

## La solución

- **Mapa interactivo** con 21 puntos de observación reales (escapadas de cielo oscuro y observatorios con visitas), rankeados por oscuridad real medida por satélite, sobre un overlay de contaminación lumínica.
- **Score de observación 0–100** para cada lugar y cada noche, con explicación en lenguaje natural.
- **Guía por punto**: qué planetas se ven, a qué altura y hacia dónde apuntar.
- **Comunidad**: cuentas sin contraseña (magic link) y reseñas moderadas.

## Mi rol y decisiones clave

Lo dirigí de punta a punta: producto, arquitectura, modelo de datos y análisis. Las decisiones que puedo defender una por una:

- **Score multiplicativo con pesos por dominio.** Las nubes bajas penalizan ~3× más que las altas (tapan más para observar); la Luna resta según fase **y** altura (llena pero bajo el horizonte no molesta); el Bortle del lugar pone el piso. No es "promediar variables": es un modelo de decisión pensado para el caso de uso.
- **Bortle desde el día 1, validación después.** Asigné la oscuridad a mano con una grilla gruesa para tener producto rápido, y *después* lo contrasté contra el satélite. El píxel exacto correlaciona poco (+0.32) pero el entorno de 3 km sí (**+0.76**): eso valida la metodología de "apuntar a la celda oscura accesible".
- **Mapa fiel.** Base Sentinel-2 (cobertura uniforme en todo el territorio), máscara con el polígono oficial del IGN, y overlay VIIRS **reproyectado a Web Mercator** para que alinee con el mapa (un detalle que mucha gente pasa por alto).
- **Stack serverless y barato.** Next.js 16 (App Router) + Prisma + Postgres en Neon + Vercel. DBs de dev y prod separadas por branching.
- **Ciencia de datos en tres tiempos:** *describir* (mapa de radiancia) → *validar* (Bortle vs. satélite) → *predecir* (tendencia a 2035 + el score por noche como predicción de corto plazo).

## Resultados

| | |
|---|---|
| **En vivo** | `starmapba.com.ar`, dominio propio, con email transaccional |
| **Validación** | Spearman **+0.76** (Bortle ↔ radiancia VIIRS) sobre 21 puntos |
| **Cobertura** | 94.5% de la Provincia bajo el umbral de detección satelital |
| **Proyección** | cielo oscuro 95.2% (2024) → 94.6% (2035); huella iluminada +22% en 12 años |
| **Calidad** | 46 tests (vitest) + CI (GitHub Actions: lint, typecheck, test) |
| **Reproducible** | 2 notebooks ejecutados que se renderizan en GitHub |

## Stack

**Front/Full-stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Prisma 7, Neon (Postgres serverless), Auth.js v5 (magic link), Resend, Leaflet, Vercel.
**Datos / DS:** Python, rasterio, geopandas, NumPy, pandas, Matplotlib (VIIRS VNL de EOG/NOAA, polígonos del IGN, Open-Meteo, astronomy-engine).

## Lo que aprendí

- Un buen modelo simple y **explicable** vale más que uno complejo que no podés defender (la recta a 2035, los pesos del score).
- La parte más difícil no fue el código, fue **decidir qué medir** y ser honesto con los límites del dato (mezcla de versiones VNL, extrapolación lineal).
- Validar tus propios supuestos con un dato independiente cambia el proyecto de "una opinión" a "una medición".

## Próximos pasos

Tests + CI ✅ · validación con usuarios reales de la comunidad (Espacio Profundo, grupos de astrofotografía) · un modelo radiancia→Bortle como pieza de ML.

---

## Bullets listos para el CV

- Diseñé y lancé a producción **StarMap BA** ([starmapba.com.ar](https://starmapba.com.ar)), web app full-stack (Next.js 16, TypeScript, Prisma, Postgres/Neon) que rankea lugares de observación astronómica combinando contaminación lumínica satelital, clima y efemérides en un **score 0–100**.
- **Validé** el modelo de oscuridad de cielo contra datos satelitales **VIIRS (NASA/NOAA)** con un pipeline geoespacial en Python (rasterio/geopandas): **Spearman +0.76** sobre 21 puntos.
- Construí un análisis **reproducible** (2 notebooks) que describe, valida y **proyecta a 2035** la contaminación lumínica de la Provincia de Buenos Aires.
- Monté **tests (vitest) e integración continua** (GitHub Actions) y desplegué en Vercel con dominio propio y email transaccional.

## Borrador de post para LinkedIn

> 🌌 Lancé **StarMap BA**: una web app que te dice *dónde* y *cuándo* ver las estrellas en la Provincia de Buenos Aires.
>
> Combina contaminación lumínica medida por satélite, el pronóstico del clima y la posición de la Luna y los planetas en un score 0–100 para cada lugar y cada noche.
>
> Lo más lindo fue la parte de datos: asigné la oscuridad de cada punto a mano y después la **validé contra datos satelitales VIIRS de la NASA/NOAA** → correlación de Spearman **+0.76**. También proyecté cómo crece la contaminación lumínica hacia 2035.
>
> Stack: Next.js 16 · TypeScript · Prisma/Postgres · Python (rasterio/geopandas) · Vercel. Con tests y CI.
>
> 🔭 Probalo: starmapba.com.ar
> 💻 Código y notebooks: github.com/jota1221-coder/starmap-ba
>
> #DataScience #Python #WebDevelopment #Astronomía
