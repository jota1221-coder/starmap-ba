import { notFound } from "next/navigation";
import Link from "next/link";
import { getPointBySlug } from "@/lib/points";
import { getConditions } from "@/lib/conditions";
import { azimuthToCardinal } from "@/lib/astronomy";
import { bortleColor, bortleLabel } from "@/lib/bortle";
import DatePicker from "@/components/DatePicker";
import Wordmark from "@/components/Wordmark";
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

  const { date, dateStr } = nightOf(dateParam);
  const conditions = await getConditions({
    lat: point.lat,
    lng: point.lng,
    bortle: point.bortle,
    date,
  });

  const { score, sky, weather } = conditions;
  const moon = sky.moon;
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
            Condiciones para la{" "}
            <span className="font-medium text-fg">{formatBADate(dateStr)}</span>{" "}
            <span className="text-fg-faint">· 22:00 hs</span>
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
                  <SectionTitle>Score de observación</SectionTitle>
                  <p
                    className="mt-1 text-2xl font-semibold tracking-tight"
                    style={{ color: scoreColor(score.score) }}
                  >
                    {score.rating}
                  </p>
                  {!sky.isNight && (
                    <p className="mt-1 text-xs text-night">
                      A esta hora todavía no es noche cerrada
                    </p>
                  )}
                </div>
              </div>
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
                <dt className="text-fg-muted">Posición</dt>
                <dd className="text-fg">
                  {moon.isUp ? (
                    <>
                      <span className="tnum">{Math.round(moon.altitude)}°</span>{" "}
                      hacia el {azimuthToCardinal(moon.azimuth)}
                    </>
                  ) : (
                    "Bajo el horizonte"
                  )}
                </dd>
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

        {/* Planetas visibles */}
        <section>
          <SectionTitle>Planetas visibles a las 22:00</SectionTitle>
          {sky.visiblePlanets.length > 0 ? (
            <ul className="mt-3 divide-y divide-white/5">
              {sky.visiblePlanets.map((p) => (
                <li
                  key={p.key}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium text-fg">{p.nombre}</span>
                  <span className="text-fg-muted">
                    <span className="tnum">{Math.round(p.altitude)}°</span> sobre
                    el horizonte · mirá al{" "}
                    <span className="text-fg">{p.direccion}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-faint">
              Ningún planeta mayor sobre el horizonte a esta hora. Probá otra
              fecha o consultá más tarde en la noche.
            </p>
          )}
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
      </main>
    </div>
  );
}
