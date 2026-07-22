"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/points";
import type { PendingSelection } from "@/components/LeafletMap";

// Leaflet depende de `window`, así que el mapa se carga solo en el cliente.
// `ssr: false` debe vivir dentro de un Client Component (regla de Next.js 16).
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-ink text-fg-muted">
      <span className="animate-pulse text-sm">Cargando mapa…</span>
    </div>
  ),
});

export default function MapView({
  points,
  pendingSelection,
}: {
  points: MapPoint[];
  pendingSelection?: PendingSelection | null;
}) {
  return <LeafletMap points={points} pendingSelection={pendingSelection} />;
}
