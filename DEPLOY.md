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
git remote add origin https://github.com/joaquinrao/starmap-ba.git
git branch -M main
git push -u origin main
```
(Git te va a pedir login a GitHub la primera vez.)

### 3. Importar en Vercel
1. Entrá a https://vercel.com con tu cuenta (la misma de Neon conviene).
2. **Add New → Project → Import** el repo `starmap-ba`.
3. Framework: Next.js (lo detecta solo). No cambies build settings.

### 4. ⚠️ Variable de entorno (CRÍTICO)
Antes de hacer Deploy, en **Environment Variables** agregá:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | (tu connection string de Neon) | Production, Preview, Development |

> Importante: marcá **los 3 entornos**. La página `/mapa` se prerenderiza en el build y necesita la DB **en tiempo de build**, no solo en runtime. Si falta, el build falla.

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

## Notas
- El free tier de Vercel + Neon alcanza de sobra para validar.
- Dominio `.com.ar`: recién cuando haya tracción real (20+ usuarios).
