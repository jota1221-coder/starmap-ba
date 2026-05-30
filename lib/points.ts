import { prisma } from "@/lib/prisma";

/** Forma serializable de un punto para pasar al mapa (Client Component). */
export type MapPoint = {
  id: number;
  slug: string;
  nombre: string;
  partido: string;
  lat: number;
  lng: number;
  bortle: number;
  sqm: number;
  distanciaCabaKm: number;
  tipo: string;
  accesoTipo: string;
  descripcion: string;
};

/** Devuelve un punto completo por su slug (o null si no existe). */
export async function getPointBySlug(slug: string) {
  return prisma.observationPoint.findUnique({ where: { slug } });
}

/** Reseñas de un punto, más recientes primero. */
export async function getReviews(pointId: number) {
  return prisma.review.findMany({
    where: { pointId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      rating: true,
      cuerpo: true,
      consejo: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });
}

/** Reseña del usuario para un punto (para precargar el formulario de edición). */
export async function getUserReview(pointId: number, userId: string) {
  return prisma.review.findUnique({
    where: { pointId_userId: { pointId, userId } },
    select: { rating: true, cuerpo: true, consejo: true },
  });
}

/** Devuelve los puntos para el mapa, ordenados del cielo más oscuro al menos. */
export async function getMapPoints(): Promise<MapPoint[]> {
  return prisma.observationPoint.findMany({
    orderBy: [{ bortle: "asc" }, { distanciaCabaKm: "asc" }],
    select: {
      id: true,
      slug: true,
      nombre: true,
      partido: true,
      lat: true,
      lng: true,
      bortle: true,
      sqm: true,
      distanciaCabaKm: true,
      tipo: true,
      accesoTipo: true,
      descripcion: true,
    },
  });
}
