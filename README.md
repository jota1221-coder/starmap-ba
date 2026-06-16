<div align="center">

# 🌌 StarMap BA

**Find the darkest sky near you.**

A web app that helps amateur astronomers in Buenos Aires Province, Argentina decide *where* and *when* to go stargazing — combining satellite light-pollution data, weather forecasts, and real-time astronomical calculations into a single 0–100 observation score.

[![Live demo](https://img.shields.io/badge/demo-live-22c55e?style=for-the-badge)](https://starmapba.com.ar)
&nbsp;
![License: MIT](https://img.shields.io/badge/license-MIT-e0a96d?style=for-the-badge)

[![CI](https://github.com/jota1221-coder/starmap-ba/actions/workflows/ci.yml/badge.svg)](https://github.com/jota1221-coder/starmap-ba/actions/workflows/ci.yml)

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?logo=prisma&logoColor=white)
![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-336791?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white)

![StarMap BA — landing](docs/screenshots/landing.png)

</div>

> [!NOTE]
> The product UI is in Spanish (its audience is Argentine stargazers). This README is in English.

## What it is

Light pollution makes most of the night sky invisible from cities. StarMap BA maps **21 real, car-accessible observation spots** across Buenos Aires Province, ranks them by how dark their sky actually is (from satellite data), and for any given night tells you how good viewing conditions will be and what you'll be able to see.

It's both a **real product** for the local amateur-astronomy community and a **portfolio project** showcasing full-stack engineering and a data-driven scoring model.

## Features

|  |  |
|---|---|
| 🛰️ **Dark skies, measured** | Spots ranked by real light pollution from NASA VIIRS satellite data — not guesswork. |
| 🌦️ **Observation forecast** | For each place and night, a 0–100 score from hourly cloud cover, moon phase, and sky darkness. |
| 🔭 **What to watch, and where** | Which planets are visible tonight, at what altitude, and which direction to point. |

### The interactive map

A Sentinel-2 satellite basemap clipped to a real province silhouette; greener means a darker sky.

![Interactive map of observation spots](docs/screenshots/map.png)

### Per-spot detail

The observation score broken down by factor, tonight's plan, and community reviews.

![Observation spot detail with score breakdown](docs/screenshots/point.png)

## How the score works

The heart of the app is a transparent, **multiplicative** 0–100 model — three independent factors, each normalized to 0–1:

```
score = 100 × cloudFactor × bortleFactor × moonFactor
```

It's multiplicative on purpose: if it's fully overcast, it doesn't matter how dark the site is — the score collapses to zero, just like reality.

| Factor | How it's computed | Why |
|---|---|---|
| **Clouds** | `1 − (low×1.0 + mid×0.7 + high×0.3) / 100` | Low clouds block everything; high cirrus barely matters — you can still see planets and the Moon through them. |
| **Bortle** (sky darkness) | Lookup table, Bortle 1 → 1.0 down to Bortle 9 → 0.05 | The background ceiling of the night. A bright suburban sky caps what's possible no matter the weather. |
| **Moon** | `1 − 0.6 × illumination × min(altitude / 45°, 1)`; no penalty when the Moon is below the horizon | Moonlight only washes out the sky when the Moon is actually *up*; the impact scales with how full and how high it is. |

The result maps to a plain-language rating (Excellent / Very good / Good / Fair / Poor) plus a generated sentence explaining *why* the night is good or bad. Astronomical values (moon phase and altitude, planet positions) are computed locally with `astronomy-engine` — no external API, fully deterministic.

## Architecture & technical decisions

- **Next.js 16 App Router**, rendered per route to match its data: the landing is fully static, `/mapa` uses ISR (`revalidate = 3600`), and each `/punto/[slug]` is dynamic so conditions are always fresh — while staying server-rendered for SEO.
- **Postgres via Prisma 7 + Neon serverless** (driver adapter), with **separate dev/prod database branches**, a denormalized review rating to avoid N+1 aggregation, and composite indexes on the hot query paths.
- **Passwordless auth** with Auth.js v5 magic links (email via Resend) and database-backed sessions.
- **The map basemap is a deliberate choice.** The default Esri imagery had no coverage over rural Buenos Aires (blank "data not available" tiles), so the app uses **Sentinel-2 cloudless (EOX)** for uniform, sharp coverage everywhere, clipped to a **real 277-point IGN province silhouette**. Leaflet is loaded strictly client-side (`next/dynamic`, `ssr: false`).
- **External data, cached deliberately:** Open-Meteo for cloud cover broken down by altitude (low / mid / high), cached in memory + the Next Data Cache (30 min TTL); the nightly observation plan via `unstable_cache`.
- **Production hardening:** Upstash rate limiting on auth and review writes, link-detection moderation on user reviews, and fail-fast environment-variable validation.

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4 (OKLCH palette), Framer Motion, Space Grotesk + Geist |
| Data | Prisma 7, Neon (serverless Postgres) |
| Auth | Auth.js v5 (magic link), Resend |
| Maps | Leaflet, react-leaflet, Sentinel-2 cloudless (EOX), IGN silhouette |
| Astronomy / weather | astronomy-engine, Open-Meteo, NASA VIIRS (light pollution) |
| Infra | Vercel, Upstash (rate limiting), Vercel Analytics |

## Local development

**Requirements:** Node.js 22+, npm, and a free [Neon](https://console.neon.tech) Postgres database (~5 min to set up).

```bash
# 1. Clone
git clone https://github.com/jota1221-coder/starmap-ba.git
cd starmap-ba

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Fill in DATABASE_URL (Neon) and AUTH_SECRET — see .env.example for the rest.

# 4. Database
npx prisma generate
npx prisma db push

# 5. Run
npm run dev
```

Open <http://localhost:3000>. Without `RESEND_API_KEY`, magic-link login prints the sign-in URL to the server console (and to `.dev-magic-link.txt`), so you can test auth with zero external services.

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run lint    # ESLint
```

## Project structure

```
starmap-ba/
├── app/                 # Routes (App Router): /, /mapa, /punto/[slug], /login, api/
├── components/          # Client components (MapView, score ring, hero, …)
├── lib/                 # Domain logic: score, conditions, weather, astronomy, points
├── prisma/              # Schema (ObservationPoint, Review, Auth.js models)
├── scripts/             # verify-points.ts — data-integrity checks (point-in-polygon, Bortle)
└── docs/                # Screenshots and notes
```

## Roadmap

- [ ] **Data Science showcase** — a Jupyter notebook processing the full VIIRS light-pollution raster for the whole province, plus a `/data-science` page documenting the methodology behind the scoring model.
- [ ] **Tests + CI** — Vitest coverage on the scoring and review paths, and a GitHub Action running lint + build + `verify-points`.
- [ ] **PWA / offline** — the app is used in the field, often without signal.
- [ ] **"Good night" alerts** — email when conditions at a saved spot look great.

## Author

**Joaquin Rao** — Data Analyst in progress, building data-driven products.
[GitHub](https://github.com/jota1221-coder)

## License

[MIT](LICENSE) © Joaquin Rao

## Credits & data sources

Weather: [Open-Meteo](https://open-meteo.com) · Light pollution: NASA VIIRS · Astronomy: [astronomy-engine](https://github.com/cosinekitty/astronomy) · Basemap: [Sentinel-2 cloudless](https://s2maps.eu) by EOX (Modified Copernicus Sentinel data) · Province silhouette: IGN Argentina · Hero photo: [ESO / L. Calçada](https://commons.wikimedia.org/wiki/File:Beneath_the_Milky_Way.jpg) (CC BY 4.0)
