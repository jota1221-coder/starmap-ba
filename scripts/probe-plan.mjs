import { getObservationPlan } from "../lib/observation-plan.ts";

// Pila el 4 de junio 2026, 22:00 ART = 2026-06-05T01:00:00Z
const date = new Date("2026-06-05T01:00:00Z");
const plan = getObservationPlan(date, -36.05, -58.25);

console.log("Noche:", plan.duskLabel, "→", plan.dawnLabel);
console.log("Medianoche (score):", plan.midnight.toISOString());
console.log("Objetos observables:", plan.objects.length);
for (const o of plan.objects) {
  console.log(
    `\n${o.nombre}: mejor ${o.best.timeLabel} · ${Math.round(o.best.altitude)}° hacia ${o.best.direccion}`,
  );
  // muestra algunos puntos de la curva
  const sample = o.track.filter((_, i) => i % 6 === 0);
  console.log(
    "  curva:",
    sample.map((p) => `${p.timeLabel}=${Math.round(p.altitude)}°`).join("  "),
  );
}
