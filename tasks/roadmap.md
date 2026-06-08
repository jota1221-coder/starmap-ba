# StarMap BA — Roadmap de largo plazo

> Auditoría integral + plan para terminar el proyecto, aplicar ciencia de datos
> y empaquetarlo para el CV. Generado tras revisión completa del **2026-06-06**.
> Complementa `plan-next.md` (cerrar→validar) con la visión de cierre.

---

## 1. Resultado de la auditoría (2026-06-06)

Revisión real (código en mano, no de memoria). Verificaciones ejecutadas:
`scripts/verify-points.ts` (punto-en-polígono + Bortle + distancias),
geocoding inverso (Google Maps MCP), `git grep` de secretos, `npm run lint`.

| Área | Verdicto | Detalle |
|---|---|---|
| Datos / ubicaciones | ✅ Correcto | 13 puntos **dentro** de BA (ray casting vs silueta IGN). Geocoding confirma partido (Pardo→Las Flores, Villa Ventana→Tornquist, Pipinas→Punta Indio). Bortle 2–5 válidos. |
| Seguridad / API keys | ✅ Limpio | `.env` gitignoreado; cero secretos en archivos trackeados. Solo `NEXT_PUBLIC_SITE_URL` expuesto (público a propósito). |
| Login / Auth | ✅ Sólido / ⚠ 1 límite | Auth.js v5, magic link, sesiones en DB, dev fail-safe. Límite: Resend sin dominio → mail solo al dueño. |
| Base de datos | ✅ Sólido | Prisma 7 + Neon, adapter correcto, índices, rating denormalizado, dev/prod separadas. |
| Código / build | ✅ tras fix | Se arreglaron 2 errores de lint (comillas). Build limpio, landing estática. |
| Diseño / movimiento | ✅ Fuerte | OKLCH nocturno, Space Grotesk, Framer (parallax, score ring, transiciones), showcase del producto. |
| Imágenes | ✅ / 🧹 | Foto ESO con atribución CC. Se eliminaron 5 SVG basura de create-next-app. |
| Mapa | ✅ Correcto | Silueta real (277 pts IGN), Sentinel-2 uniforme, sin "data not available". |

**Arreglado en esta pasada** (commit `1cf31b2`): lint, SVGs basura,
`scripts/verify-points.ts` (chequeo de integridad reutilizable).

**Nota menor de datos:** algunas `distancia_caba_km` son aproximadas
(yamay-pardo 190→~215 real; pila/tornquist sobreestimadas). Coordenadas OK; solo
el número. Pulido cosmético.

---

## 2. Plan de largo plazo (Fases A–E)

### Fase A — Desbloquear · 🔴 BLOCKER · ~1 día
Sin esto el login no sirve para nadie más que el dueño.
- [ ] Comprar dominio (`.com.ar` ~$5/año o el que sea)
- [ ] Verificar dominio en Resend (DNS records)
- [ ] Configurar dominio en Vercel + actualizar `NEXT_PUBLIC_SITE_URL` y `AUTH_URL`
- [ ] Verificar: alguien que NO sea el dueño puede pedir magic link y entrar
- **Acción del usuario** (compra + DNS). Yo configuro el código/env.

### Fase B — Validar · ~2–3 semanas
- [ ] Sembrar 3–4 reseñas reales (que la sección no esté vacía)
- [ ] Compartir en Espacio Profundo + grupos FB astrofoto + X divulgación
- [ ] Documentar reacciones en `tasks/feedback-mvp.md`
- [ ] Leer Vercel Analytics (¿mobile vs desktop? ¿qué puntos miran?)
- 🚩 Checkpoint: con datos reales se decide qué de la Fase D construir.

### Fase C — Ciencia de datos (el corazón del CV) · ~3–4 semanas
1. [ ] **Notebook EDA** (Jupyter, público en `notebooks/`): procesar el GeoTIFF
       VIIRS completo, analizar contaminación lumínica de toda BA, validar el
       Bortle de los 13 puntos contra el ráster.
2. [ ] **Capa de contaminación lumínica propia**: tiles generados desde VIIRS
       (la "Fase 5" pendiente, ahora con base científica).
3. [ ] **Refactor del score con datos**: validar el heurístico
       (nubes × bortle × luna) contra observaciones/literatura, documentar método.
4. [ ] **Página `/data-science`**: notebook renderizado + metodología + viz.
       Esto es lo que se muestra en entrevistas.

### Fase D — Pulido de producto · ~2 semanas
- [ ] PWA / offline (clave: se usa en el campo sin señal)
- [ ] Alertas "avisame cuando haya buena noche en X" (Resend + Cron)
- [ ] Brújula visual (Task 10 original; alt/az ya está en texto)
- [ ] Puntos sugeridos por usuarios (el más riesgoso; solo si la validación lo pide)

### Fase E — Empaquetar para CV · ~2 días
- [ ] README con screenshots + GIF del producto
- [ ] Sección "Data Science" enlazando el notebook
- [ ] Párrafo de impacto (usuarios, datos procesados, stack)
- [ ] Linkear desde marca personal / LinkedIn

---

## 3. ⭐ Las 5 mejores cosas (proyecto terminado)

1. **Datos reales y verificados** — 13 puntos validados con geocoding y
   punto-en-polígono; Bortle de VIIRS, no inventados.
2. **Motor de observación genuino** — cálculo astronómico local
   (astronomy-engine), trayectoria de toda la noche, score en lenguaje natural.
3. **Arquitectura de producción** — Next 16 + Prisma 7 + Neon, dev/prod
   separadas, rate limiting, moderación, auth con sesiones en DB.
4. **El rediseño del mapa** — Esri sin cobertura rural → Sentinel-2 uniforme +
   máscara real de BA. Criterio técnico, no parche.
5. **Identidad visual propia** — paleta nocturna fundamentada en visión nocturna,
   Space Grotesk, movimiento con Framer, showcase del producto.

## 4. 🎯 Las 5 que hay que hacer SÍ o SÍ para que sea brillante

1. **Dominio + Resend** — sin login para todos, no es producto. #1 absoluto.
2. **El showcase de Data Science (Fase C)** — sin el notebook VIIRS +
   `/data-science`, es "una web linda", no un proyecto de DS para el CV.
3. **Tests + CI** — tests en el path de reseñas (escritura) + GitHub Action que
   corra lint + build + `verify-points`.
4. **Reseñas reales sembradas** — 3–4 reseñas auténticas (prueba social).
5. **Cerrar el pulido de diseño** — cohesión tipográfica (wordmark en Space
   Grotesk), íconos celestes en features, pase de accesibilidad.

---

## Recomendación de arranque
**Fase A (dominio) ya** — desbloquea la validación — y en paralelo empezar el
**notebook de la Fase C**, que suma al CV pase lo que pase con la validación.
