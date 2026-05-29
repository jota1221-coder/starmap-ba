/**
 * Escala de color por nivel Bortle.
 * Verde = cielo excelente (oscuro), Rojo = muy contaminado.
 * Pensado para verse bien sobre un mapa de tema oscuro.
 */
export function bortleColor(bortle: number): string {
  if (bortle <= 2) return "#22c55e"; // verde — excelente
  if (bortle === 3) return "#84cc16"; // lima — muy bueno
  if (bortle === 4) return "#eab308"; // amarillo — bueno
  if (bortle === 5) return "#f97316"; // naranja — aceptable
  return "#ef4444"; // rojo — contaminado (6+)
}

/** Etiqueta corta de calidad de cielo por Bortle. */
export function bortleLabel(bortle: number): string {
  if (bortle <= 2) return "Excelente";
  if (bortle === 3) return "Muy bueno";
  if (bortle === 4) return "Bueno";
  if (bortle === 5) return "Aceptable";
  return "Contaminado";
}

/** Escala para la leyenda del mapa. */
export const BORTLE_LEGEND = [
  { bortle: 2, label: "Excelente (Bortle 1-2)" },
  { bortle: 3, label: "Muy bueno (Bortle 3)" },
  { bortle: 4, label: "Bueno (Bortle 4)" },
  { bortle: 5, label: "Aceptable (Bortle 5)" },
  { bortle: 6, label: "Contaminado (Bortle 6+)" },
] as const;
