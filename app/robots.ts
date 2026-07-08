import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /login cubre también /login/revisa por prefijo.
      disallow: ["/api/", "/login", "/perfil"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
