import type { MetadataRoute } from "next";
import { getMapPoints } from "@/lib/points";
import { SITE_URL } from "@/lib/site";

// Los puntos cambian poco; alineado con el revalidate de /mapa.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const points = await getMapPoints();

  const pointUrls: MetadataRoute.Sitemap = points.map((p) => ({
    url: `${SITE_URL}/punto/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    {
      url: `${SITE_URL}/mapa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/data-science`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...pointUrls,
  ];
}
