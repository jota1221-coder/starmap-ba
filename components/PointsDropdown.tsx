"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { MapPoint } from "@/lib/points";
import { bortleColor } from "@/lib/bortle";

type SortBy = "bortle" | "cercania";

/**
 * Botón "N puntos" en el header: el panel se abre al pasar el mouse (hover)
 * o al tocar/clickear (mobile y teclado). El panel queda SIEMPRE en el DOM
 * — solo se le cambia `hidden`/`block` vía CSS, nunca se desmonta — así los
 * <Link> reales a /punto/[slug] siguen indexables por Google y navegables
 * sin depender de que el mapa (Leaflet, ssr:false) haya cargado.
 *
 * `onSelectPoint` es opcional a propósito: si viene (mapa ya montado),
 * el click abre el mismo panel que un marker del mapa en vez de navegar.
 * Sin JS (o sin ese callback todavía), el <Link> navega normal a la ficha
 * del punto — degrada bien, nunca deja un click sin efecto.
 */
export default function PointsDropdown({
  points,
  onSelectPoint,
}: {
  points: MapPoint[];
  onSelectPoint?: (point: MapPoint) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("bortle");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const open = hovering || pinned;

  const sorted = useMemo(() => {
    const copy = [...points];
    copy.sort((a, b) =>
      sortBy === "cercania"
        ? a.distanciaCabaKm - b.distanciaCabaKm
        : a.bortle - b.bortle || a.distanciaCabaKm - b.distanciaCabaKm,
    );
    return copy;
  }, [points, sortBy]);

  function close() {
    setHovering(false);
    setPinned(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        onClick={() => setPinned((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-xs text-fg-faint transition-colors duration-200 hover:text-fg"
      >
        <span className="tnum text-fg-muted">{points.length}</span> puntos
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={`${
          open ? "block opacity-100" : "hidden opacity-0"
        } absolute left-1/2 top-full z-[1200] mt-2 w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-surface/95 shadow-xl backdrop-blur-md transition-opacity duration-200`}
      >
        <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2.5 text-xs">
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
          className="max-h-80 overflow-y-auto p-2"
        >
          <ul className="space-y-1">
            {sorted.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/punto/${p.slug}`}
                  onClick={
                    onSelectPoint
                      ? (e) => {
                          e.preventDefault();
                          onSelectPoint(p);
                          close();
                        }
                      : undefined
                  }
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
    </div>
  );
}
