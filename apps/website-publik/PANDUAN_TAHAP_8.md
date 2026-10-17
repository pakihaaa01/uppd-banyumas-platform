# Tahap 8 — Pengecekan Pajak Dummy dan Navigasi Layanan

## Perubahan
1. Halaman **Layanan** sekarang dimulai dengan **Info Kendaraan Bermotor** (simulasi): input plat (huruf depan, 1–4 angka, huruf belakang), tiga warna TNKB (putih, merah, kuning), dan tantangan verifikasi lokal demonstrasi.
2. Tiga nomor dummy yang tersedia: **R 1234 AB** (putih), **R 5678 CD** (merah), **R 9090 EF** (kuning). Tekan contoh plat, centang simulasi bukan robot, jawab **7** untuk soal 3 + 4, kemudian klik *Lihat Info Kendaraan*. Nilai pajak dan tahun kendaraan adalah contoh fiktif, **bukan informasi tagihan resmi**.
3. Tombol **Cek Pajak** pada Navbar dan **Cek Pajak Kendaraan** pada Hero Beranda membuka formulir di halaman Layanan.
4. Tombol **Layanan Digital SAMSAT** pada Hero dan kartu SIGNAL/SAKPOLE pada Beranda membuka bagian digital di halaman Layanan.
5. Bagian aplikasi **SIGNAL** dan **New SAKPOLE** menjadi accordion; gambar/logo dan teks penjelasan lama dipertahankan. Tombolnya membuka Google Play langsung pada tab baru, tanpa pop-up.
6. Sidebar **TOPIK LAYANAN** mirip sidebar Profil: Cek Pajak Kendaraan, Alur Pelayanan, Lokasi Pelayanan, Gerai SAMSAT & BUMDes, Layanan Digital SAMSAT. Klik menu untuk smooth scroll ke bagian target; bagian aktif disorot.
7. Semua isi lokasi SAMSAT tetap menggunakan accordion dengan tautan langsung ke Google Maps. Foto asli tidak diubah.

## File yang diedit atau ditambah
- `src/components/services/VehicleTaxChecker.tsx` — formulir simulasi pajak kendaraan.
- `src/components/pages/ServicesPage.tsx` — sidebar, form, accordion aplikasi, tautan Play Store.
- `src/components/home/HeroSection.tsx` — perbaikan tombol CTA.
- `src/components/home/QuickServiceCards.tsx` — arah tautan kartu layanan.
- `src/components/layout/Navbar.tsx` — arah tombol Cek Pajak.
- `src/utils/serviceNavigation.ts` — helper navigasi ke section tertentu.

## Tautan aplikasi
- New SAKPOLE: https://play.google.com/store/apps/details?id=com.jatengprov.bapenda.newsakpole&hl=id
- SIGNAL: https://play.google.com/store/apps/details?id=app.signal.id&hl=id

## Menjalankan di Windows
Ekstrak ZIP. Jalankan perintah pada folder yang berisi `package.json`:

```powershell
npm install
npm run dev
```

Lanjutkan pengujian build dengan:

```powershell
npm run lint
npm run build
```

## Perhatian untuk publikasi
- Form pengecekan ini belum terhubung ke layanan data PKB atau sistem Bapenda; tidak boleh digunakan sebagai bukti tagihan maupun penetapan pajak.
- Konfirmasi “Saya bukan robot” adalah simulasi antarmuka berbasis checkbox dan soal tetap, bukan verifikasi keamanan riil dan bukan reCAPTCHA Google. Saat tersambung ke backend, diperlukan mekanisme anti-bot server yang benar.
- Informasi lokasi, jadwal, dan kontak pada project masih harus diverifikasi sebelum ditayangkan resmi.
- File foto pengguna pada `public/images` tetap seperti ZIP Tahap 7.
