-- CreateEnum
CREATE TYPE "PointCategory" AS ENUM ('escapada', 'observatorio');

-- AlterEnum
ALTER TYPE "PointType" ADD VALUE 'urbano';

-- AlterTable
ALTER TABLE "ObservationPoint" ADD COLUMN     "categoria" "PointCategory" NOT NULL DEFAULT 'escapada';
