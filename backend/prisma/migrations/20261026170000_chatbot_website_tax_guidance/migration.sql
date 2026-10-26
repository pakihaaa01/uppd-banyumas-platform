-- Add website tax-check guidance without overwriting existing managed answers.
INSERT INTO "ChatbotFAQ" ("id", "question", "answer", "keywords", "category", "isEnabled", "clickCount", "createdAt", "updatedAt")
SELECT 'bot-cek-pajak-website',
       'Bagaimana cara cek pajak kendaraan di website UPPD Banyumas?',
       'Untuk mengecek informasi pajak kendaraan melalui website UPPD Banyumas:
1. Buka menu Layanan, lalu pilih Cek Pajak Kendaraan.
2. Isi nomor polisi pada kolom huruf depan, angka, dan huruf belakang.
3. Pilih warna TNKB: putih, merah, atau kuning.
4. Centang Saya bukan robot dan jawab pertanyaan verifikasi yang ditampilkan.
5. Klik Lihat Info Kendaraan untuk melihat informasi kendaraan dan rincian biaya.

Saat ini fitur tersebut masih berupa simulasi dengan data contoh, bukan data pajak kendaraan sebenarnya. Untuk mencoba, gunakan tombol Coba R 1234 AB pada formulir.',
       ARRAY['cek pajak', 'cek pajak kendaraan', 'cek pajak di website', 'pajak di website', 'pajak di web', 'info kendaraan', 'nomor polisi', 'pelat', 'plat nomor', 'estimasi pajak']::TEXT[],
       'Layanan Website', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "ChatbotFAQ"
  WHERE LOWER(TRIM("question")) = LOWER(TRIM('Bagaimana cara cek pajak kendaraan di website UPPD Banyumas?'))
)
ON CONFLICT ("id") DO NOTHING;

-- Remove only broad legacy keywords; preserve custom keywords, answers and visibility.
-- Keep the legacy spelling as an alias and add the correct application name.
UPDATE "ChatbotFAQ" AS faq
SET "keywords" = ARRAY(
      SELECT DISTINCT LOWER(TRIM(keyword))
      FROM unnest(faq."keywords" || ARRAY['sakpole', 'new sakpole', 'sekpole']::TEXT[]) AS words(keyword)
      WHERE LOWER(TRIM(keyword)) NOT IN ('jateng', 'cek pajak', 'estimasi', 'nomor polisi', 'pelat')
        AND TRIM(keyword) <> ''
      ORDER BY 1
    ),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE faq."id" = 'bot-5'
  AND LOWER(faq."question") ~ '(sakpole|sekpole)';
