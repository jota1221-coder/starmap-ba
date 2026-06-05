"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción esto iría a Sentry; por ahora a la consola.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-base font-semibold tracking-tight">
        StarMap <span className="text-accent">BA</span>
      </p>
      <h1 className="mt-8 text-xl font-semibold tracking-tight">
        Se nubló algo de nuestro lado
      </h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        Hubo un error inesperado. Probá de nuevo en un momento; si sigue,
        avisanos.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft"
        >
          Reintentar
        </button>
        <a
          href="/mapa"
          className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-medium text-fg transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:text-accent"
        >
          Ir al mapa
        </a>
      </div>
    </div>
  );
}
