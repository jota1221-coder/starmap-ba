/**
 * URL base del sitio. Única fuente de verdad.
 * Configurable con NEXT_PUBLIC_SITE_URL (ej. cuando haya dominio propio).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://starmap-ba-12.vercel.app";
