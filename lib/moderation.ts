/**
 * Heurísticas de moderación de contenido de usuarios.
 * Funciones puras y testeables (no van en el archivo "use server").
 */

/** Detecta URLs / enlaces — vector de spam típico en reseñas. */
export function contieneEnlace(texto: string): boolean {
  return /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ar|io|co|info|xyz|link)\b)/i.test(
    texto,
  );
}
