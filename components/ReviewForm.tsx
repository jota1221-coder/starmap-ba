"use client";

import { useActionState, useRef, useState } from "react";
import { submitReview, type ReviewActionState } from "@/app/punto/[slug]/actions";
import { STAR_PATH } from "@/lib/icons";

interface ReviewFormProps {
  pointId: number;
  initial?: { rating: number; cuerpo: string; consejo: string | null } | null;
}

export default function ReviewForm({ pointId, initial }: ReviewFormProps) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [state, formAction, pending] = useActionState<
    ReviewActionState,
    FormData
  >(submitReview, {});

  const shown = hover || rating;

  // Roving tabindex: solo una estrella es tabbable; las flechas mueven la
  // selección y el foco entre ellas (patrón WAI-ARIA de radiogroup).
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  function onStarsKeyDown(e: React.KeyboardEvent) {
    let next = rating || 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, next + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown")
      next = Math.max(1, next - 1);
    else return;
    e.preventDefault();
    setRating(next);
    starRefs.current[next - 1]?.focus();
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="pointId" value={pointId} />
      <input type="hidden" name="rating" value={rating} />

      {/* Selector de estrellas */}
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Puntuación"
        onKeyDown={onStarsKeyDown}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            ref={(el) => {
              starRefs.current[n - 1] = el;
            }}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            aria-checked={rating === n}
            role="radio"
            tabIndex={n === (rating || 1) ? 0 : -1}
            className="p-0.5 transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              width={28}
              height={28}
              className={n <= shown ? "text-accent" : "text-white/15"}
            >
              <path d={STAR_PATH} fill="currentColor" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        name="cuerpo"
        required
        minLength={3}
        maxLength={1000}
        rows={3}
        defaultValue={initial?.cuerpo ?? ""}
        placeholder="¿Cómo estuvo el cielo? ¿Qué pudiste ver?"
        aria-label="Tu reseña"
        className="w-full resize-y rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-faint transition-colors duration-200 focus:border-accent focus:outline-none"
      />

      <input
        name="consejo"
        maxLength={300}
        defaultValue={initial?.consejo ?? ""}
        placeholder="Un consejo para el próximo (opcional)"
        aria-label="Consejo para el próximo visitante (opcional)"
        className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint transition-colors duration-200 focus:border-accent focus:outline-none"
      />

      {state.error && <p className="text-sm text-night">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-accent">¡Gracias! Tu reseña se guardó.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft disabled:opacity-50"
        >
          {pending
            ? "Guardando…"
            : initial
              ? "Actualizar reseña"
              : "Publicar reseña"}
        </button>
        {rating === 0 && (
          <span className="text-xs text-fg-faint">
            Elegí una puntuación para publicar.
          </span>
        )}
      </div>
    </form>
  );
}
