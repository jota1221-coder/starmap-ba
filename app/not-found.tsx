import Link from "next/link";
import Wordmark from "@/components/Wordmark";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Wordmark className="text-lg" />
      <p className="mt-8 text-6xl font-semibold tracking-tight text-fg-faint">
        404
      </p>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">
        Esta página se perdió entre las estrellas
      </h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        No encontramos lo que buscabas. Quizás el enlace está mal o el lugar ya
        no existe.
      </p>
      <Link
        href="/mapa"
        className="mt-8 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft"
      >
        Volver al mapa
      </Link>
    </div>
  );
}
