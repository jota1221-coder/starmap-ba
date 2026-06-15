"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Slider "antes / después": dos imágenes del mismo tamaño superpuestas, con una
 * barra que se arrastra para revelar la de la izquierda (antes) sobre la de la
 * derecha (después). El control es un <input range> transparente → accesible por
 * teclado (flechas) y por click/drag en cualquier punto.
 */
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel,
  afterLabel,
  width,
  height,
  alt,
  caption,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}) {
  const [pos, setPos] = useState(50);

  return (
    <figure className="mx-auto max-w-md">
      <div
        className="relative w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-surface"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {/* Después (base) */}
        <Image
          src={afterSrc}
          alt={alt}
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover"
        />
        {/* Antes (recortado al lado izquierdo de la barra) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt=""
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
          />
        </div>

        {/* Etiquetas de año */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-ink/70 px-2.5 py-1 text-xs font-medium text-fg backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/15 bg-ink/70 px-2.5 py-1 text-xs font-medium text-fg backdrop-blur-sm">
          {afterLabel}
        </span>

        {/* Barra divisoria + manija */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/80"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-ink/80 text-fg shadow-lg backdrop-blur-sm">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M9 6l-4 6 4 6M15 6l4 6-4 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Control transparente (teclado + click/drag) */}
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Comparar 2012 y 2024: deslizá para revelar"
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
        />
      </div>
      <figcaption className="mt-2.5 text-xs leading-relaxed text-fg-faint">
        {caption}
      </figcaption>
    </figure>
  );
}
