import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchForecast, getWeatherAt, clearWeatherCache } from "./weather";

function mockOpenMeteoJson() {
  return {
    utc_offset_seconds: -10800, // ART, UTC-3
    hourly: {
      time: ["2026-06-01T00:00", "2026-06-01T01:00", "2026-06-01T02:00"],
      cloud_cover: [10, 50, 90],
      cloud_cover_low: [5, 40, 80],
      cloud_cover_mid: [3, 8, 8],
      cloud_cover_high: [2, 2, 2],
      visibility: [20000, 15000, null],
      relative_humidity_2m: [60, 65, 70],
      temperature_2m: [15, 14, 13],
    },
  };
}

describe("fetchForecast / getWeatherAt", () => {
  beforeEach(() => {
    clearWeatherCache();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parsea la respuesta de Open-Meteo (nubes, humedad, temperatura, visibilidad)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOpenMeteoJson(),
    } as Response);

    const forecast = await fetchForecast(-34.6, -58.4);
    expect(forecast.snapshots).toHaveLength(3);
    expect(forecast.snapshots[0].cloudCoverLow).toBe(5);
    expect(forecast.snapshots[1].temperature).toBe(14);
    expect(forecast.snapshots[2].visibilityKm).toBe(0); // null -> 0, no NaN/undefined
  });

  it("convierte la hora local del pronóstico a instante UTC usando el offset", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOpenMeteoJson(),
    } as Response);

    const forecast = await fetchForecast(-34.6, -58.4);
    // "2026-06-01T00:00" es hora ART (offset -10800s) -> 03:00 UTC.
    expect(new Date(forecast.utcMillis[0]).toISOString()).toBe(
      "2026-06-01T03:00:00.000Z",
    );
  });

  it("lanza un error legible si Open-Meteo responde con un status de error", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);
    await expect(fetchForecast(-34.6, -58.4)).rejects.toThrow("503");
  });

  it("cachea por coordenada: dos pedidos seguidos pegan una sola vez a la red", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOpenMeteoJson(),
    } as Response);

    await fetchForecast(-34.6, -58.4);
    await fetchForecast(-34.6, -58.4);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("getWeatherAt devuelve el snapshot horario más cercano a la fecha pedida", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOpenMeteoJson(),
    } as Response);

    // snapshot[1] ("01:00" ART) cae en 04:00 UTC; a las 04:10 UTC es el más cercano.
    const target = new Date("2026-06-01T04:10:00Z");
    const w = await getWeatherAt(-34.6, -58.4, target);
    expect(w?.cloudCoverLow).toBe(40);
  });
});
