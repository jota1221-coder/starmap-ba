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
    return required("DATABASE_URL");
  },
};
