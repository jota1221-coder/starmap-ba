"use client";

import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * Fondo del hero: foto real del cielo (ESO) con:
 *  - Parallax al scrollear (la foto se mueve más lento que el contenido → profundidad)
 *  - Glow radial cálido detrás del título (luz, no degradé plano)
 *  - Viñeta que cierra los bordes y enfoca el centro
 * Respeta prefers-reduced-motion (sin parallax).
 */
export default function HeroBackdrop() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const yRaw = useTransform(scrollY, [0, 500], [0, 90]);
  const y = reduce ? 0 : yRaw;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Capa de foto (sobredimensionada para que el parallax no revele bordes).
          next/image + priority: la manda a precargar de entrada (candidata a LCP). */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="kenburns absolute inset-x-0 -top-[16%] h-[132%]">
          <Image
            src="/sky-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </motion.div>

      {/* Degradé vertical para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/55 to-ink/95" />

      {/* Glow cálido detrás del título — el acento como fuente de luz */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 42% at 50% 34%, oklch(0.82 0.13 78 / 0.13), transparent 70%)",
        }}
      />

      {/* Viñeta: oscurece los bordes, enfoca el centro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 95% at 50% 38%, transparent 52%, var(--color-ink) 100%)",
        }}
      />
    </div>
  );
}
