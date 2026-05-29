/**
 * Servicio astronómico de StarMap BA.
 * Cálculo local con astronomy-engine (sin APIs externas).
 * Validado contra el MCP de stargazing como ground truth.
 */
import {
  Observer,
  Body,
  Illumination,
  MoonPhase,
  Equator,
  Horizon,
  SearchRiseSet,
} from "astronomy-engine";

const DEFAULT_HEIGHT_M = 30;

// --- Tipos ---------------------------------------------------------------

export interface MoonInfo {
  illumination: number; // fracción iluminada 0-1
  phaseAngle: number; // 0-360 (0 = nueva, 180 = llena)
  phaseName: string; // nombre en español
  altitude: number; // grados sobre el horizonte (negativo = bajo el horizonte)
  azimuth: number; // grados desde el norte, sentido horario
  isUp: boolean; // true si está sobre el horizonte
}

export interface VisibleObject {
  key: string; // identificador (Body de astronomy-engine)
  nombre: string; // nombre para mostrar
  altitude: number; // grados sobre el horizonte
  azimuth: number; // grados (0 = N, 90 = E, 180 = S, 270 = O)
  direccion: string; // texto cardinal en español
  magnitude: number; // magnitud aparente (menor = más brillante)
}

export interface SkyConditions {
  moon: MoonInfo;
  sunAltitude: number;
  isNight: boolean; // crepúsculo astronómico: sol < -18°
  visiblePlanets: VisibleObject[];
}

// --- Helpers -------------------------------------------------------------

function makeObserver(lat: number, lon: number): Observer {
  return new Observer(lat, lon, DEFAULT_HEIGHT_M);
}

/** Altitud y azimut de un cuerpo para un observador y momento dados. */
function horizonOf(body: Body, date: Date, observer: Observer) {
  const eq = Equator(body, date, observer, true, true);
  const hor = Horizon(date, observer, eq.ra, eq.dec, "normal");
  return { altitude: hor.altitude, azimuth: hor.azimuth };
}

/** Nombre de la fase lunar en español a partir del ángulo de fase (0-360). */
export function moonPhaseName(phaseAngle: number): string {
  const a = ((phaseAngle % 360) + 360) % 360;
  if (a < 11.25 || a >= 348.75) return "Luna nueva";
  if (a < 78.75) return "Creciente cóncava";
  if (a < 101.25) return "Cuarto creciente";
  if (a < 168.75) return "Gibosa creciente";
  if (a < 191.25) return "Luna llena";
  if (a < 258.75) return "Gibosa menguante";
  if (a < 281.25) return "Cuarto menguante";
  return "Creciente menguante";
}

/** Texto cardinal en español (16 rumbos) a partir de un azimut. */
export function azimuthToCardinal(azimuth: number): string {
  const dirs = [
    "Norte", "NNE", "Noreste", "ENE",
    "Este", "ESE", "Sudeste", "SSE",
    "Sur", "SSO", "Sudoeste", "OSO",
    "Oeste", "ONO", "Noroeste", "NNO",
  ];
  const idx = Math.round((((azimuth % 360) + 360) % 360) / 22.5) % 16;
  return dirs[idx];
}

// Planetas mayores observables a simple vista / con telescopio amateur.
const PLANETS: { body: Body; nombre: string }[] = [
  { body: Body.Mercury, nombre: "Mercurio" },
  { body: Body.Venus, nombre: "Venus" },
  { body: Body.Mars, nombre: "Marte" },
  { body: Body.Jupiter, nombre: "Júpiter" },
  { body: Body.Saturn, nombre: "Saturno" },
];

// --- API pública ---------------------------------------------------------

export function getMoonInfo(date: Date, lat: number, lon: number): MoonInfo {
  const observer = makeObserver(lat, lon);
  const illum = Illumination(Body.Moon, date);
  const phaseAngle = MoonPhase(date);
  const { altitude, azimuth } = horizonOf(Body.Moon, date, observer);
  return {
    illumination: illum.phase_fraction,
    phaseAngle,
    phaseName: moonPhaseName(phaseAngle),
    altitude,
    azimuth,
    isUp: altitude > 0,
  };
}

/** Altitud del Sol en grados (negativo = bajo el horizonte). */
export function getSunAltitude(date: Date, lat: number, lon: number): number {
  const observer = makeObserver(lat, lon);
  return horizonOf(Body.Sun, date, observer).altitude;
}

/** Lista de planetas mayores sobre el horizonte, ordenados por altitud desc. */
export function getVisiblePlanets(
  date: Date,
  lat: number,
  lon: number,
): VisibleObject[] {
  const observer = makeObserver(lat, lon);
  const result: VisibleObject[] = [];
  for (const { body, nombre } of PLANETS) {
    const { altitude, azimuth } = horizonOf(body, date, observer);
    if (altitude > 0) {
      result.push({
        key: body,
        nombre,
        altitude,
        azimuth,
        direccion: azimuthToCardinal(azimuth),
        magnitude: Illumination(body, date).mag,
      });
    }
  }
  return result.sort((a, b) => b.altitude - a.altitude);
}

/** Posición (alt/az) de un cuerpo arbitrario; útil para la guía de observación. */
export function getObjectPosition(
  bodyKey: Body,
  date: Date,
  lat: number,
  lon: number,
): { altitude: number; azimuth: number; direccion: string } {
  const observer = makeObserver(lat, lon);
  const { altitude, azimuth } = horizonOf(bodyKey, date, observer);
  return { altitude, azimuth, direccion: azimuthToCardinal(azimuth) };
}

/** Hora de salida y puesta de un cuerpo dentro de las próximas `limitDays`. */
export function getRiseSet(
  bodyKey: Body,
  date: Date,
  lat: number,
  lon: number,
  limitDays = 1,
): { rise: Date | null; set: Date | null } {
  const observer = makeObserver(lat, lon);
  const rise = SearchRiseSet(bodyKey, observer, +1, date, limitDays);
  const set = SearchRiseSet(bodyKey, observer, -1, date, limitDays);
  return { rise: rise?.date ?? null, set: set?.date ?? null };
}

/** Condiciones de cielo agregadas para un punto y momento. */
export function getSkyConditions(
  date: Date,
  lat: number,
  lon: number,
): SkyConditions {
  const sunAltitude = getSunAltitude(date, lat, lon);
  return {
    moon: getMoonInfo(date, lat, lon),
    sunAltitude,
    isNight: sunAltitude < -18, // crepúsculo astronómico
    visiblePlanets: getVisiblePlanets(date, lat, lon),
  };
}
