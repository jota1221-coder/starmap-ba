import { getMapPoints } from "@/lib/points";
import MapView from "@/components/MapView";
import PointsDropdown from "@/components/PointsDropdown";
import Wordmark from "@/components/Wordmark";
import AuthStatus from "@/components/AuthStatus";
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
      {/* Grid de 3 columnas (no flex+justify-between): así "puntos" queda
          centrado de verdad en la barra, sin importar cuánto midan Wordmark
          o AuthStatus a los costados. De paso, el panel cae en el medio del
          mapa, lejos tanto de la leyenda (izquierda) como de Satélite/Oscuro
          (derecha) — no hace falta pelear con overlaps. */}
      <header className="grid grid-cols-3 items-center border-b border-white/5 bg-ink px-4 py-3">
        <Wordmark className="text-sm" />
        <div className="flex justify-center">
          <PointsDropdown points={points} />
        </div>
        <div className="flex items-center justify-end">
          <AuthStatus />
        </div>
      </header>

      <h1 className="sr-only">
        Mapa de cielos oscuros de la Provincia de Buenos Aires
      </h1>

      <main className="relative min-h-0 flex-1">
        <MapView points={points} />
      </main>
    </div>
  );
}
