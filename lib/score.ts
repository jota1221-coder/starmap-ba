/**
 * Score de observación de StarMap BA (0-100).
 *
 * Modelo multiplicativo de 3 factores (cada uno 0-1):
 *   score = 100 · factorNubes · factorBortle · factorLuna
 *
 * Es multiplicativo a propósito: si está totalmente nublado, no importa
 * lo oscuro del cielo — el score se va a cero. Igual que en la realidad.
 *
 * Decisiones (basadas en feedback de revisión):
 *  - Las nubes BAJAS tapan todo; las MEDIAS bastante; las ALTAS (cirros) poco.
 *  - Bortle es el factor de fondo más pesado: define el techo del cielo.
 *  - La Luna solo molesta si está SOBRE el horizonte; el daño escala con
 *    iluminación y altitud (luna llena en el cenit = lo peor).
 */

export interface ScoreInput {
  cloudCoverLow: number; // %
  cloudCoverMid: number; // %
  cloudCoverHigh: number; // %
  bortle: number; // 1-9
  moonIllumination: number; // 0-1
  moonAltitude: number; // grados (negativo = bajo el horizonte)
}

export interface ScoreFactor {
  factor: "nubes" | "bortle" | "luna";
  value: number; // 0-1 (1 = ideal)
  label: string; // explicación corta para el usuario
}

export interface ScoreResult {
  score: number; // 0-100 (entero)
  rating: string; // etiqueta cualitativa
  breakdown: ScoreFactor[];
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** Calidad de cielo por Bortle (techo del score). */
function bortleFactor(bortle: number): number {
  const table: Record<number, number> = {
    1: 1.0,
    2: 0.95,
    3: 0.85,
    4: 0.7,
    5: 0.5,
    6: 0.33,
    7: 0.2,
    8: 0.1,
    9: 0.05,
  };
  return table[clamp(Math.round(bortle), 1, 9)] ?? 0.5;
}

/** Fracción de cielo NO bloqueada por nubes (1 = despejado). */
function cloudFactor(low: number, mid: number, high: number): number {
  // Pesos: baja=1.0, media=0.7, alta=0.3 (cirros dejan ver planetas/Luna).
  const blocked = clamp(
    (low * 1.0 + mid * 0.7 + high * 0.3) / 100,
    0,
    1,
  );
  return 1 - blocked;
}

/** Penalización por luz lunar (1 = sin impacto). */
function moonFactor(illumination: number, altitude: number): number {
  if (altitude <= 0) return 1; // Luna bajo el horizonte: no molesta.
  // El impacto crece con la altitud hasta ~45°, donde ya es pleno.
  const altImpact = clamp(altitude / 45, 0, 1);
  const impact = clamp(illumination, 0, 1) * altImpact;
  // Una luna llena en el cenit reduce el score hasta un 60%.
  return 1 - 0.6 * impact;
}

function ratingFor(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Muy bueno";
  if (score >= 40) return "Bueno";
  if (score >= 20) return "Regular";
  return "Malo";
}

function cloudLabel(low: number, mid: number, high: number): string {
  if (low >= 60 || low + mid >= 100) return "Nubes bajas: cielo tapado";
  if (low + mid + high < 20) return "Cielo despejado";
  if (high >= 50 && low + mid < 30) return "Cirros altos: observación posible";
  return "Nubosidad parcial";
}

function moonLabel(illumination: number, altitude: number): string {
  if (altitude <= 0) return "Luna bajo el horizonte: cielo sin interferencia";
  const pct = Math.round(illumination * 100);
  if (illumination < 0.15) return `Luna casi nueva (${pct}%): poca interferencia`;
  if (illumination > 0.85) return `Luna casi llena (${pct}%): mucha luz`;
  return `Luna iluminada al ${pct}%`;
}

export function computeScore(input: ScoreInput): ScoreResult {
  const fNubes = cloudFactor(
    input.cloudCoverLow,
    input.cloudCoverMid,
    input.cloudCoverHigh,
  );
  const fBortle = bortleFactor(input.bortle);
  const fLuna = moonFactor(input.moonIllumination, input.moonAltitude);

  const score = Math.round(100 * fNubes * fBortle * fLuna);

  return {
    score,
    rating: ratingFor(score),
    breakdown: [
      {
        factor: "nubes",
        value: fNubes,
        label: cloudLabel(
          input.cloudCoverLow,
          input.cloudCoverMid,
          input.cloudCoverHigh,
        ),
      },
      {
        factor: "bortle",
        value: fBortle,
        label: `Bortle ${input.bortle}: calidad de cielo de fondo`,
      },
      {
        factor: "luna",
        value: fLuna,
        label: moonLabel(input.moonIllumination, input.moonAltitude),
      },
    ],
  };
}
