-- AlterTable
ALTER TABLE "ObservationPoint" ADD COLUMN     "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "pointId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "consejo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_pointId_createdAt_idx" ON "Review"("pointId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_pointId_userId_key" ON "Review"("pointId", "userId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "ObservationPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
