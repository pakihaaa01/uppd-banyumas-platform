# Tahap 9 — Tampilan Hasil Cek Pajak Kendaraan

## Perubahan

- Tampilan setelah pengecekan nomor polisi diubah menjadi **Detail Kendaraan Anda** dengan tiga panel: **Informasi Kendaraan**, **Informasi Pajak dan PNBP**, serta **Informasi Biaya**.
- Data contoh nomor polisi `R 1234 AB` (TNKB putih) kini menggunakan **Honda Scoopy**, wilayah **Banyumas**. Data lain tetap tersedia sebagai contoh plat merah dan kuning.
- Panel informasi menampilkan periode pajak, tanggal akhir STNK, waktu pemrosesan lokal, dan urutan kepemilikan simulasi.
- Rincian delapan komponen biaya ditampilkan dengan total yang dihitung dari data contoh.
- Tombol **Kembali** menampilkan kembali formulir cek pajak.
- Informasi akses aplikasi ditautkan ke **New SAKPOLE** dan **SIGNAL** pada Google Play, tidak menggunakan kanal khusus provinsi lain.
- Semuanya **data dummy**, **tidak terhubung** ke database kendaraan atau pembayaran pajak; tidak ada pengiriman data kendaraan ke server pemerintah.
- Tidak ada perubahan pada foto/JPG, tata letak beranda, profil, atau komponen lain.

## Cara menguji

1. Ekstrak ZIP ke folder baru dan jalankan `npm install`, `npm run dev` pada folder yang berisi `package.json`.
2. Buka halaman **Layanan** → **Cek Pajak Kendaraan**.
3. Tekan **Coba R 1234 AB** (warna TNKB putih), centang verifikasi simulasi, jawab `7`, dan tekan **Lihat Info Kendaraan**.
4. Tiga panel menampilkan nomor polisi **R 1234 AB**, merek **HONDA**, model **SCOOPY**, dan total contoh **Rp302.800**.
5. Tekan **Kembali** untuk kembali ke formulir. Coba contoh plat merah/kuning bila diperlukan.

## File yang diubah

`src/components/services/VehicleTaxChecker.tsx`

## Status validasi

- Sintaks 30 file TS/TSX berhasil diperiksa tanpa error.
- SHA-256 27 aset gambar dibandingkan dengan Tahap 8 dan tetap identik.
- Typecheck keseluruhan (`npm run lint`) dan build produksi tidak dapat dijalankan secara tuntas di lingkungan ini karena dependensi npm yang tersedia tidak lengkap. Jalankan keduanya pada komputer Anda setelah `npm install`.
