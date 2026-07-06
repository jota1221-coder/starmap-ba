# Deploy de StarMap BA

Guía para publicar el proyecto en Vercel (free tier).

## Pre-requisitos
- El proyecto compila local: `npm run build` ✅
- `postinstall: prisma generate` configurado (genera el cliente en el build de Vercel) ✅
- Migración ya aplicada a Neon ✅
- Tener a mano el `DATABASE_URL` de Neon (el mismo del `.env` local)

---

## Camino recomendado: GitHub + Vercel (web)

Da CI/CD automático (cada push redeploya) y suma presencia en tu GitHub.

### 1. Crear el repo en GitHub
1. Entrá a https://github.com/new
2. Nombre: `starmap-ba` · Público · **sin** README/gitignore (ya existen)
3. Crear.

### 2. Conectar y pushear (desde la carpeta del proyecto)
```bash
git remote add origin https://github.com/jota1221-coder/starmap-ba.git
git branch -M main
git push -u origin main
```
(Git te va a pedir login a GitHub la primera vez.)

### 3. Importar en Vercel
1. Entrá a https://vercel.com con tu cuenta (la misma de Neon conviene).
2. **Add New → Project → Import** el repo `starmap-ba`.
3. Framework: Next.js (lo detecta solo). No cambies build settings.

### 4. ⚠️ Variables de entorno (CRÍTICO)
Antes de hacer Deploy, en **Environment Variables** agregá:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | connection string **pooled** (con `-pooler`) de Neon | Production, Preview, Development |
| `DIRECT_DATABASE_URL` | connection string **directa** (sin `-pooler`) de Neon | Production, Preview, Development |

> Importante: marcá **los 3 entornos** en ambas. La página `/mapa` se prerenderiza en el build y necesita `DATABASE_URL` **en tiempo de build**, no solo en runtime. `DIRECT_DATABASE_URL` la usa `prisma migrate deploy`, que ahora corre automáticamente como parte del build (ver más abajo) — sin ella, el build falla.

### 5. Deploy
Click **Deploy**. En 1-2 min queda en `https://starmap-ba.vercel.app`.

---

## Camino alternativo: Vercel CLI (sin GitHub)
```bash
npm i -g vercel
vercel login        # auth por browser
vercel              # primer deploy (preview)
vercel env add DATABASE_URL    # pegás el connection string
vercel --prod       # deploy a producción
```

---

## Verificación post-deploy
- [ ] Abre la landing
- [ ] `/mapa` muestra los 13 puntos sobre el satélite
- [ ] Click en un punto → panel + zoom
- [ ] `/punto/parque-tornquist` muestra score, clima y cielo en vivo
- [ ] Probar en el celular

## Migraciones de DB (automatizadas en el build)

Desde que separamos las DBs (Neon branching), `prisma migrate dev` en local
**solo afecta al branch `dev`**. Producción (branch `main`) se migra sola:
el script `build` corre `prisma migrate deploy && next build`, y
`prisma.config.ts` le pasa a ese comando la conexión **directa**
(`DIRECT_DATABASE_URL`, sin `-pooler`) para evitar el advisory lock del pooler.

**Endpoints Neon (cada branch tiene el suyo; copiarlos de la Neon Console):**
- `dev` (local): endpoint del branch `dev` · cadenas pooled/directa en `.env`
- `main` (prod/Vercel): endpoint del branch `main` · `DATABASE_URL` (pooled) y
  `DIRECT_DATABASE_URL` (directa) en las env vars de Vercel

**Flujo normal de trabajo:**

```bash
# 1. Crear la migración en local (va al branch dev)
npx prisma migrate dev --name <nombre>

# 2. git push → Vercel corre "prisma migrate deploy" (contra prod, vía
#    DIRECT_DATABASE_URL) y recién después "next build" — el código nuevo
#    nunca corre contra un schema viejo.
```

Ya no hace falta correr `migrate deploy` a mano contra prod. Si en algún
momento `DIRECT_DATABASE_URL` no estuviera seteada en Vercel, el build
fallaría de forma explícita (mejor que un 500 silencioso en runtime).

## Notas
- El free tier de Vercel + Neon alcanza de sobra para validar.
- Dominio `.com.ar`: recién cuando haya tracción real (20+ usuarios).
