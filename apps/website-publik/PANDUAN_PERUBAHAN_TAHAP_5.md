# Perubahan Tahap 5 — Tampilan Profil dan Slideshow

1. **Sejahtera/Berdikari:** kartu informasi dibuat statis; tidak berganti warna hijau/oranye saat kursor diarahkan.
2. **Misi Pembangunan dan Tujuan/Sasaran Operasional:** border hover serta animasi nomor dinonaktifkan. Teks tetap sama.
3. **Profil → Struktur Organisasi:** bagian Kekuatan Personil (jumlah pegawai, ASN & PPPK) dihapus dan diganti satu area foto JPEG di bawah bagan organisasi. File: `public/images/struktur-personil.jpeg`. Cukup timpa JPEG tersebut dengan foto baru menggunakan nama yang sama. Disarankan foto mendatar 1500×800 piksel atau proporsi serupa; gambar ditampilkan utuh.
4. **Beranda:** tombol Sebelumnya, Berikutnya, Jeda/Putar otomatis, dan indikator pemilihan gambar dihapus. Background akan berganti otomatis setiap 6,5 detik tanpa interaksi pengguna.
5. **Slot background** tidak berubah: `public/images/slider/01.jpg`, `02.jpg`, `03.jpg`. Timpa JPG tersebut untuk mengganti foto beranda.

## Menjalankan

Ekstrak ZIP, buka terminal pada folder hasil ekstraksi (yang berisi `package.json`) lalu jalankan:

```powershell
npm install
npm run dev
```

Verifikasi kode TypeScript: `npm run lint`. Build: `npm run build`.
