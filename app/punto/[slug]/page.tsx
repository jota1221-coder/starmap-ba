import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPointBySlug, getReviews, getUserReview } from "@/lib/points";
import Stars from "@/components/Stars";
import ReviewForm from "@/components/ReviewForm";
import { getConditions } from "@/lib/conditions";
import { explainScore } from "@/lib/score";
import { bortleColor, bortleLabel } from "@/lib/bortle";
import DatePicker from "@/components/DatePicker";
import Wordmark from "@/components/Wordmark";
import NightPlan from "@/components/NightPlan";
import { getCachedObservationPlan } from "@/lib/observation-plan";
import {
  nightOf,
  todayInBA,
  maxForecastDate,
  formatBADate,
} from "@/lib/observation-time";

export const dynamic = "force-dynamic"; // condiciones en vivo

const TIPO_LABEL: Record<string, string> = {
  sierra: "Sierra",
  costa: "Costa",
  reserva: "Reserva",
  pampa: "Pampa",
  laguna: "Laguna",
};

const ACCESO_LABEL: Record<string, string> = {
  auto: "Se llega en auto",
  auto_caminata_corta: "Auto + caminata corta",
  cuatro_x_cuatro: "Requiere 4x4",
};

const CAMINO_LABEL: Record<string, string> = {
  asfalto: "asfalto",
  ripio: "ripio",
  tierra: "tierra",
};

function scoreColor(score: number): string {
  if (score >= 80) return "#7fb08a";
  if (score >= 60) return "#a9b97e";
  if (score >= 40) return "#d6a862";
  if (score >= 20) return "#c8804b";
  return "#b65c4d";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const point = await getPointBySlug(slug);
  if (!point) return { title: "Punto no encontrado — StarMap BA" };
  return {
    title: `${point.nombre} — StarMap BA`,
    description: `Guía de observación astronómica: ${point.nombre} (${point.partido}). Cielo Bortle ${point.bortle}, a ${point.distanciaCabaKm} km de CABA.`,
  };
}

/** Encabezado de sección consistente (sin emojis estructurales). */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
      {children}
    </h2>
  );
}

export default async function PuntoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const { date: dateParam } = await searchParams;

  const point = await getPointBySlug(slug);
  if (!point) notFound();

  const { dateStr } = nightOf(dateParam);

  // Plan de la noche (cacheado: es determinístico para slug+fecha).
  const plan = await getCachedObservationPlan(
    point.slug,
    dateStr,
    point.lat,
    point.lng,
  );

  // Llamadas independientes en paralelo (antes eran 3 round-trips en serie).
  // El score representa la noche; se calcula en la medianoche astronómica.
  const [conditions, session, reviews] = await Promise.all([
    getConditions({
      lat: point.lat,
      lng: point.lng,
      bortle: point.bortle,
      date: new Date(plan.midnightMs),
    }),
    auth(),
    getReviews(point.id),
  ]);

  const { score, sky, weather } = conditions;
  const moon = sky.moon;
  const explanation = score ? explainScore(score) : null;

  const myReview = session?.user?.id
    ? await getUserReview(point.id, session.user.id)
    : null;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;

  return (
    <div className="min-h-dvh bg-ink text-fg">
      {/* Nav */}
      <header className="border-b border-white/5 px-4 py-3.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/mapa"
            className="text-sm text-fg-muted transition-colors duration-200 hover:text-fg"
          >
            ← Volver al mapa
          </Link>
          <Wordmark className="text-sm" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-10 px-5 py-8">
        {/* Título + badges */}
        <section>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance">
            {point.nombre}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{point.partido}</p>
          <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-medium text-ink"
              style={{ backgroundColor: bortleColor(point.bortle) }}
            >
              Bortle {point.bortle} · {bortleLabel(point.bortle)}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-fg-muted">
              {TIPO_LABEL[point.tipo] ?? point.tipo}
            </span>
            <span className="tnum rounded-full border border-white/10 px-2.5 py-1 text-fg-muted">
              {point.distanciaCabaKm} km de CABA
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-fg-muted">
              {ACCESO_LABEL[point.accesoTipo] ?? point.accesoTipo}
            </span>
          </div>
        </section>

        {/* Selector de fecha */}
        <section className="flex flex-col gap-3 border-y border-white/5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-muted">
            Noche del{" "}
            <span className="font-medium text-fg">{formatBADate(dateStr)}</span>{" "}
            <span className="tnum text-fg-faint">
              · {plan.duskLabel}–{plan.dawnLabel}
            </span>
          </p>
          <DatePicker current={dateStr} min={todayInBA()} max={maxForecastDate()} />
        </section>

        {/* Score */}
        <section>
          {score ? (
            <>
              <div className="flex items-center gap-5">
                <div
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border"
                  style={{
                    borderColor: scoreColor(score.score),
                    backgroundColor: `${scoreColor(score.score)}14`,
                  }}
                >
                  <span className="tnum text-3xl font-semibold">
                    {score.score}
                  </span>
                  <span className="text-[10px] text-fg-faint">de 100</span>
                </div>
                <div>
                  <SectionTitle>Pronóstico de esta noche</SectionTitle>
                  <p
                    className="mt-1 text-2xl font-semibold tracking-tight"
                    style={{ color: scoreColor(score.score) }}
                  >
                    {score.rating}
                  </p>
                  <p className="mt-1 text-xs text-fg-faint">
                    Mide las condiciones de{" "}
                    <span className="text-fg-muted">esta noche</span> (nubes y
                    Luna), no la calidad del lugar.
                  </p>
                </div>
              </div>

              {/* Explicación en lenguaje natural: por qué es buena o mala noche */}
              {explanation && (
                <p className="mt-5 text-base leading-relaxed text-fg">
                  {explanation}
                </p>
              )}
              {!sky.isNight && (
                <p className="mt-2 text-sm text-night">
                  Ojo: a las 22:00 de esta fecha todavía no es noche cerrada.
                </p>
              )}
              <ul className="mt-6 space-y-3">
                {score.breakdown.map((f) => (
                  <li key={f.factor}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-fg-muted">{f.factor}</span>
                      <span className="text-fg-faint">{f.label}</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.round(f.value * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-fg-muted">
              No hay datos de clima para esta fecha (fuera del rango de
              pronóstico). Probá una fecha dentro de los próximos 7 días.
            </p>
          )}
        </section>

        {/* Cielo + Clima */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <SectionTitle>La Luna</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-fg-muted">Fase</dt>
                <dd className="text-fg">{moon.phaseName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">Iluminación</dt>
                <dd className="tnum text-fg">
                  {Math.round(moon.illumination * 100)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">Recorrido</dt>
                <dd className="text-fg-faint">ver abajo ↓</dd>
              </div>
            </dl>
          </div>

          <div>
            <SectionTitle>El clima</SectionTitle>
            {weather ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Nubes bajas</dt>
                  <dd className="tnum text-fg">{weather.cloudCoverLow}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Nubes medias / altas</dt>
                  <dd className="tnum text-fg">
                    {weather.cloudCoverMid}% / {weather.cloudCoverHigh}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Temperatura</dt>
                  <dd className="tnum text-fg">
                    {Math.round(weather.temperature)}°C
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Humedad</dt>
                  <dd className="tnum text-fg">{weather.humidity}%</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-fg-faint">Sin datos de clima.</p>
            )}
          </div>
        </section>

        {/* Dónde apuntar esta noche */}
        <section>
          <SectionTitle>Dónde apuntar y a qué hora</SectionTitle>
          <p className="mt-2 mb-5 text-sm text-fg-muted">
            Recorrido de cada astro durante la noche. El{" "}
            <span className="text-accent">★</span> marca su mejor momento (cuando
            está más alto).
          </p>
          <NightPlan
            objects={plan.objects}
            duskMs={plan.duskMs}
            dawnMs={plan.dawnMs}
            duskLabel={plan.duskLabel}
            dawnLabel={plan.dawnLabel}
          />
        </section>

        {/* Cómo llegar */}
        <section>
          <SectionTitle>Cómo llegar</SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            {point.notasAcceso}
          </p>
          <p className="mt-2 text-xs text-fg-faint">
            {ACCESO_LABEL[point.accesoTipo] ?? point.accesoTipo} · camino de{" "}
            {CAMINO_LABEL[point.accesoCamino] ?? point.accesoCamino}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-fg transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:text-accent"
          >
            Abrir en Google Maps →
          </a>
        </section>

        {/* Info del lugar */}
        <section className="space-y-6 border-t border-white/5 pt-8">
          <div>
            <SectionTitle>Sobre el lugar</SectionTitle>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {point.descripcion}
            </p>
          </div>

          {point.experiencia && (
            <p className="text-base leading-relaxed text-fg italic">
              “{point.experiencia}”
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {point.mejorEpoca && (
              <div>
                <SectionTitle>Mejor época</SectionTitle>
                <p className="mt-2 text-sm text-fg-muted">{point.mejorEpoca}</p>
              </div>
            )}
            {point.dondeDormir && (
              <div>
                <SectionTitle>Dónde dormir</SectionTitle>
                <p className="mt-2 text-sm text-fg-muted">{point.dondeDormir}</p>
              </div>
            )}
          </div>

          {point.tips.length > 0 && (
            <div>
              <SectionTitle>Tips</SectionTitle>
              <ul className="mt-3 space-y-2">
                {point.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-fg-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {point.referencia && (
            <p className="text-xs text-fg-faint">Fuente: {point.referencia}</p>
          )}
        </section>

        {/* Reseñas de la comunidad */}
        <section className="border-t border-white/5 pt-8">
          <div className="flex items-center justify-between">
            <SectionTitle>Reseñas de la comunidad</SectionTitle>
            {point.ratingCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Stars value={point.ratingAvg} />
                <span className="tnum font-medium text-fg">
                  {point.ratingAvg.toFixed(1)}
                </span>
                <span className="tnum text-fg-faint">({point.ratingCount})</span>
              </div>
            )}
          </div>

          {/* Formulario o prompt de login */}
          <div className="mt-5">
            {session?.user ? (
              <ReviewForm
                pointId={point.id}
                slug={point.slug}
                initial={myReview}
              />
            ) : (
              <p className="text-sm text-fg-muted">
                <Link
                  href="/login"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  Entrá
                </Link>{" "}
                para dejar tu reseña y ayudar a otros a elegir.
              </p>
            )}
          </div>

          {/* Lista de reseñas */}
          {reviews.length > 0 ? (
            <ul className="mt-8 space-y-5">
              {reviews.map((r) => {
                const autor =
                  r.user.name ?? r.user.email?.split("@")[0] ?? "Anónimo";
                const fecha = new Intl.DateTimeFormat("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(r.createdAt);
                return (
                  <li
                    key={r.id}
                    className="border-t border-white/5 pt-5 first:border-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-fg">{autor}</span>
                      <Stars value={r.rating} size={14} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {r.cuerpo}
                    </p>
                    {r.consejo && (
                      <p className="mt-2 text-xs text-fg-faint">
                        <span className="text-accent">Consejo:</span> {r.consejo}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-fg-faint">{fecha}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-fg-faint">
              Todavía no hay reseñas. Si fuiste, sé el primero en contar cómo te
              fue.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
