import { describe, it, expect, vi, afterEach } from "vitest";
import {
  todayInBA,
  addDays,
  maxForecastDate,
  isValidDateStr,
  nightOf,
  formatBATime,
  formatBADate,
} from "./observation-time";

afterEach(() => {
  vi.useRealTimers();
});

describe("todayInBA", () => {
  it("usa hora de Argentina (UTC-3), no UTC: madrugada UTC es todavía \"ayer\" en BA", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T02:00:00Z")); // 2026-01-14 23:00 ART
    expect(todayInBA()).toBe("2026-01-14");
  });

  it("no cruza de día antes de la medianoche de Argentina", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T23:30:00Z")); // 2026-01-15 20:30 ART
    expect(todayInBA()).toBe("2026-01-15");
  });
});

describe("addDays", () => {
  it("suma días simples", () => {
    expect(addDays("2026-01-15", 1)).toBe("2026-01-16");
  });

  it("cruza fin de mes", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("cruza fin de año", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("acepta días negativos (restar)", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("maxForecastDate", () => {
  it("es 6 días después de hoy (Open-Meteo da 7 días de pronóstico)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z")); // mediodía UTC = 09:00 ART, mismo día
    expect(maxForecastDate()).toBe("2026-06-07");
  });
});

describe("isValidDateStr", () => {
  it("acepta fechas reales bien formadas", () => {
    expect(isValidDateStr("2026-02-28")).toBe(true);
  });

  it("rechaza formatos que no son YYYY-MM-DD", () => {
    expect(isValidDateStr("28-02-2026")).toBe(false);
    expect(isValidDateStr("2026/02/28")).toBe(false);
    expect(isValidDateStr("")).toBe(false);
  });

  it("rechaza fechas que no existen en el calendario", () => {
    expect(isValidDateStr("2026-02-30")).toBe(false); // febrero no tiene 30
    expect(isValidDateStr("2026-13-01")).toBe(false); // no existe el mes 13
  });
});

describe("nightOf", () => {
  it("sin fecha, arma la noche de hoy en BA a las 22:00 ART", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    const { dateStr, date } = nightOf();
    expect(dateStr).toBe("2026-06-01");
    // 22:00 ART (UTC-3) del 1/6 = 01:00 UTC del 2/6.
    expect(date.toISOString()).toBe("2026-06-02T01:00:00.000Z");
  });

  it("con una fecha inválida, cae a hoy en BA en vez de romper", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    expect(nightOf("no-es-una-fecha").dateStr).toBe("2026-06-01");
  });

  it("con una fecha válida, la respeta tal cual", () => {
    const { dateStr, date } = nightOf("2026-07-04");
    expect(dateStr).toBe("2026-07-04");
    expect(date.toISOString()).toBe("2026-07-05T01:00:00.000Z");
  });
});

describe("formatBATime", () => {
  it("formatea HH:mm en hora de Argentina", () => {
    // 01:00 UTC = 22:00 ART del día anterior.
    expect(formatBATime(new Date("2026-06-01T01:00:00Z"))).toBe("22:00");
  });

  it("sin fecha, devuelve un guion", () => {
    expect(formatBATime(null)).toBe("—");
  });
});

describe("formatBADate", () => {
  it("formatea en español con día de la semana", () => {
    const s = formatBADate("2026-07-04"); // sábado
    expect(s.toLowerCase()).toContain("sábado");
    expect(s).toContain("4");
    expect(s.toLowerCase()).toContain("julio");
  });
});
