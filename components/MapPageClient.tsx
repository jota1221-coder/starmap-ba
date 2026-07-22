"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import MapView from "@/components/MapView";
import PointsDropdown from "@/components/PointsDropdown";
import Wordmark from "@/components/Wordmark";
import type { MapPoint } from "@/lib/points";
import type { PendingSelection } from "@/components/LeafletMap";

/**
 * Header + mapa de /mapa, unidos en un solo Client Component: el dropdown
 * del header y el mapa son hermanos en el árbol, así que necesitan un
 * ancestro común con estado para que elegir un punto en la lista abra el
 * mismo panel que clickear su marker (en vez de navegar a /punto/[slug]).
 * `authStatus` llega ya resuelto desde el Server Component padre — es un
 * Server Component (lee la sesión), así que no puede importarse acá adentro.
 */
export default function MapPageClient({
  points,
  authStatus,
}: {
  points: MapPoint[];
  authStatus: ReactNode;
}) {
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);

  return (
    <>
      {/* Grid de 3 columnas (no flex+justify-between): así "puntos" queda
          centrado de verdad en la barra, sin importar cuánto midan Wordmark
          o AuthStatus a los costados. De paso, el panel cae en el medio del
          mapa, lejos tanto de la leyenda (izquierda) como de Satélite/Oscuro
          (derecha) — no hace falta pelear con overlaps. */}
      <header className="grid grid-cols-3 items-center border-b border-white/5 bg-ink px-4 py-3">
        <Wordmark className="text-sm" />
        <div className="flex justify-center">
          <PointsDropdown
            points={points}
            onSelectPoint={(point) => setPendingSelection({ point })}
          />
        </div>
        <div className="flex items-center justify-end">{authStatus}</div>
      </header>

      <h1 className="sr-only">
        Mapa de cielos oscuros de la Provincia de Buenos Aires
      </h1>

      <main className="relative min-h-0 flex-1">
        <MapView points={points} pendingSelection={pendingSelection} />
      </main>
    </>
  );
}
