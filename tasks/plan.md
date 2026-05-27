# Plan de Implementación: StarMap BA

> **Versión 2** — Actualizado tras revisión crítica. Cambios clave: Bortle incorporado al score desde el día 1; Task 18 redefinida como refactor heurístico (no ML); Task 21 modularizada; ajustes técnicos en Leaflet y Open-Meteo.

## Overview

App web para amateurs de astronomía en la Provincia de Buenos Aires que combina:
1. **Mapa interactivo** de puntos rankeados para observación astronómica
2. **Score dinámico** basado en clima, contaminación lumínica (Bortle), fase lunar y geografía
3. **Guía de observación** que indica qué objetos celestes son visibles y dónde apuntar el telescopio
4. **Tips prácticos** de observación por objeto

Producto real con usuarios amateurs como target, no solo portfolio. Stack: Next.js + Prisma + TypeScript. Esfuerzo estimado: 5-15h/semana del usuario.

---

## Decisiones de Arquitectura

| Decisión | Elección | Rationale |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Stack ya conocido; SSR para SEO de puntos de observación |
| Base de datos | **PostgreSQL en Neon (free tier)** | Prisma ya conocido; Neon serverless y gratis |
| Mapa | **Leaflet + OpenStreetMap** | Gratis, suficiente para MVP. Renderizado **estricto en Client Component** con `next/dynamic({ ssr: false })` para evitar errores de hidratación |
| Clima | **Open-Meteo API** | Gratis, sin API key. **Requerir explícitamente `cloud_cover_low`, `cloud_cover_mid`, `cloud_cover_high`** — las nubes bajas matan la observación, las altas (cirrus) la atenúan |
| Astronomía | **astronomy-engine** (npm) | Cálculos locales sin API limits, preciso, soporta hemisferio sur |
| Contaminación lumínica | **Bortle hardcodeado en seed (MVP)** → **VIIRS NOAA procesado a GeoJSON** (Fase 5) | Para los 15 puntos curados se hace lookup manual en lightpollutionmap.info (30 min). Procesamiento completo del GeoTIFF se hace después cuando se necesita la capa visual del mapa |
| Hosting | **Vercel free tier + subdominio `starmapba.vercel.app`** | No comprar dominio antes de validar con usuarios reales |
| Auth (post-MVP) | **NextAuth con magic link (email)** | Sin password, simple |

### Distinción Producto vs. Showcase de Data Science

- **Producto (UX usable):** Fases 0-4. Mapa con score real (incluye Bortle), guía de observación, mobile-first.
- **Showcase DS (portfolio técnico):** Fases 5-6. Procesamiento de VIIRS, notebook EDA público, refactor de pesos heurísticos basado en hallazgos del análisis.
- **Engagement (retención):** Fase 7. Cuentas, alertas, calendario de eventos.

---

## Grafo de Dependencias

```
[Task 1: Bootstrap]
    ↓
[Task 1.5: Bortle lookup manual] ──→ [Task 2: Schema + Seed (con Bortle)]
    ↓
[Task 3: Mapa Leaflet client-only] ──→ [Task 4: Detalle de punto]
    ↓
[Task 5: Open-Meteo (nubes desglosadas)]
    ↓
[Task 6: Score real (Clima + Luna + Bortle)] ──→ [Task 7: Geolocalización]
    ↓
[Task 8: Servicio astronómico] ──→ [Task 9: /punto/[slug]] ──→ [Task 10: Azimut/altitud]

        ───── 🚩 CHECKPOINT MVP ─────

[Task 11: Tips por objeto] → [Task 12: Mobile + PWA] → [Task 13: Deploy producción]

        ───── 🚩 CHECKPOINT MVP EN PRODUCCIÓN ─────

[Task 14: VIIRS → GeoJSON completo] → [Task 15: Heatmap layer]

        ───── ✋ CHECKPOINT VISUALIZACIÓN COMPLETA ─────

[Task 17: Notebook EDA público] → [Task 18: Refactor heurístico post-EDA] → [Task 19: Dashboard mejores noches]

        ───── 🚩 CHECKPOINT SHOWCASE DS ─────

[Task 20: Email alerts]
[Task 21a: NextAuth setup] → [Task 21b: Favoritos + sync alerts]
[Task 22: Calendario eventos]
```

---

## Task List

### Fase 0: Foundation

#### Task 1: Bootstrap del proyecto

**Description:** Inicializar Next.js 14 con TypeScript, Prisma, Tailwind. Setup de Git + GitHub. Cuenta de Neon creada y conectada.

**Acceptance criteria:**
- [ ] `npm run dev` levanta proyecto en localhost:3000
- [ ] Prisma conecta a Neon DB de desarrollo
- [ ] Repo en GitHub con README inicial
- [ ] Tailwind funcionando con un componente de prueba

**Verification:**
- [ ] `npm run build` sin errores
- [ ] `npx prisma db push` sin errores
- [ ] Página inicial muestra "StarMap BA" estilizado

**Dependencies:** Ninguna

**Files likely touched:** `package.json`, `prisma/schema.prisma`, `tailwind.config.ts`, `app/page.tsx`, `.env.local`

**Estimated scope:** S (1-2h)

---

### Fase 1: MVP — Mapa Funcional con Datos Reales (Producto + DS)

#### Task 1.5: Lookup manual de Bortle para 15 puntos

**Description:** Antes de seedear, abrir lightpollutionmap.info, buscar cada uno de los 15 puntos candidatos en Provincia BA y anotar su nivel Bortle (1-9). Guardar en un CSV o JSON. **Esto evita tener que procesar VIIRS al inicio del proyecto.**

**Acceptance criteria:**
- [ ] Archivo `data/seed-points.json` con 15 puntos: nombre, lat, lng, bortle, descripción breve
- [ ] Cada Bortle verificado en lightpollutionmap.info
- [ ] Cubrir distintos niveles: 2-3 puntos Bortle 3-4 (cielos buenos), varios Bortle 5-7 (medios), incluir contraste con CABA Bortle 8-9

**Verification:**
- [ ] Revisar manualmente que los puntos cubran distintos partidos de la provincia
- [ ] Distribución razonable de Bortle (no todos iguales)

**Dependencies:** Task 1

**Files likely touched:** `data/seed-points.json`

**Estimated scope:** S (30-60 min)

---

#### Task 2: Schema de DB + seed de puntos

**Description:** Modelar tabla `ObservationPoint`: id, nombre, slug, lat, lng, descripción, **bortleScale (Int 1-9)**, distancia desde CABA, tipo, notas de acceso. Seed con los 15 puntos de Task 1.5.

**Acceptance criteria:**
- [ ] Modelo `ObservationPoint` en Prisma schema con campo `bortleScale`
- [ ] Migración aplicada a Neon
- [ ] Seed corre y popula DB con los 15 puntos

**Verification:**
- [ ] `npx prisma db seed` sin errores
- [ ] Query devuelve 15 puntos con todos los campos completos

**Dependencies:** Task 1.5

**Files likely touched:** `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/`

**Estimated scope:** S-M (2-3h)

---

#### Task 3: Página /mapa con Leaflet (Client Component estricto)

**Description:** Página `/mapa` que renderiza Leaflet centrado en Provincia BA con markers. **El componente Map es 100% Client Component**: archivo separado con `'use client'`, importado en la page con `next/dynamic({ ssr: false })`. La page sí puede ser Server Component que fetcha los puntos.

**Acceptance criteria:**
- [ ] Página `/mapa` accesible y renderiza el mapa centrado en Provincia BA
- [ ] Todos los puntos como markers
- [ ] Click en marker abre popup con nombre
- [ ] Sin errores de hidratación en consola
- [ ] Sin flicker visible al cargar el mapa

**Verification:**
- [ ] Manual: abrir `/mapa`, ver mapa con 15 markers
- [ ] DevTools: no hay warnings de hydration mismatch
- [ ] Responsive: ocupa viewport sin scroll horizontal

**Dependencies:** Task 2

**Files likely touched:** `app/mapa/page.tsx`, `components/Map.tsx` (con `'use client'`), `app/api/points/route.ts`

**Estimated scope:** M (3-5h)

---

#### Task 4: Detalle de punto (sidebar / sheet)

**Description:** Click en marker abre panel lateral (desktop) o sheet (mobile) con info del punto. Muestra: nombre, descripción, Bortle, distancia desde CABA, tipo, link a "ver guía de observación".

**Acceptance criteria:**
- [ ] Click en marker abre panel/sheet con todos los campos del punto
- [ ] Botón cerrar funciona
- [ ] Layout responsive: lateral desktop, sheet bottom mobile

**Verification:**
- [ ] Manual desktop + mobile
- [ ] Click en distintos markers carga distinto contenido

**Dependencies:** Task 3

**Files likely touched:** `components/PointDetail.tsx`, `components/Map.tsx`

**Estimated scope:** S (2-3h)

---

### ✋ Checkpoint: Mapa básico con datos de Bortle reales
- [ ] Tests pasan, build limpio
- [ ] Usuario abre `/mapa`, ve puntos coloreados por Bortle, clickea uno, ve info
- [ ] **Revisar con humano antes de continuar**

---

### Fase 2: MVP — Clima y Score Real (Producto)

#### Task 5: Integración Open-Meteo con nubes desglosadas

**Description:** Endpoint `/api/weather?lat=X&lng=Y` que llama a Open-Meteo y devuelve, para las próximas 24h: **`cloud_cover_low`**, **`cloud_cover_mid`**, **`cloud_cover_high`**, visibility, temperatura, humedad. Cache 30 min en memoria.

**Acceptance criteria:**
- [ ] Endpoint funcional con cache
- [ ] Devuelve las 3 capas de nubes por separado
- [ ] Cache evita llamadas duplicadas en ventana de 30 min
- [ ] Maneja errores de red con 503

**Verification:**
- [ ] `curl /api/weather?lat=-37.32&lng=-59.13` devuelve JSON con las 3 cloud_cover
- [ ] Repetir misma query <30 min no llega a Open-Meteo (verificar logs)

**Dependencies:** Task 1

**Files likely touched:** `app/api/weather/route.ts`, `lib/weather.ts`, `lib/cache.ts`

**Estimated scope:** S (2-3h)

---

#### Task 6: Score dinámico real (Clima + Luna + Bortle)

**Description:** Función pura `computeScore({ cloudCoverLow, cloudCoverMid, cloudCoverHigh, visibility, moonPhase, moonAltitude, bortleScale }) → 0-100`. Pesos heurísticos documentados. **Las nubes bajas penalizan ~3x más que las altas. Bortle es el factor de mayor peso.** Score muestra breakdown ("Bortle 4: bueno", "Nubes bajas 80%: malo").

**Acceptance criteria:**
- [ ] Función `computeScore` con tests unitarios cubriendo casos extremos
- [ ] Markers del mapa color-codeados por score (verde >70, amarillo 40-70, rojo <40)
- [ ] Panel de detalle muestra score numérico + breakdown
- [ ] Date picker permite ver score futuro

**Verification:**
- [ ] Tests: Bortle 2 + cielo despejado + luna nueva → score >85
- [ ] Tests: Bortle 8 + cielo despejado → score <50 (luz mata todo)
- [ ] Tests: Bortle 3 + nubes bajas 100% → score <30
- [ ] Manual: colores en mapa coinciden con intuición

**Dependencies:** Task 5, Task 2

**Files likely touched:** `lib/score.ts`, `lib/score.test.ts`, `components/Map.tsx`, `components/PointDetail.tsx`

**Estimated scope:** M (3-4h)

---

#### Task 7: Geolocalización + distancia

**Description:** Pedir permiso de ubicación (opcional). Mostrar posición del usuario + distancia Haversine a cada punto. Lista alternativa al mapa ordenable por cercanía.

**Acceptance criteria:**
- [ ] Botón "Mi ubicación" en el mapa
- [ ] Distancia se muestra en popup de cada marker
- [ ] Lista de puntos ordenable por distancia
- [ ] App sigue funcionando si rechaza permiso

**Verification:**
- [ ] Manual desktop + mobile
- [ ] Haversine verificado contra Google Maps en 2-3 casos

**Dependencies:** Task 4

**Files likely touched:** `components/Map.tsx`, `lib/distance.ts`, `components/PointList.tsx`

**Estimated scope:** S (2-3h)

---

### ✋ Checkpoint: Score real y geolocalización funcionando
- [ ] Score combina los 3 factores correctamente
- [ ] Usuario ve distancia a cada punto
- [ ] **Revisar con humano**

---

### Fase 3: MVP — Guía de Observación (Producto)

#### Task 8: Servicio astronómico (objetos visibles)

**Description:** Wrapper sobre `astronomy-engine` que dado `{ lat, lng, datetime }` devuelve lista de objetos visibles esa noche: planetas mayores, Luna, top 30 estrellas brillantes, constelaciones de temporada. Cada objeto: nombre, magnitud, hora rise/set, hora de mejor visibilidad.

**Acceptance criteria:**
- [ ] Función `getVisibleObjects({ lat, lng, date }) → Object[]`
- [ ] Devuelve planetas, Luna, top 30 estrellas
- [ ] Tests con casos conocidos (Júpiter visible en fecha X)

**Verification:**
- [ ] Tests pasan vs. Stellarium/Sky Map en hemisferio sur
- [ ] Manual: planetas listados coinciden con apps de referencia

**Dependencies:** Task 1

**Files likely touched:** `lib/astronomy.ts`, `lib/astronomy.test.ts`, `data/stars.ts`

**Estimated scope:** M (4-6h)

---

#### Task 9: Página /punto/[slug] con guía

**Description:** Ruta `/punto/[slug]` (Server Component para SEO) con info del punto, score actual, weather, fase lunar, y lista de objetos visibles esta noche ordenados por hora. Date picker para otras noches. Metadata Open Graph.

**Acceptance criteria:**
- [ ] Ruta `/punto/tandil` renderiza con SSR
- [ ] Muestra clima, score, fase lunar
- [ ] Lista de objetos visibles ordenada por hora de salida
- [ ] Date picker ±30 días
- [ ] Lighthouse SEO >85

**Verification:**
- [ ] Manual: lighthouse + cambio de fecha + preview en WhatsApp

**Dependencies:** Task 6, Task 8

**Files likely touched:** `app/punto/[slug]/page.tsx`, `components/ObservationGuide.tsx`, `components/DatePicker.tsx`

**Estimated scope:** M (4-5h)

---

#### Task 10: Azimut/altitud + brújula visual

**Description:** Para cada objeto visible: azimut (0-360°) y altitud (0-90°) en tiempo real o para hora seleccionada. Brújula visual simple con flecha + indicador altitud. Texto en español: "Norte, 45° sobre el horizonte".

**Acceptance criteria:**
- [ ] Azimut + altitud por objeto para hora seleccionada
- [ ] Brújula visual con flecha + indicador
- [ ] Slider de hora actualiza posiciones en vivo

**Verification:**
- [ ] Tests: Júpiter en BA fecha X coincide con Stellarium
- [ ] Manual: brújula apunta al cuadrante correcto

**Dependencies:** Task 8, Task 9

**Files likely touched:** `lib/astronomy.ts`, `components/SkyCompass.tsx`, `components/ObservationGuide.tsx`

**Estimated scope:** M (4-5h)

---

### 🚩 Checkpoint MVP: Guía completa, flow end-to-end
- [ ] Mapa → punto → qué objetos están visibles → dónde apuntar
- [ ] Mobile responsive
- [ ] **Revisar con humano**

---

### Fase 4: Polish del MVP

#### Task 11: Contenido — Tips por objeto (15-25 objetos)

**Description:** Redactar contenido para cada objeto astronómico relevante en español rioplatense: qué es, dificultad (1-5), ocular sugerido, mejor época, dato curioso. Investigación con fuentes confiables (incluir IA como herramienta de research, pero la redacción y verificación es manual para mantener credibilidad técnica). Guardar como markdown estructurado o en DB.

**Acceptance criteria:**
- [ ] 15-25 objetos con contenido completo
- [ ] Tono rioplatense consistente
- [ ] Cada objeto: descripción, dificultad, tip de observación, dato curioso
- [ ] Panel expandible en la guía

**Verification:**
- [ ] Manual: leer todo, sin errores ortográficos ni tecnicismos mal usados
- [ ] Para cada objeto que devuelve Task 8, hay contenido asociado

**Dependencies:** Task 10

**Files likely touched:** `data/objects-content.ts` o tabla `CelestialObject`, `components/ObjectDetail.tsx`

**Estimated scope:** M (5-7h — escribir contenido es donde el producto adquiere alma)

---

#### Task 12: Mobile-first + PWA

**Description:** Auditar flow en mobile real. PWA instalable (manifest + service worker). UI touch-friendly.

**Acceptance criteria:**
- [ ] App instalable iOS/Android desde navegador
- [ ] Flow funciona en 360px de ancho
- [ ] Lighthouse mobile >85 (performance + a11y)

**Verification:**
- [ ] Lighthouse mobile
- [ ] Test en device real (idealmente de noche en un punto real)

**Dependencies:** Task 11

**Files likely touched:** `app/manifest.ts`, `public/icons/`, `next.config.js`, varios componentes

**Estimated scope:** M (4-5h)

---

#### Task 13: Deploy a producción

**Description:** Deploy a Vercel con subdominio `starmapba.vercel.app`. Variables de entorno (DB URL prod). Sentry free tier + Vercel Analytics.

**Acceptance criteria:**
- [ ] App accesible en `starmapba.vercel.app`
- [ ] DB de producción separada de dev
- [ ] Sentry capturando errores
- [ ] Analytics registrando visitas

**Verification:**
- [ ] Acceso desde otra red/device funciona
- [ ] Forzar error → llega a Sentry

**Dependencies:** Task 12

**Files likely touched:** `.env.production` (Vercel), `next.config.js`, Vercel dashboard config

**Estimated scope:** S (2-3h)

---

### 🚩 Checkpoint: MVP EN PRODUCCIÓN
- [ ] Producto LIVE en subdominio Vercel
- [ ] **Compartir en Espacio Profundo (foro), grupos FB de astrofotografía amateur, cuentas Twitter/X de divulgación. NO r/argentina (se pierde en ruido).**
- [ ] Documentar feedback en `tasks/feedback-mvp.md`
- [ ] **Solo después de validar con 20+ usuarios reales: evaluar comprar dominio .com.ar**

---

### Fase 5: Visualización Avanzada (Producto + DS Showcase)

#### Task 14: Procesar VIIRS NOAA → GeoJSON completo

**Description:** Notebook Python (rasterio/geopandas) que descarga VIIRS Annual VNL V2, recorta a bbox Provincia BA, convierte a GeoJSON con niveles Bortle. Output: `public/data/light-pollution-ba.geojson` <2MB. **Notebook documentado, va a GitHub como pieza de portfolio.**

**Acceptance criteria:**
- [ ] Notebook procesa el GeoTIFF y genera GeoJSON
- [ ] GeoJSON con polígonos por nivel Bortle
- [ ] Archivo final <2MB
- [ ] Notebook documentado y publicable

**Verification:**
- [ ] GeoJSON válido en geojson.io
- [ ] Comparación visual vs. lightpollutionmap.info

**Dependencies:** Ninguna (puede ir en paralelo con MVP)

**Files likely touched:** `data-science/light-pollution.ipynb`, `public/data/light-pollution-ba.geojson`

**Estimated scope:** M (5-7h — primera vez con geodata)

---

#### Task 15: Heatmap layer en el mapa

**Description:** Capa de contaminación lumínica como overlay semi-transparente con toggle on/off. Leyenda con escala Bortle.

**Acceptance criteria:**
- [ ] Toggle "Mostrar contaminación lumínica" en el mapa
- [ ] Capa renderiza sobre OpenStreetMap correctamente
- [ ] Leyenda con escala de colores visible

**Verification:**
- [ ] Manual: CABA en rojo, sierras y costa en azul/verde

**Dependencies:** Task 14, Task 3

**Files likely touched:** `components/Map.tsx`, `components/LightPollutionLayer.tsx`

**Estimated scope:** S (2-3h)

---

### ✋ Checkpoint: Visualización completa
- [ ] Mapa muestra tanto puntos como heatmap de contaminación lumínica

---

### Fase 6: Showcase de Data Science (Portfolio)

#### Task 17: Notebook EDA público + página /data-science

**Description:** Notebook con 4-6 análisis: distribución de contaminación lumínica en BA, correlación distancia-CABA vs. calidad de cielo, mejores meses del año (clima histórico + fase lunar). Publicar en `/data-science` con embed del notebook. **Pieza principal de portfolio.**

**Acceptance criteria:**
- [ ] Notebook con 4-6 análisis con visualizaciones
- [ ] Página `/data-science` linkea al notebook + resumen ejecutivo
- [ ] Notebook en GitHub con README explicativo

**Verification:**
- [ ] Leer como si fueras recruiter: ¿el análisis cuenta una historia coherente?
- [ ] Link público sin login

**Dependencies:** Task 14

**Files likely touched:** `data-science/exploratory-analysis.ipynb`, `app/data-science/page.tsx`

**Estimated scope:** M (6-8h)

---

#### Task 18: Refactor heurístico post-EDA (NO ML)

**Description:** Usar hallazgos del EDA para refinar matemáticamente los pesos del score: relación humedad↔dispersión de luz artificial, penalización exponencial de luna llena cerca de objetos débiles, etc. Documentar las decisiones en el notebook. **No es ML por ML; es ajustar la heurística con datos reales.**

**Acceptance criteria:**
- [ ] `computeScore` actualizado con pesos refinados
- [ ] Notebook explica los nuevos pesos y por qué
- [ ] Tests actualizados con casos del EDA

**Verification:**
- [ ] Tests pasan; rangos de score siguen siendo razonables
- [ ] Performance endpoint <100ms

**Dependencies:** Task 17

**Files likely touched:** `lib/score.ts`, `data-science/exploratory-analysis.ipynb`

**Estimated scope:** S (3-4h)

---

#### Task 19: Dashboard "mejores noches del mes"

**Description:** Cron diario en Vercel calcula, para cada punto, las 5 mejores noches del próximo mes. Página `/mejores-noches` con tabla/calendario filtrable.

**Acceptance criteria:**
- [ ] Cron diario actualiza tabla `BestNights`
- [ ] Página muestra top noches por punto
- [ ] Filtrable por punto o fecha

**Verification:**
- [ ] Verificar manualmente: noches sin luna llena ranquean alto
- [ ] Cron ejecuta 3 días seguidos sin errores

**Dependencies:** Task 6 (con Bortle), Task 8

**Files likely touched:** `app/api/cron/best-nights/route.ts`, `app/mejores-noches/page.tsx`, `prisma/schema.prisma`

**Estimated scope:** M (4-6h)

---

### 🚩 Checkpoint: Showcase DS completo
- [ ] **Linkear `/data-science` en LinkedIn, CV, README del repo**

---

### Fase 7: Engagement (Producto Real)

#### Task 20: Alertas por email

**Description:** Suscripción a "avisame cuando haya noche >85 en punto X". Cron diario evalúa + Resend manda mail.

**Acceptance criteria:**
- [ ] Form de suscripción en cada punto
- [ ] Tabla `Subscription`
- [ ] Email correcto con resumen de objetos visibles
- [ ] Unsubscribe funciona

**Verification:**
- [ ] Flow completo end-to-end

**Dependencies:** Task 19

**Files likely touched:** `prisma/schema.prisma`, `app/api/subscribe/route.ts`, `app/api/cron/alerts/route.ts`, `lib/email.ts`

**Estimated scope:** M (5-6h)

---

#### Task 21a: NextAuth setup (magic links)

**Description:** Auth con NextAuth + email magic links. Persistencia en Neon. Páginas `/login` y `/logout`.

**Acceptance criteria:**
- [ ] Magic link llega por email
- [ ] Sesión persiste correctamente
- [ ] Logout funciona

**Verification:**
- [ ] Flow registro → login → logout

**Dependencies:** Task 1

**Files likely touched:** `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `prisma/schema.prisma`

**Estimated scope:** M (4-5h)

---

#### Task 21b: Favoritos + sync con alertas

**Description:** Dashboard `/mi-cuenta`: usuarios guardan favoritos y configuran preferencias (threshold de score, distancia máxima). Alertas (Task 20) se vinculan a la cuenta.

**Acceptance criteria:**
- [ ] Dashboard con favoritos y preferencias editables
- [ ] Alertas vinculadas a usuario logueado

**Verification:**
- [ ] Flow: login → guardar favorito → editar preferencia → recibir alerta correcta

**Dependencies:** Task 20, Task 21a

**Files likely touched:** `app/mi-cuenta/page.tsx`, `prisma/schema.prisma`

**Estimated scope:** M (4-5h)

---

#### Task 22: Calendario de eventos astronómicos

**Description:** Página `/eventos` con timeline 12 meses: lluvias de meteoros, eclipses, conjunciones, paso ISS, lunas notables. Cada evento linkea al mejor punto para verlo.

**Acceptance criteria:**
- [ ] Timeline de próximos 12 meses
- [ ] Cada evento linkea a mapa con filtros
- [ ] Eventos calculados con astronomy-engine

**Verification:**
- [ ] Comparar con timeanddate.com
- [ ] Manual: click en evento navega correctamente

**Dependencies:** Task 8

**Files likely touched:** `lib/astronomy.ts`, `app/eventos/page.tsx`, `data/events-precomputed.json`

**Estimated scope:** M (5-7h)

---

### 🚩 Checkpoint Final: Producto Completo
- [ ] Producto en producción con usuarios registrados
- [ ] Showcase DS público linkeado en marca personal
- [ ] Sistema de retención operativo

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Precisión astronomy-engine en hemisferio sur | Alto | Baja | Tests vs. Stellarium en Task 8. La librería sí soporta hemisferio sur |
| Open-Meteo rate limits | Bajo | Baja | Cache 30 min + free tier 10k/día |
| Procesar VIIRS más complejo que esperado | Medio | Media | Bortle hardcodeado en MVP (Task 1.5) evita bloqueo. Task 14 (procesamiento completo) es opcional para el producto |
| Mercado argentino chico | Alto para "producto" | Media | Validar post-Task 13 antes de seguir invirtiendo. Si tibio, pivotear foco a portfolio |
| Mobile UX con mapa | Medio | Media | Probar device real desde Task 3 |
| **Procrastinar por pulir más antes de deployar** | **Alto** | **Alta** ⚠️ | **Deadline duro: deploy Task 13 max 6 semanas desde Task 1** |
| Burnout con scope grande | Alto | Media | Hitos públicos en RRSS antes de cada fase grande |
| Credibilidad técnica si contenido se nota AI-generated | Medio | Media | Task 11 con investigación + redacción manual; IA solo research |

---

## Estimación de Esfuerzo

Con 10h/sem promedio:

| Fase | Esfuerzo | Semanas |
|---|---|---|
| Fase 0: Foundation | 2h | 0.2 |
| Fase 1: MVP Mapa con Bortle | 8-10h | 1 |
| Fase 2: Clima y score real | 8h | 0.8 |
| Fase 3: Guía observación | 14h | 1.4 |
| Fase 4: Polish MVP | 13h | 1.3 |
| **🚩 MVP EN PRODUCCIÓN** | **~46h** | **~5 semanas** |
| Fase 5: Visualización avanzada | 8h | 0.8 |
| Fase 6: Showcase DS | 14h | 1.4 |
| **🚩 Versión completa + portfolio** | **~68h** | **~7 semanas** |
| Fase 7: Engagement | 17h | 1.7 |
| **🚩 Producto completo** | **~85h** | **~9 semanas** |

**Target: producto en producción en ~5-6 semanas, versión completa en ~9-10 semanas.**

---

## Decisiones Tomadas (basadas en revisión crítica)

- ✅ **Bortle en el score desde el día 1** (lookup manual de 15 puntos, evita bloqueo de VIIRS)
- ✅ **Leaflet como Client Component estricto** (`'use client'` + `next/dynamic({ ssr: false })`)
- ✅ **Open-Meteo desglosado** (`cloud_cover_low/mid/high` — nubes bajas pesan más)
- ✅ **NO ML en Task 18** — refactor heurístico basado en EDA, no regresión con datos sintéticos
- ✅ **Subdominio Vercel hasta validar** — no comprar dominio .com.ar antes del MVP validado
- ✅ **Espacio Profundo + grupos FB astrofotografía** como canales primarios (no r/argentina)
- ✅ **Task 21 dividida** en 21a (auth) + 21b (favoritos)
- ✅ **Task 11 mantiene scope M** — contenido escrito manualmente, IA solo para research (proteger credibilidad técnica)

## Preguntas Abiertas (responder antes de Task 1)

1. **¿Nombre definitivo?** "StarMap BA" (de trabajo) vs. "Cielo Pampa" / "AstroPampa" (más identidad local). El nombre se puede cambiar más adelante; importa para el repo + dominio.
2. **¿Cuenta de Neon ya tenés?** Si no, hay que crearla (es gratis, lleva 5 min).
3. **¿GitHub username confirmado?** Para crear el repo público desde el inicio.

---

## Notas Finales

- **Vinculá esto a tu marca personal Joaquin Rao desde el día 1:** commits con tu nombre, README del repo apunta a tu portfolio, link a `/data-science` desde tu LinkedIn cuando llegues a Fase 6.
- **Si después del MVP la validación es tibia,** pivotar Fase 5-6 a un análisis más amplio ("Mejores cielos de Argentina") y dejar Fase 7 para otro proyecto.
- **El MVP es el objetivo principal.** Todo lo de Fase 5+ es valor agregado dependiendo de respuesta del mercado.
