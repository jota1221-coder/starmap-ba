import { BA_PROVINCE_RING } from "../lib/ba-province";
import { readFileSync } from "node:fs";

const seed = JSON.parse(readFileSync("./data/seed-points.json", "utf8"));

// Ray casting: ¿el punto (lng,lat) está dentro del anillo [lng,lat]?
function inside(lng: number, lat: number, ring: [number, number][]): boolean {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const hit =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (hit) c = !c;
  }
  return c;
}

// Haversine desde CABA (referencia de distancia en línea recta)
const CABA = { lat: -34.6037, lng: -58.3816 };
function haversine(lat: number, lng: number): number {
  const R = 6371;
  const dLat = ((lat - CABA.lat) * Math.PI) / 180;
  const dLng = ((lng - CABA.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((CABA.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

let problemas = 0;
console.log(
  "punto".padEnd(28),
  "dentro".padEnd(7),
  "bortle",
  "recta".padEnd(6),
  "guardada",
);
console.log("─".repeat(70));
for (const p of seed.puntos) {
  const dentro = inside(p.lng, p.lat, BA_PROVINCE_RING as [number, number][]);
  const recta = haversine(p.lat, p.lng);
  const bortleOk = p.bortle >= 1 && p.bortle <= 9;
  const flags: string[] = [];
  if (!dentro) flags.push("FUERA DE BA");
  if (!bortleOk) flags.push("BORTLE INVÁLIDO");
  // La distancia guardada es por ruta; la recta debe ser MENOR. Si la recta
  // es mayor que la guardada, algo está mal en las coordenadas.
  if (recta > p.distancia_caba_km * 1.05) flags.push("DISTANCIA SOSPECHOSA");
  if (flags.length) problemas++;
  console.log(
    p.slug.padEnd(28),
    (dentro ? "sí" : "NO").padEnd(7),
    String(p.bortle).padEnd(6),
    `${recta}km`.padEnd(6),
    `${p.distancia_caba_km}km`,
    flags.length ? "  ⚠ " + flags.join(", ") : "",
  );
}
console.log("─".repeat(70));
console.log(
  problemas === 0
    ? "✓ Las 13 ubicaciones están dentro de BA, con Bortle y distancias coherentes."
    : `⚠ ${problemas} punto(s) con problemas — revisar arriba.`,
);
