import type { MetadataRoute } from "next";
import { getMapPoints } from "@/lib/points";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const points = await getMapPoints();

  const pointUrls: MetadataRoute.Sitemap = points.map((p) => ({
    url: `${SITE_URL}/punto/${p.slug}`,
    lastModified: new Date(),
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
    ...pointUrls,
  ];
}
