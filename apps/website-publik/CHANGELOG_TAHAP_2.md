# Redesign Tahap 2 — UPPD Kabupaten Banyumas

## Perubahan tampilan

- Hero: foto asli `/images/uppd1.jpg` kembali menjadi **background penuh** (bukan foto terpisah dua kolom). Tipografi, tombol informasi layanan, dan aksi SAKPOLE dari Tahap 1 tetap dipertahankan.
- Navbar: tetap menggunakan desain Tahap 1.
- Kartu layanan: dua layanan utama, empat akses pendukung; fungsi navigasi lama tetap digunakan.
- Pengumuman: daftar editorial yang lebih ringkas, modal detail dan keyboard navigation tetap digunakan.
- Panduan: bagian 'Mengapa Memilih' yang memuat klaim kinerja tanpa verifikasi diganti dengan langkah persiapan pelayanan.
- Statistik: menampilkan **jumlah entri data pada portal** (lokasi, pengumuman, FAQ) alih-alih angka contoh kunjungan atau kepuasan. Tidak diposisikan sebagai data resmi kinerja.
- Footer: tata letak lebih sederhana, dengan identitas Bapenda, navigasi, kontak, akses direktori, dan media sosial.

## Menjalankan project

Setelah ekstrak ZIP, buka terminal **di folder yang berisi `package.json`** kemudian jalankan:

```powershell
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya http://localhost:3000.

Untuk memeriksa TypeScript dan build produksi:

```powershell
npm run lint
npm run build
```

## Catatan sebelum publikasi

- Data lokasi, jam layanan, nomor telepon, email, pengumuman, dan tautan sosial yang diambil dari sumber project semula perlu diverifikasi kepada instansi pengelola.
- Konfigurasi login admin dan data yang masih tersimpan di browser/localStorage belum diubah; jangan gunakan sebagai penyimpanan data produksi yang sensitif.
- Footer tidak menampilkan klaim WBK/WBBM atau jam layanan yang saling tidak konsisten dalam dataset semula.
