/**
 * Validación de configuración (fail-fast).
 * Acceso perezoso: solo valida la variable cuando se usa, para no romper
 * contextos (build/test) que no la necesitan.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Configuración inválida: falta la variable de entorno "${name}". ` +
        `Definila en .env (local) o en las Environment Variables del hosting.`,
    );
  }
  return value;
}

export const env = {
  get DATABASE_URL(): string {
    const value = required("DATABASE_URL");
    // En producción la app SIEMPRE debe usar la conexión POOLED de Neon:
    // sin el pooler, un pico de invocaciones serverless agota las conexiones
    // directas de Postgres. La directa es solo para el CLI de Prisma
    // (ver prisma.config.ts / DIRECT_DATABASE_URL).
    if (process.env.NODE_ENV === "production" && !value.includes("-pooler")) {
      throw new Error(
        'DATABASE_URL en producción debe ser la conexión POOLED de Neon ' +
          '(el host debe incluir "-pooler"). Revisá las Environment Variables de Vercel.',
      );
    }
    return value;
  },
  // Secreto de Auth.js. Sin fail-fast, si falta, NextAuth tira un error
  // críptico recién en runtime; acá el mensaje dice exactamente qué falta.
  get AUTH_SECRET(): string {
    return required("AUTH_SECRET");
  },
};
