/**
 * Servicio de clima de StarMap BA — Open-Meteo (gratis, sin API key).
 * Pide la cobertura de nubes desglosada en baja/media/alta: para astronomía
 * las nubes bajas y medias tapan mucho más que los cirros altos.
 */

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos
const FORECAST_DAYS = 7;

export interface WeatherSnapshot {
  time: string; // ISO local del punto
  cloudCoverLow: number; // %
  cloudCoverMid: number; // %
  cloudCoverHigh: number; // %
  cloudCoverTotal: number; // %
  visibilityKm: number;
  humidity: number; // %
  temperature: number; // °C
}

interface ParsedForecast {
  utcOffsetSeconds: number;
  snapshots: WeatherSnapshot[]; // por hora
  /** Instante UTC (ms) de cada snapshot, alineado con `snapshots`. */
  utcMillis: number[];
}

interface CacheEntry {
  data: ParsedForecast;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lon: number): string {
  // Redondeo a ~1 km para compartir cache entre coords muy cercanas.
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

interface OpenMeteoResponse {
  utc_offset_seconds: number;
  hourly: {
    time: string[];
    cloud_cover: number[];
    cloud_cover_low: number[];
    cloud_cover_mid: number[];
    cloud_cover_high: number[];
    visibility: (number | null)[];
    relative_humidity_2m: number[];
    temperature_2m: number[];
  };
}

function parseResponse(json: OpenMeteoResponse): ParsedForecast {
  const h = json.hourly;
  const offset = json.utc_offset_seconds;
  const snapshots: WeatherSnapshot[] = [];
  const utcMillis: number[] = [];

  for (let i = 0; i < h.time.length; i++) {
    // h.time[i] es hora local sin zona; su instante UTC = (T como UTC) - offset.
    const localAsUtc = new Date(`${h.time[i]}Z`).getTime();
    utcMillis.push(localAsUtc - offset * 1000);

    const visM = h.visibility[i];
    snapshots.push({
      time: h.time[i],
      cloudCoverLow: h.cloud_cover_low[i],
      cloudCoverMid: h.cloud_cover_mid[i],
      cloudCoverHigh: h.cloud_cover_high[i],
      cloudCoverTotal: h.cloud_cover[i],
      visibilityKm: visM == null ? 0 : visM / 1000,
      humidity: h.relative_humidity_2m[i],
      temperature: h.temperature_2m[i],
    });
  }

  return { utcOffsetSeconds: offset, snapshots, utcMillis };
}

/** Trae (o reusa de cache) el pronóstico horario de un punto. */
export async function fetchForecast(
  lat: number,
  lon: number,
): Promise<ParsedForecast> {
  const key = cacheKey(lat, lon);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const url =
    `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}` +
    `&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,relative_humidity_2m,temperature_2m` +
    `&timezone=auto&forecast_days=${FORECAST_DAYS}`;

  // Caché L2: Next Data Cache. A diferencia del Map in-memory (L1, por
  // instancia y efímero en serverless), esta caché PERSISTE entre
  // invocaciones serverless. Es el cache real de cara a escalar.
  // En runtime no-Next (scripts/tests) la opción `next` se ignora sin romper.
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: CACHE_TTL_MS / 1000, tags: ["weather"] },
  });
  if (!res.ok) {
    throw new Error(`Open-Meteo respondió ${res.status}`);
  }
  const json = (await res.json()) as OpenMeteoResponse;
  const data = parseResponse(json);
  cache.set(key, { data, fetchedAt: Date.now() });
  return data;
}

/** Snapshot de clima más cercano a `date` para el punto dado. */
export async function getWeatherAt(
  lat: number,
  lon: number,
  date: Date = new Date(),
): Promise<WeatherSnapshot | null> {
  const forecast = await fetchForecast(lat, lon);
  if (forecast.snapshots.length === 0) return null;

  const target = date.getTime();
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < forecast.utcMillis.length; i++) {
    const diff = Math.abs(forecast.utcMillis[i] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return forecast.snapshots[bestIdx];
}

/** Vacía la cache (útil en tests). */
export function clearWeatherCache(): void {
  cache.clear();
}
