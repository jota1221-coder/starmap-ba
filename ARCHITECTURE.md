# Arquitectura de StarMap BA

> Diseño de sistema production-ready, pensado para escalar **cuando haga falta**, no antes.
> Documento vivo — versión 1 (mayo 2026).

---

## 0. Filosofía y "right-sizing"

Antes de cualquier diagrama, la decisión de arquitectura más importante: **no sobre-construir.**

StarMap BA es un producto de nicho (astronomía amateur en Provincia de Buenos Aires). El mercado realista es de **miles, no millones**. Diseñar para "Google scale" sería un error de ingeniería tan grave como no diseñar nada.

**Principio rector:** arquitectura *serverless-first, stateless, con costureras (seams) claras* para que cada componente se pueda reemplazar por uno más potente **cuando un disparador real lo justifique** (ver §9). Hoy, todo corre en free tier.

| Dimensión | Hoy (MVP) | Disparador para escalar |
|---|---|---|
| Usuarios concurrentes | <50 | >500 sostenidos |
| Puntos de observación | 13 | >500 (cuando haya UGC) |
| Tráfico | bajo | >1M req/mes |
| Costo objetivo | $0 (free tier) | optimizar recién con ingresos |

---

## 1. Arquitectura del sistema

### Estado actual (MVP)

```
                    ┌─────────────────────────────┐
                    │   Cliente (browser / mobile) │
                    └──────────────┬──────────────┘
                                   │ HTTPS
                    ┌──────────────▼──────────────┐
                    │   Vercel Edge Network (CDN)  │  ← cachea estáticos + ISR
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────▼────────────────────┐
              │        Next.js 16 (App Router)           │
              │  ┌────────────────┐  ┌────────────────┐  │
              │  │ Server          │  │ Route Handlers │  │
              │  │ Components      │  │ /api/*         │  │
              │  │ (SSR/ISR)       │  │ (serverless)   │  │
              │  └───────┬────────┘  └───────┬────────┘  │
              │          └──────────┬─────────┘           │
              │            Service layer (lib/)           │
              │   astronomy · weather · score · conditions│
              └──────┬───────────────────────┬───────────┘
                     │                        │
        ┌────────────▼──────────┐  ┌──────────▼───────────┐
        │  Neon PostgreSQL       │  │  Open-Meteo API      │
        │  (serverless, pooled)  │  │  (clima, externo)    │
        └────────────────────────┘  └──────────────────────┘

        astronomy-engine = cálculo local (sin red), corre dentro del proceso.
```

### Estado objetivo (con UGC: reviews, fotos, puntos de usuarios)

```
        Cliente ──► Vercel Edge (CDN + middleware: rate-limit, auth gate)
                         │
        ┌────────────────┼─────────────────────────────┐
        │           Next.js App Router                  │
        │   RSC / Route Handlers / Server Actions       │
        │                Service layer                  │
        └───┬─────────┬──────────┬──────────┬───────────┘
            │         │          │          │
     ┌──────▼───┐ ┌───▼────┐ ┌───▼─────┐ ┌──▼─────────┐
     │ Neon PG  │ │ Upstash│ │ Blob/S3 │ │ Open-Meteo │
     │ (datos)  │ │ Redis  │ │ (fotos) │ │ (clima)    │
     │          │ │(caché+ │ │         │ │            │
     │          │ │ rate)  │ │         │ │            │
     └──────────┘ └────────┘ └─────────┘ └────────────┘
            │
     ┌──────▼──────┐
     │ Auth        │  NextAuth (magic link) — sesiones en Neon
     └─────────────┘
```

**Por qué este stack:**
- **Vercel + Next.js**: SSR/ISR/serverless en una sola plataforma, escala automática, $0 hasta tener tráfico real. Cero ops.
- **Neon**: Postgres serverless con *connection pooling* (clave para serverless: evita agotar conexiones). Branching para entornos.
- **Open-Meteo**: gratis, sin API key, 10k req/día. Aislado tras nuestro service layer → reemplazable.
- **astronomy-engine**: cálculo determinista local → **0 costo, 0 latencia de red, infinitamente escalable** (es CPU pura). Decisión de diseño deliberada vs. depender de una API astronómica.

---

## 2. Estructura de componentes

Separación en capas con dependencias unidireccionales (presentación → servicios → datos). **Ninguna capa salta a la de abajo de la siguiente.**

```
app/                        # Capa de presentación (Next.js)
  page.tsx                  #   landing (estática)
  mapa/page.tsx             #   mapa (ISR, lee del service layer)
  punto/[slug]/page.tsx     #   guía (dinámica, condiciones en vivo)
  api/                      #   API HTTP (route handlers)
    points/route.ts
    points/[slug]/route.ts
    conditions/route.ts
    health/route.ts
components/                 # UI reutilizable (client/server components)
  Map / LeafletMap / MapView / DatePicker / SocialLinks
lib/                        # Capa de servicios / dominio (sin Next, testeable)
  astronomy.ts              #   dominio: cálculo celeste (puro)
  weather.ts                #   integración externa: Open-Meteo + caché
  score.ts                  #   dominio: scoring (puro, testeado)
  distance.ts               #   dominio: geo (puro)
  conditions.ts             #   orquestación: combina los anteriores
  points.ts                 #   acceso a datos (repositorio de puntos)
  bortle.ts                 #   dominio: escalas de color/etiqueta
  prisma.ts                 #   cliente DB (singleton + adapter)
  env.ts                    #   validación de configuración
prisma/                     # Esquema + migraciones + seed
```

**Reglas de dependencia (lo que mantiene esto sano a escala):**
1. `lib/*` **no importa** de `app/` ni `components/`. Es el núcleo portable y testeable.
2. Funciones de dominio (`astronomy`, `score`, `distance`) son **puras** → triviales de testear, sin I/O.
3. Integraciones externas (`weather`) y acceso a datos (`points`) están aisladas → reemplazables sin tocar el dominio.
4. `conditions.ts` es el único orquestador → un solo lugar donde se compone la lógica.

Esta estructura ya está implementada. Es lo que permite que el "motor" tenga 20 tests sin levantar Next ni la DB.

---

## 3. Flujo de datos

### Lectura — guía de un punto (`/punto/[slug]`)

```
1. Request → Vercel Edge → Next.js (Server Component)
2. getPointBySlug(slug) ──► Neon (1 query indexada por slug)
3. getConditions({lat,lng,bortle,date}):
     ├─ getSkyConditions()  → astronomy-engine (CPU local, ~ms)
     └─ getWeatherAt()      → Open-Meteo (cacheado, ver §7)
4. computeScore()           → función pura
5. RSC renderiza HTML en el server → stream al cliente
```

Latencia dominada por (a) la query a Neon y (b) el fetch a Open-Meteo (cacheado). La astronomía es despreciable.

### Escritura — reseña de usuario (objetivo)

```
1. Usuario autenticado → POST /api/points/[slug]/reviews (o Server Action)
2. Middleware: rate-limit (Redis) + verificar sesión
3. Validación de input (zod)
4. INSERT review (estado = 'pendiente' si requiere moderación)
5. Invalidar caché del punto (revalidateTag)
6. Recalcular rating agregado (denormalizado en ObservationPoint)
```

**Decisión:** el rating promedio se **denormaliza** en el punto (campos `ratingAvg`, `ratingCount`) y se actualiza en la escritura. Leer un punto NO debe agregar reviews on-the-fly → lectura O(1).

---

## 4. Diseño de APIs

### Convenciones
- **REST sobre route handlers**, JSON. Nombres en plural.
- **Versionado** vía carpeta cuando rompamos contrato: `/api/v1/*` (hoy implícito v1; se formaliza al abrir la API a terceros).
- **Errores consistentes**: `{ error: string, code?: string }` + status HTTP correcto.
- **Idempotencia**: GET sin efectos; mutaciones con verbo correcto.
- **Cache headers** explícitos por endpoint (ver §7).

### Endpoints actuales

| Método | Ruta | Caché | Descripción |
|---|---|---|---|
| GET | `/api/points` | `s-maxage=3600` | Lista de puntos (cambia poco) |
| GET | `/api/points/[slug]` | `s-maxage=300` | Punto + condiciones en vivo |
| GET | `/api/conditions?lat&lng&bortle&date` | `s-maxage=900` | Condiciones genéricas |
| GET | `/api/health` | `no-store` | Liveness/readiness |

### Endpoints objetivo (UGC)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/points/[slug]/reviews` | sí | Crear reseña + rating |
| GET | `/api/points/[slug]/reviews` | no | Listar reseñas (paginado) |
| POST | `/api/points/[slug]/photos` | sí | Subir foto (presigned URL) |
| POST | `/api/submissions` | sí | Proponer punto nuevo (→ moderación) |
| GET | `/api/best-nights` | no | Mejores noches del mes (precomputado) |

**Paginación**: cursor-based (`?cursor=&limit=`) desde el día 1 en listados de reviews — offset no escala.

**Rate limiting**: por IP en lecturas costosas; por usuario en escrituras. Hoy in-memory (single region); a Redis cuando haya multi-instancia real (§7, §9).

---

## 5. Esquema de base de datos

### Actual

```prisma
model ObservationPoint {
  id              Int      @id @default(autoincrement())
  slug            String   @unique          // índice para lookup por URL
  nombre, partido String
  lat, lng        Float
  distanciaCabaKm Int
  tipo            PointType                 // enum
  bortle          Int                       // @@index
  sqm             Float
  accesoTipo      AccessType                // enum
  accesoCamino    RoadType                  // enum
  descripcion, notasAcceso  String
  referencia, mejorEpoca, dondeDormir, experiencia  String?
  tips            String[]
  createdAt, updatedAt  DateTime
  @@index([bortle])
  @@index([distanciaCabaKm])
}
```

### Objetivo (UGC + auth) — diseño, aún no aplicado

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  nombre    String?
  rol       Role     @default(USER)         // USER | MODERATOR | ADMIN
  reviews   Review[]
  photos    Photo[]
  submissions Submission[]
  createdAt DateTime @default(now())
}

model ObservationPoint {
  // ...campos actuales +
  ratingAvg   Float  @default(0)            // DENORMALIZADO (lectura O(1))
  ratingCount Int    @default(0)
  source      PointSource @default(CURATED) // CURATED | USER
  reviews     Review[]
  photos      Photo[]
}

model Review {
  id        String   @id @default(cuid())
  pointId   Int
  userId    String
  rating    Int                              // 1-5
  titulo    String?
  cuerpo    String
  consejo   String?                          // tip de experiencia
  fechaVisita DateTime?
  status    ModerationStatus @default(APPROVED) // o PENDING si se modera
  point     ObservationPoint @relation(fields: [pointId], references: [id])
  user      User @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  @@unique([pointId, userId])                // 1 reseña por usuario por punto
  @@index([pointId, status, createdAt])      // listado paginado eficiente
}

model Photo {
  id        String   @id @default(cuid())
  pointId   Int
  userId    String
  url       String                           // Vercel Blob / S3
  width, height  Int
  status    ModerationStatus @default(PENDING)
  createdAt DateTime @default(now())
  @@index([pointId, status])
}

model Submission {                            // punto propuesto por usuario
  id        String   @id @default(cuid())
  userId    String
  nombre, partido  String
  lat, lng  Float
  notas     String?
  status    ModerationStatus @default(PENDING)
  pointId   Int?                              // set al aprobar
  createdAt DateTime @default(now())
  @@index([status, createdAt])
}

enum Role { USER MODERATOR ADMIN }
enum PointSource { CURATED USER }
enum ModerationStatus { PENDING APPROVED REJECTED }
```

**Decisiones clave de datos:**
- **Denormalización del rating** → lecturas baratas; el costo se paga en la escritura (poco frecuente).
- **Índices compuestos** alineados a los query patterns reales (`[pointId, status, createdAt]` para listar reviews aprobadas paginadas).
- **Moderación de origen** (`status`) en reviews/fotos/submissions → defensa contra spam/contenido erróneo, el riesgo #1 del UGC.
- **`@@unique([pointId, userId])`** → integridad: una reseña por persona por lugar, en la DB, no en código.
- **Migraciones versionadas** (Prisma migrate) → reproducibilidad y rollback.

---

## 6. Estrategia de caché (multicapa)

> ⚠️ **Gotcha de serverless que ya afecta el código actual:** una caché *in-memory* (Map) en Vercel **NO se comparte entre invocaciones** (cada request puede caer en una instancia distinta y efímera). Sirve solo como L1 oportunista. La caché real tiene que vivir fuera del proceso.

### Capas (de afuera hacia adentro)

| Capa | Qué cachea | TTL | Dónde |
|---|---|---|---|
| **L0 — CDN/Edge** | HTML estático, ISR, assets | hasta revalidate | Vercel Edge |
| **L1 — Next Data Cache** | respuestas de `fetch` (Open-Meteo) | 30 min | Vercel (persistente cross-invocación) |
| **L2 — App memo** | parse de clima en hot path | request/instancia | in-memory (oportunista) |
| **L3 — DB** | datos persistentes | — | Neon |
| **(futuro) Redis** | rate-limit, sesiones calientes, agregados | variable | Upstash |

### Reglas
- **Puntos** (`/api/points`, `/mapa`): cambian rarísimo → ISR/`s-maxage` largo (1h) + `revalidateTag('points')` al editar.
- **Condiciones** (clima+score): el clima se revalida cada 30 min (granularidad de Open-Meteo); el score se recalcula barato.
- **astronomy-engine**: no se cachea — recomputar es más barato que cachear.
- **Invalidación**: tags por entidad (`point:{slug}`) → al recibir una reseña, `revalidateTag` solo ese punto.

**El fix concreto que se implementa ahora:** mover la caché de Open-Meteo de Map in-memory a **Next Data Cache** (`fetch(..., { next: { revalidate: 1800 } })`), que sí persiste entre invocaciones serverless. La Map queda como L1 oportunista.

---

## 7. Observabilidad, seguridad y costo

**Observabilidad**
- `/api/health` para liveness/readiness (uptime monitors).
- Vercel Analytics (web vitals) + logs de funciones.
- Sentry (free tier) para errores — disparador: primer usuario real reportando un bug.
- Métricas que importan: latencia p95 de `/punto`, tasa de error de Open-Meteo, hit-rate de caché de clima.

**Seguridad**
- Sin secretos en el cliente. `DATABASE_URL` solo server-side (validado en `lib/env.ts`).
- Validación de input en todas las escrituras (zod) — nunca confiar en el cliente.
- Rate limiting en endpoints costosos y de escritura.
- Moderación de UGC (status PENDING) antes de exponer.
- Headers de seguridad (CSP, etc.) vía `next.config` cuando se abra a UGC.

**Costo**
- Hoy: **$0** (Vercel + Neon free).
- Open-Meteo gratis hasta 10k/día → la caché de 30 min lo mantiene lejísimos del límite.
- Primer gasto probable: Vercel Blob para fotos (UGC) o dominio `.com.ar`.

---

## 8. Escalabilidad — qué falla primero y cómo se arregla

Honestidad de ingeniería: enumerar los **cuellos de botella en orden** y el disparador de cada fix. No se hace ninguno hasta que el disparador ocurra.

| # | Cuello de botella | Síntoma | Disparador | Fix |
|---|---|---|---|---|
| 1 | Caché in-memory en serverless | hit-rate bajo, muchas llamadas a Open-Meteo | ya | **Next Data Cache** (se hace ahora) |
| 2 | Rate-limit in-memory | no funciona multi-instancia | UGC en producción | Upstash Redis |
| 3 | Conexiones a Neon | "too many connections" | tráfico alto | ya mitigado (pooler); subir plan |
| 4 | Listar reviews con offset | lento con muchas filas | >10k reviews | ya diseñado cursor-based |
| 5 | Fotos servidas sin optimizar | ancho de banda | UGC con fotos | Vercel Blob + `next/image` |
| 6 | Open-Meteo como SPOF de clima | si cae, no hay score | dependencia crítica | fallback a 2do proveedor tras el seam de `weather.ts` |
| 7 | "Mejores noches" calculado on-demand | CPU/latencia | feature en uso | cron nocturno → tabla precomputada |

### Roadmap por fases (con disparadores, no fechas)

- **Fase A — Validar (ahora):** MVP en producción, feedback real. *Cero infra nueva.*
- **Fase B — Comunidad (si hay tracción):** Auth + reviews + fotos. Suma Upstash + Blob. Aplica el schema de §5.
- **Fase C — Retención:** alertas por email (cron + Resend), "mejores noches" precomputado, calendario de eventos.
- **Fase D — Escala (si el nicho explota o se expande a todo el país):** Redis para agregados, read replicas en Neon, posible separación de la API.

---

## 9. Lo que deliberadamente NO construimos todavía

Tan importante como lo que se diseña. Construir esto **hoy** sería sobre-ingeniería:

- ❌ Microservicios / colas / Kafka → un monolito serverless bien estructurado escala muchísimo más de lo que este producto necesita.
- ❌ Kubernetes / contenedores → Vercel abstrae todo eso; meterlo sería costo sin beneficio.
- ❌ Redis / caché distribuida → recién cuando haya multi-instancia con UGC (disparador #2).
- ❌ Auth y tablas de UGC → recién después de validar que la gente usa el producto base.
- ❌ Multi-región / GraphQL / event sourcing → no hay problema que lo justifique.

> La arquitectura está **lista para recibirlos** (seams claros, dominio puro, datos versionados), pero no se pagan por adelantado.

---

## Resumen ejecutivo

StarMap BA ya tiene una base **production-grade y correctamente estratificada**: dominio puro testeado, integraciones aisladas, datos versionados, serverless-first. La arquitectura objetivo (UGC, auth, caché distribuida) está **diseñada y con disparadores claros**, pero se implementa incrementalmente según validación real. El único fix de escalabilidad que se justifica *hoy* es mover la caché de clima a Next Data Cache — el resto espera su disparador.
