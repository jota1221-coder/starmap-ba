/**
 * Heurísticas de moderación de contenido de usuarios.
 * Funciones puras y testeables (no van en el archivo "use server").
 */

/**
 * Detecta URLs / enlaces — vector de spam típico en reseñas. Patrón
 * genérico de dominio (protocolo, www. o palabra.TLD) en vez de una lista
 * de TLDs enumerada, que siempre queda incompleta (no cubría bit.ly, .app,
 * .dev, .me, .gg y cualquier TLD nuevo).
 */
export function contieneEnlace(texto: string): boolean {
  return /(https?:\/\/|www\.|\b[a-z0-9-]+\.[a-z]{2,}\b)/i.test(texto);
}
