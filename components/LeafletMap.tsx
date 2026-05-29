"use client";

import { useRef, useState } from "react";
import type { Map as LMap } from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/points";
import { bortleColor, bortleLabel, BORTLE_LEGEND } from "@/lib/bortle";

const BA_CENTER: [number, number] = [-36.2, -59.5];
const INITIAL_ZOOM = 6;
const POINT_ZOOM = 11;

const ACCESS_LABEL: Record<string, string> = {
  auto: "Auto",
  auto_caminata_corta: "Auto + caminata",
  cuatro_x_cuatro: "4x4",
};

const TIPO_LABEL: Record<string, string> = {
  sierra: "Sierra",
  costa: "Costa",
  reserva: "Reserva",
  pampa: "Pampa",
  laguna: "Laguna",
};

type BaseLayer = "satelite" | "oscuro";

export default function LeafletMap({ points }: { points: MapPoint[] }) {
  const mapRef = useRef<LMap | null>(null);
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [base, setBase] = useState<BaseLayer>("satelite");

  function selectPoint(p: MapPoint) {
    setSelected(p);
    mapRef.current?.flyTo([p.lat, p.lng], POINT_ZOOM, { duration: 1.2 });
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={BA_CENTER}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full bg-slate-950"
      >
        {base === "satelite" ? (
          <>
            <TileLayer
              attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {/* Etiquetas de lugares sobre la imagen satelital */}
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
          </>
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {points.map((p) => {
          const isSelected = selected?.id === p.id;
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={isSelected ? 12 : 9}
              pathOptions={{
                color: isSelected ? "#ffffff" : "#0f172a",
                weight: isSelected ? 2.5 : 1.5,
                fillColor: bortleColor(p.bortle),
                fillOpacity: 0.95,
              }}
              eventHandlers={{ click: () => selectPoint(p) }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {p.nombre}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Toggle de capa */}
      <div className="absolute right-3 top-3 z-[1000] flex overflow-hidden rounded-lg border border-slate-700 text-xs font-medium shadow-lg">
        <button
          onClick={() => setBase("satelite")}
          className={`px-3 py-1.5 ${base === "satelite" ? "bg-slate-100 text-slate-950" : "bg-slate-900/90 text-slate-300"}`}
        >
          Satélite
        </button>
        <button
          onClick={() => setBase("oscuro")}
          className={`px-3 py-1.5 ${base === "oscuro" ? "bg-slate-100 text-slate-950" : "bg-slate-900/90 text-slate-300"}`}
        >
          Oscuro
        </button>
      </div>

      {/* Leyenda */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-lg border border-slate-700 bg-slate-900/85 p-3 text-xs text-slate-200 shadow-lg backdrop-blur">
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

      {/* Panel de detalle */}
      {selected && (
        <aside className="absolute inset-x-0 bottom-0 z-[1100] max-h-[60%] overflow-y-auto border-t border-slate-700 bg-slate-900/95 p-5 shadow-2xl backdrop-blur sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-96 sm:border-l sm:border-t-0">
          <button
            onClick={() => setSelected(null)}
            className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>

          <h2 className="pr-8 text-lg font-semibold text-slate-100">
            {selected.nombre}
          </h2>
          <p className="text-sm text-slate-400">{selected.partido}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-medium text-slate-950"
              style={{ backgroundColor: bortleColor(selected.bortle) }}
            >
              Bortle {selected.bortle} · {bortleLabel(selected.bortle)}
            </span>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-300">
              {TIPO_LABEL[selected.tipo] ?? selected.tipo}
            </span>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-300">
              {selected.distanciaCabaKm} km
            </span>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-300">
              {ACCESS_LABEL[selected.accesoTipo] ?? selected.accesoTipo}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            {selected.descripcion}
          </p>

          {/* Placeholder de fotos/reseñas — próxima iteración */}
          <div className="mt-4 rounded-lg border border-dashed border-slate-700 p-3 text-center text-xs text-slate-500">
            📷 Fotos y reseñas de la comunidad — próximamente
          </div>

          <a
            href={`/punto/${selected.slug}`}
            className="mt-4 block rounded-full bg-slate-100 px-4 py-2.5 text-center text-sm font-medium text-slate-950 hover:bg-white"
          >
            Ver guía de observación →
          </a>
        </aside>
      )}
    </div>
  );
}
