ALTER TABLE "ContactMessage"
ADD COLUMN "replyDraft" TEXT,
ADD COLUMN "replySentAt" TIMESTAMP(3),
ADD COLUMN "replyGmailId" TEXT,
ADD COLUMN "replyLastError" TEXT;