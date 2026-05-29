"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/points";
import { bortleColor, bortleLabel, BORTLE_LEGEND } from "@/lib/bortle";

// Centro aproximado de la Provincia de Buenos Aires
const BA_CENTER: [number, number] = [-36.2, -59.5];
const INITIAL_ZOOM = 6;

const ACCESS_LABEL: Record<string, string> = {
  auto: "Auto",
  auto_caminata_corta: "Auto + caminata",
  cuatro_x_cuatro: "4x4",
};

export default function LeafletMap({ points }: { points: MapPoint[] }) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={BA_CENTER}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom
        className="h-full w-full bg-slate-950"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {points.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={9}
            pathOptions={{
              color: "#0f172a",
              weight: 1.5,
              fillColor: bortleColor(p.bortle),
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {p.nombre}
            </Tooltip>
            <Popup>
              <div className="min-w-[200px] space-y-1">
                <p className="text-sm font-semibold text-slate-900">{p.nombre}</p>
                <p className="text-xs text-slate-600">{p.partido}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: bortleColor(p.bortle) }}
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Bortle {p.bortle} · {bortleLabel(p.bortle)}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  SQM {p.sqm} · {p.distanciaCabaKm} km de CABA ·{" "}
                  {ACCESS_LABEL[p.accesoTipo] ?? p.accesoTipo}
                </p>
                <a
                  href={`/punto/${p.slug}`}
                  className="mt-1 inline-block text-xs font-medium text-sky-600 underline-offset-2 hover:underline"
                >
                  Ver guía de observación →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Leyenda */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-lg border border-slate-700 bg-slate-900/85 p-3 text-xs text-slate-200 backdrop-blur">
        <p className="mb-2 font-semibold">Calidad de cielo</p>
        <ul className="space-y-1">
          {BORTLE_LEGEND.map((item) => (
            <li key={item.bortle} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: bortleColor(item.bortle) }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
