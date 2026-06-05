import { describe, it, expect } from "vitest";
import { contieneEnlace } from "./moderation";

describe("contieneEnlace", () => {
  it("detecta http/https", () => {
    expect(contieneEnlace("mirá http://spam.com")).toBe(true);
    expect(contieneEnlace("https://x.io ofertas")).toBe(true);
  });

  it("detecta www y dominios sueltos", () => {
    expect(contieneEnlace("entrá a www.spam.net")).toBe(true);
    expect(contieneEnlace("comprá en miweb.com.ar")).toBe(true);
  });

  it("NO marca texto normal de una reseña", () => {
    expect(
      contieneEnlace("Cielo increíble, se veía la Vía Láctea. Llevá abrigo."),
    ).toBe(false);
    expect(contieneEnlace("Fuimos en luna nueva, 5 estrellas")).toBe(false);
  });

  it("no se confunde con abreviaturas comunes", () => {
    expect(contieneEnlace("a las 22.30 hs estaba despejado")).toBe(false);
  });
});
