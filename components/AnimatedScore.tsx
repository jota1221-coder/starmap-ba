"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Breakdown {
  factor: string;
  label: string;
  value: number;
}

interface Props {
  score: number;
  rating: string;
  color: string;
  breakdown: Breakdown[];
  explanation: string | null;
}

const SIZE = 96; // h-24 w-24
const STROKE = 3;
const RADIUS = SIZE / 2 - STROKE;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AnimatedScore({
  score,
  rating,
  color,
  breakdown,
  explanation,
}: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  /* Cuenta el número del 0 al score cuando entra en pantalla */
  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(0, score, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [isInView, score]);

  const dashOffset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div ref={ref}>
      {/* Círculo + texto */}
      <div className="flex items-center gap-5">
        {/* SVG ring animada */}
        <div
          className="relative shrink-0"
          style={{ width: SIZE, height: SIZE }}
        >
          <svg
            width={SIZE}
            height={SIZE}
            className="absolute inset-0 -rotate-90"
          >
            {/* Track (fondo) */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="white"
              strokeWidth={STROKE}
              strokeOpacity={0.06}
            />
            {/* Progreso animado */}
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={isInView ? { strokeDashoffset: dashOffset } : undefined}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            />
          </svg>

          {/* Número en el centro (animado → oculto a lectores de pantalla;
              el valor real va en el sr-only de abajo, sin la cuenta 0→N). */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            aria-hidden="true"
          >
            <span
              className="tnum text-3xl font-semibold leading-none"
              style={{ color }}
            >
              {display}
            </span>
            <span className="mt-0.5 text-[10px] text-fg-faint">de 100</span>
          </div>
          <span className="sr-only">{score} de 100</span>
        </div>

        {/* Rating + descripción */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
            Pronóstico de esta noche
          </p>
          <motion.p
            className="mt-1 text-2xl font-semibold tracking-tight"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {rating}
          </motion.p>
          <p className="mt-1 text-xs text-fg-faint">
            Mide las condiciones de{" "}
            <span className="text-fg-muted">esta noche</span> (nubes y Luna),
            no la calidad del lugar.
          </p>
        </div>
      </div>

      {/* Explicación */}
      {explanation && (
        <motion.p
          className="mt-5 text-base leading-relaxed text-fg"
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {explanation}
        </motion.p>
      )}

      {/* Barras de breakdown */}
      <ul className="mt-6 space-y-3">
        {breakdown.map((f, i) => (
          <li key={f.factor}>
            <div className="flex items-center justify-between text-xs">
              <span className="capitalize text-fg-muted">{f.factor}</span>
              <span className="text-fg-faint">{f.label}</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={
                  isInView ? { width: `${Math.round(f.value * 100)}%` } : undefined
                }
                transition={{
                  duration: 0.9,
                  delay: 0.5 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
