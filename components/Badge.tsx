/**
 * Chip/pill reutilizable. El patrón `rounded-full border ... px-2.5 py-1`
 * estaba copiado 5+ veces entre el mapa y la ficha del punto.
 */
export default function Badge({
  children,
  color,
  filled = false,
}: {
  children: React.ReactNode;
  /** Color del borde (default) o del fondo (si filled). Sin color: gris neutro. */
  color?: string;
  filled?: boolean;
}) {
  if (filled) {
    return (
      <span
        className="rounded-full px-2.5 py-1 text-xs font-medium text-ink"
        style={{ backgroundColor: color }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-xs text-fg-muted"
      style={{ borderColor: color ?? "rgba(255,255,255,0.1)" }}
    >
      {children}
    </span>
  );
}
