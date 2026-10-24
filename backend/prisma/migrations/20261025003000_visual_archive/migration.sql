CREATE TABLE "VisualArchive" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VisualArchive_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VisualArchive_isPublished_createdAt_idx" ON "VisualArchive"("isPublished", "createdAt");