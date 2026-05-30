/**
 * Rate limiting con Upstash (serverless, sin infra propia).
 * Degradación elegante: si no hay credenciales de Upstash configuradas,
 * NO limita (devuelve ok) — así dev y los entornos sin Upstash no se rompen.
 * En producción, agregando UPSTASH_REDIS_REST_URL/TOKEN se activa solo.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash ? Redis.fromEnv() : null;

type Window = `${number} ${"s" | "m" | "h" | "d"}`;

function make(tokens: number, window: Window): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: "starmap",
    analytics: false,
  });
}

// Límites por tipo de acción. Conservadores; ajustables.
const limiters = {
  conditions: make(30, "1 m"), // protege la cuota de Open-Meteo
  review: make(5, "10 m"), // anti-spam de reseñas (por usuario)
  login: make(5, "15 m"), // anti email-bombing (por IP)
} as const;

export type RateLimitKind = keyof typeof limiters;

/**
 * Devuelve { ok } según el límite. Si Upstash no está configurado, ok=true.
 * `identifier`: IP para acciones anónimas, userId para acciones autenticadas.
 */
export async function checkRateLimit(
  kind: RateLimitKind,
  identifier: string,
): Promise<{ ok: boolean }> {
  const limiter = limiters[kind];
  if (!limiter) return { ok: true };
  try {
    const { success } = await limiter.limit(identifier);
    return { ok: success };
  } catch {
    // Si Upstash falla, no bloqueamos al usuario (fail-open).
    return { ok: true };
  }
}

/** Extrae la IP del cliente desde los headers (Vercel pone x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
