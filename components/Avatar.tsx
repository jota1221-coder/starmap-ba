/**
 * Avatar generado: círculo con las iniciales y un color único y estable por
 * nombre (paleta OKLCH del sitio). Sin subida de archivos ni almacenamiento.
 * Server-safe (sin estado): se usa en el header y en las reseñas.
 */

// Tonos de la paleta nocturna: ámbar, índigo, teal, rosa, verde, violeta.
const HUES = [78, 265, 190, 25, 145, 310];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "★";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  const hue = HUES[hashString(name) % HUES.length];
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-ink"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        backgroundColor: `oklch(0.72 0.13 ${hue})`,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
