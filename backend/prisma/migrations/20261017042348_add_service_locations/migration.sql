-- CreateEnum
CREATE TYPE "ServiceLocationType" AS ENUM ('induk', 'pembantu', 'cepat', 'drive_thru', 'keliling', 'mpp', 'gerai', 'paten');

-- CreateTable
CREATE TABLE "ServiceLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "operatingHours" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "mapsUrl" TEXT NOT NULL,
    "mapsEmbedUrl" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isDriveThru" BOOLEAN NOT NULL DEFAULT false,
    "type" "ServiceLocationType" NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceLocation_isPublished_type_idx" ON "ServiceLocation"("isPublished", "type");
