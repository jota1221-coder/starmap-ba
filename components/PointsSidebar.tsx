"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MapPoint } from "@/lib/points";
import { bortleColor } from "@/lib/bortle";

type SortBy = "bortle" | "cercania";

/**
 * Lista de puntos como sidebar angosto: en desktop siempre visible al costado
 * del mapa (con su propio scroll interno); en mobile colapsa detrás de un
 * toggle para no robarle alto al mapa. Son <Link> reales (no depende de
 * Leaflet, que es ssr:false) — Google los indexa y son navegables por teclado.
 */
export default function PointsSidebar({ points }: { points: MapPoint[] }) {
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("bortle");

  const sorted = useMemo(() => {
    const copy = [...points];
    copy.sort((a, b) =>
      sortBy === "cercania"
        ? a.distanciaCabaKm - b.distanciaCabaKm
        : a.bortle - b.bortle || a.distanciaCabaKm - b.distanciaCabaKm,
    );
    return copy;
  }, [points, sortBy]);

  return (
    <aside className="flex flex-col border-b border-white/5 bg-ink sm:h-full sm:min-h-0 sm:w-60 sm:shrink-0 sm:border-b-0 sm:border-r">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-fg-muted transition-colors duration-200 hover:text-fg sm:hidden"
      >
        <span>Ver los {points.length} puntos en lista</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={`${open ? "flex" : "hidden"} min-h-0 flex-1 flex-col border-t border-white/5 sm:flex sm:min-h-0 sm:border-t-0`}
      >
        <div className="flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs">
          <span className="text-fg-faint">Ordenar por</span>
          <button
            onClick={() => setSortBy("bortle")}
            aria-pressed={sortBy === "bortle"}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors duration-200 ${
              sortBy === "bortle"
                ? "bg-accent text-ink"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            Cielo
          </button>
          <button
            onClick={() => setSortBy("cercania")}
            aria-pressed={sortBy === "cercania"}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors duration-200 ${
              sortBy === "cercania"
                ? "bg-accent text-ink"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            Cercanía
          </button>
        </div>

        <nav
          aria-label="Puntos de observación"
          className="max-h-64 min-h-0 overflow-y-auto px-2 pb-2 sm:max-h-none sm:flex-1"
        >
          <ul className="space-y-1">
            {sorted.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/punto/${p.slug}`}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-fg-muted transition-colors duration-200 hover:bg-white/5 hover:text-fg"
                >
                  <span
                    className="tnum shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-ink"
                    style={{ backgroundColor: bortleColor(p.bortle) }}
                  >
                    B{p.bortle}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{p.nombre}</span>
                  <span className="tnum shrink-0 text-[11px] text-fg-faint">
                    {p.distanciaCabaKm} km
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
