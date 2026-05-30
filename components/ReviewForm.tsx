"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewActionState } from "@/app/punto/[slug]/actions";

const STAR_PATH =
  "M12 2.2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.27l-5.9 3.1 1.13-6.58L2.45 9.14l6.6-.96z";

interface ReviewFormProps {
  pointId: number;
  slug: string;
  initial?: { rating: number; cuerpo: string; consejo: string | null } | null;
}

export default function ReviewForm({ pointId, slug, initial }: ReviewFormProps) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [state, formAction, pending] = useActionState<
    ReviewActionState,
    FormData
  >(submitReview, {});

  const shown = hover || rating;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="pointId" value={pointId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      {/* Selector de estrellas */}
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Puntuación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            aria-checked={rating === n}
            role="radio"
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
        className="w-full resize-y rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-faint transition-colors duration-200 focus:border-accent focus:outline-none"
      />

      <input
        name="consejo"
        maxLength={300}
        defaultValue={initial?.consejo ?? ""}
        placeholder="Un consejo para el próximo (opcional)"
        className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint transition-colors duration-200 focus:border-accent focus:outline-none"
      />

      {state.error && <p className="text-sm text-night">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-accent">¡Gracias! Tu reseña se guardó.</p>
      )}

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
    </form>
  );
}
