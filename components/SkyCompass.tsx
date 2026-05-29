"use client";

import { useState, useEffect, useCallback } from "react";
import SkyPointer from "./SkyPointer";
import type { MoonInfo, VisibleObject } from "@/lib/astronomy";
import { bortleColor } from "@/lib/bortle";

interface SkyCompassProps {
  moon: MoonInfo;
  planets: VisibleObject[];
}

type CompassState = "idle" | "requesting" | "active" | "unavailable";

export default function SkyCompass({ moon, planets }: SkyCompassProps) {
  const [heading, setHeading] = useState<number | null>(null);
  const [compassState, setCompassState] = useState<CompassState>("idle");

  // Limpia el listener al desmontar
  const stopCompass = useCallback(() => {
    window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener);
    window.removeEventListener("deviceorientation", handleOrientation as EventListener);
    setHeading(null);
    setCompassState("idle");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOrientation(e: DeviceOrientationEvent) {
    // `alpha` = rotación alrededor del eje Z (0 = norte magnético en algunos devices)
    // En iOS con absolute=true, alpha es el heading verdadero.
    // En Android DeviceOrientationAbsolute, alpha también es el heading real.
    const alpha = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
      ?? e.alpha;
    if (alpha !== null) {
      setHeading(alpha);
      setCompassState("active");
    }
  }

  async function activateCompass() {
    setCompassState("requesting");

    // iOS 13+ requiere permiso explícito
    const DeviceOrientationEventAny = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DeviceOrientationEventAny.requestPermission === "function") {
      try {
        const permission = await DeviceOrientationEventAny.requestPermission();
        if (permission !== "granted") {
          setCompassState("unavailable");
          return;
        }
      } catch {
        setCompassState("unavailable");
        return;
      }
    }

    // Preferimos absolute (más precisa), fallback a deviceorientation
    const hasAbsolute = "ondeviceorientationabsolute" in window;
    const event = hasAbsolute ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(event, handleOrientation as EventListener, { passive: true });

    // Si en 2s no llega nada, el dispositivo no tiene giroscopio
    setTimeout(() => {
      setCompassState((prev) => (prev === "requesting" ? "unavailable" : prev));
    }, 2000);
  }

  useEffect(() => stopCompass, [stopCompass]);

  const objects: { nombre: string; azimuth: number; altitude: number; color: string; key: string }[] = [];

  if (moon.isUp) {
    objects.push({
      key: "luna",
      nombre: `La Luna (${moon.phaseName})`,
      azimuth: moon.azimuth,
      altitude: moon.altitude,
      color: "#94a3b8", // gris plateado
    });
  }

  for (const p of planets) {
    objects.push({
      key: p.key,
      nombre: p.nombre,
      azimuth: p.azimuth,
      altitude: p.altitude,
      color: bortleColor(4), // ámbar terroso para planetas
    });
  }

  const hasObjects = objects.length > 0;

  return (
    <div>
      {/* Botón de brújula */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs text-fg-faint">
          {compassState === "active"
            ? "La flecha apunta al objeto según tu posición real."
            : "Las flechas muestran la dirección desde el Norte."}
        </p>

        {compassState === "active" ? (
          <button
            onClick={stopCompass}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-night transition-colors duration-200 hover:border-night/40"
          >
            Desactivar
          </button>
        ) : compassState === "unavailable" ? (
          <span className="text-xs text-fg-faint">
            Giroscopio no disponible
          </span>
        ) : (
          <button
            onClick={activateCompass}
            disabled={compassState === "requesting"}
            className="rounded-xl border border-accent/40 px-3 py-1.5 text-xs font-medium text-accent transition-all duration-200 hover:border-accent hover:bg-accent/10 disabled:opacity-50"
          >
            {compassState === "requesting" ? "Solicitando…" : "Activar brújula"}
          </button>
        )}
      </div>

      {/* Lista de objetos */}
      {hasObjects ? (
        <div>
          {objects.map((obj) => (
            <SkyPointer
              key={obj.key}
              nombre={obj.nombre}
              azimuth={obj.azimuth}
              altitude={obj.altitude}
              deviceHeading={heading}
              color={obj.color}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-faint">
          Ningún objeto visible sobre el horizonte a esta hora. Probá otra
          fecha o un horario más tarde en la noche.
        </p>
      )}
    </div>
  );
}
