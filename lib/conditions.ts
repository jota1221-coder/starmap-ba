/**
 * Condiciones de observación combinadas para un punto y momento:
 * clima (Open-Meteo) + cielo (astronomy-engine) + score.
 * Reutilizable desde API routes y Server Components.
 */
import { getWeatherAt, type WeatherSnapshot } from "./weather";
import { getSkyConditions, type SkyConditions } from "./astronomy";
import { computeScore, type ScoreResult } from "./score";

export interface ConditionsInput {
  lat: number;
  lng: number;
  bortle: number;
  date?: Date;
}

export interface PointConditions {
  date: string; // ISO
  weather: WeatherSnapshot | null;
  sky: SkyConditions;
  score: ScoreResult | null; // null si no hay datos de clima
}

export async function getConditions(
  input: ConditionsInput,
): Promise<PointConditions> {
  const date = input.date ?? new Date();
  const sky = getSkyConditions(date, input.lat, input.lng);

  let weather: WeatherSnapshot | null = null;
  try {
    weather = await getWeatherAt(input.lat, input.lng, date);
  } catch {
    weather = null; // si Open-Meteo falla, devolvemos cielo sin score
  }

  const score = weather
    ? computeScore({
        cloudCoverLow: weather.cloudCoverLow,
        cloudCoverMid: weather.cloudCoverMid,
        cloudCoverHigh: weather.cloudCoverHigh,
        bortle: input.bortle,
        moonIllumination: sky.moon.illumination,
        moonAltitude: sky.moon.altitude,
      })
    : null;

  return { date: date.toISOString(), weather, sky, score };
}
