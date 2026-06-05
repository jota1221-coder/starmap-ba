/**
 * Escala de color por nivel Bortle.
 * Verde = cielo excelente (oscuro), Rojo = muy contaminado.
 * Pensado para verse bien sobre un mapa de tema oscuro.
 */
// Tonos apagados y sofisticados (no neón). Significado preservado;
// siempre acompañados de etiqueta de texto (el color no es la única señal).
export function bortleColor(bortle: number): string {
  if (bortle <= 2) return "#7fb08a"; // verde sage — excelente
  if (bortle === 3) return "#a9b97e"; // lima oliva — muy bueno
  if (bortle === 4) return "#d6a862"; // ámbar — bueno
  if (bortle === 5) return "#c8804b"; // naranja terroso — aceptable
  return "#b65c4d"; // rojo ladrillo — contaminado (6+)
}

/**
 * Color por score de observación (0-100). Misma familia de tonos apagados
 * que la escala Bortle. Verde = excelente, rojo = malo.
 */
export function scoreColor(score: number): string {
  if (score >= 80) return "#7fb08a";
  if (score >= 60) return "#a9b97e";
  if (score >= 40) return "#d6a862";
  if (score >= 20) return "#c8804b";
  return "#b65c4d";
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
