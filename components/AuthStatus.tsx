import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getProfile } from "@/lib/points";
import { reviewerName, isProfileComplete } from "@/lib/profile";
import Avatar from "@/components/Avatar";

/**
 * Estado de sesión para el header. Server Component:
 * lee la sesión y muestra "Entrar", o el nombre del perfil + "Salir".
 * Si el perfil está incompleto, invita a completarlo.
 */
export default async function AuthStatus() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Link
        href="/login"
        className="text-sm text-fg-muted transition-colors duration-200 hover:text-accent"
      >
        Entrar
      </Link>
    );
  }

  const profile = await getProfile(session.user.id);

  return (
    <div className="flex items-center gap-3 text-sm">
      {profile && isProfileComplete(profile) ? (
        <Link
          href="/perfil"
          title="Tu perfil"
          className="flex items-center gap-2 text-fg-muted transition-colors duration-200 hover:text-fg"
        >
          <Avatar name={reviewerName(profile)} size={26} />
          <span className="max-w-[8rem] truncate">{reviewerName(profile)}</span>
        </Link>
      ) : (
        <Link
          href="/perfil"
          className="text-accent transition-colors duration-200 hover:text-accent-soft"
        >
          Completá tu perfil
        </Link>
      )}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="text-fg-faint transition-colors duration-200 hover:text-night"
        >
          Salir
        </button>
      </form>
    </div>
  );
}
