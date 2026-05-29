"use client";

import { useState, useEffect, useCallback } from "react";
import SkyPointer from "./SkyPointer";
import AltitudeCurve from "./AltitudeCurve";
import type { ObjectPlan } from "@/lib/observation-plan";

interface NightPlanProps {
  objects: ObjectPlan[];
  duskMs: number;
  dawnMs: number;
  duskLabel: string;
  dawnLabel: string;
}

type CompassState = "idle" | "requesting" | "active" | "unavailable";

export default function NightPlan({
  objects,
  duskMs,
  dawnMs,
  duskLabel,
  dawnLabel,
}: NightPlanProps) {
  const [heading, setHeading] = useState<number | null>(null);
  const [compassState, setCompassState] = useState<CompassState>("idle");

  function handleOrientation(e: DeviceOrientationEvent) {
    const alpha =
      (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading ?? e.alpha;
    if (alpha !== null && alpha !== undefined) {
      setHeading(alpha);
      setCompassState("active");
    }
  }

  const stopCompass = useCallback(() => {
    window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener);
    window.removeEventListener("deviceorientation", handleOrientation as EventListener);
    setHeading(null);
    setCompassState("idle");
  }, []);

  async function activateCompass() {
    setCompassState("requesting");
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission === "function") {
      try {
        if ((await DOE.requestPermission()) !== "granted") {
          setCompassState("unavailable");
          return;
        }
      } catch {
        setCompassState("unavailable");
        return;
      }
    }
    const event =
      "ondeviceorientationabsolute" in window
        ? "deviceorientationabsolute"
        : "deviceorientation";
    window.addEventListener(event, handleOrientation as EventListener, {
      passive: true,
    });
    setTimeout(() => {
      setCompassState((prev) => (prev === "requesting" ? "unavailable" : prev));
    }, 2000);
  }

  useEffect(() => stopCompass, [stopCompass]);

  if (objects.length === 0) {
    return (
      <p className="text-sm text-fg-faint">
        Ningún astro mayor se eleva lo suficiente sobre el horizonte esta noche.
        Probá otra fecha.
      </p>
    );
  }

  return (
    <div>
      {/* Ventana de noche + botón de brújula */}
      <div className="mb-6 flex items-center justify-between">
        <p className="tnum text-xs text-fg-faint">
          Noche cerrada: <span className="text-fg-muted">{duskLabel}</span> →{" "}
          <span className="text-fg-muted">{dawnLabel}</span>
        </p>
        {compassState === "active" ? (
          <button
            onClick={stopCompass}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-night transition-colors duration-200 hover:border-night/40"
          >
            Desactivar brújula
          </button>
        ) : compassState === "unavailable" ? (
          <span className="text-xs text-fg-faint">Giroscopio no disponible</span>
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

      {/* Un bloque por astro */}
      <div className="space-y-8">
        {objects.map((obj) => (
          <div key={obj.key}>
            <SkyPointer
              nombre={obj.nombre}
              azimuth={obj.best.azimuth}
              altitude={obj.best.altitude}
              timeLabel={obj.best.timeLabel}
              deviceHeading={heading}
              color={obj.color}
            />
            <AltitudeCurve
              track={obj.track}
              duskMs={duskMs}
              dawnMs={dawnMs}
              color={obj.color}
            />
            <div className="tnum flex justify-between text-[10px] text-fg-faint">
              <span>{duskLabel}</span>
              <span>{dawnLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
