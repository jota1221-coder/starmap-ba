import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signIn } from "@/auth";
import Wordmark from "@/components/Wordmark";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export const metadata = { title: "Entrar — StarMap BA" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function sendMagicLink(formData: FormData) {
    "use server";
    const ip = clientIp(await headers());
    const { ok } = await checkRateLimit("login", ip);
    if (!ok) redirect("/login?error=rate");
    await signIn("email", formData);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark className="text-lg" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Entrá a tu cuenta
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            Te mandamos un enlace por email. Sin contraseñas.
          </p>
        </div>

        <form action={sendMagicLink} className="space-y-3">
          <input type="hidden" name="redirectTo" value="/perfil" />
          <input
            type="email"
            name="email"
            required
            autoFocus
            placeholder="tu@email.com"
            className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-fg placeholder:text-fg-faint transition-colors duration-200 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-ink transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft"
          >
            Enviarme el enlace
          </button>
        </form>

        {error === "rate" && (
          <p className="mt-4 text-center text-sm text-night">
            Demasiados intentos. Esperá unos minutos y probá de nuevo.
          </p>
        )}

        <p className="mt-6 text-center text-xs text-fg-faint">
          Al entrar aceptás que guardemos tu email para identificarte. Nada más.
        </p>
      </div>
    </div>
  );
}
