import type { NextRequest } from "next/server";
import { getPointBySlug } from "@/lib/points";
import { getConditions } from "@/lib/conditions";

/**
 * GET /api/points/[slug]?date=
 * Devuelve el punto completo + condiciones de observación en vivo.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const point = await getPointBySlug(slug);

  if (!point) {
    return Response.json({ error: "Punto no encontrado" }, { status: 404 });
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  let date: Date | undefined;
  if (dateParam) {
    const d = new Date(dateParam);
    if (!Number.isNaN(d.getTime())) date = d;
  }

  const conditions = await getConditions({
    lat: point.lat,
    lng: point.lng,
    bortle: point.bortle,
    date,
  });

  return Response.json(
    { point, conditions },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    },
  );
}
