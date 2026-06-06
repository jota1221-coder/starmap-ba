import { BA_PROVINCE_RING } from "@/lib/ba-province";
import { bortleColor } from "@/lib/bortle";
import seed from "@/data/seed-points.json";

type Seed = {
  puntos: { lat: number; lng: number; bortle: number; nombre: string }[];
};
const PTS = (seed as Seed).puntos;

// CABA como referencia de "ciudad iluminada" (el contraste con los puntos oscuros).
const CABA = { lat: -34.6037, lng: -58.3816 };

// ── Proyección equirectangular con corrección de longitud ───────────────
// La provincia es real (GeoJSON oficial). Proyectamos lng/lat → coords SVG
// una sola vez al importar el módulo (estático, sin costo en runtime).
const PAD = 18;
const TARGET_W = 480;

let minLng = Infinity,
  maxLng = -Infinity,
  minLat = Infinity,
  maxLat = -Infinity;
for (const [lng, lat] of BA_PROVINCE_RING) {
  if (lng < minLng) minLng = lng;
  if (lng > maxLng) maxLng = lng;
  if (lat < minLat) minLat = lat;
  if (lat > maxLat) maxLat = lat;
}
const midLat = (minLat + maxLat) / 2;
const kx = Math.cos((midLat * Math.PI) / 180); // compresión de longitud según latitud
const geoW = (maxLng - minLng) * kx;
const geoH = maxLat - minLat;
const innerW = TARGET_W - PAD * 2;
const innerH = (innerW * geoH) / geoW;
const W = TARGET_W;
const H = Math.round(innerH + PAD * 2);

function project(lng: number, lat: number): [number, number] {
  const x = PAD + (((lng - minLng) * kx) / geoW) * innerW;
  const y = PAD + ((maxLat - lat) / geoH) * innerH;
  return [x, y];
}

const RING_PATH =
  BA_PROVINCE_RING.map(([lng, lat], i) => {
    const [x, y] = project(lng, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

const PROJECTED = PTS.map((p) => {
  const [x, y] = project(p.lng, p.lat);
  return { x, y, bortle: p.bortle, nombre: p.nombre };
});
const [cabaX, cabaY] = project(CABA.lng, CABA.lat);

/**
 * Preview del producto: mapa real de Buenos Aires con los 13 puntos
 * brillando, coloreados por Bortle. SVG puro (sin tiles, sin JS de cliente),
 * animado con CSS. Muestra el producto de verdad en la landing.
 */
export default function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Glow detrás del marco */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem]"
        style={{
          background:
            "radial-gradient(55% 50% at 50% 30%, oklch(0.82 0.13 78 / 0.12), transparent 70%)",
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40 shadow-2xl backdrop-blur-md">
        {/* Pantalla */}
        <div className="bg-ink p-5 sm:p-6">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Mapa de la Provincia de Buenos Aires con 13 puntos de observación"
          >
            <defs>
              <radialGradient id="caba-glow">
                <stop offset="0%" stopColor="oklch(0.92 0.04 95 / 0.85)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Silueta real de la provincia */}
            <path
              d={RING_PATH}
              fill="var(--color-surface)"
              fillOpacity={0.85}
              stroke="var(--color-accent)"
              strokeOpacity={0.45}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />

            {/* CABA: referencia de ciudad iluminada */}
            <circle cx={cabaX} cy={cabaY} r={15} fill="url(#caba-glow)" />
            <circle cx={cabaX} cy={cabaY} r={2} fill="oklch(0.95 0.03 95)" />
            <text
              x={cabaX + 7}
              y={cabaY + 3}
              fontSize={9}
              fill="var(--color-fg-faint)"
            >
              CABA
            </text>

            {/* Puntos de observación, coloreados por Bortle */}
            {PROJECTED.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill={bortleColor(p.bortle)}
                  className="preview-halo"
                  style={{ animationDelay: `${(i % 6) * 0.5}s` }}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={bortleColor(p.bortle)}
                  stroke="var(--color-ink)"
                  strokeWidth={0.8}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
