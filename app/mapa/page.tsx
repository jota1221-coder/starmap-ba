import { getMapPoints } from "@/lib/points";
import MapPageClient from "@/components/MapPageClient";
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
      {/* AuthStatus es Server Component (lee la sesión) — se resuelve acá y
          se pasa ya armado a MapPageClient, que sí necesita ser cliente
          para compartir estado entre el dropdown del header y el mapa. */}
      <MapPageClient points={points} authStatus={<AuthStatus />} />
    </div>
  );
}
