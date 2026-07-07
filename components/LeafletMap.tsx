"use client";

import { useRef, useState } from "react";
import type { Map as LMap, PathOptions } from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/points";
import { bortleColor, bortleLabel, BORTLE_LEGEND } from "@/lib/bortle";
import { BA_PROVINCE_RING } from "@/lib/ba-province";
import Stars from "@/components/Stars";

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
  urbano: "Urbano",
};

// Borde del marker según categoría: violeta = observatorio, azul = escapada.
const CATEGORIA_COLOR: Record<string, string> = {
  observatorio: "#7c3aed", // violeta intenso (distinto del azul)
  escapada: "#4f74e3", // azul con contraste ≥3:1 sobre el fondo del mapa
};

const CATEGORIA_LABEL: Record<string, string> = {
  observatorio: "Observatorio (visitas)",
  escapada: "Escapada de cielo oscuro",
};

// Bounds del overlay VIIRS (EPSG:3857, de notebooks/make_overlay.py).
const VIIRS_BOUNDS: [[number, number], [number, number]] = [
  [-41.037166, -63.397916],
  [-33.281251, -56.673410],
];

// Distancia en km entre dos coordenadas (haversine).
function distanciaKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Link a Google Maps con la ruta desde la ubicación del usuario (si la tenemos).
function comoLlegarUrl(p: MapPoint, from: [number, number] | null): string {
  const origin = from ? `&origin=${from[0]},${from[1]}` : "";
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${p.lat},${p.lng}`;
}

type BaseLayer = "satelite" | "oscuro";

export default function LeafletMap({ points }: { points: MapPoint[] }) {
  const mapRef = useRef<LMap | null>(null);
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [base, setBase] = useState<BaseLayer>("satelite");
  const [showOverlay, setShowOverlay] = useState(true);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "error">("idle");
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  function selectPoint(p: MapPoint) {
    setSelected(p);
    mapRef.current?.flyTo([p.lat, p.lng], POINT_ZOOM, { duration: 1.2 });
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setLocStatus("error");
      setLocMsg("Tu navegador no soporta geolocalización.");
      return;
    }
    setLocStatus("loading");
    setLocMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(c);
        setLocStatus("idle");
        mapRef.current?.flyTo(c, 9, { duration: 1.2 });
      },
      (err) => {
        setLocStatus("error");
        setLocMsg(
          err.code === err.PERMISSION_DENIED
            ? "Permiso denegado. Tocá el candado de la barra de direcciones y permití la ubicación."
            : err.code === err.POSITION_UNAVAILABLE
              ? "No se pudo ubicarte (en PC sin GPS depende del WiFi y de la ubicación de Windows)."
              : "La ubicación tardó demasiado. Probá de nuevo.",
        );
        console.error("Geolocation error", err.code, err.message);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={BA_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={6}
        maxZoom={14}
        maxBounds={PAN_BOUNDS}
        maxBoundsViscosity={0.75}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full bg-slate-950"
      >
        {/* ── Capas base ── */}
        {base === "satelite" && (
          <>
            {/* Base: Sentinel-2 cloudless (EOX). Satélite global UNIFORME —
                el campo bonaerense se ve tan nítido como la ciudad, a diferencia
                de Esri (foto aérea con huecos en zona rural). 10m/px → detalle
                real hasta z14. URL WMTS: .../g/{z}/{y}/{x} (TileRow antes que Col). */}
            <TileLayer
              attribution='Sentinel-2 cloudless 2024 by <a href="https://s2maps.eu">EOX</a> (Modified Copernicus Sentinel data)'
              url="https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"
              className="sat-nocturnal"
              maxNativeZoom={14}
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

        {/* ── Overlay de contaminación lumínica (VIIRS 2024) ── */}
        {showOverlay && (
          <ImageOverlay url="/mapa/viirs-overlay.webp" bounds={VIIRS_BOUNDS} opacity={0.7} />
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
                color: isSelected
                  ? "#ffffff"
                  : (CATEGORIA_COLOR[p.categoria] ?? "#0f172a"),
                weight: isSelected ? 2.5 : 2,
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

        {/* ── Tu ubicación ── */}
        {userLoc && (
          <CircleMarker
            center={userLoc}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#22d3ee", fillOpacity: 1 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              Tu ubicación
            </Tooltip>
          </CircleMarker>
        )}
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

      {/* ── Controles: overlay de luz + mi ubicación ── */}
      <div className="absolute right-3 top-14 z-[1000] flex flex-col items-end gap-2 text-xs font-medium">
        <button
          onClick={() => setShowOverlay((v) => !v)}
          className={`rounded-xl border border-white/10 px-3.5 py-2 backdrop-blur-md transition-colors duration-200 ${showOverlay ? "bg-accent text-ink" : "bg-surface/60 text-fg-muted hover:text-fg"}`}
        >
          Luz urbana
        </button>
        <button
          onClick={locateMe}
          className="rounded-xl border border-white/10 bg-surface/60 px-3.5 py-2 text-fg-muted backdrop-blur-md transition-colors duration-200 hover:text-fg"
        >
          {locStatus === "loading" ? "Buscando…" : "Mi ubicación"}
        </button>
        {locStatus === "error" && locMsg && (
          <span className="max-w-[13rem] rounded-lg bg-surface/80 px-2.5 py-1.5 text-right text-[11px] leading-snug text-[#ff9b9b] backdrop-blur-md">
            {locMsg}
          </span>
        )}
      </div>

      {/* ── Leyenda Bortle (colapsable en mobile: en 375px se pisaba con los
          controles de la derecha si quedaba siempre abierta) ── */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] text-xs text-fg-muted">
        <button
          onClick={() => setLegendOpen((v) => !v)}
          aria-expanded={legendOpen}
          className="pointer-events-auto rounded-xl border border-white/10 bg-surface/60 px-3.5 py-2 font-medium text-fg backdrop-blur-md transition-colors duration-200 hover:text-accent sm:hidden"
        >
          {legendOpen ? "Ocultar leyenda ▲" : "Leyenda ▼"}
        </button>

        <div
          className={`${legendOpen ? "block" : "hidden"} mt-2 rounded-xl border border-white/10 bg-surface/60 p-3.5 backdrop-blur-md sm:mt-0 sm:block`}
        >
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
          <p className="mb-2 mt-3.5 font-semibold tracking-tight text-fg">
            Tipo de lugar
          </p>
          <ul className="space-y-1.5">
            {Object.entries(CATEGORIA_LABEL).map(([key, label]) => (
              <li key={key} className="flex items-center gap-2.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ border: `2px solid ${CATEGORIA_COLOR[key]}` }}
                />
                {label}
              </li>
            ))}
          </ul>
          {showOverlay && (
            <p className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-2.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: "linear-gradient(135deg, #fed976, #e31a1c)" }}
              />
              Halo cálido = luz urbana
            </p>
          )}
        </div>
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
            <span
              className="rounded-full border px-2.5 py-1 text-fg-muted"
              style={{
                borderColor: CATEGORIA_COLOR[selected.categoria] ?? "rgba(255,255,255,0.1)",
              }}
            >
              {selected.categoria === "observatorio" ? "Observatorio" : "Escapada"}
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
            {userLoc && (
              <span className="tnum rounded-full border border-cyan-400/40 px-2.5 py-1 text-fg-muted">
                a {Math.round(distanciaKm(userLoc, [selected.lat, selected.lng]))} km de vos
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-fg-muted">
            {selected.descripcion}
          </p>

          {selected.ratingCount > 0 ? (
            <div className="mt-5 flex items-center gap-2 text-sm">
              <Stars value={selected.ratingAvg} size={14} />
              <span className="tnum font-medium text-fg">
                {selected.ratingAvg.toFixed(1)}
              </span>
              <span className="tnum text-fg-faint">
                ({selected.ratingCount})
              </span>
            </div>
          ) : (
            <p className="mt-5 text-xs text-fg-faint">
              Todavía no hay reseñas para este punto.
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <a
              href={`/punto/${selected.slug}`}
              className="block rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-ink transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft"
            >
              Ver guía de observación →
            </a>
            <a
              href={comoLlegarUrl(selected, userLoc)}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              Cómo llegar{userLoc ? " desde donde estás" : ""} →
            </a>
          </div>
        </aside>
      )}
    </div>
  );
}
