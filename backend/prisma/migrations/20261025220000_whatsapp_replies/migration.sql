ALTER TABLE "ContactMessage" ADD COLUMN "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ContactMessage" ADD COLUMN "whatsappSentAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "whatsappMessageId" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN "whatsappLastError" TEXT;
