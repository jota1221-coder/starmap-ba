import { getMapPoints } from "@/lib/points";
import MapView from "@/components/MapView";
import Wordmark from "@/components/Wordmark";

export const metadata = {
  title: "Mapa de cielos — StarMap BA",
  description:
    "Mapa de los mejores puntos para ver las estrellas en la Provincia de Buenos Aires, rankeados por calidad de cielo.",
};

// Los puntos cambian poco; revalidar cada hora es más que suficiente.
export const revalidate = 3600;

export default async function MapaPage() {
  const points = await getMapPoints();

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-white/5 bg-ink px-4 py-3">
        <Wordmark className="text-sm" />
        <p className="text-xs text-fg-faint">
          <span className="tnum text-fg-muted">{points.length}</span> puntos
          relevados
        </p>
      </header>

      <main className="relative min-h-0 flex-1">
        <MapView points={points} />
      </main>
    </div>
  );
}
