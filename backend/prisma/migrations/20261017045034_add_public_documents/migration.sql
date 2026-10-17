-- CreateEnum
CREATE TYPE "PublicDocumentCategory" AS ENUM ('sop', 'wbk', 'sipp', 'pad', 'evaluasi');

-- CreateTable
CREATE TABLE "PublicDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "PublicDocumentCategory" NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "updateDate" DATE NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicDocument_isPublished_category_idx" ON "PublicDocument"("isPublished", "category");
