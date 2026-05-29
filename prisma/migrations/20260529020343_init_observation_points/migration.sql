-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('sierra', 'costa', 'reserva', 'pampa', 'laguna');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('auto', 'auto_caminata_corta', 'cuatro_x_cuatro');

-- CreateEnum
CREATE TYPE "RoadType" AS ENUM ('asfalto', 'ripio', 'tierra');

-- CreateTable
CREATE TABLE "ObservationPoint" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "partido" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "distanciaCabaKm" INTEGER NOT NULL,
    "tipo" "PointType" NOT NULL,
    "bortle" INTEGER NOT NULL,
    "sqm" DOUBLE PRECISION NOT NULL,
    "accesoTipo" "AccessType" NOT NULL,
    "accesoCamino" "RoadType" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "notasAcceso" TEXT NOT NULL,
    "referencia" TEXT,
    "mejorEpoca" TEXT,
    "dondeDormir" TEXT,
    "tips" TEXT[],
    "experiencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ObservationPoint_slug_key" ON "ObservationPoint"("slug");

-- CreateIndex
CREATE INDEX "ObservationPoint_bortle_idx" ON "ObservationPoint"("bortle");

-- CreateIndex
CREATE INDEX "ObservationPoint_distanciaCabaKm_idx" ON "ObservationPoint"("distanciaCabaKm");
