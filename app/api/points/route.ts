import { getMapPoints } from "@/lib/points";

// Lista de puntos para el mapa (ordenados por calidad de cielo).
// Cambian rarísimo → cache larga en el CDN + stale-while-revalidate.
export async function GET() {
  const points = await getMapPoints();
  return Response.json(
    { points },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
