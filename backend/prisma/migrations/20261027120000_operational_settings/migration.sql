-- Keep historical authors and content; revoke access for retired roles.
UPDATE "User" SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "role" <> 'ADMINISTRATOR';
DELETE FROM "Session" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "role" <> 'ADMINISTRATOR');
-- Retired review queues become editable drafts without deleting review history.
UPDATE "Announcement" SET "status" = 'DRAFT', "updatedAt" = CURRENT_TIMESTAMP WHERE "status" IN ('PENDING_REVIEW', 'REJECTED');
ALTER TABLE "Announcement" ADD COLUMN "showInNotifications" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notificationExpiresAt" TIMESTAMP(3);
CREATE TABLE "SiteSettings" ("id" TEXT PRIMARY KEY, "value" JSONB NOT NULL, "version" INTEGER NOT NULL DEFAULT 0, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "HeroImage" ("id" TEXT PRIMARY KEY, "mime" TEXT NOT NULL, "data" BYTEA NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "ReplyTemplate" ("id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "version" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);
INSERT INTO "ReplyTemplate" ("id","title","body","updatedAt") VALUES
('standard-general','Balasan umum','Yth. Bapak/Ibu {{nama}},

Terima kasih telah menghubungi layanan informasi UPPD Kabupaten Banyumas.

[Isi jawaban]

Hormat kami,
Tim Layanan Informasi UPPD Banyumas',CURRENT_TIMESTAMP),
('standard-followup','Permintaan informasi tambahan','Yth. Bapak/Ibu {{nama}}, terima kasih atas pesan Anda. Mohon lengkapi informasi berikut: [rincian]. Jangan mengirim OTP atau password.',CURRENT_TIMESTAMP);
