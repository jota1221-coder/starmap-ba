import type { NextConfig } from "next";

/**
 * Headers de seguridad aplicados a todas las rutas.
 *
 * Nota sobre CSP: solo restringimos `frame-ancestors` (anti-clickjacking).
 * NO ponemos un CSP completo (default-src/img-src/script-src) acá porque el
 * mapa carga tiles de orígenes externos (EOX/Sentinel-2, Esri), Vercel
 * Analytics inyecta su script y Leaflet usa estilos inline: un CSP estricto
 * mal listado rompería el mapa. Queda como mejora posterior, testeada en el
 * navegador. HSTS ya lo agrega Vercel automáticamente.
 */
// CSP completa en modo Report-Only: NO bloquea nada, solo reporta violaciones
// a la consola del navegador. Es el paso previo a enforce (B3 de la auditoría):
// navegar el sitio, mirar la consola, y cuando no queden violaciones, mover
// esta política a `Content-Security-Policy`. Orígenes:
//   - tiles del mapa: EOX (satélite), ArcGIS (rótulos), Carto (base oscura)
//   - Vercel Analytics: script y beacon (self + va.vercel-scripts.com)
//   - 'unsafe-inline' en script/style: Next inyecta scripts de hidratación y
//     el JSON-LD inline; Leaflet usa estilos inline. Endurecer con nonce queda
//     para cuando se promueva a enforce.
const cspReportOnly = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://tiles.maps.eox.at https://server.arcgisonline.com https://*.basemaps.cartocdn.com",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // geolocation=(self) es necesaria para la función "Mi ubicación".
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), geolocation=(self)",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

// Assets estáticos de los notebooks (overlay VIIRS, heatmaps, figuras).
// `:path+` (uno o más segmentos) matchea SOLO archivos bajo esas carpetas
// (`/mapa/viirs-overlay.webp`, `/data-science/*.png`), nunca las páginas
// `/mapa` ni `/data-science` (no queremos cachear el HTML).
// No usamos `immutable`: los filenames no están versionados y estas imágenes
// se regeneran desde los notebooks; `stale-while-revalidate` sirve al toque y
// refresca en segundo plano, así un overlay nuevo propaga en ~1 día.
const staticAssetHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=86400, stale-while-revalidate=604800",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      { source: "/mapa/:path+", headers: staticAssetHeaders },
      { source: "/data-science/:path+", headers: staticAssetHeaders },
    ];
  },
};

export default nextConfig;
