-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- DropIndex
DROP INDEX "Review_pointId_createdAt_idx";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "status" "ModerationStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateIndex
CREATE INDEX "Review_pointId_status_createdAt_idx" ON "Review"("pointId", "status", "createdAt");
