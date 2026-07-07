/**
 * Acentos de color usados fuera de los tokens de Tailwind (globals.css):
 * categoría de punto y un par de acentos puntuales. Antes vivían como hex
 * sueltos repetidos en components/LeafletMap.tsx y app/punto/[slug]/page.tsx.
 */
export const CATEGORIA_COLOR: Record<string, string> = {
  observatorio: "#7c3aed", // violeta intenso
  escapada: "#4f74e3", // azul con contraste ≥3:1 sobre el fondo del mapa
};

export const CATEGORIA_LABEL: Record<string, string> = {
  observatorio: "Observatorio (visitas)",
  escapada: "Escapada de cielo oscuro",
};

export const ACCENT_CYAN = "#22d3ee"; // marcador de "tu ubicación" en el mapa
export const ACCENT_ERROR = "#ff9b9b"; // texto de error inline

/**
 * Color por astro (clave = Body de astronomy-engine, ej. "Moon", "Mars").
 * Vive acá, no en lib/observation-plan.ts: ese módulo calcula posiciones
 * astronómicas (dominio), no debería decidir de qué color se pinta nada
 * (presentación) — antes mezclaba las dos cosas.
 */
export const BODY_COLOR: Record<string, string> = {
  Moon: "#94a3b8", // plata
  Mercury: "#d6a862",
  Venus: "#d6a862",
  Mars: "#c8804b",
  Jupiter: "#d6a862",
  Saturn: "#d6a862",
};
