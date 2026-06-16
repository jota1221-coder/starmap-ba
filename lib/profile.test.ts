import { describe, it, expect } from "vitest";
import {
  isExperience,
  experienceLabel,
  reviewerName,
  isProfileComplete,
  EXPERIENCE_OPTIONS,
} from "./profile";

describe("isExperience", () => {
  it("acepta todos los valores válidos", () => {
    for (const o of EXPERIENCE_OPTIONS) expect(isExperience(o.value)).toBe(true);
  });

  it("rechaza valores inválidos y no-strings", () => {
    expect(isExperience("experto")).toBe(false);
    expect(isExperience("")).toBe(false);
    expect(isExperience(null)).toBe(false);
    expect(isExperience(undefined)).toBe(false);
    expect(isExperience(3)).toBe(false);
    expect(isExperience({})).toBe(false);
  });
});

describe("experienceLabel", () => {
  it("traduce el valor a su etiqueta visible", () => {
    expect(experienceLabel("nada")).toBe("Nada");
    expect(experienceLabel("basico")).toBe("Básico");
    expect(experienceLabel("intermedio")).toBe("Intermedio");
    expect(experienceLabel("avanzado")).toBe("Avanzado");
  });

  it("devuelve null si no está seteado", () => {
    expect(experienceLabel(null)).toBeNull();
    expect(experienceLabel(undefined)).toBeNull();
  });
});

describe("reviewerName", () => {
  it("prefiere el nickname cuando existe", () => {
    expect(reviewerName({ nickname: "Astro", firstName: "Juan" })).toBe("Astro");
  });

  it("cae al firstName si el nick está vacío o ausente", () => {
    expect(reviewerName({ nickname: null, firstName: "Juan" })).toBe("Juan");
    expect(reviewerName({ nickname: "   ", firstName: "Juan" })).toBe("Juan");
  });

  it("usa 'Observador anónimo' si no hay nada", () => {
    expect(reviewerName({ nickname: null, firstName: null })).toBe(
      "Observador anónimo",
    );
    expect(reviewerName({ nickname: "  ", firstName: "  " })).toBe(
      "Observador anónimo",
    );
  });

  it("nunca expone un email (decisión de privacidad)", () => {
    expect(reviewerName({ nickname: "X", firstName: "Y" })).not.toContain("@");
  });
});

describe("isProfileComplete", () => {
  const completo = {
    firstName: "Juan",
    lastName: "Pérez",
    nickname: null,
    experience: "basico" as const,
  };

  it("completo con nombre, apellido y experiencia (nick opcional)", () => {
    expect(isProfileComplete(completo)).toBe(true);
    expect(isProfileComplete({ ...completo, nickname: "Juani" })).toBe(true);
  });

  it("incompleto si falta algún campo obligatorio", () => {
    expect(isProfileComplete({ ...completo, firstName: null })).toBe(false);
    expect(isProfileComplete({ ...completo, lastName: null })).toBe(false);
    expect(isProfileComplete({ ...completo, experience: null })).toBe(false);
  });

  it("null o undefined ⇒ incompleto", () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(isProfileComplete(undefined)).toBe(false);
  });
});
