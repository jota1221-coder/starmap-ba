import Link from "next/link";
import { getMapPoints } from "@/lib/points";
import MapView from "@/components/MapView";

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
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          StarMap{" "}
          <span className="bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
            BA
          </span>
        </Link>
        <p className="text-xs text-slate-400">
          {points.length} puntos en la Provincia de Buenos Aires
        </p>
      </header>

      <main className="relative min-h-0 flex-1">
        <MapView points={points} />
      </main>
    </div>
  );
}
