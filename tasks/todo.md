# StarMap BA — Todo List (v2)

> Plan completo en [plan.md](./plan.md). Esta es la lista accionable actualizada tras revisión crítica.

---

## 🎯 PRÓXIMO ORDEN (post-review) — ver [plan-next.md](./plan-next.md)

**Veredicto: parar de construir features, cerrar el círculo y validar.**

### Fase 0 — Cerrar el círculo (que lo construido sea usable)
- [ ] **A** — Pushear commits locales (auth + reseñas + hardening) → Vercel redeploya
- [ ] **B** — `AUTH_SECRET` + `AUTH_URL` en Vercel + redeploy
- [ ] **C** — Resend: activar emails de login reales en prod
- [ ] **D** — Separar DB dev/prod (Neon branching)
### ✋ Checkpoint: producto realmente usable en prod (login funciona)

### Fase 1 — Validar (lo postergado)
- [ ] **E** — Vercel Analytics + canal de feedback
- [ ] **F** — Compartir en Espacio Profundo + FB + X · documentar `feedback-mvp.md`
### 🚩 Checkpoint: usuarios reales + feedback → DECIDIR Fase 2 con datos

### Fase 2 — Features según feedback (candidatos, NO compromisos)
- [ ] Puntos enviados por usuarios (diferido: el más riesgoso) · brújula visual · mobile/PWA · alertas · showcase DS

---

## 📌 CHECKPOINT — 2026-05-29

**Estado:** MVP funcional completo en local. 9 commits, 23 tests pasando, build limpio.
Repo: github.com/jota1221-coder/starmap-ba (⚠️ 5 commits locales SIN pushear).

**Flow end-to-end operativo:** landing → mapa (satélite + Bortle) → punto → guía con score en vivo.

**Hecho más allá del plan original (mejoras no previstas):**
- 🎨 Rediseño completo de dirección de arte (skills impeccable + ui-ux-pro-max):
  paleta nocturna OKLCH, anti-slop, ver `DESIGN.md` — commit dc86165
- 🛰️ Vista satélite Esri + toggle + zoom y panel de detalle al clickear — commit cae50e9
- 🏛️ `ARCHITECTURE.md` + hardening de producción (env, /api/health, Next Data
  Cache, cache headers) — commit d4cc1c0 / hardening
- 🌌 Landing con foto real del cielo (ESO, CC BY 4.0) + animaciones de entrada — commit 75f4b57
- 💬 Explicación en lenguaje natural de por qué la noche es buena/mala
  (`explainScore`) — commit 46d28ee
- 🚀 Deploy-readiness: `postinstall: prisma generate` + `DEPLOY.md`

**Próximo paso inmediato:** `git push` (subir los 5 commits) → retomar deploy en Vercel (Task 13).

---

## Fase 0: Foundation
- [x] **Task 1** — Bootstrap Next.js 16 + Prisma 7 + TypeScript + Tailwind + Neon — ✅ commit 5c53e22

## Fase 1: MVP Mapa con Datos Reales [Producto + DS]
- [x] **Task 1.5** — 13 puntos validados; contaminación lumínica MEDIDA vía VIIRS (MCP stargazing); coords verificadas con Google Maps — ✅
- [x] **Task 2** — Schema `ObservationPoint` + seed 13 puntos (bortle/sqm/acceso/tips/experiencia) en Neon — ✅ commit c5460b7
- [x] **Task 3** — Página `/mapa` con Leaflet (Client Component estricto, `ssr: false`) — ✅ commit a193b48
- [x] **Task 4** — Panel detalle del punto (sidebar desktop / sheet mobile) — ✅ commit cae50e9 (glass sobre el mapa, zoom al clickear)

> Stack real: Next.js 16 + Prisma 7 (más nuevos que el plan original). Prisma 7 requiere driver adapter (`@prisma/adapter-neon`). El modelo suma info de visitante rica (tips, dónde dormir, mejor época, experiencia), mejora no prevista en el plan.

### ✋ Checkpoint: Mapa con datos de Bortle reales funcionando

## Fase 2: Clima y Score Real [Producto] — ✅ commit d4cc1c0
- [x] **Task 5** — Open-Meteo con `cloud_cover_low/mid/high` + cache — ✅ `lib/weather.ts`
- [x] **Task 6** — Score real: Clima (nubes desglosadas) + Luna + Bortle + tests — ✅ `lib/score.ts` (8 tests)
- [x] **Task 7** — Distancia Haversine — ✅ `lib/distance.ts`. Geolocalización del usuario (UI) pendiente.
- [x] **(extra)** — API routes + `lib/conditions.ts` (clima+cielo+score combinados)

### ✋ Checkpoint: Score real OK ✅ (validado en vivo: Alberti score 10 por luna casi llena)

## Fase 3: Guía de Observación [Producto]
- [x] **Task 8** — Servicio astronomy-engine (objetos visibles, alt/az, rise/set) — ✅ `lib/astronomy.ts` (8 tests, validado vs MCP)
- [x] **Task 9** — Página `/punto/[slug]` Server Component + guía + date picker — ✅ score en vivo, cielo, planetas, clima, info del lugar
- [ ] **Task 10** — Azimut/altitud + brújula visual — M (cálculo ya en astronomy.ts; la guía ya muestra alt/az en texto; falta brújula visual)

### 🚩 Checkpoint MVP: Flow end-to-end usable

## Fase 4: Polish del MVP [Producto]
- [ ] **Task 11** — Tips por objeto (15-25, redacción manual en rioplatense) — M
- [ ] **Task 12** — Mobile-first responsive + PWA — M
- [x] **Task 13** — Deploy a Vercel — ✅ LIVE: https://starmap-ba-ajp5.vercel.app

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
