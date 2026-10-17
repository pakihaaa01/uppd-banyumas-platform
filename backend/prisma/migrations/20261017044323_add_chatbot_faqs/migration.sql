-- CreateTable
CREATE TABLE "ChatbotFAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[],
    "category" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotFAQ_isEnabled_category_idx" ON "ChatbotFAQ"("isEnabled", "category");
