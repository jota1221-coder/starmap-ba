"use client";

import { useRef, useState } from "react";
import type { Map as LMap, PathOptions } from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/points";
import { bortleColor, bortleLabel, BORTLE_LEGEND } from "@/lib/bortle";
import { BA_PROVINCE_RING } from "@/lib/ba-province";

// ── Máscara de Buenos Aires Province ─────────────────────────────────────
// Polígono real de la provincia (lib/ba-province.ts — 277 puntos, IGN).
const BA_COORDS = BA_PROVINCE_RING;

// Máscara invertida: rectángulo mundial con BA Province como hueco.
// fillRule evenodd (default en Leaflet) hace que el hueco quede sin relleno.
const WORLD_MASK = {
  type: "Feature" as const,
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
      BA_COORDS,
    ],
  },
  properties: {},
};

// Solo el polígono de la provincia — para dibujar el contorno.
const BA_BORDER = {
  type: "Feature" as const,
  geometry: {
    type: "Polygon" as const,
    coordinates: [BA_COORDS],
  },
  properties: {},
};

const maskStyle: PathOptions = {
  fillColor: "#0a0e1a",
  fillOpacity: 0.72,
  stroke: false,
  weight: 0,
};

const borderStyle: PathOptions = {
  fill: false,
  stroke: true,
  color: "rgba(255, 255, 255, 0.18)",
  weight: 1.5,
};

const BA_CENTER: [number, number] = [-36.2, -59.5];
const INITIAL_ZOOM = 6;
const POINT_ZOOM = 12;

// Caja de paneo: la provincia + un margen de contexto (Uruguay, costa, vecinas).
// Evita que el usuario se vaya al otro lado del mundo, sin encerrarlo.
const PAN_BOUNDS: [[number, number], [number, number]] = [
  [-43.8, -66.5], // SW
  [-30.6, -53.8], // NE
];

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
        minZoom={6}
        maxBounds={PAN_BOUNDS}
        maxBoundsViscosity={0.75}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full bg-slate-950"
      >
        {/* ── Capas base ── */}
        {base === "satelite" && (
          <>
            {/* Base satelital levemente atenuada.
                maxNativeZoom=13: Esri no tiene cobertura a zoom 14+ en Argentina
                interior — upscalea las tiles de 13 en vez de mostrar "not available". */}
            <TileLayer
              attribution="Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              className="sat-nocturnal"
              maxNativeZoom={13}
            />
            {/* Rutas (Ruta 2, Ruta 3, autopistas…) — blancas sobre satélite */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
              className="sat-nocturnal-labels"
            />
            {/* Nombres de ciudades, pueblos y límites */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              className="sat-nocturnal-labels"
            />
          </>
        )}

        {base === "oscuro" && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* ── Máscara: oscurece todo fuera de BA Province ── */}
        <GeoJSON data={WORLD_MASK} style={maskStyle} />

        {/* ── Contorno sutil de la provincia ── */}
        <GeoJSON data={BA_BORDER} style={borderStyle} />

        {/* ── Puntos de observación ── */}
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

      {/* ── Toggle de capa base ── */}
      <div className="absolute right-3 top-3 z-[1000] flex overflow-hidden rounded-xl border border-white/10 bg-surface/60 text-xs font-medium backdrop-blur-md">
        <button
          onClick={() => setBase("satelite")}
          className={`px-3.5 py-2 transition-colors duration-200 ${base === "satelite" ? "bg-accent text-ink" : "text-fg-muted hover:text-fg"}`}
        >
          Satélite
        </button>
        <button
          onClick={() => setBase("oscuro")}
          className={`px-3.5 py-2 transition-colors duration-200 ${base === "oscuro" ? "bg-accent text-ink" : "text-fg-muted hover:text-fg"}`}
        >
          Oscuro
        </button>
      </div>

      {/* ── Leyenda Bortle ── */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-xl border border-white/10 bg-surface/60 p-3.5 text-xs text-fg-muted backdrop-blur-md">
        <p className="mb-2.5 font-semibold tracking-tight text-fg">Calidad de cielo</p>
        <ul className="space-y-1.5">
          {BORTLE_LEGEND.map((item) => (
            <li key={item.bortle} className="flex items-center gap-2.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: bortleColor(item.bortle) }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Panel de detalle del punto ── */}
      {selected && (
        <aside className="absolute inset-x-0 bottom-0 z-[1100] max-h-[62%] overflow-y-auto border-t border-white/10 bg-surface/70 p-6 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[24rem] sm:border-l sm:border-t-0">
          <button
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 rounded-full p-1.5 text-fg-faint transition-colors duration-200 hover:bg-white/5 hover:text-fg"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          <h2 className="pr-8 text-xl font-semibold tracking-tight text-fg">
            {selected.nombre}
          </h2>
          <p className="mt-0.5 text-sm text-fg-muted">{selected.partido}</p>

          <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-medium text-ink"
              style={{ backgroundColor: bortleColor(selected.bortle) }}
            >
              Bortle {selected.bortle} · {bortleLabel(selected.bortle)}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-fg-muted">
              {TIPO_LABEL[selected.tipo] ?? selected.tipo}
            </span>
            <span className="tnum rounded-full border border-white/10 px-2.5 py-1 text-fg-muted">
              {selected.distanciaCabaKm} km
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-fg-muted">
              {ACCESS_LABEL[selected.accesoTipo] ?? selected.accesoTipo}
            </span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-fg-muted">
            {selected.descripcion}
          </p>

          <p className="mt-5 text-xs text-fg-faint">
            Fotos y reseñas de la comunidad, próximamente.
          </p>

          <a
            href={`/punto/${selected.slug}`}
            className="mt-5 block rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-ink transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft"
          >
            Ver guía de observación →
          </a>
        </aside>
      )}
    </div>
  );
}
