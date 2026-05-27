# StarMap BA — Todo List (v2)

> Plan completo en [plan.md](./plan.md). Esta es la lista accionable actualizada tras revisión crítica.

## Fase 0: Foundation
- [ ] **Task 1** — Bootstrap Next.js 14 + Prisma + TypeScript + Tailwind + Neon — S

## Fase 1: MVP Mapa con Datos Reales [Producto + DS]
- [ ] **Task 1.5** — Lookup manual de Bortle para 15 puntos en lightpollutionmap.info — S
- [ ] **Task 2** — Schema DB + seed 15 puntos (incluye `bortleScale`) — S-M
- [ ] **Task 3** — Página `/mapa` con Leaflet (Client Component estricto, `ssr: false`) — M
- [ ] **Task 4** — Panel detalle del punto (sidebar / sheet mobile) — S

### ✋ Checkpoint: Mapa con datos de Bortle reales funcionando

## Fase 2: Clima y Score Real [Producto]
- [ ] **Task 5** — Open-Meteo con `cloud_cover_low/mid/high` + cache — S
- [ ] **Task 6** — Score real: Clima (nubes desglosadas) + Luna + Bortle + tests — M
- [ ] **Task 7** — Geolocalización + distancia Haversine — S

### ✋ Checkpoint: Score real y geolocalización OK

## Fase 3: Guía de Observación [Producto]
- [ ] **Task 8** — Servicio astronomy-engine (objetos visibles) — M
- [ ] **Task 9** — Página `/punto/[slug]` Server Component + guía + date picker — M
- [ ] **Task 10** — Azimut/altitud + brújula visual — M

### 🚩 Checkpoint MVP: Flow end-to-end usable

## Fase 4: Polish del MVP [Producto]
- [ ] **Task 11** — Tips por objeto (15-25, redacción manual en rioplatense) — M
- [ ] **Task 12** — Mobile-first responsive + PWA — M
- [ ] **Task 13** — Deploy a `starmapba.vercel.app` + Sentry + Analytics — S

### 🚩 Checkpoint: MVP EN PRODUCCIÓN
- [ ] Compartir en Espacio Profundo + grupos FB astrofotografía + Twitter divulgación
- [ ] Recoger feedback en `feedback-mvp.md`
- [ ] Solo después de 20+ usuarios reales: evaluar comprar dominio `.com.ar`

## Fase 5: Visualización Avanzada [Producto + DS]
- [ ] **Task 14** — Procesar VIIRS NOAA → GeoJSON (notebook Python) — M
- [ ] **Task 15** — Heatmap layer en el mapa con toggle + leyenda — S

### ✋ Checkpoint: Visualización completa

## Fase 6: Showcase de Data Science [Portfolio]
- [ ] **Task 17** — Notebook EDA público + página `/data-science` — M
- [ ] **Task 18** — Refactor heurístico post-EDA (NO ML, ajuste de pesos basado en datos) — S
- [ ] **Task 19** — Dashboard "mejores noches del mes" con cron — M

### 🚩 Checkpoint: Pieza de portfolio lista para LinkedIn y CV

## Fase 7: Engagement [Producto Real]
- [ ] **Task 20** — Alertas por email (Resend + Cron) — M
- [ ] **Task 21a** — NextAuth con magic links + persistencia — M
- [ ] **Task 21b** — Lógica de favoritos + sync con alertas — M
- [ ] **Task 22** — Calendario de eventos astronómicos — M

### 🚩 Checkpoint final: Producto con retención

---

## Cambios respecto a v1
- ✅ **Bortle en el score desde día 1** (Task 1.5 + Task 6 actualizada)
- ✅ **Leaflet como Client Component estricto** (Task 3)
- ✅ **Open-Meteo con nubes desglosadas** (Task 5 + 6)
- ✅ **Task 18 redefinida** (refactor heurístico, no ML)
- ✅ **Task 21 dividida** en 21a + 21b
- ✅ **Subdominio Vercel hasta validar**

## Preguntas a responder antes de Task 1
- [ ] ¿Nombre definitivo? (StarMap BA / Cielo Pampa / AstroPampa / otro)
- [ ] ¿Tenés cuenta de Neon o hay que crear una?
- [ ] ¿Confirmás GitHub username para crear repo público?
