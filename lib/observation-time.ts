/**
 * Manejo de la "noche de observación".
 * Las 22:00 ART (UTC-3) son solo el ANCLA para saber a qué noche pertenece una
 * fecha; el score real se calcula en la medianoche astronómica de esa noche
 * (midpoint dusk↔dawn, ver observation-plan.ts). El usuario elige la fecha.
 */

const BA_TZ = "America/Argentina/Buenos_Aires";
const OBSERVATION_HOUR = "22:00:00";
const BA_OFFSET = "-03:00"; // Argentina no usa horario de verano

/** Fecha de hoy en Buenos Aires, como string YYYY-MM-DD. */
export function todayInBA(): string {
  // en-CA produce formato YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Suma `days` a un string YYYY-MM-DD y devuelve YYYY-MM-DD. */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Última fecha con pronóstico de clima disponible (Open-Meteo: 7 días). */
export function maxForecastDate(): string {
  return addDays(todayInBA(), 6);
}

/** Valida que `dateStr` tenga forma YYYY-MM-DD y sea una fecha real. */
export function isValidDateStr(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(`${dateStr}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

/**
 * Instante (Date) correspondiente a las 22:00 ART de la fecha dada.
 * Si no se pasa fecha (o es inválida), usa hoy en Buenos Aires.
 */
export function nightOf(dateStr?: string): { date: Date; dateStr: string } {
  const day = dateStr && isValidDateStr(dateStr) ? dateStr : todayInBA();
  return {
    date: new Date(`${day}T${OBSERVATION_HOUR}${BA_OFFSET}`),
    dateStr: day,
  };
}

/** Formatea una hora (Date) en HH:mm hora de Argentina. */
export function formatBATime(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: BA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Formatea una fecha YYYY-MM-DD de forma legible en español. */
export function formatBADate(dateStr: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: BA_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateStr}T12:00:00${BA_OFFSET}`));
}
