"use client";

/**
 * SkyPointer — indicador de dirección + altitud para un objeto celeste.
 * Recibe azimuth (0-360°, norte=0) y altitude (0-90°).
 * Opcionalmente recibe deviceHeading (azimuth del norte magnético en el
 * dispositivo) para girar el indicador de dirección en tiempo real.
 */

interface SkyPointerProps {
  nombre: string;
  azimuth: number;
  altitude: number;
  deviceHeading: number | null; // null = sin giroscopio activo
  color?: string;
}

const CARDINALS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                   "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];

function azToCardinal(az: number): string {
  return CARDINALS[Math.round(((az % 360) + 360) % 360 / 22.5) % 16];
}

export default function SkyPointer({
  nombre,
  azimuth,
  altitude,
  deviceHeading,
  color = "#d6a862",
}: SkyPointerProps) {
  // Ángulo de la flecha relativo a la pantalla.
  // Si deviceHeading está activo, rotamos para compensar la orientación real.
  const arrowAngle = deviceHeading !== null
    ? (azimuth - deviceHeading + 360) % 360
    : azimuth;

  // Altitud normalizada (0–90° → 0–100%)
  const altPct = Math.min(100, Math.max(0, (altitude / 90) * 100));

  return (
    <div className="flex items-start gap-4 py-4 border-b border-white/5 last:border-0">

      {/* Indicador de dirección — arco circular con flecha */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface">
        {/* Rosa de vientos: N/S/E/O */}
        <span className="absolute top-1 text-[9px] font-medium text-fg-faint">N</span>
        <span className="absolute bottom-1 text-[9px] font-medium text-fg-faint">S</span>
        <span className="absolute right-1.5 text-[9px] font-medium text-fg-faint">E</span>
        <span className="absolute left-1.5 text-[9px] font-medium text-fg-faint">O</span>

        {/* Flecha apuntando al objeto */}
        <div
          className="absolute h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `rotate(${arrowAngle}deg)` }}
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2 L13 13 L10 11 L7 13 Z"
              fill={color}
              fillOpacity="0.95"
            />
            <circle cx="10" cy="10" r="1.5" fill={color} fillOpacity="0.5" />
          </svg>
        </div>
      </div>

      {/* Indicador de altitud — barra vertical */}
      <div className="flex h-14 w-3 shrink-0 flex-col justify-end overflow-hidden rounded-full border border-white/10 bg-surface">
        <div
          className="w-full rounded-full transition-all duration-500"
          style={{
            height: `${altPct}%`,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      </div>

      {/* Texto */}
      <div className="flex-1 pt-0.5">
        <p className="font-semibold tracking-tight text-fg">{nombre}</p>
        <p className="tnum mt-0.5 text-sm text-fg-muted">
          <span className="text-fg">{Math.round(altitude)}°</span> sobre el
          horizonte
        </p>
        <p className="tnum text-sm text-fg-muted">
          mirá al <span className="text-fg">{azToCardinal(azimuth)}</span>
          {" "}
          <span className="text-fg-faint">
            ({Math.round(azimuth)}°)
          </span>
        </p>
        {deviceHeading !== null && (
          <p className="mt-0.5 text-xs text-accent">
            Brújula activa — la flecha apunta al objeto
          </p>
        )}
      </div>
    </div>
  );
}
