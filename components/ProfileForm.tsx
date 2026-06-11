"use client";

import { useActionState, useState } from "react";
import { saveProfile, type ProfileActionState } from "@/app/perfil/actions";
import { EXPERIENCE_OPTIONS, type ProfileFields } from "@/lib/profile";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-faint transition-colors duration-200 focus:border-accent focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-medium text-fg-muted";

export default function ProfileForm({ initial }: { initial: ProfileFields }) {
  const [experience, setExperience] = useState<string>(
    initial.experience ?? "",
  );
  const [state, formAction, pending] = useActionState<
    ProfileActionState,
    FormData
  >(saveProfile, {});

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="experience" value={experience} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            minLength={2}
            maxLength={40}
            defaultValue={initial.firstName ?? ""}
            placeholder="Joaquín"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Apellido
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            minLength={2}
            maxLength={40}
            defaultValue={initial.lastName ?? ""}
            placeholder="Rao"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="nickname" className={labelClass}>
          Nick <span className="text-fg-faint">(opcional)</span>
        </label>
        <input
          id="nickname"
          name="nickname"
          maxLength={30}
          defaultValue={initial.nickname ?? ""}
          placeholder="Cómo querés que te vean en las reseñas"
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Experiencia en astronomía</legend>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map((o) => {
            const active = experience === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setExperience(o.value)}
                aria-pressed={active}
                className={
                  "rounded-full border px-4 py-2 text-sm transition-colors duration-200 " +
                  (active
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/10 text-fg-muted hover:border-white/25 hover:text-fg")
                }
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {state.error && <p className="text-sm text-night">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !experience}
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}
