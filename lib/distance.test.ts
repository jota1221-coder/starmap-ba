import { describe, it, expect } from "vitest";
import { haversineKm } from "./distance";

const OBELISCO = { lat: -34.6037, lng: -58.3816 };
const PILA = { lat: -36.05, lng: -58.25 };

describe("haversineKm", () => {
  it("distancia cero a sí mismo", () => {
    expect(haversineKm(OBELISCO, OBELISCO)).toBeCloseTo(0, 5);
  });

  it("Obelisco → Pila ≈ 161 km (línea recta)", () => {
    // ~161 km en línea recta (la distancia por ruta del seed, 285 km, es mayor).
    const d = haversineKm(OBELISCO, PILA);
    expect(d).toBeGreaterThan(155);
    expect(d).toBeLessThan(170);
  });

  it("es simétrica", () => {
    expect(haversineKm(OBELISCO, PILA)).toBeCloseTo(
      haversineKm(PILA, OBELISCO),
      6,
    );
  });

  it("1 grado de latitud ≈ 111 km", () => {
    const d = haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });
});
