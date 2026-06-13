/**
 * Seed de StarMap BA.
 * Lee data/seed-points.json (fuente de verdad curada manualmente + datos VIIRS medidos)
 * y popula la tabla ObservationPoint.
 *
 * Correr con:  npx tsx prisma/seed.ts
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PrismaClient,
  PointType,
  PointCategory,
  AccessType,
  RoadType,
} from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL no está definida");

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// --- Tipos del JSON de origen --------------------------------------------

interface SeedAcceso {
  tipo: string;
  tipo_camino: string;
}

interface SeedInfoVisitante {
  mejor_epoca?: string;
  donde_dormir?: string;
  tips?: string[];
  experiencia?: string;
}

interface SeedPunto {
  slug: string;
  nombre: string;
  partido: string;
  lat: number;
  lng: number;
  distancia_caba_km: number;
  tipo: string;
  categoria?: string; // "escapada" (default) | "observatorio"
  bortle: number;
  sqm: number;
  acceso: SeedAcceso;
  descripcion: string;
  notas_acceso: string;
  referencia?: string;
  info_visitante?: SeedInfoVisitante;
}

interface SeedFile {
  puntos: SeedPunto[];
}

// --- Mapeo de strings del JSON a enums de Prisma -------------------------

function mapPointType(tipo: string): PointType {
  const map: Record<string, PointType> = {
    sierra: PointType.sierra,
    costa: PointType.costa,
    reserva: PointType.reserva,
    pampa: PointType.pampa,
    laguna: PointType.laguna,
    urbano: PointType.urbano,
  };
  const value = map[tipo];
  if (!value) throw new Error(`Tipo de punto desconocido: "${tipo}"`);
  return value;
}

function mapCategoria(categoria: string | undefined): PointCategory {
  if (!categoria || categoria === "escapada") return PointCategory.escapada;
  if (categoria === "observatorio") return PointCategory.observatorio;
  throw new Error(`Categoría desconocida: "${categoria}"`);
}

function mapAccessType(tipo: string): AccessType {
  const map: Record<string, AccessType> = {
    auto: AccessType.auto,
    "auto_+_caminata_corta": AccessType.auto_caminata_corta,
    "4x4_requerido": AccessType.cuatro_x_cuatro,
  };
  const value = map[tipo];
  if (!value) throw new Error(`Tipo de acceso desconocido: "${tipo}"`);
  return value;
}

function mapRoadType(camino: string): RoadType {
  const map: Record<string, RoadType> = {
    asfalto: RoadType.asfalto,
    ripio: RoadType.ripio,
    tierra: RoadType.tierra,
  };
  const value = map[camino];
  if (!value) throw new Error(`Tipo de camino desconocido: "${camino}"`);
  return value;
}

// --- Seed -----------------------------------------------------------------

async function main() {
  const jsonPath = join(process.cwd(), "data", "seed-points.json");
  const file = JSON.parse(readFileSync(jsonPath, "utf-8")) as SeedFile;

  console.log(`Leyendo ${file.puntos.length} puntos de ${jsonPath}`);

  for (const p of file.puntos) {
    const data = {
      slug: p.slug,
      nombre: p.nombre,
      partido: p.partido,
      lat: p.lat,
      lng: p.lng,
      distanciaCabaKm: p.distancia_caba_km,
      tipo: mapPointType(p.tipo),
      categoria: mapCategoria(p.categoria),
      bortle: p.bortle,
      sqm: p.sqm,
      accesoTipo: mapAccessType(p.acceso.tipo),
      accesoCamino: mapRoadType(p.acceso.tipo_camino),
      descripcion: p.descripcion,
      notasAcceso: p.notas_acceso,
      referencia: p.referencia ?? null,
      mejorEpoca: p.info_visitante?.mejor_epoca ?? null,
      dondeDormir: p.info_visitante?.donde_dormir ?? null,
      tips: p.info_visitante?.tips ?? [],
      experiencia: p.info_visitante?.experiencia ?? null,
    };

    await prisma.observationPoint.upsert({
      where: { slug: p.slug },
      create: data,
      update: data,
    });

    console.log(`  ✓ ${p.nombre} (Bortle ${p.bortle})`);
  }

  const total = await prisma.observationPoint.count();
  console.log(`\nSeed completo. Total de puntos en la DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
