"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import { contieneEnlace } from "@/lib/moderation";

/** Recalcula el rating promedio denormalizado contando solo aprobadas. */
async function recomputeRating(pointId: number) {
  const agg = await prisma.review.aggregate({
    where: { pointId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.observationPoint.update({
    where: { id: pointId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });
}

export type ReviewActionState = { error?: string; ok?: boolean };

/** Crea o actualiza la reseña del usuario logueado para un punto. */
export async function submitReview(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Tenés que iniciar sesión para reseñar." };

  const { ok } = await checkRateLimit("review", userId);
  if (!ok)
    return { error: "Demasiadas reseñas seguidas. Esperá unos minutos." };

  const pointId = Number(formData.get("pointId"));
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating"));
  const cuerpo = String(formData.get("cuerpo") ?? "").trim();
  const consejoRaw = String(formData.get("consejo") ?? "").trim();
  const consejo = consejoRaw.length ? consejoRaw : null;

  if (!Number.isInteger(pointId) || pointId <= 0)
    return { error: "Punto inválido." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { error: "Elegí una puntuación de 1 a 5 estrellas." };
  if (cuerpo.length < 3)
    return { error: "Escribí un comentario (mínimo 3 caracteres)." };
  if (cuerpo.length > 1000)
    return { error: "El comentario es demasiado largo (máx. 1000)." };
  if (contieneEnlace(cuerpo) || (consejo && contieneEnlace(consejo)))
    return { error: "No se permiten enlaces en las reseñas." };

  try {
    await prisma.review.upsert({
      where: { pointId_userId: { pointId, userId } },
      create: { pointId, userId, rating, cuerpo, consejo },
      update: { rating, cuerpo, consejo },
    });
    await recomputeRating(pointId);
  } catch {
    return { error: "No se pudo guardar la reseña. Probá de nuevo." };
  }

  revalidatePath(`/punto/${slug}`);
  return { ok: true };
}

/** Borra la reseña del usuario logueado para un punto. */
export async function deleteReview(formData: FormData): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const pointId = Number(formData.get("pointId"));
  const slug = String(formData.get("slug") ?? "");
  if (!Number.isInteger(pointId)) return;

  await prisma.review.deleteMany({ where: { pointId, userId } });
  await recomputeRating(pointId);
  revalidatePath(`/punto/${slug}`);
}
