"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isExperience } from "@/lib/profile";
import { contieneEnlace } from "@/lib/moderation";

export type ProfileActionState = { error?: string };

/** Guarda el perfil de comunidad del usuario logueado y lo manda al mapa. */
export async function saveProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Tenés que iniciar sesión." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const nicknameRaw = String(formData.get("nickname") ?? "").trim();
  const nickname = nicknameRaw.length ? nicknameRaw : null;
  const experience = formData.get("experience");

  if (firstName.length < 2) return { error: "Escribí tu nombre." };
  if (firstName.length > 40)
    return { error: "El nombre es demasiado largo (máx. 40)." };
  if (lastName.length < 2) return { error: "Escribí tu apellido." };
  if (lastName.length > 40)
    return { error: "El apellido es demasiado largo (máx. 40)." };
  if (nickname && nickname.length > 30)
    return { error: "El nick es demasiado largo (máx. 30)." };
  if (!isExperience(experience))
    return { error: "Elegí tu nivel de experiencia." };
  if (
    contieneEnlace(firstName) ||
    contieneEnlace(lastName) ||
    (nickname !== null && contieneEnlace(nickname))
  )
    return { error: "No se permiten enlaces en el perfil." };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, nickname, experience },
    });
  } catch (e) {
    console.error("saveProfile:", e);
    return { error: "No se pudo guardar el perfil. Probá de nuevo." };
  }

  // redirect() lanza una excepción de control-flow: va fuera del try/catch.
  redirect("/mapa");
}
