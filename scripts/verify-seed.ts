import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const pts = await prisma.observationPoint.findMany({
    orderBy: [{ bortle: "asc" }, { distanciaCabaKm: "asc" }],
    select: {
      nombre: true,
      bortle: true,
      sqm: true,
      distanciaCabaKm: true,
      tipo: true,
      accesoTipo: true,
      tips: true,
    },
  });
  console.log(`Total de puntos: ${pts.length}\n`);
  for (const p of pts) {
    console.log(
      `B${p.bortle} SQM${p.sqm} | ${String(p.distanciaCabaKm).padStart(3)}km | ${p.tipo.padEnd(7)} | ${p.accesoTipo.padEnd(20)} | tips:${p.tips.length} | ${p.nombre}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
