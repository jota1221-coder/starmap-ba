import Link from "next/link";
import { getMapPoints } from "@/lib/points";
import MapView from "@/components/MapView";
import Wordmark from "@/components/Wordmark";
import AuthStatus from "@/components/AuthStatus";
import { bortleColor } from "@/lib/bortle";
import { ogFor } from "@/lib/site";

const TITLE = "Mapa de cielos";
const DESCRIPTION =
  "Mapa de los mejores puntos para ver las estrellas en la Provincia de Buenos Aires, rankeados por calidad de cielo.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...ogFor(TITLE, DESCRIPTION, "/mapa"),
};

// Los puntos cambian poco; revalidar cada hora es más que suficiente.
export const revalidate = 3600;

export default async function MapaPage() {
  const points = await getMapPoints();

  return (
    <div className="flex h-dvh flex-col">
      {/* Next.js eleva los <link> renderizados en cualquier Server Component
          al <head> del documento: esto adelanta la descarga del overlay
          VIIRS (se pinta apenas carga el mapa, en vez de esperar al JS de
          Leaflet + al fetch de la imagen). */}
      <link rel="preload" as="image" href="/mapa/viirs-overlay.webp" type="image/webp" />
      <header className="flex items-center justify-between border-b border-white/5 bg-ink px-4 py-3">
        <Wordmark className="text-sm" />
        <div className="flex items-center gap-4">
          <p className="hidden text-xs text-fg-faint sm:block">
            <span className="tnum text-fg-muted">{points.length}</span> puntos
          </p>
          <AuthStatus />
        </div>
      </header>

      <h1 className="sr-only">
        Mapa de cielos oscuros de la Provincia de Buenos Aires
      </h1>

      {/*
        Lista de puntos server-rendered: el mapa (Leaflet, ssr:false) no
        emite HTML en el servidor, así que sin esto no había ningún link
        real a /punto/[slug] en el sitio ni forma de llegar a un punto sin
        mouse. <details> es accesible por teclado nativamente y los
        crawlers indexan su contenido esté abierto o cerrado.
      */}
      <details className="group border-b border-white/5 bg-ink">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm font-medium text-fg-muted transition-colors duration-200 hover:text-fg [&::-webkit-details-marker]:hidden">
          <span>Ver los {points.length} puntos en lista</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <nav
          aria-label="Puntos de observación"
          className="max-h-64 overflow-y-auto border-t border-white/5 px-4 py-3 sm:max-h-80"
        >
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {points.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/punto/${p.slug}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-fg-muted transition-colors duration-200 hover:bg-white/5 hover:text-fg"
                >
                  <span className="truncate">{p.nombre}</span>
                  <span
                    className="tnum shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-ink"
                    style={{ backgroundColor: bortleColor(p.bortle) }}
                  >
                    B{p.bortle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>

      <main className="relative min-h-0 flex-1">
        <MapView points={points} />
      </main>
    </div>
  );
}
