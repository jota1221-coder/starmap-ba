"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import { contieneEnlace } from "@/lib/moderation";
import { getProfile } from "@/lib/points";
import { isProfileComplete } from "@/lib/profile";

// El rating denormalizado (ratingAvg/ratingCount) lo mantiene un trigger de
// la DB (migración db_integrity_checks_and_rating_trigger): cualquier
// INSERT/UPDATE/DELETE sobre Review lo recalcula solo, incluido el borrado
// en cascada de un User. Acá ya no hace falta llamarlo a mano.

/** Busca el slug real de un punto por id — nunca confiar en el que manda el form. */
async function slugFor(pointId: number): Promise<string | null> {
  const point = await prisma.observationPoint.findUnique({
    where: { id: pointId },
    select: { slug: true },
  });
  return point?.slug ?? null;
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

  if (!isProfileComplete(await getProfile(userId)))
    return { error: "Completá tu perfil antes de reseñar." };

  const pointId = Number(formData.get("pointId"));
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
  if (consejo && consejo.length > 300)
    return { error: "El consejo es demasiado largo (máx. 300)." };
  if (contieneEnlace(cuerpo) || (consejo && contieneEnlace(consejo)))
    return { error: "No se permiten enlaces en las reseñas." };

  const slug = await slugFor(pointId);
  if (!slug) return { error: "Punto inválido." };

  try {
    await prisma.review.upsert({
      where: { pointId_userId: { pointId, userId } },
      create: { pointId, userId, rating, cuerpo, consejo },
      update: { rating, cuerpo, consejo },
    });
  } catch (e) {
    console.error("submitReview:", e);
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

  const { ok } = await checkRateLimit("review", userId);
  if (!ok) return;

  const pointId = Number(formData.get("pointId"));
  if (!Number.isInteger(pointId)) return;

  const slug = await slugFor(pointId);
  if (!slug) return;

  try {
    await prisma.review.deleteMany({ where: { pointId, userId } });
  } catch (e) {
    console.error("deleteReview:", e);
    return;
  }
  revalidatePath(`/punto/${slug}`);
}
