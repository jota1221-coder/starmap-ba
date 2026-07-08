/**
 * Plan de observación de la noche completa.
 * Para cada astro (Luna + planetas) calcula su recorrido hora por hora a lo
 * largo de la noche astronómica y su MEJOR momento (máxima altitud).
 */
import { unstable_cache } from "next/cache";
import { Body } from "astronomy-engine";
import { getNightWindow, getObjectPosition } from "./astronomy";
import { formatBATime, nightOf } from "./observation-time";

const STEP_MIN = 20; // resolución del muestreo
const MIN_PEAK_ALT = 10; // grados — debajo de esto no vale la pena observar

interface Target {
  body: Body;
  nombre: string;
}

// El color de cada astro es una decisión de presentación, no de este cálculo
// astronómico — vive en lib/theme.ts (BODY_COLOR, indexado por Body).
const TARGETS: Target[] = [
  { body: Body.Moon, nombre: "La Luna" },
  { body: Body.Mercury, nombre: "Mercurio" },
  { body: Body.Venus, nombre: "Venus" },
  { body: Body.Mars, nombre: "Marte" },
  { body: Body.Jupiter, nombre: "Júpiter" },
  { body: Body.Saturn, nombre: "Saturno" },
];

export interface TrackPoint {
  t: number; // epoch ms (para el eje X de la curva)
  timeLabel: string; // HH:mm ART
  altitude: number; // grados (puede ser negativa)
  azimuth: number;
}

export interface BestMoment {
  timeLabel: string;
  altitude: number;
  azimuth: number;
  direccion: string;
}

export interface ObjectPlan {
  key: string;
  nombre: string;
  best: BestMoment;
  track: TrackPoint[];
}

export interface NightPlan {
  duskLabel: string;
  dawnLabel: string;
  duskMs: number;
  dawnMs: number;
  midnightMs: number; // momento representativo de la noche (para el score)
  objects: ObjectPlan[];
}

export function getObservationPlan(
  date: Date,
  lat: number,
  lon: number,
): NightPlan {
  const { dusk, dawn } = getNightWindow(date, lat, lon);
  const stepMs = STEP_MIN * 60 * 1000;

  const objects: ObjectPlan[] = [];

  for (const tgt of TARGETS) {
    const track: TrackPoint[] = [];
    let best: BestMoment | null = null;

    for (let t = dusk.getTime(); t <= dawn.getTime(); t += stepMs) {
      const d = new Date(t);
      const pos = getObjectPosition(tgt.body, d, lat, lon);
      track.push({
        t,
        timeLabel: formatBATime(d),
        altitude: pos.altitude,
        azimuth: pos.azimuth,
      });
      if (pos.altitude > 0 && (!best || pos.altitude > best.altitude)) {
        best = {
          timeLabel: formatBATime(d),
          altitude: pos.altitude,
          azimuth: pos.azimuth,
          direccion: pos.direccion,
        };
      }
    }

    if (best && best.altitude >= MIN_PEAK_ALT) {
      objects.push({
        key: tgt.body,
        nombre: tgt.nombre,
        best,
        track,
      });
    }
  }

  // Ordenar por mejor altitud (los más altos / más fáciles primero).
  objects.sort((a, b) => b.best.altitude - a.best.altitude);

  return {
    duskLabel: formatBATime(dusk),
    dawnLabel: formatBATime(dawn),
    duskMs: dusk.getTime(),
    dawnMs: dawn.getTime(),
    midnightMs: (dusk.getTime() + dawn.getTime()) / 2,
    objects,
  };
}

/**
 * Versión cacheada del plan. Es determinístico para (slug, fecha, lat, lon):
 * la astronomía no cambia para un instante dado. Cachear saca el cómputo
 * pesado (~180 cálculos) del request path en visitas repetidas.
 */
export function getCachedObservationPlan(
  slug: string,
  dateStr: string,
  lat: number,
  lon: number,
): Promise<NightPlan> {
  return unstable_cache(
    async () => getObservationPlan(nightOf(dateStr).date, lat, lon),
    // lat/lon van en la key: si un re-seed corrige las coordenadas de un punto,
    // el plan viejo no se sirve hasta 6h después (la astronomía depende de ellas).
    ["observation-plan", slug, dateStr, lat.toFixed(3), lon.toFixed(3)],
    { revalidate: 60 * 60 * 6 }, // 6 h; fecha + coords están en la key
  )();
}
