# 🔍 Auditoría integral — StarMap BA

**Fecha:** 2026-06-25 · **Alcance:** repo completo en `main` (HEAD `c6d9d93`), producción en Vercel (starmapba.com.ar) · **Modo:** solo lectura — ningún archivo de código fue modificado.

**Metodología:** 7 sub-agentes especializados auditaron en paralelo Seguridad, Base de datos, Diseño/UI-UX, Rendimiento, Código/Arquitectura, DevOps/Deploy y SEO. Este documento consolida sus informes: los hallazgos que aparecieron en más de un dominio se fusionaron en una sola entrada (marcada con los dominios de origen), y todo está ordenado por severidad global. Cada ubicación `archivo:línea` fue verificada por el agente correspondiente; lo que no se pudo comprobar desde el repo está marcado **[a verificar]**.

> **✅ Nivel 1 del plan de acción — RESUELTO (2026-06-26):** C1, C2, A1, A2 y A3 ya están arreglados y verificados (lint/typecheck/tests/build + smoke test en browser). Detalle abajo, en la sección del plan. El resto de los hallazgos (Niveles 2-4) sigue pendiente tal como se documentó originalmente.
>
> **✅ Nivel 2 del plan de acción — RESUELTO (2026-07-06):** A4, A5, A6, A8, A9, A10, A11, M9, M10, M11, M12, M23, M24 ya están arreglados y verificados (lint/typecheck/tests/build + smoke test en browser, incluyendo click real sobre un marker del mapa y foco sobre el slider). Detalle abajo, en la sección del plan.
>
> **✅ Nivel 3 del plan de acción — RESUELTO (2026-07-07):** A7, A12, M2, M3, M4, M5, M7, M18, M19, M20, M21, M22, M25, M27, M28, M29, M30, M31 ya están arreglados y verificados (lint/typecheck/76 tests en verde/build + smoke test en browser + deploy confirmado en producción). Incluye integridad de datos a nivel DB (CHECK constraints + trigger que recalcula el rating solo, sin depender de ningún código de app), consolidación de 5+ duplicados (labels, `<Badge>`, haversine, bandas de score, tipo `Hospedaje`), accesibilidad completa del mapa (diálogo con foco/Escape, `aria-pressed`, `prefers-reduced-motion`), schema.org (`TouristAttraction`/`Article`/`WebSite`) y branch protection en GitHub con bypass de admin. **M6 (build job nuevo en CI) se dejó explícitamente sin hacer** — decisión del usuario, no pendiente por olvido. El primer deploy de este nivel falló por un mixup de `DATABASE_URL`/`DIRECT_DATABASE_URL` en Vercel (detectado por una validación nueva agregada en este mismo nivel); se resolvió pisando ambas variables con strings frescos desde Neon Console y redeployando. Detalle abajo, en la sección del plan.
>
> **✅ Nivel 4 del plan de acción — RESUELTO (2026-07-08):** los 28 hallazgos Bajos de código + 3 Medios colgados (M14, M15 y M16 confirmado) ya están arreglados y verificados (lint/typecheck/76 tests/build en verde + smoke test en browser). Backend: validación server-side del `consejo` (B2) y de rangos lat/lng en `/api/conditions` (B27), timeouts en los fetch a Resend (B28) y Open-Meteo bajado a 4s (M14), lat/lon en la key de caché del plan (B29), magic link que falla ruidoso en prod sin `RESEND_API_KEY` en vez de loggear el token (B1), fail-fast de `AUTH_SECRET` (B10). DB: `@@index([userId])` en Review/Account/Session, ya migrado a dev y prod (B7). Rendimiento: sacado Geist Mono que nunca se usaba (B15), `sizes` en las figuras (B16), `Cache-Control` largo en los assets estáticos vía `:path+` sin tocar el HTML (B17), `React.cache` en `getPointBySlug` (M15), `Promise.all` de perfil+reseña (B9). SEO: `robots` bloquea `/perfil` (B13), sacadas las meta `keywords` muertas (B14). UI/UX + a11y: grid de stats responsive (B18), tokens en el loader del mapa (B20), roving tabindex + flechas en el selector de estrellas (B21), labels interpolados en slider y curva (B22), copy duplicado del DatePicker (B23), nota `isNight` muerta eliminada (B24), control de zoom propio en el mapa (B25), score animado accesible con `sr-only` (B26), `<Link>` en el panel del mapa (B30). Código: `MapPoint` derivado de `Prisma.ObservationPointGetPayload` (B31), convención de nombres documentada en `AGENTS.md` (B32). Seguridad: CSP completa en `Report-Only` con los orígenes reales, lista para promover a enforce (B3), `npm audit fix` que cerró la vuln **high** de `hono` (B4). **Pendientes de acción externa (no de código), documentados abajo:** M8 (UptimeRobot), M16 (fijar región `iad1` en Vercel — Neon confirmado en `us-east-1`), B5 (reset opcional de password de Neon), B8 (cron de limpieza de sesiones), y el resto de `postcss` que solo se cierra cuando Next lo parchee.
>
> **⏳ M8 (UptimeRobot) — pendiente de una acción externa, no de código:** `/api/health` ya existe y funciona (chequea server + DB, responde 503 si algo está degradado). Falta que alguien lo monitoree. Pasos (5 minutos, gratis): (1) crear cuenta en [uptimerobot.com](https://uptimerobot.com), (2) "Add New Monitor" → tipo HTTP(s), URL `https://starmapba.com.ar/api/health`, intervalo 5 minutos, (3) agregar tu email como contacto de alerta. Avisa por mail si el sitio o la DB se caen — sin esto, te enterás por un usuario antes que por una alerta.

---

## Resumen ejecutivo

**Estado general: sólido.** El proyecto tiene una base mejor que la media para un producto de portfolio en producción: **cero secrets filtrados** (verificado en la historia completa de git), autenticación y autorización correctas (sin IDOR, sin escrituras anónimas), **sin vectores XSS / SQLi / SSRF**, tipado estricto real (cero `any`), CI en verde, dominio puro en `lib/`, buen manejo de errores hacia Open-Meteo y estados de carga/vacío bien resueltos. No hay ningún incendio: los dos hallazgos Críticos son un fix de una línea y una feature de accesibilidad.

**Los 5 problemas más importantes:**

1. **El flujo principal es inaccesible sin mouse y invisible para Google** *(Crítico, UI/UX + SEO)* — los puntos del mapa solo se descubren clickeando `CircleMarker`s de Leaflet: no son operables por teclado ni lectores de pantalla, y **no existe ni un solo link HTML `<a href="/punto/...">` en todo el sitio** (los crawlers solo llegan por sitemap). Una sola solución arregla ambos: una lista SSR de los 22 puntos en `/mapa`.
2. **`SITE_URL` cae por defecto al dominio viejo de Vercel** *(Crítico, SEO)* — si `NEXT_PUBLIC_SITE_URL` no está seteada en Vercel, el sitemap, canonicals y og:url apuntan a `starmap-ba-12.vercel.app`. Fix de 1 línea + verificación en el dashboard.
3. **El rating denormalizado se actualiza sin atomicidad** *(Alto, DB)* — reseñas concurrentes o un crash entre el upsert y el recompute dejan `ratingAvg/ratingCount` inconsistentes, sin autocorrección. Además, borrar un usuario (cascada) deja ratings "fantasma".
4. **Migraciones a prod 100% manuales** *(Alto, DevOps)* — Vercel deploya el código en cada push, pero el schema de prod se migra a mano: si se olvida el paso, 500s en producción. Se cierra con `DIRECT_DATABASE_URL` + `migrate deploy` en el build.
5. **/mapa y la landing cargan pesado** *(Alto, Rendimiento)* — el overlay VIIRS pesa 1.53 MB (PNG → WebP lo baja ~80%), el fondo del hero se carga sin prioridad (LCP), y `app/template.tsx` mete framer-motion en **todas** las rutas dejando la página en `opacity: 0` hasta que hidrata el JS.

**Conteo consolidado (tras fusionar duplicados entre dominios):**

| Severidad | Cantidad |
|---|---|
| 🔴 Crítico | 2 |
| 🟠 Alto | 12 |
| 🟡 Medio | 32 |
| 🟢 Bajo | 32 |

---

## 🔴 Hallazgos CRÍTICOS

| # | Dominio | Hallazgo | Ubicación | Impacto | Recomendación |
|---|---|---|---|---|---|
| C1 | UI/UX + SEO | Los markers del mapa (`CircleMarker` SVG) no son enfocables ni operables por teclado, y no existe ningún listado alternativo ni link HTML `<a href="/punto/...">` en todo el sitio: la función core (descubrir un punto y abrir su guía) es imposible sin mouse (WCAG 2.1.1) y los crawlers no ven links internos a los 22 puntos (PageRank interno nulo, dependencia total del sitemap) | `components/LeafletMap.tsx:223-241`, `app/mapa/page.tsx:30-32` | Usuarios de teclado/lectores de pantalla no pueden usar el producto; Google no descubre las fichas por links | **Una solución para ambos:** lista SSR de los 22 puntos en `/mapa` (panel/acordeón con `<Link href={/punto/${slug}}>` por punto, que además llame a `selectPoint` client-side). Alternativa/complemento: sección "Los 22 puntos" en la landing |
| C2 | SEO | `SITE_URL` tiene fallback `https://starmap-ba-12.vercel.app` (el dominio viejo): todo lo absoluto (metadataBase, og:url, sitemap, robots) depende de que `NEXT_PUBLIC_SITE_URL` esté seteada en Vercel. `.env.example` también muestra la URL vieja | `lib/site.ts:6`, `.env.example:16` | Si la env falta en prod, señales de canonicidad divididas entre dos dominios → indexación duplicada | Cambiar el fallback a `"https://starmapba.com.ar"`, actualizar `.env.example`, **[a verificar]** que la env esté en Vercel Production, y configurar redirect 301 del dominio vercel.app al propio |

---

## 🟠 Hallazgos ALTOS

| # | Dominio | Hallazgo | Ubicación | Impacto | Recomendación |
|---|---|---|---|---|---|
| A1 | DB (+Código) | El rating denormalizado NO se actualiza de forma atómica: `submitReview`/`deleteReview` hacen upsert/delete y luego `recomputeRating` (aggregate + update) en 3-4 round-trips sin `$transaction` (no hay ninguno en el repo). Reseñas concurrentes se interleavean (last-write-wins con agregado viejo); un crash entre pasos deja `ratingAvg/ratingCount` inconsistentes sin autocorrección | `app/punto/[slug]/actions.ts:12-22, 61-66, 85-86` | Rating incorrecto visible en la ficha; inconsistencia silenciosa | Un único statement atómico vía `$executeRaw`: `UPDATE "ObservationPoint" p SET ... FROM (SELECT AVG/COUNT FROM "Review" WHERE "pointId"=$1 AND status='APPROVED') s WHERE p.id=$1` — o `$transaction` interactivo |
| A2 | DevOps (+DB) | Ventana de incompatibilidad schema/código: las migraciones a prod son 100% manuales y nada las enforcea. Vercel deploya el código en el push; si te olvidás el `migrate deploy`, el código espera columnas que prod no tiene → 500s en runtime, no en build | `DEPLOY.md:80-95`, `package.json:7`, `prisma.config.ts:12-14` | Caída parcial de prod dependiente de disciplina humana | En `prisma.config.ts`: `url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL`. Agregar `DIRECT_DATABASE_URL` (directa, sin `-pooler`, branch main) en Vercel y cambiar el build a `prisma migrate deploy && next build`. Resuelve también el problema del advisory lock del pooler |
| A3 | Rendimiento | `viirs-overlay.png` pesa **1.53 MB** (PNG 2798×4056) y se descarga SIEMPRE al abrir /mapa (`showOverlay` default `true`, sin lazy/preload) | `components/LeafletMap.tsx:121, 210` | ~1.5 MB en el critical path de /mapa; 3-6 s en 4G + decode de 11 MP que traba el main thread en móviles | Convertir a **WebP q≈80** (~150-350 KB; `ImageOverlay` acepta cualquier URL) y opcionalmente bajar a ~2000 px de ancho. Agregar `<link rel="preload" as="image">` en /mapa |
| A4 | Rendimiento | El fondo del hero (`sky-hero.jpg`, 277 KB) se carga como CSS `background-image`: sin preload, sin `next/image`, sin `fetchpriority` — el preload scanner no lo ve | `components/HeroBackdrop.tsx:31-33` | Candidato a LCP de la landing descargándose tarde y con prioridad baja | `next/image` con `fill` + `priority` + `sizes="100vw"` debajo de los gradientes, o preload manual. Bonus: AVIF (~120 KB) |
| A5 | Rendimiento | `app/template.tsx` es un client component con framer-motion envolviendo TODAS las rutas con `initial={{opacity:0}}`: (1) ~30-40 KB gz en todos los bundles, incluso /mapa; (2) el SSR emite `opacity:0` → **contenido invisible hasta hidratar** | `app/template.tsx:7, 11-15` | FCP/LCP gateados por el bundle JS en todas las rutas | Eliminar `template.tsx` y hacer el fade con animación CSS (como el `animate-rise` existente), o `LazyMotion` + `m` si se conserva |
| A6 | SEO | El sitemap NO incluye `/data-science` | `app/sitemap.ts:15-24` | La página vitrina del portfolio sin señal de descubrimiento explícita | Agregar la entrada con `changeFrequency: "monthly", priority: 0.7` |
| A7 | SEO | Cero datos estructurados schema.org en todo el sitio | Todo `app/` | Sin rich results: los 22 puntos no califican para paneles de lugar, estrellas de rating ni breadcrumbs | JSON-LD: `TouristAttraction`/`Place` con `geo` + `aggregateRating` (ya existen `ratingAvg/ratingCount`) en `/punto/[slug]`; `Article` en `/data-science`; `WebSite` en el layout |
| A8 | SEO | `generateMetadata` de `/punto/[slug]` solo define title/description: hereda og:title/og:url de la home y la og:image global genérica | `app/punto/[slug]/page.tsx:54-66`, `app/opengraph-image.tsx` | Compartir un punto en WhatsApp/redes muestra la preview de la home → menos CTR | Devolver también `openGraph`/`twitter` por punto; opcional: `opengraph-image.tsx` dinámico con nombre + Bortle |
| A9 | UI/UX | `--color-fg-faint` da 4.05:1 sobre `ink` y 3.73:1 sobre `surface`: **falla WCAG AA** (4.5:1) y se usa masivamente en texto ≤12px (fechas, captions, footers, placeholders) | `app/globals.css:13`; usos en `app/punto/[slug]/page.tsx:472,483-487`, `components/BeforeAfterSlider.tsx:102`, `ProfileForm.tsx` | Texto secundario ilegible para baja visión en casi todas las páginas | Subir el token a ~`oklch(0.62 0.022 265)` (≈5.3:1) o reservar `fg-faint` para texto grande/decorativo |
| A10 | UI/UX | El slider antes/después usa `input range` con `opacity-0` sin ningún estilo de foco visible en el contenedor | `components/BeforeAfterSlider.tsx:92-100` | Operable por teclado pero invisible al foco (WCAG 2.4.7) | `has-[:focus-visible]:ring-2 ring-accent` en el contenedor |
| A11 | UI/UX | En 375px la leyenda (~200px) y los toggles (~140px) del mapa se pisan, y la leyenda de 8+ filas tapa gran parte del mapa sin poder colapsarse | `components/LeafletMap.tsx:259, 296-332` | En mobile (caso de uso principal) el mapa queda oculto y los controles superpuestos | Colapsar la leyenda a un botón "Leyenda" en mobile (`<details>` o estado), versión completa desde `sm:` |
| A12 | Código | Módulos núcleo de `lib/` sin ningún test: `weather.ts` (parseo Open-Meteo + offsets UTC), `conditions.ts`, `observation-plan.ts`, `observation-time.ts` (timezones), `rate-limit.ts`. Los 46 tests cubren solo helpers puros; server actions: cero | `lib/weather.ts`, `lib/conditions.ts`, `lib/observation-plan.ts`, `lib/observation-time.ts` | La lógica más propensa a bugs (timezones, API externa) sin red de regresión; el CI da falsa confianza | Tests con `fetch` mockeado y fechas fijas; extraer la validación de `submitReview` a una función pura testeable |

---

## 🟡 Hallazgos MEDIOS

| # | Dominio | Hallazgo | Ubicación | Recomendación |
|---|---|---|---|---|
| M1 | Seguridad | Rate limiting opcional y **fail-open**: sin las env vars de Upstash (o si Upstash falla), ningún límite aplica a login (email-bombing vía Resend), /api/conditions (cuota Open-Meteo) ni reseñas | `lib/rate-limit.ts:10-14, 47-53` | **[A verificar]** que `UPSTASH_REDIS_REST_URL/TOKEN` estén en Vercel Production. En código: warning si `VERCEL_ENV==="production"` sin Upstash; considerar fail-closed para login |
| M2 | Seguridad + DB | Moderación débil: `status` default `APPROVED` (publicación instantánea), el filtro anti-links no cubre `bit.ly/.app/.dev/.me/.gg`, la edición vía upsert no re-modera, y no existe NINGÚN código que escriba `PENDING/REJECTED` (el enum es peso muerto) | `prisma/schema.prisma:75`, `lib/moderation.ts:8`, `app/punto/[slug]/actions.ts:61-65` | Ampliar el regex a patrón genérico de dominio con allowlist; documentar la "moderación reactiva" o agregar una acción admin mínima que setee status y recalcule rating en la misma transacción |
| M3 | DB | Cascada `User → Review` borra reseñas pero nada recalcula el rating de los puntos afectados: agregados "fantasma" | `prisma/schema.prisma:80` | Flujo de borrado de usuario que recopile `pointId`s y recalcule, o trigger SQL `AFTER INSERT/UPDATE/DELETE ON "Review"` (resuelve también A1) |
| M4 | DB | Validaciones críticas solo en JS, sin constraints en la DB: `rating` 1-5, `cuerpo` ≤1000, `bortle` 1-9, `lat/lng` sin rango — ninguna migración crea CHECKs | `prisma/schema.prisma:35,72`, `app/punto/[slug]/actions.ts:51-56` | Migración manual con `CHECK (rating BETWEEN 1 AND 5)`, `CHECK (char_length(cuerpo) <= 1000)`, `CHECK (bortle BETWEEN 1 AND 9)`, rangos lat/lng |
| M5 | DB | Sin validación runtime de que `DATABASE_URL` de prod sea la pooled: si alguien pega la directa en Vercel, picos de lambdas agotan las conexiones de Neon | `lib/env.ts:17-21`, `lib/prisma.ts:12` | En `lib/env.ts`: si `NODE_ENV==="production"` y la URL no contiene `-pooler`, lanzar error fail-fast |
| M6 | DevOps | CI no corre `next build`: errores exclusivos de build (prerender, límites server/client) llegan a Vercel sin aviso. Mitigado: Vercel mantiene el último deploy bueno | `.github/workflows/ci.yml:22-25` | Job `build` con secret `DATABASE_URL` del branch dev de Neon (dummy no alcanza: /mapa prerenderiza contra DB). Aceptable omitirlo si no querés gastar cómputo |
| M7 | DevOps | `main` sin branch protection (verificado vía API: 404) y Vercel deploya en paralelo al CI → el CI nunca bloquea nada, es informativo a posteriori | Config GitHub del repo | Branch protection requiriendo el check "Lint · Typecheck · Test" (con bypass de admin para fixes triviales); branch + PR para cambios riesgosos |
| M8 | DevOps | Sin monitoreo ni error tracking: `/api/health` está bien hecho pero nadie lo consulta; errores runtime solo en logs de Vercel (retención de horas en free tier) | `app/api/health/route.ts:7-21` | UptimeRobot (gratis) contra `https://starmapba.com.ar/api/health` cada 5 min. Opcional: `@sentry/nextjs` free tier |
| M9 | SEO | Duplicación de marca en títulos: template `"%s · StarMap BA"` + páginas que ya incluyen "— StarMap BA" → "Mapa de cielos — StarMap BA · StarMap BA" | `app/layout.tsx:31` + `app/mapa/page.tsx:7`, `app/punto/[slug]/page.tsx:61,63`, `app/data-science/page.tsx:8` | Quitar el sufijo de los titles por página; el template lo agrega una vez |
| M10 | SEO | Sin `alternates.canonical` en ninguna página; `/punto/[slug]` acepta `?date=` (force-dynamic) generando N variantes indexables por punto | `app/punto/[slug]/page.tsx:30,85` | `alternates: { canonical: /punto/${slug} }` (sin query) en `generateMetadata`; ídem en las demás páginas |
| M11 | SEO | El sitemap se congela en build (sin `revalidate`): puntos nuevos invisibles hasta redeploy; `lastModified: new Date()` es la fecha de build (dato falso) | `app/sitemap.ts:5-13` | `export const revalidate = 3600` y usar `updatedAt` de Prisma como lastModified |
| M12 | SEO | `/mapa` no tiene `<h1>` (solo el Wordmark) | `app/mapa/page.tsx:19-33` | `<h1>` (puede ser `sr-only`): "Mapa de cielos oscuros de la Provincia de Buenos Aires" |
| M13 | SEO | Sin links internos entre puntos: `/punto/[slug]` solo linkea "← Volver al mapa" | `app/punto/[slug]/page.tsx:131-136` | Sección "Otros cielos cerca" con 3-4 `<Link>` a puntos del mismo tipo o cercanos (datos ya disponibles en `getMapPoints`) |
| M14 | Rendimiento | Timeout de Open-Meteo de 10 s en el request path de /punto (force-dynamic): si la API se degrada, el contenido cuelga hasta 10 s | `lib/weather.ts:103` | Bajar a 3-4 s (el catch de `conditions.ts:33-35` ya degrada con gracia); el `revalidate: 1800` existente hace el hit frío infrecuente |
| M15 | Rendimiento | `getPointBySlug()` se ejecuta 2 veces por request en /punto (generateMetadata + page) sin dedupe | `app/punto/[slug]/page.tsx:60, 87`, `lib/points.ts:21-23` | Envolver en `React.cache()` en `lib/points.ts` |
| M16 | Rendimiento | Sin `vercel.json` ni `preferredRegion`: la región de funciones queda en default **[a verificar]**; Neon está en us-east-1 → posible latencia cross-region multiplicada por query | Raíz del repo | Fijar `{"regions": ["iad1"]}` en `vercel.json` para co-locar con Neon |
| M17 | Rendimiento | Filtro CSS sobre las tiles satelitales + decode del overlay de 11 MP durante pan/zoom: costo de paint por frame en móviles de gama media (INP) | `app/globals.css:122-126`, `components/LeafletMap.tsx:210` | Mitigado en gran parte por A3 (WebP ~2000px). Medir en móvil real; alternativa `mix-blend-mode` |
| M18 | UI/UX | `prefers-reduced-motion` no cubre `.kenburns` ni las animaciones de framer-motion (FadeIn, AnimatedScore, CTAButton, template) — solo el parallax del hero | `app/globals.css:115-117, 153-172`, `components/FadeIn.tsx:26-35` | Agregar `.kenburns { animation: none }` al media query y `<MotionConfig reducedMotion="user">` |
| M19 | UI/UX | Los toggles del mapa (Satélite/Oscuro, "Luz urbana") no exponen estado: sin `aria-pressed`, el estado activo es solo color | `components/LeafletMap.tsx:260-271, 276-281` | `aria-pressed={showOverlay}` y radiogroup (o aria-pressed) en el par de capas |
| M20 | UI/UX | El panel de detalle del punto no es un diálogo: no recibe foco al abrir, no cierra con Escape, el foco no vuelve al cerrar | `components/LeafletMap.tsx:335-345` | `role="dialog"` + `aria-label={selected.nombre}`, foco inicial, handler de Escape |
| M21 | UI/UX + Código | Color "escapada" `#1e40af`: **2.26:1** sobre el fondo — el anillo del marker y la leyenda son casi invisibles (falla 3:1 no-textual). Además `#7c3aed/#1e40af/#22d3ee/#ff9b9b` hardcodeados en 3+ lugares fuera del sistema de tokens (incl. `observation-plan.ts`, módulo de dominio que conoce colores de UI) | `components/LeafletMap.tsx:81-82,249,289`, `app/punto/[slug]/page.tsx:159,194-195`, `lib/observation-plan.ts:22-28` | Aclarar el azul (p.ej. `#4f74e3`, ≥3:1) y promover los colores a tokens/módulo de tema único; el color del astro lo asigna la capa de presentación |
| M22 | UI/UX | Inputs sin label accesible: email del login y textarea/consejo de reseñas solo tienen placeholder (encima en `fg-faint`, ver A9) | `app/login/page.tsx:39-46`, `components/ReviewForm.tsx:55-72` | `<label>` visible o `aria-label` |
| M23 | UI/UX | Con Open-Meteo caído, la UI dice "No hay datos de clima para esta fecha (fuera del rango de pronóstico)" — diagnóstico incorrecto cuando lo que falló es la API | `lib/conditions.ts:31-35`, `app/punto/[slug]/page.tsx:210-215` | Distinguir causa (`weatherError: "unavailable" \| "out_of_range"`) y mostrar "No pudimos consultar el clima ahora, probá en unos minutos" |
| M24 | UI/UX | Copy desactualizado en el panel del mapa: "Fotos y reseñas de la comunidad, próximamente" — las reseñas ya existen y funcionan | `components/LeafletMap.tsx:387-389` | Mostrar el rating real (`ratingAvg/ratingCount` ya están en el modelo) o eliminar la línea |
| M25 | UI/UX + Código | Chip/Badge duplicado 5+ veces y labels de enums definidos dos veces **con textos ya divergentes** ("Auto + caminata" vs "Auto + caminata corta"; "Auto" vs "Se llega en auto") | `components/LeafletMap.tsx:64-88, 352-380` vs `app/punto/[slug]/page.tsx:32-51, 149-173` | Extraer `<Badge>` y crear `lib/labels.ts` con `TIPO_LABEL/ACCESO_LABEL/CAMINO_LABEL` tipados `Record<PointType, string>` como única fuente |
| M26 | UI/UX | El botón de login no tiene estado pending (`useFormStatus`): se puede tocar varias veces mientras manda el magic link → doble envío de emails | `app/login/page.tsx:47-52` | Client component con `useFormStatus` → "Enviando…" + `disabled` |
| M27 | Código | Haversine implementado 3 veces: `lib/distance.ts` (canónica, con tests), copia en el mapa, copia en verify-points | `components/LeafletMap.tsx:97-107`, `scripts/verify-points.ts:22-32` vs `lib/distance.ts:6-20` | Importar `haversineKm` desde `lib/distance.ts` en ambos; borrar las copias |
| M28 | Código | Umbrales de score 80/60/40/20 codificados en dos archivos: `ratingFor` (etiqueta) y `scoreColor` (color) pueden desincronizarse | `lib/score.ts:78-84` vs `lib/bortle.ts:20-26` | Constante compartida `SCORE_BANDS: {min, rating, color}[]` de la que ambos derivan |
| M29 | Código + DB | Campo Json `hospedajes` casteado sin validación en dos lados, tipo definido dos veces (`SeedHospedaje` + cast inline) | `app/punto/[slug]/page.tsx:345-355`, `prisma/seed.ts:34-38, 146` | Tipo `Hospedaje` único en `lib/` + type guard `parseHospedajes(json: unknown)` usado por seed y página; usar índice como `key` |
| M30 | Código | `catch {}` silencioso en server actions: el error real de Prisma se descarta sin loguear | `app/punto/[slug]/actions.ts:67-69`, `app/perfil/actions.ts:48-50` | `catch (e) { console.error("submitReview:", e); ... }` (o Sentry) |
| M31 | Código + Seguridad | El `slug` del form nunca se verifica contra el `pointId` y se usa directo en `revalidatePath`: un form manipulado revalida paths arbitrarios y deja stale la página real del punto | `app/punto/[slug]/actions.ts:43, 71, 82-87` | No aceptar `slug` del cliente: derivarlo por DB desde `pointId` antes de revalidar |
| M32 | Código | Caché L1 in-memory de clima (`Map`) sin evicción, alimentada por `/api/conditions` con lat/lng arbitrarios; además duplica la L2 de Next del mismo fetch | `lib/weather.ts:34-39, 111`, `app/api/conditions/route.ts:19-30` | Eliminar la L1 (la L2 `next: {revalidate}` ya cubre) o tope LRU + purga de vencidos |

---

## 🟢 Hallazgos BAJOS

| # | Dominio | Hallazgo | Ubicación | Recomendación |
|---|---|---|---|---|
| B1 | Seguridad | Fallback del magic link condicionado a la presencia de `RESEND_API_KEY`, no a `NODE_ENV`: sin la key en prod, los tokens de login irían a los logs de Vercel | `auth.ts:24-37` | Condicionar a `NODE_ENV !== "production"`; en prod sin key, lanzar error. **[A verificar]** la env en Vercel |
| B2 | Seguridad | `consejo` sin límite de longitud server-side (el `maxLength=300` es solo del cliente) | `app/punto/[slug]/actions.ts:46-58` | Validar longitud en el server action |
| B3 | Seguridad | CSP mínima: solo `frame-ancestors`, sin `script-src`/`default-src` (decisión documentada por los tiles) | `next.config.ts:22` | CSP completa en `Report-Only` con los orígenes reales, testear el mapa, después enforce |
| B4 | Seguridad | `npm audit --omit=dev`: 6 vulns (1 high: `hono` vía CLI de Prisma — tooling, no corre en requests; resto moderate/dev) | `package.json` | `npm audit fix` (sin `--force`); actualizar next cuando parchee su postcss interno |
| B5 | Seguridad | Historia de git expone hostnames de Neon, rol y nombre de DB (redactados en HEAD pero visibles en commits viejos). La password **nunca** se commiteó (verificado) | Historia: `git show f6ea35c -- DEPLOY.md` | Riesgo aceptable; si querés cerrarlo, resetear la password del rol en Neon (1 click) |
| B6 | Seguridad | `deleteReview` sin rate limit (a diferencia de `submitReview`) | `app/punto/[slug]/actions.ts:76-88` | Reusar `checkRateLimit("review", userId)` |
| B7 | DB | FKs sin índice propio: `Review.userId`, `Account.userId`, `Session.userId` (el unique compuesto solo cubre `pointId` como prefijo) | `prisma/schema.prisma:79-84, 133, 143` | `@@index([userId])` en los tres modelos en la próxima migración |
| B8 | DB | Sin limpieza de `Session`/`VerificationToken` expirados: crecen para siempre (Auth.js solo borra al re-presentarse el token) | `prisma/schema.prisma:138-152` | Cron ocasional con `DELETE ... WHERE expires < now()` |
| B9 | DB + Perf + Código | `getUserReview` y `getProfile` en awaits seriales tras el `Promise.all` principal (página force-dynamic) | `app/punto/[slug]/page.tsx:117-122` | `Promise.all` condicional para logueados |
| B10 | DevOps | `AUTH_SECRET` no pasa por el fail-fast de `lib/env.ts`: si falta, error críptico de NextAuth en runtime | `lib/env.ts:17-21` | Getter `AUTH_SECRET` en `lib/env.ts` + `secret: env.AUTH_SECRET` en auth.ts |
| B11 | DevOps | 4 GeoTIFF (~2.8 MB) versionados; probablemente intencional (reproducibilidad de notebooks) | `notebooks/data/viirs_ba_*.tif` | Dejarlos; si crecen, Git LFS o script de descarga |
| B12 | DevOps | Todo el historial son commits directos a main (sin PRs). Aceptable para solo-dev con CI verde (7/7 runs success) | `git log` | Mantener para cambios chicos; branch + preview deployment para features grandes |
| B13 | SEO | `robots.ts` no bloquea `/perfil` ni `/login/revisa` | `app/robots.ts:9` | Agregar a `disallow` (o `robots: {index: false}` en esas páginas) |
| B14 | SEO | `keywords` en metadata: tag ignorado por Google desde 2009 | `app/layout.tsx:34-43` | Eliminar (peso muerto) |
| B15 | Rendimiento | Geist Mono se carga (~15-30 KB preload en todas las páginas) pero **nunca se usa** (ninguna clase `font-mono`; `.tnum` usa font-variant-numeric) | `app/layout.tsx:18-21`, `app/globals.css:20` | Eliminar del layout; token a `ui-monospace` si se quiere conservar |
| B16 | Rendimiento | Imágenes de /data-science (`Figure`) sin prop `sizes` siendo `w-full` responsivas: móviles retina bajan la variante 2x (~1950px) para renders de ~350px | `app/data-science/page.tsx:48` | `sizes="(max-width: 768px) 100vw, 672px"` (y ~512px para las `narrow`) |
| B17 | Rendimiento | Assets de `public/` sin `Cache-Control` largo explícito **[a verificar el header real en prod]**: recurrentes revalidan el overlay en cada visita | `next.config.ts:25-36` | Header `public, max-age=31536000, immutable` para `/mapa/:path*` y `/data-science/:path*` (versionando filenames al cambiar) |
| B18 | UI/UX | Stats de /data-science en `grid-cols-3` fijo: en 375px los labels se apilan en 4-5 líneas | `app/data-science/page.tsx:94-110` | `grid-cols-1 gap-6 sm:grid-cols-3` |
| B19 | UI/UX | Radios de botón inconsistentes: CTA de landing rectangular, resto alterna `rounded-xl`/`rounded-2xl` | `components/CTAButton.tsx:12` vs `app/error.tsx:32-39` | 2 radios canónicos (control=xl, CTA=2xl) |
| B20 | UI/UX | `bg-slate-950`/`text-slate-400` (paleta Tailwind genérica) en loader y fondo del mapa en vez de los tokens | `components/MapView.tsx:11`, `components/LeafletMap.tsx:173` | Reemplazar por `bg-ink text-fg-muted` |
| B21 | UI/UX | Selector de estrellas: `role="radio"` sin roving tabindex ni flechas; submit `disabled` sin explicar que falta puntuación | `components/ReviewForm.tsx:30-52, 79-82` | Roving tabindex con flechas + hint "Elegí una puntuación" |
| B22 | UI/UX | `aria-label` del slider hardcodea "2012 y 2024" ignorando las props; `AltitudeCurve` con label genérico sin el nombre del astro | `components/BeforeAfterSlider.tsx:98`, `components/AltitudeCurve.tsx:51` | Interpolar props en ambos labels |
| B23 | UI/UX | Copy duplicado: "Noche del {fecha}" en la ficha y de nuevo en el DatePicker | `app/punto/[slug]/page.tsx:180-187`, `components/DatePicker.tsx:27` | Quitar el prefijo del DatePicker |
| B24 | UI/UX + Código | La nota del score dice "a las 22:00" pero el score se calcula en la medianoche astronómica; el comentario de `observation-time.ts` repite la imprecisión | `components/AnimatedScore.tsx:137-141`, `lib/observation-time.ts:2-5` | Derivar la hora del plan o reescribir sin hora fija; actualizar el comentario |
| B25 | UI/UX | Mapa sin control de zoom visible (`zoomControl={false}` sin reemplazo) | `components/LeafletMap.tsx:172` | Reactivar zoomControl abajo-derecha o botones propios |
| B26 | UI/UX | El número del score anima 0→N sin `aria-live` ni valor estático accesible | `components/AnimatedScore.tsx:92-100` | `aria-hidden` en el animado + `<span class="sr-only">{score} de 100</span>` |
| B27 | Código | `/api/conditions` no valida rangos de lat/lng: coordenadas inválidas llegan a Open-Meteo y vuelven 502 en vez de 400 | `app/api/conditions/route.ts:25-30` | Chequeo de rango junto al `Number.isFinite` → 400 |
| B28 | Código | Fetch a Resend sin timeout ni AbortController (weather.ts sí lo tiene) | `auth.ts:40-57` | `signal: AbortSignal.timeout(10_000)` |
| B29 | Código | Key de `unstable_cache` del plan omite lat/lon: si un re-seed corrige coordenadas, sirve datos viejos hasta 6h | `lib/observation-plan.ts:129-133` | Incluir `lat.toFixed(3)/lon.toFixed(3)` en la key |
| B30 | Código | Navegación interna con `<a href>` en vez de `next/link` en el panel del mapa → full page reload | `components/LeafletMap.tsx:392-397` | `<Link>` (verificar convivencia con Leaflet) |
| B31 | Código | `MapPoint` definido a mano espejando el `select` de Prisma (doble mantenimiento) | `lib/points.ts:4-18` vs `53-72` | `Prisma.ObservationPointGetPayload<{select: typeof mapPointSelect}>` |
| B32 | Código | Convención spanglish implícita (dominio en español, infra en inglés) razonable pero no documentada; algunos casos la rompen | `lib/moderation.ts:7`, `components/LeafletMap.tsx:97` | Documentar la regla en README/CONTRIBUTING |

---

## ✅ Fortalezas verificadas (lo que está bien)

- **Secrets: limpio.** `.env` y `.dev-magic-link.txt` no versionados; historia completa de git sin passwords/keys (verificado con `git grep` sobre `rev-list --all`); CI con DB dummy; notebooks sin credenciales.
- **AuthZ correcta:** sin IDOR (upsert por clave de sesión, delete filtrado por userId propio), ninguna escritura sin sesión, reseñas públicas no exponen email.
- **Sin vectores de inyección:** todo por Prisma parametrizado (único raw: `SELECT 1`), cero `dangerouslySetInnerHTML`, inputs de API validados con rangos, hosts externos fijos (sin SSRF).
- **Sesiones bien configuradas:** Auth.js v5 database sessions, cookies seguras por default, magic link 30 min single-use.
- **Security headers presentes** en `next.config.ts` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, frame-ancestors); HSTS lo pone Vercel.
- **DB sin N+1 ni drift:** queries con select explícito y `take`, índice compuesto exacto para las reseñas, 7 migraciones consistentes con el schema, seed idempotente, singleton de Prisma correcto para serverless.
- **Buen aislamiento de bundles:** Leaflet y astronomy-engine no contaminan otras páginas; `ProductPreview` es SVG server-side puro; ISR de /mapa e infra de caché de Open-Meteo (L1+L2) bien pensadas; CLS de bajo riesgo.
- **Calidad de código:** TypeScript estricto real (cero `any`, cero `@ts-ignore`), `lib/` puro sin JSX, server actions delgadas con estado tipado, API routes con status codes y Cache-Control correctos, cero TODOs/console.log residuales.
- **UX bien resuelta en:** skeleton de /punto fiel al contenido, estados vacíos con acción sugerida, mensajes de geolocalización diferenciados por causa (ejemplar), alt text descriptivo en todas las figuras, semántica base sólida (`dl/dt/dd`, `fieldset/legend`, jerarquía de headings), copy honesto (disclaimers del score, del observatorio y de la proyección 2035).
- **DevOps:** `.env.example` completo y actualizado; env vars con fail-fast o fallbacks elegantes; `.gitignore` correcto; CI con caché de npm, corriendo en push y PRs, 7/7 runs en verde.

## 🔎 Pendientes de verificar fuera del repo

Estas cosas no se pueden confirmar desde el código — revisalas en los dashboards:

1. **Vercel → Environment Variables (Production):** que estén `NEXT_PUBLIC_SITE_URL=https://starmapba.com.ar` (C2), `UPSTASH_REDIS_REST_URL/TOKEN` (M1), `RESEND_API_KEY` (B1) y `AUTH_SECRET`.
2. **Vercel → región de funciones:** idealmente `iad1` (us-east-1), co-locada con Neon (M16).
3. **Header `Cache-Control` real** que Vercel sirve para `public/` en producción (B17).
4. **Medición en vivo de Core Web Vitals** (el análisis de rendimiento fue por código).

---

## 🎯 Plan de acción priorizado

### 1️⃣ Primero — crítico y barato (una tarde) — ✅ HECHO (2026-06-26)
| Qué | Cierra | Esfuerzo | Estado |
|---|---|---|---|
| Fix del fallback de `SITE_URL` a `starmapba.com.ar` + `.env.example` actualizado | C2 | 30 min | ✅ `lib/site.ts` |
| Lista SSR de los 22 puntos en `/mapa` con `<Link>` real (`<details>` nativo, sin JS) | C1, M13 parcial | 2-3 h | ✅ `app/mapa/page.tsx` — verificado: 22 `<a href>` en el HTML crudo |
| Overlay VIIRS → WebP + preload | A3, M17 | 1 h | ✅ 1.53 MB → 361 KB (-77%) — `notebooks/make_overlay.py`, `components/LeafletMap.tsx` |
| `DIRECT_DATABASE_URL` + `migrate deploy && next build` en Vercel (con retry por cold-start de Neon) | A2 | 30 min | ✅ `prisma.config.ts`, `package.json` — probado end-to-end contra dev |
| Rating atómico (un solo `UPDATE` con subquery) | A1 | 1 h | ✅ `app/punto/[slug]/actions.ts` — verificado contra datos reales, coincide con el aggregate de Prisma |

**Pendiente de vos (dashboard de Vercel, no accesible desde acá):**
1. Agregar `DIRECT_DATABASE_URL` (conexión directa, sin `-pooler`) a Environment Variables → Production/Preview/Development. Sin esto, el próximo deploy va a fallar el build.
2. Confirmar que `NEXT_PUBLIC_SITE_URL=https://starmapba.com.ar` esté seteada (si no lo está, el código ya cae bien en el fallback correcto, pero mejor tenerla explícita).
3. Redirect 301 opcional de `starmap-ba-12.vercel.app` → `starmapba.com.ar` (en Vercel → Domains).
4. `UPSTASH_REDIS_REST_URL/TOKEN` y `RESEND_API_KEY` (M1, B1 — quedan para el Nivel 2/3, no bloquean este deploy).

### 2️⃣ Segundo — impacto alto en UX/SEO (un fin de semana)
- Eliminar `template.tsx` (fade por CSS) + hero con `next/image priority` → LCP/FCP (A4, A5)
- Subir el token `fg-faint` a AA + aclarar el azul de escapada + foco visible del slider (A9, A10, M21)
- Leyenda del mapa colapsable en mobile (A11)
- Sitemap: `/data-science` + revalidate + lastModified real; OG por punto; títulos sin duplicar; canonical (A6, A8, M9, M10, M11)
- UptimeRobot contra `/api/health` (M8)
- Fix del mensaje "fuera del rango" cuando Open-Meteo cae + copy "próximamente" (M23, M24)

### 3️⃣ Tercero — robustez (progresivo)
- Tests de `weather/conditions/observation-time/observation-plan` con mocks (A12)
- Consolidar duplicaciones: haversine, labels, bandas de score, tipo `Hospedaje`, `<Badge>` (M25, M27, M28, M29)
- CHECKs en la DB + recompute en cascada de borrado de usuario + validación de URL pooled (M3, M4, M5)
- Filtro de moderación ampliado + logging en los `catch` + slug derivado por DB (M2, M30, M31)
- Schema.org (TouristAttraction + Article + WebSite) (A7)
- A11y del mapa: aria-pressed, dialog del panel, labels de inputs, reduced-motion completo (M18-M22)
- Branch protection + build check en CI si se justifica (M6, M7)

### 4️⃣ Nice to have — ✅ HECHO (2026-07-08, lo de código)
- CSP completa en Report-Only → enforce (B3) · `npm audit fix` (B4) · timeout Open-Meteo a 4s (M14) · `React.cache` en getPointBySlug (M15) · eliminar Geist Mono (B15) · `sizes` en Figure (B16) · Cache-Control en assets (B17) · índices de FKs (B7) · resto de Bajos de UI/UX y código (B18-B32) → **todos hechos y verificados**.
- **Queda pendiente de acción externa (dashboards / infra), no de código:** región iad1 en Vercel (M16 — Neon confirmado en `us-east-1`, así que iad1 es la correcta) · cron de limpieza de `Session`/`VerificationToken` (B8) · reset opcional de password de Neon (B5) · promover la CSP de Report-Only a enforce tras mirar la consola (B3). M26 (pending state del login) ya estaba resuelto en un nivel previo.

---

*Generado por auditoría multi-agente (7 dominios) el 2026-06-25. Ningún archivo de código fue modificado; este reporte es el único artefacto nuevo.*
