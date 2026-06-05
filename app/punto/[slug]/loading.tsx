import Wordmark from "@/components/Wordmark";

/** Skeleton de la guía mientras se calculan clima + cielo (página dinámica). */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-dvh bg-ink text-fg">
      <header className="border-b border-white/5 px-4 py-3.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="text-sm text-fg-muted">← Volver al mapa</span>
          <Wordmark className="text-sm" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-10 px-5 py-8">
        {/* Título + badges */}
        <section>
          <Bar className="h-8 w-3/4" />
          <Bar className="mt-3 h-4 w-1/3" />
          <div className="mt-4 flex gap-1.5">
            <Bar className="h-7 w-28 rounded-full" />
            <Bar className="h-7 w-20 rounded-full" />
            <Bar className="h-7 w-24 rounded-full" />
          </div>
        </section>

        {/* Score */}
        <section className="flex items-center gap-5">
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <Bar className="h-3 w-32" />
            <Bar className="h-7 w-40" />
            <Bar className="h-3 w-full" />
          </div>
        </section>

        {/* Cielo + clima */}
        <section className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3">
              <Bar className="h-3 w-24" />
              <Bar className="h-4 w-full" />
              <Bar className="h-4 w-5/6" />
              <Bar className="h-4 w-2/3" />
            </div>
          ))}
        </section>

        <p className="text-center text-sm text-fg-faint">
          Calculando el cielo de esta noche…
        </p>
      </main>
    </div>
  );
}
