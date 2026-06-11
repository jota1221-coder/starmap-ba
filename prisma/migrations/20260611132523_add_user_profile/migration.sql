-- CreateEnum
CREATE TYPE "AstronomyExperience" AS ENUM ('nada', 'basico', 'intermedio', 'avanzado');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experience" "AstronomyExperience",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "nickname" TEXT;
