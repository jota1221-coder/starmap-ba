import * as A from "astronomy-engine";

// Fixture: Pila (-36.05, -58.25) el 2026-05-28 22:00 ART = 2026-05-29T01:00:00Z
const time = new Date("2026-05-29T01:00:00Z");
const observer = new A.Observer(-36.05, -58.25, 30);

console.log("Body enum sample:", A.Body.Moon, A.Body.Jupiter, A.Body.Sun);

// Iluminación lunar (comparar con MCP: 0.9496)
const illum = A.Illumination(A.Body.Moon, time);
console.log("Moon Illumination keys:", Object.keys(illum));
console.log("Moon phase_fraction:", illum.phase_fraction);

// Fase lunar 0-360 (0=nueva, 180=llena)
console.log("MoonPhase (deg):", A.MoonPhase(time));

// Altitud de la Luna en el punto
const moonEq = A.Equator(A.Body.Moon, time, observer, true, true);
const moonHor = A.Horizon(time, observer, moonEq.ra, moonEq.dec, "normal");
console.log("Moon altitude:", moonHor.altitude.toFixed(2), "azimuth:", moonHor.azimuth.toFixed(2));

// Sol: altitud (para saber si es de noche)
const sunEq = A.Equator(A.Body.Sun, time, observer, true, true);
const sunHor = A.Horizon(time, observer, sunEq.ra, sunEq.dec, "normal");
console.log("Sun altitude:", sunHor.altitude.toFixed(2));

// Planetas sobre el horizonte (comparar con MCP: ninguno)
const planets = [A.Body.Mercury, A.Body.Venus, A.Body.Mars, A.Body.Jupiter, A.Body.Saturn];
for (const b of planets) {
  const eq = A.Equator(b, time, observer, true, true);
  const hor = A.Horizon(time, observer, eq.ra, eq.dec, "normal");
  const mag = A.Illumination(b, time).mag;
  console.log(`${b}: alt ${hor.altitude.toFixed(1)} az ${hor.azimuth.toFixed(1)} mag ${mag.toFixed(1)}${hor.altitude > 0 ? "  <-- VISIBLE" : ""}`);
}

// Rise/Set de la Luna ese día
const rise = A.SearchRiseSet(A.Body.Moon, observer, +1, time, 1);
const set = A.SearchRiseSet(A.Body.Moon, observer, -1, time, 1);
console.log("Moon rise:", rise?.date?.toISOString(), "set:", set?.date?.toISOString());
