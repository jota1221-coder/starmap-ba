import type { TrackPoint } from "@/lib/observation-plan";

/**
 * Curva de altitud de un astro a lo largo de la noche.
 * Eje X = tiempo (dusk → dawn). Eje Y = altitud 0–90°.
 * Marca el punto más alto (mejor momento). Pure SVG, sin estado.
 */
interface AltitudeCurveProps {
  track: TrackPoint[];
  duskMs: number;
  dawnMs: number;
  color: string;
  nombre: string;
}

const W = 320;
const H = 92;
const PAD_X = 6;
const TOP = 8;
const BASE = 74; // línea del horizonte (y)
const MAX_ALT = 90;

export default function AltitudeCurve({
  track,
  duskMs,
  dawnMs,
  color,
  nombre,
}: AltitudeCurveProps) {
  const span = Math.max(1, dawnMs - duskMs);
  const x = (t: number) => PAD_X + ((t - duskMs) / span) * (W - 2 * PAD_X);
  const y = (alt: number) => {
    const clamped = Math.min(MAX_ALT, Math.max(0, alt));
    return BASE - (clamped / MAX_ALT) * (BASE - TOP);
  };

  const pts = track.map((p) => `${x(p.t).toFixed(1)},${y(p.altitude).toFixed(1)}`);
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `M ${x(track[0].t).toFixed(1)},${BASE} L ${pts.join(" L ")} L ${x(
    track[track.length - 1].t,
  ).toFixed(1)},${BASE} Z`;

  // Punto más alto (mejor momento)
  let peak = track[0];
  for (const p of track) if (p.altitude > peak.altitude) peak = p;
  const peakVisible = peak.altitude > 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 w-full"
      role="img"
      aria-label={`Altitud de ${nombre} a lo largo de la noche`}
    >
      {/* horizonte */}
      <line
        x1={PAD_X}
        y1={BASE}
        x2={W - PAD_X}
        y2={BASE}
        stroke="currentColor"
        strokeWidth="1"
        className="text-white/10"
      />
      {/* área bajo la curva */}
      <path d={areaPath} fill={color} fillOpacity="0.12" />
      {/* línea */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      {/* punto del mejor momento */}
      {peakVisible && (
        <>
          <line
            x1={x(peak.t)}
            y1={y(peak.altitude)}
            x2={x(peak.t)}
            y2={BASE}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2 3"
            strokeOpacity="0.5"
          />
          <circle cx={x(peak.t)} cy={y(peak.altitude)} r="3.5" fill={color} />
        </>
      )}
    </svg>
  );
}
