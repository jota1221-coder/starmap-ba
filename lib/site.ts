/**
 * URL base del sitio. Única fuente de verdad.
 * Configurable con NEXT_PUBLIC_SITE_URL (ej. para previews de Vercel).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://starmapba.com.ar";

/**
 * Metadata de Open Graph/Twitter para una página. Next.js REEMPLAZA el objeto
 * `openGraph`/`twitter` entero por página (no lo mergea campo a campo con el
 * del layout raíz) — por eso repetimos acá type/locale/siteName en vez de
 * confiar en la herencia, para que cada página comparta en redes con su
 * propio título en vez del genérico de la home.
 */
export function ogFor(title: string, description: string, path: string) {
  return {
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      locale: "es_AR",
      siteName: "StarMap BA",
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}

/**
 * Serializa un objeto JSON-LD para un <script type="application/ld+json">.
 * Escapa "<" para que un valor con "</script>" adentro (en teoría, hoy todo
 * el contenido es curado por nosotros, no de usuarios) no pueda cerrar el
 * tag antes de tiempo.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
