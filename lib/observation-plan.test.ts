import { describe, it, expect } from "vitest";
import { getObservationPlan } from "./observation-plan";

const BA = { lat: -34.6, lng: -58.4 };
const NIGHT = new Date("2026-06-01T22:00:00-03:00");

describe("getObservationPlan", () => {
  it("la ventana de noche tiene dusk < medianoche < dawn", () => {
    const plan = getObservationPlan(NIGHT, BA.lat, BA.lng);
    expect(plan.duskMs).toBeLessThan(plan.midnightMs);
    expect(plan.midnightMs).toBeLessThan(plan.dawnMs);
  });

  it("todo objeto listado supera el umbral mínimo de altitud (10°)", () => {
    const plan = getObservationPlan(NIGHT, BA.lat, BA.lng);
    for (const obj of plan.objects) {
      expect(obj.best.altitude).toBeGreaterThanOrEqual(10);
    }
  });

  it("cada objeto trae un recorrido (track) con al menos un punto", () => {
    const plan = getObservationPlan(NIGHT, BA.lat, BA.lng);
    for (const obj of plan.objects) {
      expect(obj.track.length).toBeGreaterThan(0);
    }
  });

  it("los objetos quedan ordenados de mayor a menor altitud máxima", () => {
    const plan = getObservationPlan(NIGHT, BA.lat, BA.lng);
    for (let i = 1; i < plan.objects.length; i++) {
      expect(plan.objects[i - 1].best.altitude).toBeGreaterThanOrEqual(
        plan.objects[i].best.altitude,
      );
    }
  });

  it("es determinístico: misma fecha y lugar dan el mismo plan", () => {
    const a = getObservationPlan(NIGHT, BA.lat, BA.lng);
    const b = getObservationPlan(NIGHT, BA.lat, BA.lng);
    expect(a.objects.map((o) => o.key)).toEqual(b.objects.map((o) => o.key));
    expect(a.duskMs).toBe(b.duskMs);
  });
});
