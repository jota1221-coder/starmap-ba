// Smoke test del servicio de clima (red real).
import { getWeatherAt, fetchForecast } from "../lib/weather.ts";

const lat = -36.05;
const lon = -58.25;

const fc = await fetchForecast(lat, lon);
console.log("snapshots:", fc.snapshots.length, "offset(s):", fc.utcOffsetSeconds);

const now = await getWeatherAt(lat, lon);
console.log("ahora:", now);

// segunda llamada debería venir de cache (instantánea)
const t0 = Date.now();
await getWeatherAt(lat, lon);
console.log("segunda llamada (cache) ms:", Date.now() - t0);
