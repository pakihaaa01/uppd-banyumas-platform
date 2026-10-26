-- One-time restoration of seven existing prototype chatbot answers.
-- Imported as INACTIVE for content review before publication; never overwrite existing records.
-- Legacy clickCount values were sample figures, so real counters start at 0.
WITH legacy(id, question, answer, keywords, category) AS (
  VALUES
  ('bot-1', 'Cara Bayar Pajak', 'Langkah bayar pajak tahunan:
1. Siapkan KTP Asli & STNK Asli
2. Datang ke SAMSAT Induk / Drive Thru / SAMSAT Keliling / BUMDes terdekat
3. Lakukan verifikasi & pembayaran kasir
4. Terima lembar SKPD / pengesahan STNK.
Atau gunakan aplikasi SIGNAL / Sekpole secara full online!', ARRAY['bayar', 'pajak', 'cara', 'prosedur', 'alur', 'stnk']::TEXT[], 'Prosedur'),
  ('bot-2', 'Lokasi SAMSAT', 'SAMSAT Banyumas memiliki 10 titik layanan:
• SAMSAT Induk Purwokerto (Jl. Prof. Dr. Suharso)
• SAMSAT Drive Thru (Halaman SAMSAT Induk)
• SAMSAT Pembantu Wangon
• SAMSAT Cepat Purwokerto & Wangon
• SAMSAT Paten Sokaraja
• SAMSAT MPP Purwokerto
• SAMSAT Keliling
• SAMSAT Rita SuperMall
• SAMSAT Malam Minggu (Alun-Alun)', ARRAY['lokasi', 'alamat', 'dimana', 'titik', 'kantor', 'mpp', 'mall']::TEXT[], 'Lokasi'),
  ('bot-3', 'Jadwal SAMSAT Keliling', 'Jadwal SAMSAT Keliling Banyumas (08.30 - 11.30 WIB):
• Senin: Kec. Ajibarang & Kec. Sumbang
• Selasa: Kec. Cilongok & Kec. Kembaran
• Rabu: Kec. Wangon & Kec. Sokaraja
• Kamis: Kec. Sumpiuh & Kec. Baturraden
• Jumat: Kec. Jatilawang & Kec. Kedungbanteng
• Sabtu: Kec. Patikraja & Alun-Alun Banyumas', ARRAY['jadwal', 'keliling', 'bus', 'mpling', 'hari', 'jam', 'waktu']::TEXT[], 'Jadwal'),
  ('bot-4', 'Download SIGNAL', 'Aplikasi SIGNAL (Samsat Digital Nasional) adalah aplikasi resmi Korlantas Polri untuk bayar pajak kendaraan secara online nasional.
Bisa diunduh gratis di Google Play Store & Apple App Store.', ARRAY['signal', 'aplikasi', 'download', 'playstore', 'online', 'apk']::TEXT[], 'Aplikasi'),
  ('bot-5', 'Download Sekpole', 'Aplikasi Sekpole (Sistem Informasi Pajak Kendaraan Online Jawa Tengah) memudahkan masyarakat Banyumas untuk cek estimasi nominal pajak, info tunggakan, dan kode bayar e-Samsat Jawa Tengah.', ARRAY['sekpole', 'jateng', 'cek pajak', 'estimasi', 'nomor polisi', 'pelat']::TEXT[], 'Aplikasi'),
  ('bot-6', 'Persyaratan Pajak', 'Syarat Pajak Tahunan:
• STNK Asli
• KTP Asli pemilik kendaraan sesuai STNK

Syarat Pajak 5 Tahunan (Ganti Plat):
• STNK Asli & BPKB Asli
• KTP Asli pemilik
• Hasil Cek Fisik Kendaraan
• Kendaraan wajib dihadirkan ke SAMSAT Induk.', ARRAY['syarat', 'persyaratan', 'dokumen', 'ktp', 'bpkb', 'dibawa']::TEXT[], 'Persyaratan'),
  ('bot-7', 'Hubungi Petugas', 'Anda dapat menghubungi Layanan Informasi & Pengaduan SAMSAT Banyumas:
• Call Center: (0281) 635123
• WhatsApp Resmi: 0812-2345-6789
• Email: samsat.banyumas@jatengprov.go.id
• jam kerja: Senin - Sabtu 08.00 - 13.00 WIB.', ARRAY['hubungi', 'petugas', 'kontak', 'whatsapp', 'wa', 'telepon', 'admin', 'cs']::TEXT[], 'Kontak')
)
INSERT INTO "ChatbotFAQ" ("id", "question", "answer", "keywords", "category", "isEnabled", "clickCount", "createdAt", "updatedAt")
SELECT legacy.id, legacy.question, legacy.answer, legacy.keywords, legacy.category,
       FALSE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM legacy
WHERE NOT EXISTS (
  SELECT 1 FROM "ChatbotFAQ" existing
  WHERE LOWER(TRIM(existing."question")) = LOWER(TRIM(legacy.question))
)
ON CONFLICT ("id") DO NOTHING;
