const STAR_PATH =
  "M12 2.2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.27l-5.9 3.1 1.13-6.58L2.45 9.14l6.6-.96z";

function Star({ size, className }: { size: number; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
  );
}

/**
 * Estrellas de rating (solo lectura). Soporta relleno fraccional
 * (ej. 4.5) con la técnica de capa superpuesta recortada.
 */
export default function Stars({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(5, value)) * 20; // 0–100%
  return (
    <span
      className="relative inline-flex"
      role="img"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      <span className="flex text-white/15">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} className="" />
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-accent"
        style={{ width: `${pct}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} className="shrink-0" />
        ))}
      </span>
    </span>
  );
}
