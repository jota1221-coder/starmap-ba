import Link from "next/link";
import { auth, signOut } from "@/auth";

/**
 * Estado de sesión para el header. Server Component:
 * lee la sesión y muestra "Entrar" o el email + "Salir".
 */
export default async function AuthStatus() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm text-fg-muted transition-colors duration-200 hover:text-accent"
      >
        Entrar
      </Link>
    );
  }

  const label = session.user.email ?? session.user.name ?? "Mi cuenta";

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="max-w-[10rem] truncate text-fg-muted" title={label}>
        {label}
      </span>
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
