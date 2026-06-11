import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getProfile } from "@/lib/points";
import { isProfileComplete } from "@/lib/profile";
import Wordmark from "@/components/Wordmark";
import ProfileForm from "@/components/ProfileForm";

export const metadata = { title: "Tu perfil — StarMap BA" };
export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = (await getProfile(session.user.id)) ?? {
    firstName: null,
    lastName: null,
    nickname: null,
    experience: null,
  };
  const complete = isProfileComplete(profile);

  return (
    <div className="min-h-dvh bg-ink text-fg">
      <header className="border-b border-white/5 px-4 py-3.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Wordmark className="text-sm" />
          <Link
            href="/mapa"
            className="text-sm text-fg-muted transition-colors duration-200 hover:text-fg"
          >
            Ir al mapa →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {complete ? "Tu perfil" : "Completá tu perfil"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          {complete
            ? "Editá tus datos cuando quieras."
            : "Así te identificamos en las reseñas, en vez de mostrar tu email. Te toma 20 segundos."}
        </p>

        <div className="mt-8">
          <ProfileForm initial={profile} />
        </div>
      </main>
    </div>
  );
}
