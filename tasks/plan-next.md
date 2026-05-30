# Plan: ¿Qué orden tomar a partir de acá?

> Plan mode — mayo 2026. Decisión de prioridades post-review de arquitectura.
> No reemplaza `plan.md` (el plan maestro original); es el "qué sigue ahora".

## La pregunta real

"¿Qué construimos ahora?" — pero la respuesta honesta no es *qué feature*, sino
**parar de construir features y cerrar el círculo.**

## El diagnóstico incómodo

StarMap BA está "LIVE", pero hay una brecha entre lo que parece y lo que es:

| Parece | Es |
|---|---|
| Auth funcionando | ✅ en local — ❌ en prod no manda emails (falta Resend) |
| Reseñas usables | ❌ nadie puede loguearse en prod → reseñas inalcanzables |
| Producto deployado | ⚠️ los últimos commits (auth, reseñas, hardening) **no están pusheados** |
| MVP validado | ❌ **cero usuarios reales lo vieron** |

**Conclusión:** construimos 3 features grandes (auth, reseñas, hardening) que
**nadie puede usar todavía**. Y el próximo paso del orden acordado
("puntos enviados por usuarios") es el feature **más riesgoso** (spam, moderación,
coordenadas malas) y el **menos validado**.

> Esto es exactamente la trampa de "preparar más antes de mostrar". El mejor
> aporte de ingeniería ahora es **no** escribir un feature nuevo.

## Decisión de arquitectura/proceso

**Orden recomendado: Cerrar → Validar → (recién ahí) Construir con datos.**

Construir "puntos de usuarios" ahora sería apostar semanas a una hipótesis sin
evidencia. Se **difiere explícitamente** detrás de la validación.

---

## Fase 0 — Cerrar el círculo (hacer usable lo ya hecho)

Tareas chicas, obligatorias para que las features construidas no estén muertas.

### Task A: Pushear todos los commits locales
**Descripción:** Subir auth + reseñas + hardening a GitHub; Vercel redeploya.
**Acceptance:**
- [ ] `git status` limpio, `origin/main` al día
- [ ] Deploy de Vercel en verde
**Verificación:**
- [ ] `curl https://<prod>/api/health` → `{"status":"ok"}`
- [ ] `/punto/<slug>` carga en prod
**Dependencias:** Ninguna · **Scope:** XS

### Task B: Variables de entorno de auth en Vercel
**Descripción:** Cargar `AUTH_SECRET` y `AUTH_URL` en Vercel + redeploy.
**Acceptance:**
- [ ] `/login` en prod no tira error de configuración
- [ ] Landing/mapa muestran "Entrar"
**Verificación:**
- [ ] Cargar `/login` en prod sin error 500
**Dependencias:** A · **Scope:** XS (acción del usuario en el dashboard)

### Task C: Activar Resend (emails de login reales)
**Descripción:** Crear cuenta Resend, agregar `RESEND_API_KEY` + `EMAIL_FROM` en Vercel.
**Acceptance:**
- [ ] Pedir magic link en prod envía un email real
- [ ] El link autentica y redirige a `/mapa`
**Verificación:**
- [ ] Login e2e en prod con tu propia casilla
**Notas:** Resend free sin dominio propio solo envía a tu email. Para abrirlo a
la comunidad: verificar un dominio (o aceptar la limitación al inicio).
**Dependencias:** A, B · **Scope:** S

### Task D: Separar DB dev/prod (Neon branching)
**Descripción:** Crear branch `dev` en Neon; `.env` local apunta a `dev`, prod a `main`.
**Acceptance:**
- [ ] `prisma migrate dev` local NO toca la DB de producción
**Verificación:**
- [ ] Una migración de prueba en local no aparece en la data de prod
**Dependencias:** Ninguna · **Scope:** S (riesgo de infra real, señalado en el review)

### ✋ Checkpoint Fase 0
- [ ] Producto **realmente usable** en prod: alguien puede entrar, ver, reseñar
- [ ] Dev y prod aislados
- [ ] **Recién acá tiene sentido mostrarlo**

---

## Fase 1 — Validar (lo que se viene postergando)

### Task E: Instrumentar para aprender
**Descripción:** Activar Vercel Analytics (gratis) + un canal de feedback simple.
**Acceptance:**
- [ ] Analytics registra visitas y páginas más vistas
- [ ] Hay una forma de que la gente deje feedback (link, mail o form mínimo)
**Verificación:**
- [ ] Una visita propia aparece en Analytics
**Dependencias:** A · **Scope:** S

### Task F: Compartir con la comunidad real
**Descripción:** Postear en los canales identificados y recoger reacciones.
**Acceptance:**
- [ ] Publicado en ≥2 de: Espacio Profundo, grupos FB astrofoto, X divulgación
- [ ] `feedback-mvp.md` con lo que dijo la gente
**Verificación:**
- [ ] ≥10 visitas de terceros en Analytics; feedback anotado
**Dependencias:** Checkpoint Fase 0 · **Scope:** acción del usuario (no código)

### 🚩 Checkpoint Fase 1 — EL MÁS IMPORTANTE
- [ ] Usuarios reales lo usaron
- [ ] Feedback documentado
- [ ] **DECISIÓN basada en datos:** ¿qué duele/falta de verdad? Eso define la Fase 2.

---

## Fase 2 — Features guiadas por feedback (CANDIDATOS, no compromisos)

Se elige **según lo que pida la validación**, no de antemano. Candidatos:

- **Puntos enviados por usuarios** (el del orden acordado) — el más riesgoso.
  Requiere: schema `Submission` + moderación (estado PENDING) + UI de envío +
  panel de aprobación. Solo si la gente realmente quiere aportar puntos.
- **Brújula visual** (Task 10 original) — el alt/az ya está en texto.
- **Mobile/PWA fino** (Task 12) — si el tráfico es mayormente mobile (lo dirá Analytics).
- **Alertas por email** "avisame cuando haya buena noche en X" (Fase 7 original).
- **Showcase de Data Science** (`/data-science`, notebook) — para tu marca personal/CV.

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Seguir construyendo sin validar | Alto | Este plan: gate de validación antes de Fase 2 |
| Resend sin dominio = login limitado | Medio | Empezar con tu email; verificar dominio si hay tracción |
| dev/prod misma DB | Medio | Task D (Neon branching) antes de seguir migrando |
| Validación tibia (nicho chico) | Alto | Si pasa: pivotar foco a showcase DS (vale para el CV igual) |
| Construir "puntos de usuarios" sin demanda | Medio | Diferido detrás del checkpoint Fase 1 |

## Preguntas abiertas (para vos)

1. ¿Tenés un dominio (aunque sea `.vercel.app` o uno barato) para que Resend
   pueda mandar emails a cualquiera, o arrancamos validando solo con tu casilla?
2. Para compartir: ¿lo hacés vos en los foros/grupos, o querés que prepare los
   textos de los posts?
3. Si la validación es tibia, ¿te interesa más insistir con el producto o virar
   al showcase de Data Science (que suma a tu CV pase lo que pase)?
