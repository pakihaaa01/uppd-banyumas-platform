# Redesign Tahap 4 — Accordion dan Background Slideshow

## Acuan desain

Mengadaptasi prinsip keterbacaan konten dan pola accordion dari halaman Sejarah Bapenda Jawa Barat, lalu diterapkan dengan identitas visual UPPD Kabupaten Banyumas/Bapenda Jawa Tengah. Tidak menyalin konten sejarah Jawa Barat ke portal Banyumas.

## Fitur yang diperbarui

1. **Homepage — HeroSection**
   - Background tetap berupa foto penuh seperti desain yang sudah disepakati, bukan foto dalam dua kolom.
   - Slideshow tiga foto dari folder `public/images/slider/`, dengan transisi fade.
   - Kontrol Sebelumnya, Berikutnya, pilihan foto, Jeda/Putar otomatis, serta swipe sentuh.
   - Interval berganti 6,5 detik. Pada sistem yang mengaktifkan `prefers-reduced-motion`, putar otomatis dijeda.
   - Tiga foto awal hanyalah contoh sementara dari aset project, dapat diganti tanpa mengedit source code. Petunjuk lengkap di `README_FOTO_SLIDESHOW.md`.

2. **Profil**
   - Sembilan bagian asli Profil tetap tersedia, termasuk struktur organisasi, penilaian kinerja, maklumat, SOP, SIPP, dan konten pendukung.
   - Halaman sejarah menggunakan accordion berdasarkan tahun/periode, bukan timeline dekoratif yang panjang.
   - Ikon dekoratif pada sejumlah daftar serta elemen Profil dikurangi; tombol yang berfungsi tetap dipertahankan.
   - Data sejarah yang berasal dari konten sebelumnya tetap perlu divalidasi terhadap sumber resmi.

3. **Layanan**
   - Tahapan pelayanan diubah ke accordion lima langkah.
   - Filter dan pencarian lokasi tetap tersedia, berikut modal peta, gerai, dan aplikasi digital.
   - Kartu lokasi menggunakan label teks, bukan banyak ikon.
   - Tombol SIGNAL tetap berupa simulasi; perlu tautan resmi sebelum publikasi.

4. **Informasi Publik**
   - Dokumen dicari lewat pencarian dan filter kategori; detail setiap dokumen dibuka melalui accordion.
   - Status berkas belum tersedia tetap ditandai.
   - Pratinjau dokumen bergambar lama dipertahankan.

5. **FAQ**
   - Daftar pertanyaan memakai komponen accordion bersama.
   - Fitur pencarian, kategori, serta reset ketika tidak ada hasil tetap berfungsi.

6. **Kontak**
   - Informasi alamat, telepon, WhatsApp, email, jam kerja, dan peta tetap ditampilkan.
   - Accordion panduan kontak baru ditambahkan tanpa menyembunyikan formulir.
   - Ikon dekoratif dihilangkan; formulir masih berupa demo yang hanya menyimpan data di localStorage.

## Pertimbangan teknis

- Komponen reusable baru: `src/components/shared/EditorialAccordion.tsx`.
- Logo Bapenda, Navbar, footer, dan desain homepage Tahap 2 dipertahankan.
- Perubahan tidak menghapus context atau dashboard admin.
- Pemeriksaan `node node_modules/typescript/bin/tsc --noEmit` berhasil di lingkungan pengujian.
- Build Vite tidak berhasil diverifikasi di Linux karena node_modules yang terpasang sebelumnya hanya menyediakan dependensi native Windows (`@rollup/rollup-linux-x64-gnu` tidak ada). Jalankan `npm install` kembali dan `npm run build` di Windows.

## Batasan sebelum produksi

Sejumlah jadwal, alamat, nomor kontak, regulasi, data target, dan dokumen belum divalidasi ulang dengan Bapenda/UPPD. Login admin serta formulir pengaduan masih membutuhkan backend server sebelum dapat disebut aman dan operasional.
