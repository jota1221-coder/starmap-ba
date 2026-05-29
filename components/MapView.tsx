"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/points";

// Leaflet depende de `window`, así que el mapa se carga solo en el cliente.
// `ssr: false` debe vivir dentro de un Client Component (regla de Next.js 16).
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-slate-400">
      <span className="animate-pulse text-sm">Cargando mapa…</span>
    </div>
  ),
});

export default function MapView({ points }: { points: MapPoint[] }) {
  return <LeafletMap points={points} />;
}
