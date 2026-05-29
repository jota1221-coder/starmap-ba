import { prisma } from "@/lib/prisma";

/**
 * GET /api/health — liveness/readiness para monitores de uptime.
 * Verifica que el proceso responde y que la DB está accesible.
 */
export async function GET() {
  const checks: Record<string, "ok" | "fail"> = { server: "ok", db: "ok" };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    checks.db = "fail";
  }

  const healthy = Object.values(checks).every((s) => s === "ok");
  return Response.json(
    { status: healthy ? "ok" : "degraded", checks, ts: new Date().toISOString() },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
