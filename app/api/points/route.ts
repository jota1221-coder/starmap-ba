import { getMapPoints } from "@/lib/points";

// Lista de puntos para el mapa (ordenados por calidad de cielo).
export async function GET() {
  const points = await getMapPoints();
  return Response.json({ points });
}
