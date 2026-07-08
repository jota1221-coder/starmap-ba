import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { EmailConfig } from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const FROM = process.env.EMAIL_FROM ?? "StarMap BA <onboarding@resend.dev>";

/**
 * Provider de magic link.
 * - Producción: envía el email vía Resend (si hay RESEND_API_KEY).
 * - Desarrollo: imprime el link en la consola del server (no requiere
 *   ningún servicio externo para probar el flujo).
 */
const magicLink: EmailConfig = {
  id: "email",
  type: "email",
  name: "Email",
  from: FROM,
  maxAge: 30 * 60, // el link vence en 30 min
  options: {},
  async sendVerificationRequest({ identifier, url }) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // En producción NUNCA loggear el link: iría a los logs de Vercel y
      // cualquiera con acceso a los logs podría secuestrar el login. Fallar
      // ruidosamente es más seguro que filtrar el token.
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "RESEND_API_KEY no está configurada en producción: no se puede enviar el magic link.",
        );
      }
      console.log("\n════════════════ MAGIC LINK (dev) ════════════════");
      console.log(`Para: ${identifier}`);
      console.log(url);
      console.log("═══════════════════════════════════════════════════\n");
      // Conveniencia de desarrollo: escribir el link a un archivo local
      // (gitignored) para poder abrirlo fácil. Solo en dev sin Resend.
      try {
        const { writeFile } = await import("node:fs/promises");
        await writeFile(".dev-magic-link.txt", url, "utf-8");
      } catch {
        /* no-op */
      }
      return;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: identifier,
        subject: "Entrá a StarMap BA",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0b0f17">StarMap BA</h2>
          <p>Tocá el botón para entrar a tu cuenta:</p>
          <p><a href="${url}" style="display:inline-block;background:#e0a96d;color:#0b0f17;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600">Entrar a StarMap BA</a></p>
          <p style="color:#888;font-size:12px">Si no pediste esto, ignorá este mail. El enlace vence en 30 minutos.</p>
        </div>`,
      }),
    });

    if (!res.ok) {
      throw new Error(`Resend respondió ${res.status}`);
    }
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  session: { strategy: "database" },
  providers: [magicLink],
  pages: { signIn: "/login", verifyRequest: "/login/revisa" },
  callbacks: {
    // Con sesiones en DB, exponemos el id del usuario en la sesión.
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
