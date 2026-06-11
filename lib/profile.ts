import type { AstronomyExperience } from "@prisma/client";

/**
 * Helpers puros del perfil de comunidad (sin acceso a DB, para poder
 * importarlos también desde Client Components). La query vive en lib/points.ts.
 */

/** Opciones de experiencia: valor en DB → etiqueta visible. Orden del picker. */
export const EXPERIENCE_OPTIONS: { value: AstronomyExperience; label: string }[] =
  [
    { value: "nada", label: "Nada" },
    { value: "basico", label: "Básico" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
  ];

const EXPERIENCE_VALUES: string[] = EXPERIENCE_OPTIONS.map((o) => o.value);

/** ¿Es un valor de experiencia válido? (para validar el formulario) */
export function isExperience(v: unknown): v is AstronomyExperience {
  return typeof v === "string" && EXPERIENCE_VALUES.includes(v);
}

/** Etiqueta visible de un nivel de experiencia (o null si no está seteado). */
export function experienceLabel(
  exp: AstronomyExperience | null | undefined,
): string | null {
  if (!exp) return null;
  return EXPERIENCE_OPTIONS.find((o) => o.value === exp)?.label ?? null;
}

/** Campos de perfil que leemos/mostramos. */
export type ProfileFields = {
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  experience: AstronomyExperience | null;
};

/** Nombre público para reseñas/header. NUNCA expone el email. */
export function reviewerName(u: {
  nickname: string | null;
  firstName: string | null;
}): string {
  return u.nickname?.trim() || u.firstName?.trim() || "Observador anónimo";
}

/** El perfil está completo con nombre, apellido y experiencia (nick es opcional). */
export function isProfileComplete(p: ProfileFields | null | undefined): boolean {
  return Boolean(p && p.firstName && p.lastName && p.experience);
}
