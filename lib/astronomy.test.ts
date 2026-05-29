import { describe, it, expect } from "vitest";
import {
  getMoonInfo,
  getSunAltitude,
  getVisiblePlanets,
  getSkyConditions,
  moonPhaseName,
  azimuthToCardinal,
} from "./astronomy";

// Fixture validado contra el MCP de stargazing:
// Pila (-36.05, -58.25) el 2026-05-28 22:00 ART = 2026-05-29T01:00:00Z
// MCP devolvió: iluminación 0.9496, Waxing Gibbous, 0 planetas visibles.
const FIXTURE_DATE = new Date("2026-05-29T01:00:00Z");
const PILA = { lat: -36.05, lon: -58.25 };

describe("getMoonInfo", () => {
  it("coincide con el MCP en iluminación (~0.9496)", () => {
    const moon = getMoonInfo(FIXTURE_DATE, PILA.lat, PILA.lon);
    expect(moon.illumination).toBeGreaterThan(0.94);
    expect(moon.illumination).toBeLessThan(0.96);
  });

  it("identifica fase gibosa creciente", () => {
    const moon = getMoonInfo(FIXTURE_DATE, PILA.lat, PILA.lon);
    expect(moon.phaseName).toBe("Gibosa creciente");
  });

  it("la Luna está alta sobre el horizonte y marcada como visible", () => {
    const moon = getMoonInfo(FIXTURE_DATE, PILA.lat, PILA.lon);
    expect(moon.altitude).toBeGreaterThan(60);
    expect(moon.isUp).toBe(true);
  });
});

describe("getSunAltitude / noche", () => {
  it("es noche astronómica profunda (sol muy bajo)", () => {
    const alt = getSunAltitude(FIXTURE_DATE, PILA.lat, PILA.lon);
    expect(alt).toBeLessThan(-18);
  });
});

describe("getVisiblePlanets", () => {
  it("coincide con el MCP: ningún planeta mayor sobre el horizonte", () => {
    const planets = getVisiblePlanets(FIXTURE_DATE, PILA.lat, PILA.lon);
    expect(planets).toHaveLength(0);
  });
});

describe("getSkyConditions", () => {
  it("agrega luna, sol y planetas correctamente", () => {
    const sky = getSkyConditions(FIXTURE_DATE, PILA.lat, PILA.lon);
    expect(sky.isNight).toBe(true);
    expect(sky.moon.illumination).toBeGreaterThan(0.94);
    expect(sky.visiblePlanets).toHaveLength(0);
  });
});

describe("moonPhaseName", () => {
  it("mapea ángulos clásicos", () => {
    expect(moonPhaseName(0)).toBe("Luna nueva");
    expect(moonPhaseName(90)).toBe("Cuarto creciente");
    expect(moonPhaseName(180)).toBe("Luna llena");
    expect(moonPhaseName(270)).toBe("Cuarto menguante");
  });
});

describe("azimuthToCardinal", () => {
  it("mapea rumbos principales", () => {
    expect(azimuthToCardinal(0)).toBe("Norte");
    expect(azimuthToCardinal(90)).toBe("Este");
    expect(azimuthToCardinal(180)).toBe("Sur");
    expect(azimuthToCardinal(270)).toBe("Oeste");
    expect(azimuthToCardinal(360)).toBe("Norte");
  });
});
