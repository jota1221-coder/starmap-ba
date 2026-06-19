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
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
