import Link from "next/link";
import { notFound } from "next/navigation";
import { getPointBySlug } from "@/lib/points";
import { getConditions } from "@/lib/conditions";
import { azimuthToCardinal } from "@/lib/astronomy";
import { bortleColor, bortleLabel } from "@/lib/bortle";
import DatePicker from "@/components/DatePicker";
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
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <header className="border-b border-slate-800 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/mapa" className="text-sm text-slate-400 hover:text-slate-200">
            ← Volver al mapa
          </Link>
          <Link href="/" className="text-sm font-semibold tracking-tight">
            StarMap{" "}
            <span className="bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
              BA
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* Título + badges */}
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {point.nombre}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{point.partido}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-slate-950"
              style={{ backgroundColor: bortleColor(point.bortle) }}
            >
              Bortle {point.bortle} · {bortleLabel(point.bortle)}
            </span>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-300">
              {TIPO_LABEL[point.tipo] ?? point.tipo}
            </span>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-300">
              {point.distanciaCabaKm} km de CABA
            </span>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-300">
              {ACCESO_LABEL[point.accesoTipo] ?? point.accesoTipo}
            </span>
          </div>
        </section>

        {/* Selector de fecha */}
        <section className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">
            Condiciones para la{" "}
            <span className="font-medium text-slate-100">
              {formatBADate(dateStr)}
            </span>{" "}
            <span className="text-slate-500">(22:00 hs)</span>
          </p>
          <DatePicker current={dateStr} min={todayInBA()} max={maxForecastDate()} />
        </section>

        {/* Score */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          {score ? (
            <>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4"
                  style={{ borderColor: scoreColor(score.score) }}
                >
                  <span className="text-2xl font-bold">{score.score}</span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Score de observación
                  </p>
                  <p
                    className="text-xl font-semibold"
                    style={{ color: scoreColor(score.score) }}
                  >
                    {score.rating}
                  </p>
                  {!sky.isNight && (
                    <p className="mt-1 text-xs text-amber-400">
                      ⚠️ A esta hora todavía no es noche cerrada
                    </p>
                  )}
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {score.breakdown.map((f) => (
                  <li key={f.factor}>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="capitalize">{f.factor}</span>
                      <span>{f.label}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-400"
                        style={{ width: `${Math.round(f.value * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              No hay datos de clima para esta fecha (fuera del rango de
              pronóstico). Probá una fecha dentro de los próximos 7 días.
            </p>
          )}
        </section>

        {/* Cielo + Clima */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Luna */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-200">🌙 La Luna</h2>
            <dl className="mt-2 space-y-1 text-sm text-slate-400">
              <div className="flex justify-between">
                <dt>Fase</dt>
                <dd className="text-slate-200">{moon.phaseName}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Iluminación</dt>
                <dd className="text-slate-200">
                  {Math.round(moon.illumination * 100)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Posición</dt>
                <dd className="text-slate-200">
                  {moon.isUp
                    ? `${Math.round(moon.altitude)}° hacia el ${azimuthToCardinal(moon.azimuth)}`
                    : "Bajo el horizonte"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Clima */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-200">☁️ El clima</h2>
            {weather ? (
              <dl className="mt-2 space-y-1 text-sm text-slate-400">
                <div className="flex justify-between">
                  <dt>Nubes bajas</dt>
                  <dd className="text-slate-200">{weather.cloudCoverLow}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Nubes medias / altas</dt>
                  <dd className="text-slate-200">
                    {weather.cloudCoverMid}% / {weather.cloudCoverHigh}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Temperatura</dt>
                  <dd className="text-slate-200">{Math.round(weather.temperature)}°C</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Humedad</dt>
                  <dd className="text-slate-200">{weather.humidity}%</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Sin datos de clima.</p>
            )}
          </section>
        </div>

        {/* Planetas visibles */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200">
            🪐 Planetas visibles a las 22:00
          </h2>
          {sky.visiblePlanets.length > 0 ? (
            <ul className="mt-3 divide-y divide-slate-800">
              {sky.visiblePlanets.map((p) => (
                <li key={p.key} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-slate-100">{p.nombre}</span>
                  <span className="text-slate-400">
                    {Math.round(p.altitude)}° sobre el horizonte · mirá al{" "}
                    <span className="text-slate-200">{p.direccion}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Ningún planeta mayor sobre el horizonte a esta hora. Probá otra
              fecha o consultá más tarde en la noche.
            </p>
          )}
        </section>

        {/* Cómo llegar */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200">📍 Cómo llegar</h2>
          <p className="mt-2 text-sm text-slate-400">{point.notasAcceso}</p>
          <p className="mt-2 text-xs text-slate-500">
            {ACCESO_LABEL[point.accesoTipo] ?? point.accesoTipo} · camino de{" "}
            {CAMINO_LABEL[point.accesoCamino] ?? point.accesoCamino}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-white"
          >
            Abrir en Google Maps →
          </a>
        </section>

        {/* Info del lugar */}
        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Sobre el lugar</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {point.descripcion}
            </p>
          </div>

          {point.experiencia && (
            <p className="border-l-2 border-slate-700 pl-3 text-sm italic text-slate-300">
              {point.experiencia}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {point.mejorEpoca && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mejor época
                </h3>
                <p className="mt-1 text-sm text-slate-400">{point.mejorEpoca}</p>
              </div>
            )}
            {point.dondeDormir && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dónde dormir
                </h3>
                <p className="mt-1 text-sm text-slate-400">{point.dondeDormir}</p>
              </div>
            )}
          </div>

          {point.tips.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tips
              </h3>
              <ul className="mt-2 space-y-1.5">
                {point.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-400">
                    <span className="text-sky-400">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {point.referencia && (
            <p className="text-xs text-slate-600">Fuente: {point.referencia}</p>
          )}
        </section>
      </main>
    </div>
  );
}
