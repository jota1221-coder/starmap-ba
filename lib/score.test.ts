import { describe, it, expect } from "vitest";
import { computeScore, type ScoreInput } from "./score";

const base: ScoreInput = {
  cloudCoverLow: 0,
  cloudCoverMid: 0,
  cloudCoverHigh: 0,
  bortle: 4,
  moonIllumination: 0,
  moonAltitude: -30,
};

describe("computeScore — casos extremos", () => {
  it("Bortle 2 + despejado + luna nueva ⇒ excelente (>85)", () => {
    const r = computeScore({ ...base, bortle: 2 });
    expect(r.score).toBeGreaterThan(85);
    expect(r.rating).toBe("Excelente");
  });

  it("Bortle 8 + despejado ⇒ malo (la luz urbana mata el cielo, <20)", () => {
    const r = computeScore({ ...base, bortle: 8 });
    expect(r.score).toBeLessThan(20);
  });

  it("Bortle 3 + 100% nubes bajas ⇒ casi cero (<10)", () => {
    const r = computeScore({ ...base, bortle: 3, cloudCoverLow: 100 });
    expect(r.score).toBeLessThan(10);
  });

  it("nubes ALTAS (cirros) penalizan menos que nubes BAJAS", () => {
    const altas = computeScore({ ...base, bortle: 3, cloudCoverHigh: 80 });
    const bajas = computeScore({ ...base, bortle: 3, cloudCoverLow: 80 });
    expect(altas.score).toBeGreaterThan(bajas.score);
  });

  it("luna llena alta reduce el score respecto a luna nueva", () => {
    const nueva = computeScore({ ...base, bortle: 2 });
    const llenaAlta = computeScore({
      ...base,
      bortle: 2,
      moonIllumination: 1,
      moonAltitude: 70,
    });
    expect(llenaAlta.score).toBeLessThan(nueva.score);
    expect(llenaAlta.score).toBeLessThan(nueva.score * 0.6);
  });

  it("luna llena PERO bajo el horizonte no penaliza", () => {
    const conLunaAbajo = computeScore({
      ...base,
      bortle: 2,
      moonIllumination: 1,
      moonAltitude: -10,
    });
    const sinLuna = computeScore({ ...base, bortle: 2 });
    expect(conLunaAbajo.score).toBe(sinLuna.score);
  });

  it("score siempre dentro de 0-100", () => {
    for (let b = 1; b <= 9; b++) {
      const r = computeScore({ ...base, bortle: b, cloudCoverLow: 50 });
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  it("breakdown tiene los 3 factores", () => {
    const r = computeScore(base);
    expect(r.breakdown.map((f) => f.factor)).toEqual([
      "nubes",
      "bortle",
      "luna",
    ]);
  });
});
