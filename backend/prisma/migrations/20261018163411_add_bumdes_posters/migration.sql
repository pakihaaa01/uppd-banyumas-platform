-- CreateTable
CREATE TABLE "BUMDesPoster" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "dateAdded" DATE NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BUMDesPoster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BUMDesPoster_isPublished_dateAdded_idx" ON "BUMDesPoster"("isPublished", "dateAdded");
