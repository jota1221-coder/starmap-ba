import { describe, it, expect, vi } from "vitest";
import { getConditions } from "./conditions";
import * as weatherModule from "./weather";

vi.mock("./weather", () => ({ getWeatherAt: vi.fn() }));

const MOCK_WEATHER = {
  time: "2026-06-01T22:00",
  cloudCoverLow: 0,
  cloudCoverMid: 0,
  cloudCoverHigh: 0,
  cloudCoverTotal: 0,
  visibilityKm: 20,
  humidity: 50,
  temperature: 15,
};

describe("getConditions", () => {
  it("con clima disponible, calcula un score", async () => {
    vi.mocked(weatherModule.getWeatherAt).mockResolvedValue(MOCK_WEATHER);

    const c = await getConditions({
      lat: -34.6,
      lng: -58.4,
      bortle: 2,
      date: new Date("2026-06-01T22:00:00-03:00"),
    });

    expect(c.weather).toEqual(MOCK_WEATHER);
    expect(c.score).not.toBeNull();
    expect(c.score!.score).toBeGreaterThan(0);
  });

  it("si Open-Meteo tira una excepción, degrada a score null sin romper la página", async () => {
    vi.mocked(weatherModule.getWeatherAt).mockRejectedValue(
      new Error("Open-Meteo respondió 503"),
    );

    const c = await getConditions({ lat: -34.6, lng: -58.4, bortle: 2 });
    expect(c.weather).toBeNull();
    expect(c.score).toBeNull();
  });

  it("si getWeatherAt devuelve null (sin snapshots), también degrada sin romper", async () => {
    vi.mocked(weatherModule.getWeatherAt).mockResolvedValue(null);

    const c = await getConditions({ lat: -34.6, lng: -58.4, bortle: 2 });
    expect(c.weather).toBeNull();
    expect(c.score).toBeNull();
  });

  it("calcula 'sky' (posición astronómica) aunque el clima falle", async () => {
    vi.mocked(weatherModule.getWeatherAt).mockRejectedValue(new Error("boom"));

    const c = await getConditions({ lat: -34.6, lng: -58.4, bortle: 2 });
    expect(c.sky).toBeDefined();
    expect(c.sky.moon).toBeDefined();
  });
});
