import type { NextRequest } from "next/server";
import { getConditions } from "@/lib/conditions";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * GET /api/conditions?lat=&lng=&bortle=&date=
 * Devuelve clima + cielo + score para unas coordenadas y momento.
 * `date` es opcional (ISO); por defecto, ahora.
 */
export async function GET(request: NextRequest) {
  const { ok } = await checkRateLimit("conditions", clientIp(request.headers));
  if (!ok) {
    return Response.json(
      { error: "Demasiadas consultas. Esperá un momento." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  const sp = request.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  const bortle = Number(sp.get("bortle"));
  const dateParam = sp.get("date");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json(
      { error: "lat y lng son requeridos y numéricos" },
      { status: 400 },
    );
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return Response.json(
      { error: "lat (-90 a 90) y lng (-180 a 180) fuera de rango" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(bortle) || bortle < 1 || bortle > 9) {
    return Response.json(
      { error: "bortle es requerido (1-9)" },
      { status: 400 },
    );
  }

  let date: Date | undefined;
  if (dateParam) {
    const d = new Date(dateParam);
    if (Number.isNaN(d.getTime())) {
      return Response.json({ error: "date inválida" }, { status: 400 });
    }
    date = d;
  }

  try {
    const conditions = await getConditions({ lat, lng, bortle, date });
    return Response.json(conditions, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch {
    return Response.json(
      { error: "No se pudieron calcular las condiciones" },
      { status: 502 },
    );
  }
}
