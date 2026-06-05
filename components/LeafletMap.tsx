"use client";

import { useRef, useState } from "react";
import type { Map as LMap } from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/points";
import { bortleColor, bortleLabel, BORTLE_LEGEND } from "@/lib/bortle";

const BA_CENTER: [number, number] = [-36.2, -59.5];
const INITIAL_ZOOM = 6;
const POINT_ZOOM = 14;

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
  const [showLP, setShowLP] = useState(false);

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
        {/* ── Capas base ── */}
        {base === "satelite" && (
          <>
            <TileLayer
              attribution="Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {/* Etiquetas de lugares sobre la imagen satelital */}
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
          </>
        )}

        {base === "oscuro" && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* ── Capa de contaminación lumínica (VIIRS 2022) ── */}
        {showLP && (
          <TileLayer
            url="https://djlorenz.github.io/astronomy/lp2022/overlay/tiles/{z}/{x}/{y}.png"
            opacity={0.45}
            attribution='Contaminación lumínica: <a href="https://djlorenz.github.io/astronomy/lp2022/">Light Pollution Atlas 2022</a>'
          />
        )}

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

      {/* ── Controles top-right ── */}
      <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
        {/* Toggle de capa base */}
        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-surface/60 text-xs font-medium backdrop-blur-md">
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

        {/* Toggle contaminación lumínica */}
        <button
          onClick={() => setShowLP((v) => !v)}
          title={showLP ? "Ocultar contaminación lumínica" : "Ver contaminación lumínica (VIIRS)"}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium backdrop-blur-md transition-all duration-200 ${
            showLP
              ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
              : "border-white/10 bg-surface/60 text-fg-muted hover:text-fg"
          }`}
        >
          {/* Icono "ojo" minimalista */}
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-3.5 w-3.5 shrink-0"
          >
            <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="10" r="2.5" />
          </svg>
          Contam. lumínica
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
