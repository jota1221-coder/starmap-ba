import { describe, it, expect } from "vitest";
import { bortleColor, scoreColor, bortleLabel, BORTLE_LEGEND } from "./bortle";

const HEX = /^#[0-9a-f]{6}$/i;

describe("bortleLabel", () => {
  it("clasifica de excelente (oscuro) a contaminado", () => {
    expect(bortleLabel(1)).toBe("Excelente");
    expect(bortleLabel(2)).toBe("Excelente");
    expect(bortleLabel(3)).toBe("Muy bueno");
    expect(bortleLabel(4)).toBe("Bueno");
    expect(bortleLabel(5)).toBe("Aceptable");
    expect(bortleLabel(6)).toBe("Contaminado");
    expect(bortleLabel(9)).toBe("Contaminado");
  });
});

describe("bortleColor", () => {
  it("devuelve un hex válido para todo nivel 1-9", () => {
    for (let b = 1; b <= 9; b++) expect(bortleColor(b)).toMatch(HEX);
  });

  it("1 y 2 comparten color (banda excelente); 3 y 5 difieren", () => {
    expect(bortleColor(1)).toBe(bortleColor(2));
    expect(bortleColor(3)).not.toBe(bortleColor(5));
  });

  it("Bortle 6+ colapsa al mismo color (contaminado)", () => {
    expect(bortleColor(6)).toBe(bortleColor(9));
  });
});

describe("scoreColor", () => {
  it("verde para score alto, rojo para bajo", () => {
    expect(scoreColor(90)).toBe("#7fb08a");
    expect(scoreColor(10)).toBe("#b65c4d");
  });

  it("hex válido en todo el rango 0-100", () => {
    for (let s = 0; s <= 100; s += 5) expect(scoreColor(s)).toMatch(HEX);
  });

  it("cambia de banda exactamente en el corte 80", () => {
    expect(scoreColor(80)).toBe(scoreColor(90));
    expect(scoreColor(79)).not.toBe(scoreColor(80));
  });
});

describe("BORTLE_LEGEND", () => {
  it("tiene 5 entradas, cada una de un color distinto", () => {
    expect(BORTLE_LEGEND).toHaveLength(5);
    const colores = new Set(BORTLE_LEGEND.map((x) => bortleColor(x.bortle)));
    expect(colores.size).toBe(5);
  });
});
